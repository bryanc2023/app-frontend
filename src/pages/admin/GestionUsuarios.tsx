import { useState, useEffect } from 'react';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal';

interface User {
    id?: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    created_at: string;
    is_active: boolean; // Agrega este campo para manejar el estado activo/inactivo
}

interface Role {
    id: number;
    name: string;
}

const GestionUsuarios = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const updateUserStatus = async (userId: number, isActive: boolean) => {
        try {
            const response = await axios.put(`/users/${userId}/status`, { is_active: isActive });
            // Actualiza la lista de usuarios después de cambiar el estado
            setUsers(users.map(user => user.id === userId ? { ...user, is_active: isActive } : user));
            setModalContent({
                title: 'Estado actualizado',
                message: `El usuario ha sido ${isActive ? 'activado' : 'desactivado'} con éxito.`,
                success: true
            });
            setModalOpen(true);
        } catch (error) {
            console.error('Error updating user status:', error);
            setModalContent({
                title: 'Error',
                message: 'No se pudo actualizar el estado del usuario.',
                success: false
            });
            setModalOpen(true);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1></center>
            <p>En esta sección se maneja la gestión de usuarios del sistema.</p>
            <div className="overflow-x-auto">
                <hr className="my-4" />
                <h1 className="text-xl text-orange-400 mb-4">USUARIOS</h1>
                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(user.created_at).toLocaleString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        className={`px-4 py-2 text-white ${user.is_active ? 'bg-red-500' : 'bg-green-500'} rounded`}
                                        onClick={() => updateUserStatus(user.id!, !user.is_active)}
                                    >
                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr className="my-4" />

            <Modal show={modalOpen} onClose={closeModal} title={modalContent.title} success={modalContent.success}>
                <p>{modalContent.message}</p>
            </Modal>
        </div>
    );
};

export default GestionUsuarios;
