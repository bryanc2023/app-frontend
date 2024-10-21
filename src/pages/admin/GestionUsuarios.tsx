import { useState, useEffect } from 'react';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';


interface User {
    id?: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    is_active: boolean; // Campo para manejar el estado activo/inactivo
    empresa?: {
        nombre_comercial: string;
        ruc: string;
        razon_s: string;
        sitio: string;
        telefono: string;
        red: { id_empresa_red: number; nombre_red: string; enlace: string }[];
        sector?: { sector: string; division: string };
        ubicacion?: { provincia: string; canton: string }; // Detalles de la ubicación de la empresa
    };
    postulante?: {
        postulante: {
            id_postulante: number;
            id_ubicacion: number;
            id_usuario: number;
            nombres: string;
            apellidos: string;
            fecha_nac: string;
            edad: number;
            estado_civil: string;
            cedula: string;
            telefono: string;
            genero: string;
            informacion_extra: string;
            foto: string;
            cv: string | null;
            vigencia: boolean;
        };
        ubicacion: {
            id: number;
            provincia: string;
            canton: string;
            created_at: string;
            updated_at: string;
        };
        formaciones: {
            id_postulante: number;
            id_titulo: number;
            institucion: string;
            estado: string;
            fecha_ini: string;
            fecha_fin: string | null;
            titulo_acreditado: string;
        }[];
        titulos: {
            id: number;
            nivel_educacion: string;
            campo_amplio: string;
            titulo: string;
            created_at: string;
            updated_at: string;
        }[];
        idiomas: {
            id_postulante: number;
            id_idioma: number;
            nivel_oral: string;
            nivel_escrito: string;
            idioma_nombre: string;
        }[];
        // Añadir otros campos que necesites
    };
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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [modalUserOpen, setModalUserOpen] = useState(false);


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

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
    
        let currentY = 10; // Inicializa la posición vertical
    
        // Agregar el título "POSTULA" en la esquina izquierda, negrilla y color naranja
        doc.setFontSize(20);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(255, 165, 0); // Color naranja
        doc.text("POSTULA", 10, 10);
        
        currentY += 15; // Aumenta el espacio después del título
    
        
    
        // Detalles del postulante
        if (selectedUser && selectedUser.postulante) {
            const { postulante, ubicacion, formaciones, titulos, idiomas } = selectedUser.postulante;
            const maxWidth = doc.internal.pageSize.getWidth() - 70;
            doc.setFontSize(18);
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(0, 0, 255); // Asegura que los siguientes textos sean en color negro
            doc.text("Detalles del Postulante", 10, currentY);
            currentY += 10; // Aumenta la posición

            // Texto introductorio
        doc.setFontSize(14);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Vuelve a color negro
        doc.text("El usuario ha proporcionado los siguientes datos:", 10, currentY);
        currentY += 10; // Espacio adicional después del texto
    
            doc.setFontSize(12);
            doc.setFont("Helvetica", "bold"); // Establece la fuente en negrita
            doc.text("Nombre:", 10, currentY);
            doc.setFont("Helvetica", "normal"); // Vuelve a la fuente normal
            doc.text(postulante.nombres || 'No se ha proporcionado', 40, currentY); // Mueve el texto del nombre a la derecha
            currentY += 10;
            
            doc.setFont("Helvetica", "bold");
            doc.text("Fecha de Nacimiento:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.fecha_nac || 'No se ha proporcionado', 60, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Edad:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.edad.toString() || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Estado Civil:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.estado_civil || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Cédula:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.cedula || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Teléfono:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.telefono || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Género:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(postulante.genero || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Información Extra:", 10, currentY);
            doc.setFont("Helvetica", "normal");

            // Divide el texto en líneas que quepan en el ancho máximo
            const lines = doc.splitTextToSize(postulante.informacion_extra || 'No se ha proporcionado', maxWidth);

            // Dibuja cada línea en el PDF
            lines.forEach((line) => {
                doc.text(line, 60, currentY);
                currentY += 10; // Aumenta el espacio vertical para la siguiente línea
            });

            // Ajusta el currentY para el siguiente contenido
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Ubicación:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(`${ubicacion.provincia}, ${ubicacion.canton}` || 'No se ha proporcionado', 40, currentY);
            currentY += 10;
    
            // Formaciones
            doc.setFont("Helvetica", "bold");
            doc.text("Formaciones:", 10, currentY);
            currentY += 10;
            doc.setFont("Helvetica", "normal");
            formaciones.forEach((formacion) => {
                const line = ` - ${formacion.titulo_acreditado} en ${formacion.institucion} (${formacion.estado})` || 'No se ha proporcionado';
                doc.text(line, 10, currentY);
                currentY += 10;
            });
    
            // Títulos
            doc.setFont("Helvetica", "bold");
            const titulosStartY = currentY;
            doc.text("Títulos:", 10, titulosStartY);
            currentY += 10;
            doc.setFont("Helvetica", "normal");
            titulos.forEach((titulo) => {
                const line = ` - ${titulo.titulo} (Nivel: ${titulo.nivel_educacion})` || 'No se ha proporcionado';
                doc.text(line, 10, currentY);
                currentY += 10;
            });
    
            // Idiomas
            doc.setFont("Helvetica", "bold");
            doc.text("Idiomas:", 10, currentY);
            currentY += 10;
            doc.setFont("Helvetica", "normal");
            idiomas.forEach((idioma) => {
                const line = ` - ${idioma.idioma_nombre} (Oral: ${idioma.nivel_oral}, Escrito: ${idioma.nivel_escrito})` || 'No se ha proporcionado';
                doc.text(line, 10, currentY);
                currentY += 10;
            });
        }
    
        // Detalles de la empresa
        if (selectedUser.empresa) {
            doc.setFontSize(18);
            doc.setFont("Helvetica", "bold");
            doc.text("Detalles de la Empresa", 10, currentY);
            currentY += 10; // Aumenta la posición

            // Texto introductorio
        doc.setFontSize(14);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Vuelve a color negro
        doc.text("El usuario ha proporcionado los siguientes datos:", 10, currentY);
        currentY += 10; // Espacio adicional después del texto
    
            doc.setFontSize(12);
            doc.setFont("Helvetica", "bold");
            doc.text("Nombre Comercial:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.nombre_comercial || 'No se ha proporcionado', 60, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("RUC:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.ruc || 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Razón Social:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.razon_s || 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Sitio Web:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.sitio || 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Teléfono:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.telefono || 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Sector:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.sector ? selectedUser.empresa.sector.sector : 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("División:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.sector ? selectedUser.empresa.sector.division : 'No disponible', 40, currentY);
            currentY += 10;
    
            doc.setFont("Helvetica", "bold");
            doc.text("Ubicación:", 10, currentY);
            doc.setFont("Helvetica", "normal");
            doc.text(selectedUser.empresa.ubicacion ? `${selectedUser.empresa.ubicacion.provincia}, ${selectedUser.empresa.ubicacion.canton}` : 'No disponible', 40, currentY);
        }
    
        // Generar el nombre del archivo
        let fileName = "Detalles_";
        if (selectedUser && selectedUser.postulante) {
            fileName += `Postulante_${selectedUser.postulante.postulante.nombres}_${selectedUser.postulante.postulante.apellidos}.pdf`;
        } else if (selectedUser.empresa) {
            fileName += `Empresa_${selectedUser.empresa.nombre_comercial}.pdf`;
        }
    
        doc.save(fileName); // Guarda el documento con el nombre generado
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

    const handleGetUserData = async (userId: number) => {
        setLoadingUser(true);
        try {
            const response = await axios.get(`/users/${userId}`);
            setSelectedUser(response.data);
            setModalUserOpen(true); // Abre el modal
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoadingUser(false);
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
                                        className="block w-full px-4 py-2 mt-2 bg-green-500 text-white rounded"
                                        onClick={() => handleGetUserData(user.id!)}
                                    >
                                        Ver Datos
                                    </button>

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
            <Modal show={modalUserOpen} onClose={() => setModalUserOpen(false)} title="Detalles del Usuario" success={true}>
    {selectedUser && (
        <div className="mt-4 p-6 border rounded-lg shadow-lg bg-white max-h-[80vh] overflow-y-auto">
            {selectedUser.empresa && (
               <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 mt-4">Detalles de la Empresa</h3>
               <p className="text-gray-700">
                   <strong>Nombre Comercial:</strong> {selectedUser.empresa.nombre_comercial || 'No disponible'}
               </p>
               <p className="text-gray-700"><strong>RUC:</strong> {selectedUser.empresa.ruc}</p>
                <p className="text-gray-700"><strong>Razón Social:</strong> {selectedUser.empresa.razon_s}</p>
                <p className="text-gray-700"><strong>Sitio Web:</strong> {selectedUser.empresa.sitio}</p>
                <p className="text-gray-700"><strong>Teléfono:</strong> {selectedUser.empresa.telefono}</p>
               <p className="text-gray-700">
                   <strong>Sector:</strong> {selectedUser.empresa.sector ? selectedUser.empresa.sector.sector : 'No disponible'}
               </p>
               <p className="text-gray-700">
                   <strong>División:</strong> {selectedUser.empresa.sector ? selectedUser.empresa.sector.division : 'No disponible'}
               </p>
               <p className="text-gray-700">
                   <strong>Ubicación:</strong> {selectedUser.empresa.ubicacion ? `${selectedUser.empresa.ubicacion.provincia}, ${selectedUser.empresa.ubicacion.canton}` : 'No disponible'}
               </p>
           </div>
           
            )}
            {selectedUser.postulante && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mt-4">Detalles del Postulante</h3>
                    <p className="text-gray-700"><strong>Nombres:</strong> {selectedUser.postulante.postulante.nombres || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Apellidos:</strong> {selectedUser.postulante.postulante.apellidos || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Fecha de Nacimiento:</strong> {selectedUser.postulante.postulante.fecha_nac || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Edad:</strong> {selectedUser.postulante.postulante.edad || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Estado Civil:</strong> {selectedUser.postulante.postulante.estado_civil || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Cédula:</strong> {selectedUser.postulante.postulante.cedula || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Teléfono:</strong> {selectedUser.postulante.postulante.telefono || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Género:</strong> {selectedUser.postulante.postulante.genero || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Información Extra:</strong> {selectedUser.postulante.postulante.informacion_extra || 'No disponible'}</p>
                    <p className="text-gray-700"><strong>Vigencia:</strong> {selectedUser.postulante.postulante.vigencia ? 'Vigente' : 'No vigente'}</p>
                    <p className="text-gray-700"><strong>Ubicación:</strong> {selectedUser.postulante.ubicacion ? `${selectedUser.postulante.ubicacion.provincia}, ${selectedUser.postulante.ubicacion.canton}` : 'No disponible'}</p>

                    {/* Formaciones */}
                    <h4 className="font-semibold mt-4 text-gray-800">Formaciones:</h4>
                    {selectedUser.postulante.formaciones.length > 0 ? (
                        selectedUser.postulante.formaciones.map((formacion, index) => (
                            <p key={index} className="text-gray-600"> - {formacion.titulo_acreditado} en {formacion.institucion} ({formacion.estado})</p>
                        ))
                    ) : (
                        <p className="text-gray-600">No hay formaciones disponibles.</p>
                    )}

                    {/* Títulos */}
                    <h4 className="font-semibold mt-4 text-gray-800">Títulos:</h4>
                    {selectedUser.postulante.titulos.length > 0 ? (
                        selectedUser.postulante.titulos.map((titulo, index) => (
                            <p key={index} className="text-gray-600"> - {titulo.titulo} (Nivel: {titulo.nivel_educacion})</p>
                        ))
                    ) : (
                        <p className="text-gray-600">No hay títulos disponibles.</p>
                    )}

                    {/* Idiomas */}
                    <h4 className="font-semibold mt-4 text-gray-800">Idiomas:</h4>
                    {selectedUser.postulante.idiomas.length > 0 ? (
                        selectedUser.postulante.idiomas.map((idioma, index) => (
                            <p key={index} className="text-gray-600"> - {idioma.idioma_nombre} (Oral: {idioma.nivel_oral}, Escrito: {idioma.nivel_escrito})</p>
                        ))
                    ) : (
                        <p className="text-gray-600">No hay idiomas disponibles.</p>
                    )}
                </div>
            )}

            <button onClick={handleDownloadPDF} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition duration-200">Descargar PDF</button>
        </div>
    )}
</Modal>







            <hr className="my-4" />

            <Modal show={modalOpen} onClose={closeModal} title={modalContent.title} success={modalContent.success}>
                <p>{modalContent.message}</p>
            </Modal>
        </div>
    );
};

export default GestionUsuarios;
