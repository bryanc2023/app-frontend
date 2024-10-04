import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import Modal from 'react-modal';
import { RootState } from '../../store';
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram, FaGlobe, FaXing, FaXTwitter, FaUserTie, FaBriefcase, FaTrash } from 'react-icons/fa6';
import AddRedModal from '../../components/Empresa/AddRedEModal';
import EditLogoModal from '../../components/Empresa/EditProfilePicEModal';
import PlanModal from '../../components/Empresa/PlanModal';
import Swal from 'sweetalert2';
import { FaInfoCircle } from 'react-icons/fa';

interface Empresa {
    id?: number;
    nombre_comercial: string;
    logo: string;
    ubicacion: {
        id: string;
        provincia: string;
        canton: string;
    };
    sector: {
        id: string;
        sector: string;
        division: string;
    };
    tamanio: string;
    descripcion: string;
    cantidad_empleados: number;
    red: { id_empresa_red: number; enlace: string; nombre_red: string }[];
    plan: string; // Nuevo campo para el plan contratado
}

interface Red {
    id_empresa_red: number;
    enlace: string;
    nombre_red: string;
}

const EmpresaDetails: React.FC = () => {
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editedEmpresa, setEditedEmpresa] = useState<Empresa | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false); // Estado para el modal de planes
    const { user } = useSelector((state: RootState) => state.auth);

    const [provinces, setProvinces] = useState<string[]>([]);
    const [cantons, setCantons] = useState<{ id: number; canton: string }[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [sectores, setSectores] = useState<string[]>([]);
    const [divisiones, setDivisiones] = useState<{ id: number; division: string }[]>([]);
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedDivision, setSelectedDivision] = useState<string>('');
    const [isDivisionEnabled, setIsDivisionEnabled] = useState<boolean>(false);
    const [isEditLogoModalOpen, setIsEditLogoModalOpen] = useState(false); // Estado para el modal de editar logo
    const [isAddRedModalOpen, setIsAddRedModalOpen] = useState<boolean>(false); // Estado para el modal de agregar red
    const [redes, setRedes] = useState<Red[]>([]);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [redToDelete, setRedToDelete] = useState<Red | null>(null);
    const [errorDescripcion, setErrorDescripcion] = useState('');
    const [customDivision, setCustomDivision] = useState('');
    const [isCustomSector, setIsCustomSector] = useState(false);
    const [isDivisionEnabled2, setIsDivisionEnabled2] = useState(true);
        
        const handleCheckboxChange = () => {
            setIsCustomSector(!isCustomSector);
            if (!isCustomSector) {
                setSelectedSector('Otro'); // Cambia el valor del sector a "Otro"
                setIsDivisionEnabled2(false); // Deshabilita el select de división
                setSelectedDivision(''); // Limpia la selección de división
            } else {
                setSelectedSector(''); // Resetea el sector si se desmarca
                setIsDivisionEnabled2(true); // Habilita el select de división
            }
        };

    const fetchRedes = async (empresaId: number) => {
        
        try {
            const response = await axios.get(`/empresa-red/${empresaId}`);
            if (response.data && Array.isArray(response.data)) {
                setEmpresa((prevState) => ({
                    ...prevState!,
                    red: response.data,
                    // Preservar el plan original si ya existe en el estado de la empresa
                    plan: 'Estándar', // Preserva el plan actual
                }));
            } else {
                setEmpresa((prevState) => ({
                    ...prevState!,
                    red: [],
                    plan: 'Estándar', // Preserva el plan actual
                }));
            }
        } catch (error) {
            console.error('Error fetching redes:', error);
            setEmpresa((prevState) => ({
                ...prevState!,
                red: [],
                plan: 'Estándar', // Preserva el plan actual
            }));
        }
    };


    const openConfirmDeleteModal = (red: Red) => {
        setRedToDelete(red);
        setIsConfirmDeleteModalOpen(true);
    };

    const closeConfirmDeleteModal = () => {
        setIsConfirmDeleteModalOpen(false);
        setRedToDelete(null);
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (user) {
                    const response = await axios.get(`/empresaById/${user.id}`);
                    const empresaData = response.data;

                    const redesResponse = await axios.get(`/empresa-red/${empresaData.id_empresa}`);
                    empresaData.red = redesResponse.data;
                    empresaData.plan = 'Estándar'; // Asigna el plan actual aquí

                    setEmpresa(empresaData);

                    if (empresaData.ubicacion) {
                        setSelectedProvince(empresaData.ubicacion.provincia || '');
                        setSelectedCanton(empresaData.ubicacion.canton || '');
                    }
                    if (empresaData.sector) {
                        setSelectedSector(empresaData.sector.sector || '');
                        setSelectedDivision(empresaData.sector.division || '');
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Error fetching profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const openEditLogoModal = () => {
        setIsEditLogoModalOpen(true);
    };

    const closeEditLogoModal = () => {
        setIsEditLogoModalOpen(false);
    };

    const openPlanModal = () => {
        setIsPlanModalOpen(true);
    };

    const closePlanModal = () => {
        setIsPlanModalOpen(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ubicacionesResponse, sectoresResponse] = await Promise.all([
                    axios.get('ubicaciones'),
                    axios.get('sectores'),
                ]);

                setProvinces(ubicacionesResponse.data.provinces || []);
                setSectores(sectoresResponse.data.sectores || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleDeleteRed = async (id: number) => {
        try {
            await axios.delete(`/empresa-red/${id}`);

            // Actualiza el estado eliminando la red del arreglo local
            setEmpresa((prevState) => ({
                ...prevState!,
                red: prevState!.red.filter((red) => red.id_empresa_red !== id),
            }));

            // Mostrar mensaje de éxito
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Red social eliminada exitosamente',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            // Refrescar la lista de redes desde el servidor
            if (empresa?.id) {
                await fetchRedes(empresa.id);
            }

        } catch (error) {
            console.error('Error eliminando la red:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Hubo un error al eliminar la red social',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } finally {
            // Cerrar modal de confirmación
            closeConfirmDeleteModal();
        }
    };


    useEffect(() => {
        const fetchCantons = async () => {
            if (selectedProvince) {
                try {
                    const response = await axios.get(`ubicaciones/cantonesID/${selectedProvince}`);
                    setCantons(response.data || []);
                } catch (error) {
                    console.error('Error fetching cantons:', error);
                }
            }
        };

        fetchCantons();
    }, [selectedProvince]);

    useEffect(() => {
        const fetchDivisiones = async () => {
            if (selectedSector) {
                try {
                    const response = await axios.get(`sectores/${encodeURIComponent(selectedSector)}`);
                    setDivisiones(response.data || []);
                    setIsDivisionEnabled(true);
                } catch (error) {
                    console.error('Error fetching divisiones:', error);
                }
            }
        };

        fetchDivisiones();
    }, [selectedSector]);

    const openModal = async () => {
        if (empresa) {
            // Setea la empresa seleccionada en el modal
            setEditedEmpresa(empresa);

            // Accede a las propiedades directamente desde 'empresa' y agrega validaciones
            const cantonId = empresa.ubicacion && empresa.ubicacion.id ? empresa.ubicacion.id : '2';
            const divisionId = empresa.sector && empresa.sector.id ? empresa.sector.id : '2';

            // Setear valores validados
            setSelectedCanton(cantonId);
            setSelectedDivision(divisionId);
            setCustomDivision(null);
            setIsCustomSector(false);
            setIsDivisionEnabled2(true);

            // Abrir el modal
            setModalIsOpen(true);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        const fetchData = async () => {
            try {
                const [ubicacionesResponse, sectoresResponse] = await Promise.all([
                    axios.get('ubicaciones'),
                    axios.get('sectores'),
                ]);

                setProvinces(ubicacionesResponse.data.provinces || []);
                setSectores(sectoresResponse.data.sectores || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    };

    const openAddRedModal = () => {
        setIsAddRedModalOpen(true);
    };

    const closeAddRedModal = async () => {
        setIsAddRedModalOpen(false);
        if (empresa?.id) {
            await fetchRedes(empresa.id);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (editedEmpresa) {
            const { name, value } = e.target;
            const [mainKey, subKey] = name.split('.');
            // Validación específica para el campo "descripcion"
            if (name === 'descripcion') {
                if (value.length > 1000) {
                    setErrorDescripcion('La descripción no puede tener más de 1000 caracteres.');
                    return; // Evita que se actualice el valor si excede los 1000 caracteres
                } else {
                    setErrorDescripcion(''); // Limpia el error si está dentro del límite
                }
            }
            if (subKey) {
                setEditedEmpresa({
                    ...editedEmpresa,
                    [mainKey]: {
                        ...(editedEmpresa[mainKey as keyof Empresa] as any),
                        [subKey]: value,
                    },
                });
            } else {
                setEditedEmpresa({
                    ...editedEmpresa,
                    [name]: value,
                });
            }
        }
    };

    const reloadProfile = async () => {
        if (user) {
            try {
                const response = await axios.get(`/empresaById/${user.id}`);
                const empresaData = response.data;

                const redesResponse = await axios.get(`/empresa-red/${empresaData.id_empresa}`);
                empresaData.red = redesResponse.data;

                setEmpresa(empresaData);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Error fetching profile data');
            }
        }
    };

    const handleSave = async () => {
        if (editedEmpresa && user) {
            try {
                const empresaToSave = {
                    ...editedEmpresa,
                    division: isCustomSector ? null : selectedDivision, // Enviar null si es un sector personalizado
                    customDivision: isCustomSector ? customDivision : '', 
                }
               
                await axios.put(`/updateEmpresaById/${user.id}`, empresaToSave);
                setSuccessMessage("Datos guardados con éxito!");
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);

                // Recargar los datos del perfil después de guardar
                await reloadProfile();

                setModalIsOpen(false);
                setError(null);
            } catch (err: any) {
                setError(`Axios error: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const renderIcon = (nombreRed: string | null | undefined) => {
        // Proporcionar un valor predeterminado si nombreRed es null o undefined
        const nombre = nombreRed ? nombreRed.toLowerCase() : '';

        switch (nombre) {
            case 'linkedin':
                return <FaLinkedin className="text-blue-700" />;
            case 'facebook':
                return <FaFacebook className="text-blue-600" />;
            case 'twitter':
                return <FaTwitter className="text-blue-400" />;
            case 'instagram':
                return <FaInstagram className="text-pink-600" />;
            case 'xing':
                return <FaXing className="text-green-600" />;
            case 'x':
                return <FaXTwitter className="text-blue-400" />;
            default:
                return <FaGlobe className="text-gray-400" />;
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'Gratuito':
                return <FaUserTie className="text-green-500 text-2xl" />;
            case 'Estándar':
                return <FaBriefcase className="text-blue-500 text-2xl" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="font-bold">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
    }

    if (!empresa) {
        return <div className="flex justify-center items-center h-screen">No company data available</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white text-black rounded-lg shadow-md" style={{ borderColor: '#d1552a', borderWidth: '4px' }}>
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Éxito! </strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left mr-0 sm:mr-8">
                    <h1 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 inline-block pb-2 w-40 text-center text-black">{empresa?.nombre_comercial}</h1>
                    <img
                        src={empresa?.logo}
                        alt="Logo"
                        className="w-32 h-32 object-cover border-2 border-black rounded-full mb-4 sm:mb-0 mx-auto cursor-pointer"
                        onClick={openEditLogoModal}
                    />
                    <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 mt-4 self-center">Editar Datos</button>
                </div>
                <div className="w-full">
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 inline-block pb-2 w-40 text-black">Detalles del Perfil</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
                            <p><strong>Provincia:</strong> {empresa?.ubicacion?.provincia || 'N/A'}</p>
                            <p><strong>Cantón:</strong> {empresa?.ubicacion?.canton || 'N/A'}</p>
                            <p><strong>Sector:</strong> {empresa?.sector?.sector || 'N/A'}</p>
                            <p><strong>División:</strong> {empresa?.sector?.division || 'N/A'}</p>
                            <p><strong>Tamaño:</strong> {empresa?.tamanio || 'N/A'}</p>
                            <p><strong>Cantidad de Empleados:</strong> {empresa?.cantidad_empleados || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 inline-block pb-2 w-40 text-black">Descripción</h2>
                        <p className="text-black">{empresa?.descripcion || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 inline-block pb-2 w-40 text-black">
                                Redes Sociales
                            </h2>

                            {/* Ícono de información con tooltip */}
                            <div className="relative group">
                                <FaInfoCircle className="text-black text-lg cursor-pointer" />

                                {/* Tooltip */}
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-8 w-max bg-white text-gray-800 text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Si necesita cambiar una red social, elimine la existente y agregue la nueva red social.
                                </span>
                            </div>

                            <button onClick={openAddRedModal} className="text-orange-400 hover:underline">
                                + Agregar red
                            </button>
                        </div>

                        {/* Renderizado condicional de redes */}
                        {empresa?.red && empresa.red.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
                                {empresa.red.map((red) => (
                                    <div key={red.id_empresa_red} className="flex items-center space-x-2">
                                        <span>{red.nombre_red}</span>
                                        <a
                                            href={red.enlace}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-2xl hover:underline"
                                        >
                                            {renderIcon(red.nombre_red)}
                                        </a>

                                        {/* Botón para eliminar red con confirmación */}
                                        <button
                                            onClick={() => openConfirmDeleteModal(red)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center mt-4 p-4 bg-gray-300 rounded-lg border border-gray-400 text-gray-600">
                                <span>No hay redes sociales agregadas.</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg mt-6">
                        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 inline-block pb-2 w-40 text-black">Plan Contratado</h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getPlanIcon('Estandar')}
                                <span className="text-lg font-semibold">{'Estandar'}</span>
                            </div>
                            <button onClick={openPlanModal} className="bg-blue-500 text-white px-4 py-2 rounded">Ver Otros Planes</button>
                        </div>
                    </div>
                </div>
            </div>
            {modalIsOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                        >
                            &times;
                        </button>
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Empresa</h3>
                            {editedEmpresa && (
                                <div className="mt-2 max-h-96 overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre_comercial">
                                                Nombre Comercial
                                            </label>
                                            <input
                                                id="nombre_comercial"
                                                name="nombre_comercial"
                                                type="text"
                                                value={editedEmpresa.nombre_comercial}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cantidad_empleados">
                                                Cantidad de Empleados
                                            </label>
                                            <input
                                                id="cantidad_empleados"
                                                name="cantidad_empleados"
                                                type="number"
                                                value={editedEmpresa.cantidad_empleados}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                        </div>
                                        <div className="mb-4 sm:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
                                                Descripción
                                            </label>
                                            <textarea
                                                id="descripcion"
                                                name="descripcion"
                                                value={editedEmpresa.descripcion}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                rows={10}
                                            />
                                            {errorDescripcion && (
                                                <p className="text-red-500 text-sm mt-2">{errorDescripcion}</p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provincia">
                                                Provincia
                                            </label>
                                            <select
                                                id="provincia"
                                                name="ubicacion.provincia"
                                                value={selectedProvince}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    setSelectedProvince(e.target.value);
                                                }}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                                <option value="">Seleccione</option>
                                                {provinces.map((province, index) => (
                                                    <option key={index} value={province}>
                                                        {province}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="canton">
                                                Cantón
                                            </label>
                                            <select
                                                id="canton"
                                                name="ubicacion.canton"
                                                value={selectedCanton}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    setSelectedCanton(e.target.value);
                                                }}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                                <option value="">Seleccione</option>
                                                {cantons.map((canton) => (
                                                    <option key={canton.id} value={canton.id}>
                                                        {canton.canton}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sector">
                    Sector
                </label>
                <select
                    id="sector"
                    name="sector.sector"
                    value={selectedSector}
                    onChange={(e) => {
                        handleInputChange(e);
                        setSelectedSector(e.target.value);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Seleccione</option>
                    {sectores.map((sector, index) => (
                        <option key={index} value={sector}>
                            {sector}
                        </option>
                    ))}
                    {isCustomSector && <option value="Otro">Otro</option>}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="division">
                    División
                </label>
                {isDivisionEnabled2 ? (
                    <select
                        id="division"
                        name="sector.division"
                        value={selectedDivision}
                        onChange={(e) => {
                            handleInputChange(e);
                            setSelectedDivision(e.target.value);
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Seleccione</option>
                        {divisiones.map((division) => (
                            <option key={division.id} value={division.id}>
                                {division.division}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={customDivision}
                        onChange={(e) => setCustomDivision(e.target.value)}
                        placeholder="Escriba la división a la que pertenece su empresa"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                )}
            </div>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isCustomSector}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                    />
                    Introducir nuevo sector/división
                </label>
            </div>
      
                                    </div>
                                    <div className="flex items-center justify-center mt-4">
                                        <button onClick={handleSave} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700">
                                            Guardar
                                        </button>
                                        <button onClick={closeModal} className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white ml-4">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <AddRedModal
                isOpen={isAddRedModalOpen}
                onRequestClose={closeAddRedModal}
                reloadProfile={reloadProfile}
                idEmpresa={empresa?.id || 0}
            />
            <EditLogoModal
                isOpen={isEditLogoModalOpen}
                onRequestClose={closeEditLogoModal}
                onSave={(newLogoURL) => {
                    setEmpresa((prevData) => {
                        if (prevData) {
                            return { ...prevData, logo: newLogoURL };
                        }
                        return prevData;
                    });
                }}
                initialImage={empresa?.logo}
                empresaId={empresa?.id || 0}
            />

            <Modal
                isOpen={isConfirmDeleteModalOpen}
                onRequestClose={closeConfirmDeleteModal}
                contentLabel="Confirmar eliminación"
                className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-full max-w-lg mx-auto my-20 relative"
                overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
                <p className="mb-4">¿Estás seguro de que deseas eliminar la red social <strong>{redToDelete?.nombre_red}</strong>?</p>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={closeConfirmDeleteModal}
                        className="px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (redToDelete) {
                                handleDeleteRed(redToDelete.id_empresa_red);
                            }
                            closeConfirmDeleteModal();
                        }}
                        className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        Eliminar
                    </button>
                </div>
            </Modal>
            <PlanModal
                isOpen={isPlanModalOpen}
                onRequestClose={closePlanModal}
                currentPlan={'Estándar'}
            />
        </div>

    );
};

export default EmpresaDetails;
