import  { useState, useEffect } from 'react';
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
}

interface Role {
    id: number;
    name: string;
}

const GestionUsuarios = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent] = useState({ title: '', message: '', success: false });
 
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
            console.log(roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

 

  

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1></center>
            <p> En esta sección se maneja la gestión de usuarios del sistema.</p>
            <div className="overflow-x-auto">
                <hr className="my-4" />
                <h1 className="text-xl text-orange-400 mb-4">USUARIOS</h1>
                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Correo Electrónico
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha de creación
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role.name}
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
