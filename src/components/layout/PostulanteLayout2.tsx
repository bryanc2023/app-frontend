import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faBars, faTimes, faEnvelope, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import axios from '../../services/axios';
import { RootState } from '../../store';
import { MagnifyingGlassIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/solid';
import ListPostulantes from '../Empresa/ListPostulantes';
import ListEmpresa from '../Empresa/ListEmpresa';
import PerfilPModal from '../../components/PerfilPModal';
import PerfilEModal from '../../components/PerfilEModal';
import { dataNotificable, DataNotifyApi } from '../../types/NotifyType';
import { ProfileData } from '../../types/PostulanteType';
import { Empresa } from '../../types/EmpresaType';

interface Postulante {
    id_postulante: number;
    nombres: string;
    apellidos: string;
    foto: string;
}

interface Idioma {
    id_idioma: number;
    idioma_nombre: string;
    nivel_oral: string;
    nivel_escrito: string;
}

interface Formacion {
    id_titulo: number;
    institucion: string;
    estado: string;
    fecha_ini: Date;
    fecha_fin: Date;
    titulo_acreditado: string;
}

interface Red {
    id_postulante_red: number;
    nombre_red: string;
    enlace: string;
}

interface FormacionPro {
    id_formacion_pro: number;
    empresa: string;
    puesto: string;
    fecha_ini: Date;
    fecha_fin: Date;
    descripcion_responsabilidades: string;
    persona_referencia: string;
    contacto: string;
    anios_e: number;
    area: string;
    mes_e: number;
}

interface Certificado {
    id_certificado: number;
    titulo: string;
    certificado: string;
}

export interface PostulanteData {
    postulante: {
        id_postulante: number;
        nombres: string;
        apellidos: string;
        fecha_nac: Date;
        foto: string;
        edad: number;
        estado_civil: string;
        cedula: string;
        genero: string;
        informacion_extra: string;
        cv: string;
    };
    idiomas: Idioma[];
    formaciones: Formacion[];
    red: Red[];
    formapro: FormacionPro[];
    certificados: Certificado[];
}

interface Sector {
    id: number;
    sector: string;
    division: string;
}

interface Red {
    nombre_red: string;
    enlace: string;
}

interface Ubicacion {
    provincia: string;
    canton: string;
}

export interface EmpresaData {
    nombre_comercial: string;
    tamanio: string;
    descripcion: string;
    logo: string;
    cantidad_empleados: number;
    ubicacion: Ubicacion;
    sector: Sector;
    red: Red[];
}

const initialPostulanteData: PostulanteData = {
    postulante: {} as PostulanteData['postulante'],
    idiomas: [],
    formaciones: [],
    red: [],
    formapro: [],
    certificados: []
};

const initialEmpresaData: EmpresaData = {
    nombre_comercial: '',
    tamanio: '',
    descripcion: '',
    logo: '',
    cantidad_empleados: 0,
    sector: {
        id: 0,
        sector: '',
        division: ''
    },
    ubicacion: {
        provincia: '',
        canton: ''
    },
    red: []
};

const useDebounce = (value: string, delay: number): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

function PostulanteLayout() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const location = useLocation();

    const [query, setQuery] = useState(''); // Guardará el nombre y apellido del postulante
    const [postulantes, setPostulantes] = useState<Postulante[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsmodal] = useState(false);

    const [isModalPost, setIsModalPost] = useState(false);
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const [dataPost, setDataPost] = useState<PostulanteData>(initialPostulanteData);

    const [queryEmpresa, setQueryEmpresa] = useState('');
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
    const [isModalEmpresas, setIsModalEmpresas] = useState(false);

    const [isModalEmpresa, setIsModalEmpresa] = useState(false);
    const [isLoadingEmpresa, setIsLoadingEmpresa] = useState(false);
    const [dataEmpresa, setDataEmpresa] = useState<EmpresaData>(initialEmpresaData);

    const [select, setSelect] = useState(1);

    const debouncedQuery = useDebounce(query, 300); // Ajusta el delay según sea necesario
    const debouncedQueryEmpresa = useDebounce(queryEmpresa, 300);

    const [notificaciones, setNotificaciones] = useState<dataNotificable[]>([]);
    const [, setLoadNotificaciones] = useState(false);
    const [isModalNotify, setIsModalNotify] = useState(false);
    const notifyRef = useRef<HTMLDivElement>(null);

    

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Llama a la acción de logout cuando el usuario intenta cerrar la pestaña
            dispatch(logout());
            // También puedes mostrar un mensaje al usuario, pero es limitado por los navegadores
            event.preventDefault(); // Evita que se muestre el mensaje
            return true; // Necesario para algunos navegadores
        };

        // Solo agregar el evento si el usuario está autenticado
        if (user) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        // Limpieza del efecto
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [dispatch, user]); 


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
                setIsModalNotify(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef, notifyRef]);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleContentClick = () => {
        // No cerrar la barra lateral al hacer clic fuera de ella
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (user) {
                    const response = await axios.get(`/perfil/${user.id}`);
                    if (response.data && response.data.postulante) {
                        setProfileData(response.data);
                    } else {
                        console.error('Invalid profile data:', response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
    
        if (user) {
            fetchProfileData();
        }
    }, [user]);
    

    // Busca a todos los postulantes
    const searchPostulante = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsmodal(true);
            const { data } = await axios.get('postulanteByName', {
                params: {
                    'nombre_apellido': query
                }
            });

            setPostulantes(data);
        } catch (error) {
            setPostulantes([]);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    // Datos de la empresa
    const searchEmpresa = useCallback(async () => {
        try {
            setIsLoadingEmpresas(true);
            setIsModalEmpresas(true);
            const { data } = await axios.get('getEmpresaByName', {
                params: {
                    'nombre_comercial': queryEmpresa
                }
            });

            setEmpresas(data);
        } catch (error) {
           
            setEmpresas([]);
        } finally {
            setIsLoadingEmpresas(false);
        }
    }, [queryEmpresa]);

   

    const closeModal = () => {
        setIsmodal(false);
    };

    const closeModalEmpresa = () => {
        setIsModalEmpresas(false);
    };

    // Comprueba si está vacío el query para cerrar el modal
    useEffect(() => {
        if (!query) {
            setIsmodal(false);
        }
        if (!queryEmpresa) {
            setIsModalEmpresas(false);
        }
    }, [query, queryEmpresa]);

    // Maneja el cambio de selección
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelect(Number(event.target.value));
    };

    // UseEffect para limpiar la consulta
    useEffect(() => {
        if (select === 1) {
            setQueryEmpresa(''); // Limpia el query relacionado con empresas
            setEmpresas([]);
            setIsModalEmpresas(false);
        } else if (select === 2) {
            setQuery('');
            setPostulantes([]);
            setIsmodal(false);
        }
    }, [select]);

    // UseEffect para actualizar los resultados de búsqueda en tiempo real
    useEffect(() => {
        if (debouncedQuery.trim() !== '') {
            searchPostulante();
        } else {
            setPostulantes([]);
        }
    }, [debouncedQuery, searchPostulante]);

    useEffect(() => {
        if (debouncedQueryEmpresa.trim() !== '') {
            searchEmpresa();
        } else {
            setEmpresas([]);
        }
    }, [debouncedQueryEmpresa, searchEmpresa]);

    // Función para traer los datos completos del postulante y abrir el modal
    const getPostulante = async (postulanteData: Postulante) => {
        try {
            setIsLoadingPost(true);
            setIsModalPost(true);

            // Consulto a la API
            const { data } = await axios.get(`postulante/${postulanteData.id_postulante}`);
            setDataPost(data);
            
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingPost(false);
        }
    };

    // Función para traer los datos completos de la empresa y abrir el modal
    const getEmpresa = async (idEmpresa: Empresa['id_empresa']) => {
        try {
            setIsLoadingEmpresa(true);
            setIsModalEmpresa(true);

            const { data } = await axios.get(`getEmpresaById/${idEmpresa}`);
            setDataEmpresa(data);
           
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingEmpresa(false);
        }
    };

    // Obtener notificaciones
    const getNotificaciones = async () => {
        try {
            setLoadNotificaciones(true);
            const { data } = await axios.get<DataNotifyApi[]>('notificaciones');
            const notify = data.map(notification => ({
                ...notification.data,
                id: notification.id,
                mensaje: notification.data.mensaje || notification.data.asunto
            }));
        

            setNotificaciones(notify);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadNotificaciones(false);
        }
    };

    // Marcar una notificación como leída
    const marcarLeida = async (id: string) => {
        try {
            await axios.post(`/notificaciones/${id}`);
            setNotificaciones(notificaciones.filter(notificacion => notificacion.id !== id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Marcar todas las notificaciones como leídas
    const marcarTodasLeidas = async () => {
        try {
            await axios.post('/notificacionesL');
            setNotificaciones([]);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const openModalNotify = () => {
        setIsModalNotify(true);
    };

    useEffect(() => {
        getNotificaciones();
    }, []);

    return (
        <>
        <header className="bg-gray-800 p-4 flex justify-between items-center fixed w-full z-50">
         

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-auto">
                
                {/* Top Nav */}
                <nav className="bg-gray-900 text-white p-4 flex justify-between items-center w-full fixed top-0 left-0 right-0 z-30">
                <h1 className="text-white text-2xl font-bold">
                        Postula
                    </h1>
                    <div className="relative flex gap-2 items-center">
                        <div className="relative" ref={notifyRef}>
                            <button onClick={() => openModalNotify()}>
                                <BellIcon className="w-6" />
                                {notificaciones.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                        {notificaciones.length}
                                    </span>
                                )}
                            </button>
                            {isModalNotify && (
                                <div className="absolute mt-2 w-64 right-0 z-30">
                                    <div className="bg-white p-5 shadow-xl rounded-lg w-full relative">
                                        <div className="flex justify-between text-orange-500 mb-3">
                                            <h3 className="text-center text-lg font-semibold">Notificaciones</h3>
                                            <button onClick={() => setIsModalNotify(false)}>
                                                <XMarkIcon className="w-6" />
                                            </button>
                                        </div>
                                        {notificaciones.length > 0 ? (
                                            notificaciones.map((notificacion) => (
                                                <div key={notificacion.id} className="bg-gray-50 p-2 my-2 rounded-lg">
                                                    <p className="font-semibold text-gray-700">{notificacion.mensaje}</p>
                                                    <p className="text-gray-500">{notificacion.asunto}</p>
                                                    <p className="text-gray-500">{notificacion.destinatario}</p>
                                                    <button
                                                        className="text-blue-500 text-sm"
                                                        onClick={() => marcarLeida(notificacion.id)}
                                                    >
                                                        Marcar como leída
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500">No hay notificaciones</p>
                                        )}
                                        <button
                                            className="bg-blue-500 text-white py-2 px-4 rounded mt-2 w-full"
                                            onClick={marcarTodasLeidas}
                                        >
                                            Marcar todas como leídas
                                        </button>
                                    </div>
                                </div>
                            )}
                        
                        </div>
                        <div ref={dropdownRef}> 
                            <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                                <img
                                    src={profileData ? profileData.postulante.foto : 'https://via.placeholder.com/30'}
                                    alt="Foto de Perfil"
                                    className="rounded-full w-8 h-8 object-cover mr-2"
                                />
                                <span className="hidden lg:inline">{user ? `${user.name} ` : 'Postulante'}</span>
                                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                            </button>
                            {dropdownOpen && (
                                <ul className="absolute mt-2 w-48 bg-white text-black shadow-lg rounded-md overflow-hidden z-20" style={{ top: '100%', right: '0' }}>
                                    <li className="px-4 py-2 hover:bg-gray-200 rounded-md">
                                        <Link to="/perfilP">Mi Perfil</Link>
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-200 rounded-md">
                                        <Link to="/" onClick={() => { dispatch(logout()); setDropdownOpen(false); }}>Cerrar Sesión</Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                  
                </nav>

             
               
            </div>
        </header>
         <div className="pt-16">
         <Outlet />
       </div>
      </>
    );
}

export default PostulanteLayout;
