import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../../services/axios';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { FiEdit, FiPlus, FiEye, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


interface Oferta {
    id_oferta: number;
    estado: string;
    cargo: string;
    areas: {
        nombre_area: string;
    };
    fecha_publi: string;
    objetivo_cargo: string;
    modalidad: string;
    sueldo: number;
    funciones: string;
    carga_horaria: string;
    experiencia: number;
    mostrar_empresa: number;
    criterios: Criterio[];
    expe: Experiencia[];
    fecha_max_pos: string;
    detalles_adicionales: string;
    correo_contacto: string;
    numero_contacto: string;
    n_mostrar_sueldo: boolean;
    n_mostrar_empresa: boolean;
    soli_sueldo: boolean;
    preguntas: Pregunta[];
    // Define otros campos de la oferta según sea necesario
    comisiones: number | null;
    horasExtras: number | null;
    viaticos: number | null;
    comentariosComisiones: string | null;
    comentariosHorasExtras: string | null;
    comentariosViaticos: string | null;
    exp_m: boolean;
    dest: boolean;
    ciudad: string | null;
}

interface Pregunta {
    id: number;
    pregunta: string;
}

interface Criterio {
    id_criterio: number;
    criterio: string;
    descripcion: string;
    pivot: {
        valor: string;
    };
}

interface Experiencia {
    id: number;
    nivel_educacion: string;
    campo_amplio: string;
    titulo: string;
    pivot: {
        titulo_per2: string | null;
    };
}

interface Area {
    id: number;
    nombre_area: string;
}


interface Configuracion {
    dias_max_edicion: number;
    dias_max_eliminacion: number;
}

function VerOfertasPPage() {
    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null); // Estado para almacenar la oferta seleccionada
    const [selectedFechaInicio, setSelectedFechaInicio] = useState<string>('');
    const [selectedFechaFin, setSelectedFechaFin] = useState<string>('');
    const [selectedEstado, setSelectedEstado] = useState<string>(''); // Estado para almacenar el estado seleccionado
    const [selectedArea, setSelectedArea] = useState<string>(''); // Estado para almacenar el área seleccionada
    const [selectedCargaHoraria, setSelectedCargaHoraria] = useState<string>(''); // Estado para almacenar la carga horaria seleccionada
    const [selectedCargo, setSelectedCargo] = useState<string>(''); // Estado para almacenar el estado seleccionado
    const { user } = useSelector((state: RootState) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [ofertasPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú desplegable
    const [areas, setAreas] = useState<Area[]>([]);
    const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
    const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
    const [selectedDate, setSelectedDate] = useState(""); // Fecha seleccionada
    const [ofertaIdReactivar, setOfertaIdReactivar] = useState(null); // Estado para el id de la oferta a reactivar


    // Obtener la fecha de hoy
    const handleReactivar = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Se reactivara esta oferta',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {

            try {
                await axios.put(`/reactivarO/${ofertaIdReactivar}`, {
                    fecha_max_pos: selectedDate // Envía la fecha seleccionada
                });
                Swal.fire({
                    title: 'Oferta Reactivada',
                    text: 'La oferta se ha reactivado',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    fetchOfertas();
                    setOfertaIdReactivar(null);
                    setShowModal(false);
                });
            } catch (error) {
                Swal.fire('Error', 'Hubo un error al reactivar la oferta.', 'error');
            }

        }

    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const today = new Date().toISOString().split("T")[0]; // Obtener la fecha de hoy


    const navigate = useNavigate();

    useEffect(() => {
        fetchOfertas();
        fetchConfiguracion();
        const checkRegistrationStatus = async () => {
            const response = await axios.get('user/registration-status');

            const { profileCompleted } = response.data;

            if (!profileCompleted) {
                navigate('/completarE');
                return;
            }
        }

        checkRegistrationStatus();
    }, []);

    const fetchConfiguracion = async () => {
        try {
            const response = await axios.get('/configuracion/activa');
            setConfiguracion(response.data);
        } catch (error) {
            console.error('Error fetching configuracion:', error);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(`${dateString}T00:00:00`);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };



    const fetchOfertas = async () => {
        if (user) {
            try {
                setLoading(true);
                const response2 = await axios.get('areas');
                const response = await axios.get(`empresa/${user.id}/ofertas`); // Reemplaza con tu URL y ID de empresa
                setOfertas(response.data.ofertas);
                setAreas(response2.data.areas);
            } catch (error) {
                console.error('Error fetching ofertas:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Función para mostrar los detalles de la oferta seleccionada en el modal
    const handleVerDetalles = (oferta: Oferta) => {
        setSelectedOferta(oferta);
        // Lógica para mostrar el modal aquí (puedes usar estados, context, etc.)
    };



    // Función para cerrar el modal de detalles
    const handleCloseModal = () => {
        setSelectedOferta(null);
    };

    const handleFilter = async () => {
        try {
            setLoading(true);
            setIsFiltering(true);

            if (selectedFechaInicio && !selectedFechaFin) {
                Swal.fire('Error', 'Debe ingresar una fecha de fin', 'error');
                setLoading(false);
                return;
            }
            const response = await axios.get(`empresa/${user?.id}/ofertas`, {
                params: {
                    ...(selectedCargo && { cargo: selectedCargo }),
                    ...(selectedFechaInicio && { fecha_inicio: selectedFechaInicio }),
                    ...(selectedFechaFin && { fecha_fin: selectedFechaFin }),
                    ...(selectedEstado && { estado: selectedEstado }),
                    ...(selectedArea && { area: selectedArea }),
                    ...(selectedCargaHoraria && { carga_horaria: selectedCargaHoraria }),
                },
            });

            setOfertas(response.data.ofertas);
        } catch (error) {
            console.error('Error filtering ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para borrar los filtros y recuperar la información inicial
    const handleClearFilters = () => {

        setSelectedCargo('');
        setSelectedFechaInicio('');
        setSelectedFechaFin('');
        setSelectedEstado('');
        setSelectedArea('');
        setSelectedCargaHoraria('');
        setIsFiltering(false);
        fetchOfertas();

    };


    const handleDeleteOferta = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {

            try {
                await axios.delete(`/oferta/${id}`);
                Swal.fire({
                    title: 'Oferta Eliminada',
                    text: 'La oferta ha sido eliminada exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    fetchOfertas();
                });
            } catch (error) {
                Swal.fire('Error', 'Hubo un error al eliminar la oferta.', 'error');
            }

        }
    };

    // Calcula las ofertas a mostrar en la página actual
    const indexOfLastOferta = currentPage * ofertasPerPage;
    const indexOfFirstOferta = indexOfLastOferta - ofertasPerPage;
    const currentOfertas = ofertas.slice(indexOfFirstOferta, indexOfLastOferta);

    const renderCriterioValor = (criterio: Criterio) => {
        if (criterio && criterio.pivot && criterio.pivot.valor) {
            const valorArray = criterio.pivot.valor.split(",");

            switch (criterio.criterio) {
                case 'Experiencia':
                    return criterio.pivot.valor ? "Si el postulante cumple con los años/meses indicados para la oferta" : "Si el postulante cumple con los años/meses indicados para la oferta";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados" : "Alguno de los títulos mencionados";
                case 'Sueldo':
                    return criterio.pivot.valor ? "Sueldo prospecto del postulante" : "Indicar el sueldo prospecto a ganar";
                case 'Género':
                    return criterio.pivot.valor ? criterio.pivot.valor : "No especificado";
                case 'Estado Civil':
                    switch (criterio.pivot.valor) {
                        case "Casado":
                            return "Casado/a";
                        case "Soltero":
                            return "Soltero/a";
                        default:
                            return "Viudo/a";
                    }
                case 'Idioma':
                    return valorArray.length > 1 ? valorArray[1].trim() : criterio.pivot.valor;
                case 'Edad':
                    return valorArray.length > 1 ? valorArray[1].trim() : criterio.pivot.valor;
                case 'Ubicación':
                    return valorArray.length > 1 ? `${valorArray[1].trim()}, ${valorArray[2].trim()}` : criterio.pivot.valor;
                default:
                    return criterio.pivot.valor ? criterio.pivot.valor : "No especificado";
            }
        } else {

            switch (criterio.criterio) {
                case 'Experiencia':

                    return criterio.pivot.valor ? "Si el postulante cumple con los años/meses indicados para la oferta" : "Si el postulante cumple con los años/meses indicados para la oferta";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados" : "Alguno de los títulos mencionados";
                case 'Sueldo':
                    return criterio.pivot.valor ? "El sueldo prospecto a ganar del postulante" : "El sueldo prospecto a ganar del postulante";
                case 'Género':
                default:
                    return "No especificado";
            }
        }
    };

    const isEditableOrDeletable = (fecha_publi: string) => {
        if (!configuracion) { return { editable: false, eliminable: false } } else {


            const fechaPublicacion = new Date(fecha_publi);
            const fechaActual = new Date();
            const diffInDays = Math.floor((fechaActual.getTime() - fechaPublicacion.getTime()) / (1000 * 3600 * 24));


            return {
                editable: diffInDays <= configuracion.dias_max_edicion,
                eliminable: diffInDays <= configuracion.dias_max_eliminacion
            };
        }
    };




    return (
        <div className="w-full p-4">
            <div className="mb-4 text-center max-w-screen-lg mx-auto">
                <h1 className="text-3xl font-bold mb-4 flex justify-center items-center text-orange-500 ml-2">
                    GESTIÓN DE OFERTAS
                    <FiEdit className="text-orange-500 ml-2" />
                </h1>
                <p>En esta sección te mostramos todas las ofertas creadas hasta el momento, puedes seleccionar una fecha de publicación para filtrar la lista de ofertas publicadas manejarte de mejor manera</p>

                <div className="flex justify-center items-center mt-4 space-x-4">
                    <div className="relative">
                        <div className="bg-gray-100 p-4 rounded-lg shadow-md max-w-xl text-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center"
                            >
                                <FiSearch className="mr-2" />
                                <span>Búsqueda avanzada</span>
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md max-w-xl text-center">
                        <Link to="/add-oferta" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 flex items-center justify-center">
                            <FiPlus className="mr-2" /> Publicar Nueva Oferta
                        </Link>
                    </div>
                </div>
                {isMenuOpen && (
                    <>
                        <hr className="my-4" />
                        <center><strong>Filtra las ofertas según los siguientes criterios:</strong></center>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 p-4   rounded-lg shadow-md  ">
                            <div className="mb-4">
                                <label htmlFor="cargo" className="block font-semibold text-orange-500">
                                    Cargo:
                                </label>
                                <input
                                    type="text"
                                    id="cargo"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedCargo}
                                    placeholder='Cargo de la oferta'
                                    onChange={(e) => setSelectedCargo(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="fechaInicio" className="block font-semibold text-orange-500">
                                    Fecha inicio:
                                </label>
                                <input
                                    type="date"
                                    id="fechaInicio"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedFechaInicio}
                                    onChange={(e) => setSelectedFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="fechaFin" className="block font-semibold text-orange-500">
                                    Fecha fin:
                                </label>
                                <input
                                    type="date"
                                    id="fechaFin"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedFechaFin}
                                    onChange={(e) => {
                                        if (new Date(e.target.value) < new Date(selectedFechaInicio)) {
                                            Swal.fire('Error', 'La fecha de fin no puede ser menor que la fecha de inicio', 'error');
                                        } else {
                                            setSelectedFechaFin(e.target.value);
                                        }
                                    }}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="selectEstado" className="block font-semibold text-orange-500">
                                    Estado:
                                </label>
                                <select
                                    id="selectEstado"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="Culminada">Culminada</option>
                                    <option value="En espera">En espera</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="selectArea" className="block font-semibold text-orange-500">
                                    Área:
                                </label>
                                <select
                                    id="selectArea"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                >
                                    <option value="">Todas</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>
                                            {area.nombre_area}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="selectCargaHoraria" className="block font-semibold text-orange-500">
                                    Carga Horaria:
                                </label>
                                <select
                                    id="selectCargaHoraria"
                                    className="px-2 py-1 border border-gray-300 rounded w-full"
                                    value={selectedCargaHoraria}
                                    onChange={(e) => setSelectedCargaHoraria(e.target.value)}
                                >
                                    <option value="">Todas</option>
                                    <option value="Tiempo Completo">Tiempo Completo</option>
                                    <option value="Tiempo Parcial">Tiempo Parcial</option>
                                </select>
                            </div>
                            <div className="flex justify-between col-span-1 sm:col-span-2 lg:col-span-3">
                                <button
                                    onClick={handleFilter}
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
                                >
                                    Borrar filtros
                                </button>
                            </div>
                        </div>
                    </>
                )}





            </div>
            {/* Modal de reactivación */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Reactivar Oferta</h2>
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
                                    Reactivarla permite volver a publicar la oferta y que sea visible nuevamente
                                </h1>
                            </div>
                        </div>
                        <label htmlFor="fechaReactivacion" className="block mb-2">
                            Selecciona la fecha de maxima de postulacion:
                        </label>
                        <input
                            type="date"
                            id="fechaReactivacion"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={today}
                            className="border rounded px-4 py-2 w-full"
                        />
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowModal(false)} className="mr-4 px-4 py-2 bg-gray-300 rounded">Cancelar</button>
                            <button onClick={handleReactivar} className="px-4 py-2 bg-green-500 text-white rounded">Reactivar</button>
                        </div>
                    </div>
                </div>
            )}
            {selectedOferta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`bg-gradient-to-b from-gray-200 to-white p-4 rounded-lg shadow-lg max-w-5xl w-full mx-4 overflow-auto ${selectedOferta.dest ? 'bg-gradient-to-b from-white to-orange-200 border border-b-0 shadow-xl' : ''}`} style={{ maxHeight: '80vh', position: 'relative' }}>
                        {selectedOferta.dest ? ( // Solo muestra el elemento si es 'dest'
                            <div className="absolute top-2 right-2 text-gold text-xl font-semibold">
                                ⭐ DESTACADA
                            </div>
                        ) : null}

                        <h2 className="text-xl mb-4 text-center text-blue-500">
                            <strong>CARGO:</strong> {selectedOferta.cargo}
                        </h2>
                        <div className="text-center mb-4 text-sm text-gray-500">
                            <p>
                                <FaCalendarAlt className="inline-block mr-1" />
                                <strong>Fecha de Publicación:</strong> {formatDate(selectedOferta.fecha_publi)}
                            </p>
                            <p>
                                <FaCalendarAlt className="inline-block mr-1 text-orange-800" />
                                <strong className=" text-orange-800">Fecha Máxima de postulación:</strong> {formatDate(selectedOferta.fecha_max_pos)}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-100 rounded shadow">
                                <div className="flex flex-col space-y-2"> {/* Cambiar a flex-col para distribución vertical */}
                                    <p><strong>Estado:</strong> {selectedOferta.estado}</p>
                                    <p><strong>Área: </strong>{selectedOferta.areas.nombre_area}</p>
                                    <p><strong>Carga Horaria: </strong>{selectedOferta.carga_horaria}</p>
                                    {selectedOferta.ciudad && (
                                        <p><strong>Ciudad específica para la oferta: </strong>{selectedOferta.ciudad}</p>
                                    )}
                                    <p><strong>Experiencia Mínima: </strong>
                                        {selectedOferta.experiencia === 0
                                            ? 'Ninguna'
                                            : `${selectedOferta.experiencia} ${selectedOferta.exp_m
                                                ? (selectedOferta.experiencia > 1 ? 'meses' : 'mes')
                                                : (selectedOferta.experiencia > 1 ? 'años' : 'año')}`
                                        }
                                    </p>
                                    <p><strong>Sueldo: </strong>{selectedOferta.sueldo === 0 ? 'No especificado' : `${selectedOferta.sueldo} $ ofrecidos`}</p>
                                </div>

                                {(selectedOferta.correo_contacto || selectedOferta.numero_contacto) && (
                                    <>
                                        <hr className="my-4" />
                                        <p><strong className="text-lg font-semibold mt-4 mb-2 text-orange-500">Datos de contacto extra:</strong></p>
                                        <div className="flex flex-col space-y-2"> {/* También cambiar aquí para distribución vertical */}
                                            {selectedOferta.correo_contacto && (
                                                <p><strong>Correo contacto: </strong>{selectedOferta.correo_contacto}</p>
                                            )}
                                            {selectedOferta.numero_contacto && (
                                                <p><strong>Número contacto: </strong>{selectedOferta.numero_contacto}</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 bg-gray-100 rounded shadow">
                                <p><strong>Funciones: </strong></p>
                                <ul className="list-disc pl-6">
                                    {selectedOferta.funciones.endsWith('.') && selectedOferta.funciones.length > 1 ? (
                                        selectedOferta.funciones.slice(0, -1).split('.').map((funcion, index) => (
                                            <li key={index}>{funcion.trim()}</li>
                                        ))
                                    ) : (
                                        selectedOferta.funciones.includes('.') ? (
                                            selectedOferta.funciones.split('.').map((funcion, index) => (
                                                <li key={index}>{funcion.trim()}</li>
                                            ))
                                        ) : (
                                            <li>{selectedOferta.funciones}</li>
                                        )
                                    )}
                                </ul>

                                <p><strong>Conocimientos adicionales: </strong></p>
                                <ul className="list-disc pl-6">
                                    {selectedOferta.detalles_adicionales.endsWith('.') && selectedOferta.detalles_adicionales.length > 1 ? (
                                        selectedOferta.detalles_adicionales.slice(0, -1).split('.').map((detalle, index) => (
                                            <li key={index}>{detalle.trim()}</li>
                                        ))
                                    ) : (
                                        selectedOferta.detalles_adicionales.includes('.') ? (
                                            selectedOferta.detalles_adicionales.split('.').map((detalle, index) => (
                                                <li key={index}>{detalle.trim()}</li>
                                            ))
                                        ) : (
                                            <li>{selectedOferta.detalles_adicionales}</li>
                                        )
                                    )}
                                </ul>

                            </div>
                        </div>
                        {(selectedOferta.comisiones || selectedOferta.comentariosComisiones) && (
                            <>
                                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Comisiones:</h3>

                                    {selectedOferta.comisiones && (
                                        <p><strong>Valor: </strong>{selectedOferta.comisiones}$ ofrecidos</p>
                                    )}
                                    {selectedOferta.comentariosComisiones && (
                                        <p><strong>Comentario: </strong>{selectedOferta.comentariosComisiones}</p>
                                    )}

                                </div>
                            </>
                        )}
                        {(selectedOferta.horasExtras || selectedOferta.comentariosHorasExtras) && (
                            <>
                                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Horas extras:</h3>

                                    {selectedOferta.horasExtras && (
                                        <p><strong>Valor: </strong>{selectedOferta.horasExtras}$ ofrecidos</p>
                                    )}
                                    {selectedOferta.comentariosHorasExtras && (
                                        <p><strong>Comentario: </strong>{selectedOferta.comentariosHorasExtras}</p>
                                    )}

                                </div>
                            </>
                        )}

                        {(selectedOferta.viaticos || selectedOferta.comentariosViaticos) && (
                            <>
                                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Viaticos:</h3>

                                    {selectedOferta.viaticos && (
                                        <p><strong>Valor: </strong>{selectedOferta.viaticos}$ ofrecidos</p>
                                    )}
                                    {selectedOferta.comentariosViaticos && (
                                        <p><strong>Comentario: </strong>{selectedOferta.comentariosViaticos}</p>
                                    )}

                                </div>
                            </>
                        )}

                        <div className="p-4 bg-gray-100 rounded shadow mt-4">
                            <p className="whitespace-pre-wrap"><strong>Objetivo Cargo: </strong>{selectedOferta.objetivo_cargo}</p>
                        </div>

                        {selectedOferta.criterios.length > 0 && (
                            <>
                                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Criterios de evaluación:</h3>
                                    <ul className="list-disc pl-6">
                                        {selectedOferta.criterios.map((criterio) => (
                                            <li key={criterio.id_criterio}>
                                                <strong>{criterio.criterio}:</strong> {renderCriterioValor(criterio)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}


                        {selectedOferta.expe.length > 0 && (
                            <>
                                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Formación requerida para esta oferta:</h3>
                                    <ul className="list-disc pl-6">
                                        {selectedOferta.expe.map((experiencia) => (
                                            <li key={experiencia.id}>
                                                <strong>{experiencia.pivot.titulo_per2 ? experiencia.pivot.titulo_per2 : experiencia.titulo}</strong>
                                                - {experiencia.nivel_educacion} en {experiencia.campo_amplio}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}


                        {selectedOferta.preguntas.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-orange-500">Preguntas para los postulantes de esta oferta:</h3>
                                <ul className="list-disc pl-6">
                                    {selectedOferta.preguntas.map((pregunta) => (
                                        <li key={pregunta.id}>
                                            <strong>{pregunta.pregunta}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={handleCloseModal}
                            className="bg-gray-300 text-gray-700 py-2 px-4 mt-4 rounded hover:bg-gray-400"
                        >
                            Cerrar Detalles
                        </button>
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
            ) :
                ofertas.length > 0 ? (
                    <>

                        <hr className="my-4" />
                        <div className="flex items-center justify-center mb-4 max-w-screen-lg mx-auto">
                            <FaBriefcase className="text-blue-500 text-2xl mr-2" />
                            <h1 className="text-2xl font-semibold text-blue-500">OFERTAS PUBLICADAS:</h1>
                        </div>
                        <div className="max-w-screen-lg mx-auto mb-4">
                            <h2 className="text-lg font-semibold text-center mb-4">Tus ofertas se muestran clasificadas por un color, que representa su estado:</h2>
                            <div className="flex justify-center space-x-8">
                                <div className="flex flex-col items-center">
                                    <span className="mb-2">Ofertas culminadas:</span>
                                    <div className="bg-green-500 text-white py-2 px-4 rounded-lg text-center">
                                        {/* Puedes agregar aquí el contenido que necesites */}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="mb-2">Ofertas en espera de postulantes:</span>
                                    <div className="bg-gray-500 text-white py-2 px-4 rounded-lg text-center">
                                        {/* Puedes agregar aquí el contenido que necesites */}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="mb-2">Ofertas inactivas:</span>
                                    <div className="bg-orange-500 text-white py-2 px-4 rounded-lg text-center">
                                        {/* Puedes agregar aquí el contenido que necesites */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-w-screen-lg mx-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="py-3 px-6">Cargo</th>
                                        <th scope="col" className="py-3 px-6">Estado</th>
                                        <th scope="col" className="py-3 px-6">Fecha Publicación</th>
                                        <th scope="col" className="py-3 px-6">Área</th>
                                        <th scope="col" className="py-3 px-6">Carga Horaria</th>
                                        <th scope="col" className="py-3 px-6">Experiencia Mínima</th>
                                        <th scope="col" className="py-3 px-6">Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOfertas.map((oferta) => {
                                        const { editable, eliminable } = isEditableOrDeletable(oferta.fecha_publi);
                                        const isInactive = oferta.estado === "Inactiva"; // Verifica si la oferta está inactiva

                                        return (
                                            <tr key={oferta.id_oferta} className={`py-4 px-6 ${oferta.estado === 'Culminada' ? 'bg-green-100' : (oferta.estado === 'En espera' ? 'bg-gray-100' : 'bg-orange-200')}`}>
                                                <td className="py-4 px-6">{oferta.cargo}</td>
                                                <td className="py-4 px-6">{oferta.estado}</td>
                                                <td className="py-4 px-6">{formatDate(oferta.fecha_publi)}</td>
                                                <td className="py-4 px-6">{oferta.areas.nombre_area}</td>
                                                <td className="py-4 px-6">{oferta.carga_horaria}</td>
                                                <td className="py-4 px-6">
                                                    {oferta.experiencia === 0
                                                        ? 'No requerida'
                                                        : `${oferta.experiencia} ${oferta.exp_m
                                                            ? (oferta.experiencia > 1 ? 'meses' : 'mes')
                                                            : (oferta.experiencia > 1 ? 'años' : 'año')}`}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button onClick={() => handleVerDetalles(oferta)} className="flex items-center text-blue-600 hover:text-blue-900">
                                                        <FiEye className="w-4 h-4 mr-1" /> Ver
                                                    </button>
                                                    {editable && (
                                                        <Link to={`/edit-oferta/${oferta.id_oferta}`} className="flex items-center text-green-600 hover:text-green-900">
                                                            <FiEdit className="w-4 h-4 mr-1" /> Editar
                                                        </Link>
                                                    )}
                                                    {eliminable && (
                                                        <button onClick={() => handleDeleteOferta(oferta.id_oferta)} className="flex items-center text-red-600 hover:text-red-900">
                                                            <FiTrash2 className="w-4 h-4 mr-1" /> Eliminar
                                                        </button>
                                                    )}
                                                    {isInactive && (
                                                        <button onClick={() => {
                                                            setShowModal(true);
                                                            setOfertaIdReactivar(oferta.id_oferta); // Guardar el id de la oferta a reactivar
                                                        }} className="flex items-center text-yellow-600 hover:text-yellow-900">
                                                            <FiRefreshCw className="w-4 h-4 mr-1" /> Reactivar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {ofertas.length > ofertasPerPage && (
                            <div className="mt-4 flex justify-end max-w-screen-lg mx-auto">
                                <nav className="relative z-0 inline-flex shadow-sm rounded-md">
                                    <a
                                        href="#"
                                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-slate-950 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                    >
                                        <span className="sr-only">Anterior</span>
                                        Anterior
                                    </a>
                                    {Array.from({ length: Math.ceil(ofertas.length / ofertasPerPage) }, (_, index) => (
                                        <a
                                            key={index}
                                            href="#"
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === index + 1 ? 'bg-neutral-900 text-white' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                        >
                                            {index + 1}
                                        </a>
                                    ))}
                                    <a
                                        href="#"
                                        onClick={() => setCurrentPage(currentPage < Math.ceil(ofertas.length / ofertasPerPage) ? currentPage + 1 : Math.ceil(ofertas.length / ofertasPerPage))}
                                        className={`-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(ofertas.length / ofertasPerPage) ? 'text-gray-500 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        Siguiente
                                    </a>
                                </nav>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center mt-4">
                        {isFiltering ? (
                            <p className="text-lg text-gray-600">No se encontraron ofertas con los criterios indicados.</p>
                        ) : (
                            <p className="text-lg text-gray-600">Aún no has publicado ninguna oferta.</p>
                        )}
                    </div>
                )}
        </div>
    );
}

export default VerOfertasPPage;
