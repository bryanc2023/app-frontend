import  { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FaInfo } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCalendarAlt, faBuilding, faInfoCircle, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt, FaPaperPlane, FaTimes, FaMoneyBillAlt, FaBriefcase, FaClock, FaUserClock, FaBullseye, FaBookReader, FaClipboardCheck } from 'react-icons/fa';
import { FiMapPin,FiArrowLeft } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/layout/Navbar";
import PostulanteLayout from '../../components/layout/PostulanteLayout2';


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
        ubicacion: {
            canton: string;
            provincia: string;
        };
        sector: {
            sector: string;
            division: string;
        };
    };
    fecha_max_pos: string;
    n_mostrar_empresa: number;
    modalidad: string;
    carga_horaria: string;
    experiencia: number;
    fecha_publi: string;
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
    ciudad: string | null;
    empre_p: string | null;
    sector_p: string | null;
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



interface CheckCvResponse {
    hasCv: boolean;
    message: string;
}

function OfertaPageP() {
    const { id } = useParams<{ id: string }>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [sueldoDeseado, setSueldoDeseado] = useState<number | null>(null);
    const [checkCvResponse, setCheckCvResponse] = useState<CheckCvResponse | null>(null);
    const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchCvStatus = async () => {
        try {
            const response = await axios.get(`check-cv/${user.id}`);
            setCheckCvResponse(response.data);
        } catch (error) {
            console.error('Error checking CV status:', error);
        }
    };

    useEffect(() => {
        fetchCvStatus();
    }, []);

    useEffect(() => {
        const fetchOferta = async () => {
            Swal.fire({
                title: 'Cargando...',
                text: 'Por favor, espera mientras se carga la oferta.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                const response = await axios.get(`ofertaP/${id}`); // Reemplaza con la URL correcta de tu API
                setSelectedOferta(response.data);
                
            } catch (error) {
                console.error('Error fetching oferta:', error);
            } finally {
                
                Swal.close();
            }
        };

        fetchOferta();
    }, [id]);
  
  

    const navigate = useNavigate();

    const formatFechaMaxPos = (fecha: string) => {
        const date = new Date(`${fecha}T00:00:00`);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    if (!selectedOferta) return null;

    const handlePostular = async () => {
        if (!user) {
            // Guarda la ruta actual en localStorage
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login'); // Redirige al usuario a la página de inicio de sesión
        } else {
        if (selectedOferta.soli_sueldo === 1 && (sueldoDeseado === null || sueldoDeseado === undefined)) {
            Swal.fire({
                title: '¡Error!',
                text: 'El campo de sueldo es obligatorio.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        // Recopilar las respuestas de las preguntas si existen
        let respuestas = [];
        if (selectedOferta.preguntas.length > 0) {
            let respuestasCompletas = true;
            selectedOferta.preguntas.forEach((pregunta, index) => {
                const respuestaElement = document.getElementById(`respuesta-${index}`) as HTMLTextAreaElement;
                const respuesta = respuestaElement.value.trim();
                if (respuesta === '') {
                    respuestasCompletas = false;
                }
                respuestas.push({
                    id_pregunta: pregunta.id,
                    pregunta: pregunta.pregunta,
                    id_oferta: selectedOferta.id_oferta,
                    respuesta: respuesta
                });
            });

            if (!respuestasCompletas) {
                Swal.fire({
                    title: '¡Error!',
                    text: 'Debes completar todas las respuestas antes de postular.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                return;
            }
        }
        setLoading(true); // Activar el estado de carga
        try {
            await fetchCvStatus();

            if (!checkCvResponse?.hasCv) {
                Swal.fire({
                    title: '¡Error!',
                    text: "Parece que no has generado tu cv. Ve a la pestaña CV y generalo antes de postular",
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                return;
            }

            const postData = {
                id_postulante: user.id,
                id_oferta: selectedOferta.id_oferta,
                sueldo: sueldoDeseado,
                respuestas: respuestas.length > 0 ? respuestas : undefined
            };

            await axios.post('postular', postData);

            setLoading(false); // Desactivar la carga
            Swal.fire({
                title: '¡Hecho!',
                text: 'Te has postulado a la oferta seleccionado, verifica el estado de tu postulación en los resultados',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {

                navigate("/verOfertasAll");
            });
        } catch (error) {
            console.error('Error postulando:', error);
            setLoading(false); // Desactivar la carga
            Swal.fire({
                title: '¡Ha ocurrido un error!',
                text: 'Ya has postulado para esta oferta, consulta su estado en la pestaña de "Consultar postulación".',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then(() => {
                navigate("/verOfertasAll");
            });
        }
    }
    };

    const renderFunciones = () => {
        if (!selectedOferta.funciones) return null;

        if (selectedOferta.funciones.includes('.')) {
            const funcionesList = selectedOferta.funciones.split('.').map(funcion => funcion.trim()).filter(funcion => funcion).map((funcion, index) => (
                <li key={index}>+ {funcion}</li>
            ));
            return <ul>{funcionesList}</ul>;
        } else {
            return <p>{selectedOferta.funciones}</p>;
        }
    };

    const renderDetalles = () => {
        if (!selectedOferta.detalles_adicionales) return null;

        if (selectedOferta.detalles_adicionales.includes('.')) {
            const detallesList = selectedOferta.detalles_adicionales.split('.').map(detalle => detalle.trim()).filter(detalle => detalle).map((detalle, index) => (
                <li key={index}>+ {detalle}</li>
            ));
            return <ul>{detallesList}</ul>;
        } else {
            return <p>{selectedOferta.detalles_adicionales}</p>;
        }
    };


    const renderCriterioValor = (criterio: Criterio) => {
        if (criterio && criterio.pivot && criterio.pivot.valor) {
            const valorArray = criterio.pivot.valor.split(",");

            switch (criterio.criterio) {
                case 'Experiencia':
                    return criterio.pivot.valor ? "Los años/meses mínimos indicados en la oferta" : "Los años/meses mínimos indicados en la ofert";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados en la oferta" : "Alguno de los títulos mencionados en la oferta";
                case 'Sueldo':
                    return criterio.pivot.valor ? "Aspiracion salarial del postulante" : "Aspiracion salarial del postulante";
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
                    return criterio.pivot.valor ? "Los años/meses mínimos indicados en la oferta" : "Los años/meses mínimos indicados en la ofert";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados en la oferta" : "Alguno de los títulos mencionados en la oferta";
                case 'Sueldo':
                    return criterio.pivot.valor ? "Aspiracion salarial del postulante" : "Aspiracion salarial del postulante";
                case 'Género':
                default:
                    return "No especificado";
            }
        }
    };




    const IconoSueldo = <FaMoneyBillAlt className="mr-2" />;
    const IconoExperiencia = <FaBriefcase className="mr-2" />;
    const IconoCargaHoraria = <FaClock className="mr-2" />;
    const IconoModalidad = <FaUserClock className="mr-2" />;
    const IconoLectura = <FaBookReader className="mr-2" />;
    const IconoObjetivo = <FaBullseye className="mr-2" />;
    const IconoEvaluacion = <FaClipboardCheck className="mr-2" />;

  

    return (
        <>
         {user === null ? (
            
                <Navbar />
                
            ) : (
               
                <PostulanteLayout />

                
            )}
        <div className="mb-4 text-center max-w-screen-lg mx-auto">
          
            <div >
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
                        <span className="text-white text-lg mt-4">Cargando...</span>
                    </div>
                </div>
            )}
            
           <div >
            
           <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-2 z-50">
            <div className="bg-orange-300 rounded-full shadow-lg p-4 flex flex-col items-center">
                {user && (
                    <button
                        onClick={() => navigate('/verOfertasAll')}
                        className="flex items-center text-white font-bold hover:text-black"
                    >
                        <FiArrowLeft className="mr-2" />
                        Ver más ofertas
                    </button>
                )}
                {user == null && (
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-white font-bold hover:text-black"
                    >
                        <FiArrowLeft className="mr-2" />
                        Inicio
                    </button>
                )}
            </div>
        </div>
           <div className="text-left mb-4 px-6 py-4 bg-gray-100 rounded-lg mt-8">
                    <div className="flex flex-col md:flex-row items-center mb-4">
                        <img
                            src={selectedOferta.n_mostrar_empresa === 1 ? '/images/anonima.png' : selectedOferta.empresa.logo}
                            alt="Logo"
                            className="w-20 h-20 shadow-lg rounded-full mb-4 md:mb-0 md:mr-4"
                        />
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-blue-500 flex items-center">
                                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                <strong>Cargo: </strong> {selectedOferta.cargo}
                            </h2>
                            <p className="text-gray-700 mb-1 flex items-center">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                <strong>Fecha de Publicación: </strong> {formatFechaMaxPos(selectedOferta.fecha_publi)}
                            </p>
                            <p className="text-gray-700 mb-1 flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                                <strong>Empresa que ofrece la vacante: </strong> {selectedOferta.n_mostrar_empresa === 1 ? 'Confidencial' : selectedOferta.empre_p
                                    ? selectedOferta.empre_p.includes('/')
                                        ? selectedOferta.empre_p.split('/')[0] // Muestra la parte antes de la barra
                                        : selectedOferta.empre_p
                                    : selectedOferta.empresa.nombre_comercial}
                            </p>
                            <p className="text-gray-700 mb-1 flex items-center flex-wrap">
                                <FontAwesomeIcon icon={faIndustry} className="mr-2" />
                                <strong>Sector de la empresa: </strong>
                                {
                                    selectedOferta.sector_p ?
                                        selectedOferta.sector_p.includes('/')
                                            ? selectedOferta.sector_p.split('/')[0] + ' En ' + selectedOferta.sector_p.split('/')[1] // Muestra la parte antes de la barra
                                            : selectedOferta.sector_p
                                        :
                                        `${selectedOferta.empresa.sector.division} EN ${selectedOferta.empresa.sector.sector}`
                                }
                            </p>
                            {!(selectedOferta.empre_p && selectedOferta.sector_p) && (
                                <p className="text-gray-700 mb-1 flex items-center">
                                    <FiMapPin className="text-gray-700 mr-2" />
                                    <strong>Ubicación empresa: </strong> {selectedOferta.empresa.ubicacion.provincia}, {selectedOferta.empresa.ubicacion.canton}
                                </p>
                            )}
                            {selectedOferta.ciudad && (
                                <p className="text-gray-700 mb-1 flex items-center">
                                    <FaMapMarkerAlt className="text-gray-700 mr-2" />
                                    <strong>Ciudad en la que se solicita el cargo: </strong> {selectedOferta.ciudad}
                                </p>)}
                        </div>
                    </div>
                </div>
                {selectedOferta.empre_p && selectedOferta.empre_p.includes('/') && (
                    <>
                        <hr className="my-4" />
                        <p className="text-gray-600 mb-1">
                            <strong>Información extra de la empresa que ofrece la vacante:</strong> {selectedOferta.empre_p.split('/')[1]} {/* Muestra la parte después de la barra */}
                        </p>

                        <hr className="my-4" />
                    </>
                )}
                <div className="flex justify-center items-start">
                    <div className="w-full">
                        <div className="text-left">
                            {selectedOferta.expe.length > 0 && (
                                <>
                                    <hr className="my-4" />
                                    <p className="text-slate-950 mb-1 "><strong className='flex items-center'>  <FontAwesomeIcon icon={faBriefcase} className="mr-2" /> Titulo/Experiencia necesaria o similar para este cargo:</strong></p>
                                    <ul className="mb-4">
                                        {selectedOferta.expe.map((expe, index) => (
                                            <li key={index}>
                                                <p>
                                                    <strong className="text-orange-800 mb-1">⁃ {expe.pivot.titulo_per2 ? expe.pivot.titulo_per2 : expe.titulo}:</strong>
                                                    {expe.nivel_educacion} en {expe.campo_amplio}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                    <hr className="my-4" />
                                </>
                            )}
                            <p className="text-gray-700 mb-1 flex items-center">
                                {IconoSueldo} <strong>Sueldo:</strong>   {(selectedOferta.sueldo === 0 || selectedOferta.n_mostrar_sueldo === 1) ? 'No especificado' : `${selectedOferta.sueldo} $`}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'>
                                    {IconoExperiencia}Experiencia en cargos similares:
                                </strong>
                                {selectedOferta.experiencia === 0
                                    ? 'No especificada'
                                    : selectedOferta.exp_m
                                        ? `${selectedOferta.experiencia} ${selectedOferta.experiencia > 1 ? 'meses' : 'mes'}`
                                        : `${selectedOferta.experiencia} ${selectedOferta.experiencia > 1 ? 'años' : 'año'}`}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'> {IconoCargaHoraria}Carga Horaria:</strong> {selectedOferta.carga_horaria}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'> {IconoModalidad} Modalidad:</strong> {selectedOferta.modalidad}
                            </p>
                            <p className="text-gray-700 mb-1 "><strong className='flex items-center'>   {IconoCargaHoraria} Fecha Máxima De Postulación:</strong> {formatFechaMaxPos(selectedOferta.fecha_max_pos)}</p>
                            <p className="text-gray-700 mb-1"><strong className='flex items-center'>   {IconoObjetivo} Objetivo del cargo:</strong> {selectedOferta.objetivo_cargo}</p>
                        </div>
                    </div>


                </div>
                <div className="text-left mb-4 px-6 py-4 bg-orange-50 rounded-lg">

                    <p className="text-slate-950 "><strong><p className="text-blue-900 mb-1 flex items-center"> {IconoLectura} Funciones:</p></strong> {renderFunciones()}</p>
                    <hr className="my-4" />

                    <p className="text-slate-950 mb-1 "><strong><p className="text-blue-900 mb-1 flex items-center"> {IconoLectura} Detalles/Conocimientos adicionales:</p></strong> {renderDetalles()}</p>
                    {(selectedOferta.comisiones || selectedOferta.horasExtras || selectedOferta.viaticos || selectedOferta.comentariosComisiones || selectedOferta.comentariosHorasExtras || selectedOferta.comentariosViaticos) && (
                        <>
                            <hr className="my-4" />
                            <p className="text-slate-950 mb-1 "><strong><p className="text-yellow-900 mb-1 flex items-center"> {IconoLectura} Detalles adicionales de pago:</p></strong></p>
                            <p>Para esta oferta, la empresa detallo los siguientes beneficios:</p>
                            {(selectedOferta.comisiones || selectedOferta.comentariosComisiones) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de las comisiones:</strong>  {(selectedOferta.comisiones) ? `${selectedOferta.comisiones} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(selectedOferta.comentariosComisiones) ? `${selectedOferta.comentariosComisiones}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}
                            {(selectedOferta.horasExtras || selectedOferta.comentariosHorasExtras) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de las horas extras:</strong>  {(selectedOferta.horasExtras) ? `${selectedOferta.horasExtras} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(selectedOferta.comentariosHorasExtras) ? `${selectedOferta.comentariosHorasExtras}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}
                            {(selectedOferta.viaticos || selectedOferta.comentariosViaticos) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de los viáticos:</strong>  {(selectedOferta.viaticos) ? `${selectedOferta.viaticos} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(selectedOferta.comentariosViaticos) ? `${selectedOferta.comentariosViaticos}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}

                        </>
                    )}

                    {selectedOferta.criterios.length > 0 && (
                        <>
                            <hr className="my-4" />
                            <p className="text-orange-700 mb-1 "><strong className='flex items-center'> {IconoEvaluacion} Requisitos adicionales de evaluación:</strong></p>
                            <ul className="mb-4">
                                {selectedOferta.criterios.map((criterio, index) => (
                                    <li key={index}>
                                        <p>
                                            <strong className="text-orange-800 mb-1">
                                                ⁃ {criterio.criterio}:
                                            </strong>
                                            {criterio.criterio === "Experiencia" ? (
                                                <>
                                                    {selectedOferta.experiencia && selectedOferta.experiencia > 0
                                                        ? `${selectedOferta.experiencia} ${selectedOferta.exp_m ? (selectedOferta.experiencia > 1 ? 'meses' : 'mes') : (selectedOferta.experiencia > 1 ? 'años' : 'año')} de experiencia en cargos similares mínimo`
                                                        : "Años de experiencia adquiridos en cargos similares mínimo"}
                                                </>

                                            ) : renderCriterioValor(criterio)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {selectedOferta.soli_sueldo === 1 && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <label htmlFor="sueldoDeseado" className="text-blue-700 block mb-2"><strong>Ingrese el sueldo prospecto a ganar en el trabajo:</strong></label>
                            <input
                                type="number"
                                id="sueldoDeseado"
                                className="w-full p-2 border rounded"
                                value={sueldoDeseado || ''}
                                onChange={(e) => setSueldoDeseado(parseInt(e.target.value))}
                            />
                        </div>
                    )}
                    {selectedOferta.correo_contacto && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-900 mr-2" />
                                <h3 className=" text-blue-900 mb-1 "><strong>Datos Extras de Contacto</strong></h3>
                            </div>
                            <p>Para esta oferta enviar hojas de vida al siguiente correo de contacto con asunto "{selectedOferta.cargo}"</p>
                            <p className="text-blue-900 mb-1"><strong>Correo electrónico:</strong> {selectedOferta.correo_contacto}</p>
                        </div>
                    )}
                    {selectedOferta.numero_contacto && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-700 mr-2" />
                                <h3 className=" text-gray-700 mb-1 "><strong>Más información</strong></h3>
                            </div>
                            <p>Para esta oferta se puede comunicar al siguiente número de teléfono para más información</p>
                            <p className="text-gray-700 mb-1"><strong>Número de contacto:</strong> {selectedOferta.numero_contacto}</p>
                        </div>
                    )}
                    {selectedOferta.preguntas.length > 0 && (
                        <>
                            <hr className="my-4" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-700">Preguntas de evaluación</h3>
                                {user && (
                                <p className="text-sm text-gray-500 mb-4">Máximo 300 caracteres por respuesta.</p>
                            )}
                                {selectedOferta.preguntas.map((pregunta, index) => (
                                    <div key={index} className="mb-4">
                                        <label htmlFor={`respuesta-${index}`} className="block text-gray-700 mb-2">
                                            {pregunta.pregunta}
                                        </label>
                                        {user && (
                                        <textarea
                                            id={`respuesta-${index}`}
                                            className="w-full p-2 border rounded"
                                            placeholder="Escribe tu respuesta aquí"
                                            maxLength={300}
                                            rows={4}
                                        // Aquí puedes manejar el estado de las respuestas si es necesario
                                        ></textarea>
                                    )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}




                </div>
                {selectedOferta.estado === "Inactiva" ? (
                    <div className="mt-4 flex justify-center">
                        <span className="text-red-500 font-bold">Esta oferta ha culminado</span>
                    </div>
                ) : (
                    <div className="mt-4 flex justify-center">
                        <button onClick={handlePostular} className="bg-blue-500 text-white p-2 rounded flex items-center">
                            <FaPaperPlane className="mr-2" />
                            Postular
                        </button>
                    </div>
                )}

               
            </div>
        </div>
        </div>
        </>
    );
}

export default OfertaPageP;