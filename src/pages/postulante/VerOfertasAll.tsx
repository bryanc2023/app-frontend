import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../../store';
import axios from "../../services/axios";
import { FaHandPaper, FaSearch } from 'react-icons/fa';
import { FiUser, FiEye, FiMapPin } from 'react-icons/fi';
import Modal from '../../components/Postulante/PostulacionModal';
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

interface Oferta {
    id_oferta: number;
    estado: string;
    cargo: string;
    areas: {
        id: number;
        nombre_area: string;
    };
    empresa: {
        id_empresa: string,
        nombre_comercial: string;
        logo: string;
        id_ubicacion: number;
        ubicacion: {
            provincia: string;
            canton: string;
        };
    };
    fecha_max_pos: string;
    fecha_publi: string;
    n_mostrar_empresa: number;
    modalidad: string;
    carga_horaria: string;
    experiencia: number;
    funciones: string;
    objetivo_cargo: string;
    detalles_adicionales: string;
    criterios: Criterio[];
    expe: {
        titulo: string;
        nivel_educacion: string;
        campo_amplio: string;
        pivot: {
            titulo_per2: string | null;
        };
    }[];
    sueldo: number;
    n_mostrar_sueldo: number;
    soli_sueldo: number;
    correo_contacto: string;
    numero_contacto: string;
    preguntas: Pregunta[];
    comisiones: number | null;
    horasExtras: number | null;
    viaticos: number | null;
    comentariosComisiones: string | null;
    comentariosHorasExtras: string | null;
    comentariosViaticos: string | null;
    exp_m: boolean;
}

interface Pregunta {
    id: number;
    id_oferta: number;
    pregunta: string;
}
interface Criterio {
    criterio: string;
    pivot: {
        valor: string;
    };
}

interface Area {
    id: number;
    nombre_area: string;
}

interface Canton {
    id: number;
    canton: string;
}
const VerOfertasAll = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user,token,isLogged,role } = useSelector((state: RootState) => state.auth);
    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchEmpresa, setSearchEmpresa] = useState('');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedCarga, setSelectedCarga] = useState('');
    const [selectedModalidad, setSelectedModalidad] = useState('');
    const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fechaMaxPosFilter, setFechaMaxPosFilter] = useState('');
    const [provinces, setProvinces] = useState<string[]>([]);
    const [cantons, setCantons] = useState<Canton[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCanton, setSelectedCanton] = useState<number | string>('');
    const [loading, setLoading] = useState(true);
    const ofertasPerPage = 5;

    const formatFechaMaxPos = (fecha: string) => {
        const date = new Date(fecha);
        date.setDate(date.getDate() + 1);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    useEffect(() => {
        const userInfo= async () => {
          if(!user|| !token || !isLogged || !role){
             // Cerrar sesión y redirigir al login
             dispatch(logout());
             window.localStorage.removeItem("token");
             window.localStorage.removeItem('role');
             window.localStorage.removeItem('role');
             navigate("/login");
             return;
          }
        };
        const getFirstLoginDate = async () => {
            try {

                if (!user || !user.id) {
                    throw new Error('User ID not available');
                }

                const response = await axios.get(`first?user_id=${user.id}`);
                const { data } = response;

                if (!data.hasOwnProperty('has_first_login')) {
                    throw new Error('Invalid response format');
                }

                const hasFirstLogin = data.has_first_login;


                if (!hasFirstLogin) {
                    navigate('/completar'); // Redirigir a completar perfil si no tiene first_login_at y está logeado
                } else {
                    navigate('/verOfertasAll'); // Redirigir a ver ofertas si tiene first_login_at
                }
            } catch (error) {
                console.error('Error fetching first login status:', error);
                // Manejar el error según tus necesidades, por ejemplo, mostrar un mensaje de error
            }
        };
        userInfo();
        getFirstLoginDate
        fetchOfertas();
        fetchAreas();
        fetchData();

    }, []);



    const fetchData = async () => {
        try {
            const response = await axios.get('ubicaciones');
            setProvinces(response.data.provinces);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const fetchCantons = async () => {
            if (selectedProvince) {
                try {
                    const response = await axios.get(`ubicaciones/cantonesid/${selectedProvince}`);
                    setCantons(response.data);
                } catch (error) {
                    console.error('Error fetching cantons:', error);
                }
            }
        };

        fetchCantons();
    }, [selectedProvince]);

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);
        setSelectedCanton('');
    };

    const handleCantonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCanton(Number(e.target.value));
    };

    const fetchAreas = async () => {
        try {
            const response = await axios.get('areas');
            if (response.data.areas) {
                setAreas(response.data.areas);
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchOfertas = async () => {
        try {
            const response = await axios.get('ofertas');
            if (response.data.ofertas) {
                setOfertas(response.data.ofertas);
            }
        } catch (error) {
            console.error('Error fetching ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfertas = ofertas?.filter((oferta) =>
        (searchTerm === '' || oferta.cargo.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedArea === '' || oferta.areas.nombre_area === selectedArea) &&
        (selectedCanton === '' || oferta.empresa.id_ubicacion === selectedCanton) &&
        (selectedCarga === '' || oferta.carga_horaria === selectedCarga) &&
        (searchEmpresa === '' || oferta.empresa.nombre_comercial.toLowerCase().includes(searchEmpresa.toLowerCase())) &&
        (selectedModalidad === '' || oferta.modalidad === selectedModalidad) &&
        (fechaMaxPosFilter === '' || oferta.fecha_max_pos === fechaMaxPosFilter)
    ) || [];

    const indexOfLastOferta = currentPage * ofertasPerPage;
    const indexOfFirstOferta = indexOfLastOferta - ofertasPerPage;
    const currentOfertas = filteredOfertas.slice(indexOfFirstOferta, indexOfLastOferta);

    useEffect(() => {
        if (showAdvancedSearch) {
            setCurrentPage(1);
        }
    }, [showAdvancedSearch]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedArea('');
        setSelectedCanton('');
        setSelectedProvince('');
        setSearchEmpresa('');
        setSelectedModalidad('');
        setSelectedCarga('');
        setFechaMaxPosFilter('');
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="w-full p-4 flex justify-center">
            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-center mb-4">
                    <FaHandPaper className="text-blue-500 text-2xl mr-2" />
                    <h1 className="text-2xl font-semibold text-blue-500">REALIZAR POSTULACIÓN</h1>
                </div>
                <p>En esta sección te mostramos todos las ofertas publicadas por las empresas, puedes postular en cualquier oferta de interes. Recuerda siempre tener generado tu hoja de vida para poder hacerlo</p>
                <hr className="my-4" />
                <div className="flex mb-4">
                    <div className="relative flex w-full">
                        <input
                            type="text"
                            className="border border-gray-300 p-2 rounded mr-2 w-full"
                            placeholder="Buscar por cargo"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        onClick={() => {
                            setShowAdvancedSearch(!showAdvancedSearch);
                            if (showAdvancedSearch) {
                                clearFilters();
                            }
                        }}
                    >
                        {showAdvancedSearch ? 'Ocultar Búsqueda Avanzada' : 'Búsqueda Avanzada'}
                    </button>
                </div>

                {showAdvancedSearch && (
                    <div className="mb-4 p-4 border border-gray-300 rounded">
                        <h2 className="text-xl font-semibold mb-4">Búsqueda Avanzada</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="empresa" className="block font-medium text-gray-700">Búsqueda por empresa:</label>
                                <input
                                    type="text"
                                    id="empresa"
                                    value={searchEmpresa}
                                    onChange={(e) => setSearchEmpresa(e.target.value)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                    placeholder="Buscar por empresa"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="area" className="block mt-4 md:mt-0 font-medium text-gray-700">Búsqueda por área:</label>
                                <select
                                    id="area"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                >
                                    <option value="">Seleccione un área</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.nombre_area}>
                                            {area.nombre_area}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="fechaMaxPos" className="block mt-4 md:mt-0 font-medium text-gray-700">Búsqueda por fecha máxima de postulación:</label>
                                <input
                                    type="date"
                                    id="fechaMaxPos"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={fechaMaxPosFilter}
                                    onChange={(e) => setFechaMaxPosFilter(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="carga" className="block mt-4 md:mt-0 font-medium text-gray-700">Búsqueda por carga horaria:</label>
                                <select
                                    id="carga"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={selectedCarga}
                                    onChange={(e) => setSelectedCarga(e.target.value)}
                                >
                                    <option value="">Seleccione una carga</option>
                                    <option value="Tiempo Parcial">Tiempo parcial</option>
                                    <option value="Tiempo Completo">Tiempo Completo</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="modalidad" className="block mt-4 md:mt-0 font-medium text-gray-700">Búsqueda por modalidad:</label>
                                <select
                                    id="modalidad"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={selectedModalidad}
                                    onChange={(e) => setSelectedModalidad(e.target.value)}
                                >
                                    <option value="">Seleccione una modalidad</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Hibrida">Hibrida</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="modalidad" className="block mt-4 md:mt-0 font-medium text-gray-700">Provincia:</label>
                                <select id="province" className="border border-gray-300 p-2 rounded w-full" onChange={handleProvinceChange}>
                                    <option value="">Seleccione</option>
                                    {provinces.map((province, index) => (
                                        <option key={index} value={province}>
                                            {province}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="modalidad" className="block mt-4 md:mt-0 font-medium text-gray-700">Canton:</label>
                                <select
                                    id="canton"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    disabled={!selectedProvince}
                                    onChange={handleCantonChange}
                                    value={selectedCanton}
                                >
                                    <option value="">Seleccione</option>
                                    {cantons.map((canton) => (
                                        <option key={canton.id} value={canton.id}>
                                            {canton.canton}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <span className="font-bold">Cargando...</span>
                        </div>
                    </div>
                ) : currentOfertas.length === 0 ? (
                    <p>Todavía no se han publicado ofertas.</p>
                ) : (
                    <>
                        <hr className="my-4" />
                        <h1 className="text-2xl font-bold mb-4">OFERTAS PUBLICADAS:</h1>
                        <div className="relative overflow-x-auto">
                            <div className="flex flex-col gap-4">
                                {currentOfertas.map((oferta) => (
                                    <div key={oferta.id_oferta} className="w-full relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4 flex flex-col lg:flex-row items-center">
                                        <div className="relative w-full lg:w-80 lg:h-52 flex items-center justify-center overflow-hidden mt-4 lg:mt-0 order-2 lg:order-1">
                                            <img
                                                src={oferta.n_mostrar_empresa === 1 ? '/images/anonima.png' : oferta.empresa.logo}
                                                alt="Logo"
                                                className="w-3/4 h-auto md:w-full md:h-full object-contain max-w-xs max-h-60"
                                            />
                                        </div>
                                        <div className="flex-1 pr-4 order-1 lg:order-2 mt-8 lg:mt-8">
                                            <div className="text-center mb-2 flex items-center justify-center lg:justify-start">
                                                <FiUser className="text-blue-800 mr-2" size={24} />
                                                <h2 className="text-xl font-bold text-blue-800 lg:ml-4">{oferta.cargo}</h2>
                                            </div>

                                            <p className="text-gray-700 mb-1"><strong>Empresa:</strong> {oferta.n_mostrar_empresa === 1 ? 'Confidencial' : oferta.empresa.nombre_comercial}</p>
                                            <p className="text-gray-700 mb-1"><strong>Área:</strong> {oferta.areas.nombre_area.charAt(0).toUpperCase() + oferta.areas.nombre_area.slice(1).toLowerCase()}</p>
                                            <p className="text-gray-700 mb-1"><strong>Carga Horaria:</strong> {oferta.carga_horaria}</p>
                                            <p className="text-gray-700 mb-1"><strong>Fecha Máxima De Postulación:</strong> {formatFechaMaxPos(oferta.fecha_max_pos)}</p>

                                            <center>
                                                <button
                                                    onClick={() => setSelectedOferta(oferta)}
                                                    className="flex items-center justify-center bg-green-500 text-white p-2 rounded-lg mt-4"
                                                >
                                                    Ver Oferta <FiEye className="ml-2" />
                                                </button>
                                            </center>
                                        </div>

                                        {/* Ubicación de la empresa */}
                                        <div className="absolute top-2 right-2 flex items-center text-gray-700">
                                            <FiMapPin className="text-blue-800 mr-1" />
                                            <span>{oferta.empresa.ubicacion.provincia}, {oferta.empresa.ubicacion.canton}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {filteredOfertas.length > ofertasPerPage && (
                            <div className="mt-4 flex justify-end">
                                <nav className="relative z-0 inline-flex shadow-sm rounded-md">
                                    <a
                                        href="#"
                                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                    >
                                        <span className="sr-only">Anterior</span>
                                        Anterior
                                    </a>
                                    {Array.from({ length: Math.ceil(filteredOfertas.length / ofertasPerPage) }, (_, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            onClick={() => paginate(i + 1)}
                                            className={`-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === i + 1 ? 'text-blue-500 bg-blue-100' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                        >
                                            {i + 1}
                                        </a>
                                    ))}
                                    <a
                                        href="#"
                                        onClick={() => paginate(currentPage < Math.ceil(filteredOfertas.length / ofertasPerPage) ? currentPage + 1 : Math.ceil(filteredOfertas.length / ofertasPerPage))}
                                        className={`-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(filteredOfertas.length / ofertasPerPage) ? 'text-gray-500 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        Siguiente
                                    </a>
                                </nav>
                            </div>
                        )}
                        {selectedOferta && <Modal oferta={selectedOferta} onClose={() => setSelectedOferta(null)} userId={user?.id} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default VerOfertasAll;
