import { useState, useEffect } from 'react';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal';
import Swal from 'sweetalert2';

interface User {
    id?: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    } | null;
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
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Estado para usuarios filtrados
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

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
            setFilteredUsers(response.data);
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

    const grantAccessToUser = async (userId: number) => {
        try {
            const response = await axios.put(`/users/${userId}/grant-access`);
            // Actualiza la lista de usuarios después de cambiar el estado
            // Actualiza la lista de usuarios después de cambiar el rol
            await fetchUsers();
            setModalContent({
                title: 'Acceso actualizado',
                message: `El usuario ha sido registrado como parte de empresa gestora con éxito.`,
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

    const nograntAccessToUser = async (userId: number) => {
        try {
            const response = await axios.put(`/users/${userId}/no-grant-access`);
            // Actualiza la lista de usuarios después de cambiar el estado
            // Actualiza la lista de usuarios después de cambiar el rol
            await fetchUsers();
            setModalContent({
                title: 'Acceso actualizado',
                message: `El usuario ha sido denegado como parte de empresa gestora con éxito.`,
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

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = event.target.value === "null" ? null : parseInt(event.target.value);
        setSelectedRoleId(roleId);

        // Filtrar usuarios según el rol seleccionado
        const filtered = roleId === null
            ? users.filter(user => user.role === null) // Filtrar usuarios sin rol
            : roleId
                ? users.filter(user => user.role?.id === roleId)
                : users; // Si no hay rol seleccionado, mostrar todos los usuarios

        setFilteredUsers(filtered);
    };
    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1></center>
            <p>En esta sección se maneja la gestión de usuarios del sistema.</p>
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">USUARIOS</h1>
            {/* Mensaje de aviso mejorado */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4">
                <div className="flex items-center">
                    <svg
                        className="h-5 w-5 text-yellow-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12A9 9 0 1112 3a9 9 0 019 9z"
                        />
                    </svg>
                    <h1 className="text-xs font-semibold">
                        (Las acciones realizadas en los usuarios son delicadas, precaución)
                    </h1>
                </div>
            </div>

            <div className="overflow-x-auto">
                {/* Select para filtrar por rol */}
                <div className="mb-4">
                    <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700">Filtrar por Rol:</label>
                    <select
                        id="roleSelect"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        onChange={handleRoleChange}
                        value={selectedRoleId === null ? "null" : selectedRoleId}
                    >
                        <option value="">Todos</option> {/* Opción para ver todos los usuarios */}
                        <option value="null">Solicitudes</option> {/* Opción para ver solicitudes */}
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role && user.role.name ? (
                                        user.role.name
                                    ) : (
                                        <strong style={{ color: 'red' }} title="Este usuario ha solicitado acceso como empresa gestora">
                                            Solicitud:
                                            <p style={{ color: 'orange' }}>EMPRESA GESTORA</p>
                                        </strong>
                                    )}
                                </td>

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
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    {/* Mostrar el botón "Dar acceso" solo si el rol es nulo */}
                                    {user.role === null && (
                                        <>
                                            <button
                                                className="block w-full px-4 py-2 mb-2 bg-blue-500 text-white rounded"
                                                onClick={() => {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: "Acceso de empresa gestora",
                                                        text: "Al dar acceso a este usuario podrá gestionar ofertas desde el perfil de empresa gestora.",
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Dar acceso',
                                                        cancelButtonText: 'Cancelar'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            // Función para dar acceso al usuario
                                                            grantAccessToUser(user.id);
                                                        }
                                                    });
                                                }}
                                            >
                                                Dar acceso
                                            </button>
                                            <button
                                                className="block w-full px-4 py-2 bg-violet-500 text-white rounded"
                                                onClick={() => {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: "Acceso de empresa gestora",
                                                        text: "Al negar acceso a este usuario no podrá gestionar ofertas desde el perfil de empresa gestora.",
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Negar acceso',
                                                        cancelButtonText: 'Cancelar'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            // Función para negar acceso al usuario
                                                            nograntAccessToUser(user.id);
                                                        }
                                                    });
                                                }}
                                            >
                                                Negar acceso
                                            </button>
                                        </>
                                    )}

                                    <button
                                        className={`block w-full px-4 py-2 mt-2 text-white ${user.is_active ? 'bg-red-500' : 'bg-green-500'} rounded`}
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
