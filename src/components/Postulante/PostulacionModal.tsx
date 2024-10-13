// src/components/Postulante/PostulacionModal.tsx
import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCalendarAlt, faBuilding, faInfoCircle, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt, FaPaperPlane, FaTimes, FaMoneyBillAlt, FaBriefcase, FaClock, FaUserClock, FaBullseye, FaBookReader, FaClipboardCheck } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';

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

interface ModalProps {
    oferta: Oferta | null;
    onClose: () => void;
    userId: number | undefined;
}

interface CheckCvResponse {
    hasCv: boolean;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ oferta, onClose, userId }) => {
    const [sueldoDeseado, setSueldoDeseado] = useState<number | null>(null);
    const [checkCvResponse, setCheckCvResponse] = useState<CheckCvResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchCvStatus = async () => {
        try {
            const response = await axios.get(`check-cv/${userId}`);
            setCheckCvResponse(response.data);
        } catch (error) {
            console.error('Error checking CV status:', error);
        }
    };

    useEffect(() => {
        fetchCvStatus();
    }, []);

    const navigate = useNavigate();

    const formatFechaMaxPos = (fecha: string) => {
        const date = new Date(fecha);
        date.setDate(date.getDate());
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    if (!oferta) return null;

    const handlePostular = async () => {

        if (oferta.soli_sueldo === 1 && (sueldoDeseado === null || sueldoDeseado === undefined)) {
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
        if (oferta.preguntas.length > 0) {
            let respuestasCompletas = true;
            oferta.preguntas.forEach((pregunta, index) => {
                const respuestaElement = document.getElementById(`respuesta-${index}`) as HTMLTextAreaElement;
                const respuesta = respuestaElement.value.trim();
                if (respuesta === '') {
                    respuestasCompletas = false;
                }
                respuestas.push({
                    id_pregunta: pregunta.id,
                    pregunta: pregunta.pregunta,
                    id_oferta: oferta.id_oferta,
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
                id_postulante: userId,
                id_oferta: oferta.id_oferta,
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
    };

    const renderFunciones = () => {
        if (!oferta.funciones) return null;

        if (oferta.funciones.includes('.')) {
            const funcionesList = oferta.funciones.split('.').map(funcion => funcion.trim()).filter(funcion => funcion).map((funcion, index) => (
                <li key={index}>+ {funcion}</li>
            ));
            return <ul>{funcionesList}</ul>;
        } else {
            return <p>{oferta.funciones}</p>;
        }
    };

    const renderDetalles = () => {
        if (!oferta.detalles_adicionales) return null;

        if (oferta.detalles_adicionales.includes('.')) {
            const detallesList = oferta.detalles_adicionales.split('.').map(detalle => detalle.trim()).filter(detalle => detalle).map((detalle, index) => (
                <li key={index}>+ {detalle}</li>
            ));
            return <ul>{detallesList}</ul>;
        } else {
            return <p>{oferta.detalles_adicionales}</p>;
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

        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
                        <span className="text-white text-lg mt-4">Cargando...</span>
                    </div>
                </div>
            )}
            <div className="bg-white p-4 rounded shadow-lg w-11/12 md:w-3/4 max-w-4xl text-center overflow-auto max-h-screen md:max-h-96" style={{ maxHeight: `calc(100vh - 30px)` }}>
                <div className="text-left mb-4 px-6 py-4 bg-gray-100 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center mb-4">
                        <img
                            src={oferta.n_mostrar_empresa === 1 ? '/images/anonima.png' : oferta.empresa.logo}
                            alt="Logo"
                            className="w-20 h-20 shadow-lg rounded-full mb-4 md:mb-0 md:mr-4"
                        />
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-blue-500 flex items-center">
                                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                <strong>Cargo: </strong> {oferta.cargo}
                            </h2>
                            <p className="text-gray-700 mb-1 flex items-center">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                <strong>Fecha de Publicación: </strong> {formatFechaMaxPos(oferta.fecha_publi)}
                            </p>
                            <p className="text-gray-700 mb-1 flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                                <strong>Empresa que ofrece la vacante: </strong> {oferta.n_mostrar_empresa === 1 ? 'Confidencial' : oferta.empre_p
                                    ? oferta.empre_p.includes('/')
                                        ? oferta.empre_p.split('/')[0] // Muestra la parte antes de la barra
                                        : oferta.empre_p
                                    : oferta.empresa.nombre_comercial}
                            </p>
                            <p className="text-gray-700 mb-1 flex items-center flex-wrap">
                                <FontAwesomeIcon icon={faIndustry} className="mr-2" />
                                <strong>Sector de la empresa: </strong>
                                {
                                    oferta.sector_p ?
                                        oferta.sector_p.includes('/')
                                            ? oferta.sector_p.split('/')[0] + ' En ' + oferta.sector_p.split('/')[1] // Muestra la parte antes de la barra
                                            : oferta.sector_p
                                        :
                                        `${oferta.empresa.sector.division} EN ${oferta.empresa.sector.sector}`
                                }
                            </p>
                            {!(oferta.empre_p && oferta.sector_p) && (
                                <p className="text-gray-700 mb-1 flex items-center">
                                    <FiMapPin className="text-gray-700 mr-2" />
                                    <strong>Ubicación empresa: </strong> {oferta.empresa.ubicacion.provincia}, {oferta.empresa.ubicacion.canton}
                                </p>
                            )}
                            {oferta.ciudad && (
                                <p className="text-gray-700 mb-1 flex items-center">
                                    <FaMapMarkerAlt className="text-gray-700 mr-2" />
                                    <strong>Ciudad en la que se solicita el cargo: </strong> {oferta.ciudad}
                                </p>)}
                        </div>
                    </div>
                </div>
                {oferta.empre_p && oferta.empre_p.includes('/') && (
                    <>
                        <hr className="my-4" />
                        <p className="text-gray-600 mb-1">
                            <strong>Información extra de la empresa que ofrece la vacante:</strong> {oferta.empre_p.split('/')[1]} {/* Muestra la parte después de la barra */}
                        </p>

                        <hr className="my-4" />
                    </>
                )}
                <div className="flex justify-center items-start">
                    <div className="w-full">
                        <div className="text-left">
                            {oferta.expe.length > 0 && (
                                <>
                                    <hr className="my-4" />
                                    <p className="text-slate-950 mb-1 "><strong className='flex items-center'>  <FontAwesomeIcon icon={faBriefcase} className="mr-2" /> Titulo/Experiencia necesaria o similar para este cargo:</strong></p>
                                    <ul className="mb-4">
                                        {oferta.expe.map((expe, index) => (
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
                                {IconoSueldo} <strong>Sueldo:</strong>   {(oferta.sueldo === 0 || oferta.n_mostrar_sueldo === 1) ? 'No especificado' : `${oferta.sueldo} $`}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'>
                                    {IconoExperiencia}Experiencia en cargos similares:
                                </strong>
                                {oferta.experiencia === 0
                                    ? 'No especificada'
                                    : oferta.exp_m
                                        ? `${oferta.experiencia} ${oferta.experiencia > 1 ? 'meses' : 'mes'}`
                                        : `${oferta.experiencia} ${oferta.experiencia > 1 ? 'años' : 'año'}`}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'> {IconoCargaHoraria}Carga Horaria:</strong> {oferta.carga_horaria}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'> {IconoModalidad} Modalidad:</strong> {oferta.modalidad}
                            </p>
                            <p className="text-gray-700 mb-1 "><strong className='flex items-center'>   {IconoCargaHoraria} Fecha Máxima De Postulación:</strong> {formatFechaMaxPos(oferta.fecha_max_pos)}</p>
                            <p className="text-gray-700 mb-1"><strong className='flex items-center'>   {IconoObjetivo} Objetivo del cargo:</strong> {oferta.objetivo_cargo}</p>
                        </div>
                    </div>


                </div>
                <div className="text-left mb-4 px-6 py-4 bg-orange-50 rounded-lg">

                    <p className="text-slate-950 "><strong><p className="text-blue-900 mb-1 flex items-center"> {IconoLectura} Funciones:</p></strong> {renderFunciones()}</p>
                    <hr className="my-4" />

                    <p className="text-slate-950 mb-1 "><strong><p className="text-blue-900 mb-1 flex items-center"> {IconoLectura} Detalles/Conocimientos adicionales:</p></strong> {renderDetalles()}</p>
                    {(oferta.comisiones || oferta.horasExtras || oferta.viaticos || oferta.comentariosComisiones || oferta.comentariosHorasExtras || oferta.comentariosViaticos) && (
                        <>
                            <hr className="my-4" />
                            <p className="text-slate-950 mb-1 "><strong><p className="text-yellow-900 mb-1 flex items-center"> {IconoLectura} Detalles adicionales de pago:</p></strong></p>
                            <p>Para esta oferta, la empresa detallo los siguientes beneficios:</p>
                            {(oferta.comisiones || oferta.comentariosComisiones) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de las comisiones:</strong>  {(oferta.comisiones) ? `${oferta.comisiones} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(oferta.comentariosComisiones) ? `${oferta.comentariosComisiones}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}
                            {(oferta.horasExtras || oferta.comentariosHorasExtras) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de las horas extras:</strong>  {(oferta.horasExtras) ? `${oferta.horasExtras} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(oferta.comentariosHorasExtras) ? `${oferta.comentariosHorasExtras}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}
                            {(oferta.viaticos || oferta.comentariosViaticos) && (
                                <>
                                    <p className="text-gray-700 mb-1"><strong>Valor de los viáticos:</strong>  {(oferta.viaticos) ? `${oferta.viaticos} $` : 'No especificado'}</p>
                                    <p className="text-gray-700 mb-1"><strong>Detalle:</strong>  {(oferta.comentariosViaticos) ? `${oferta.comentariosViaticos}` : 'Ninguno'}</p>
                                    <hr className="my-4" />
                                </>
                            )}

                        </>
                    )}

                    {oferta.criterios.length > 0 && (
                        <>
                            <hr className="my-4" />
                            <p className="text-orange-700 mb-1 "><strong className='flex items-center'> {IconoEvaluacion} Requisitos adicionales de evaluación:</strong></p>
                            <ul className="mb-4">
                                {oferta.criterios.map((criterio, index) => (
                                    <li key={index}>
                                        <p>
                                            <strong className="text-orange-800 mb-1">
                                                ⁃ {criterio.criterio}:
                                            </strong>
                                            {criterio.criterio === "Experiencia" ? (
                                                <>
                                                    {oferta.experiencia && oferta.experiencia > 0
                                                        ? `${oferta.experiencia} ${oferta.exp_m ? (oferta.experiencia > 1 ? 'meses' : 'mes') : (oferta.experiencia > 1 ? 'años' : 'año')} de experiencia en cargos similares mínimo`
                                                        : "Años de experiencia adquiridos en cargos similares mínimo"}
                                                </>

                                            ) : renderCriterioValor(criterio)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {oferta.soli_sueldo === 1 && (
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
                    {oferta.correo_contacto && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-900 mr-2" />
                                <h3 className=" text-blue-900 mb-1 "><strong>Datos Extras de Contacto</strong></h3>
                            </div>
                            <p>Para esta oferta enviar hojas de vida al siguiente correo de contacto con asunto "{oferta.cargo}"</p>
                            <p className="text-blue-900 mb-1"><strong>Correo electrónico:</strong> {oferta.correo_contacto}</p>
                        </div>
                    )}
                    {oferta.numero_contacto && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-700 mr-2" />
                                <h3 className=" text-gray-700 mb-1 "><strong>Más información</strong></h3>
                            </div>
                            <p>Para esta oferta se puede comunicar al siguiente número de teléfono para más información</p>
                            <p className="text-gray-700 mb-1"><strong>Número de contacto:</strong> {oferta.numero_contacto}</p>
                        </div>
                    )}
                    {oferta.preguntas.length > 0 && (
                        <>
                            <hr className="my-4" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-700">Preguntas de evaluación</h3>
                                <p className="text-sm text-gray-500 mb-4">Máximo 300 caracteres por respuesta.</p>
                                {oferta.preguntas.map((pregunta, index) => (
                                    <div key={index} className="mb-4">
                                        <label htmlFor={`respuesta-${index}`} className="block text-gray-700 mb-2">
                                            {pregunta.pregunta}
                                        </label>
                                        <textarea
                                            id={`respuesta-${index}`}
                                            className="w-full p-2 border rounded"
                                            placeholder="Escribe tu respuesta aquí"
                                            maxLength={300}
                                            rows={4}
                                        // Aquí puedes manejar el estado de las respuestas si es necesario
                                        ></textarea>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}




                </div>
                {oferta.estado === "Inactiva" ? (
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

                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="bg-red-300 text-gray-700 px-4 py-2 rounded-lg shadow-md flex items-center">  <FaTimes className="mr-2" />  Cerrar Detalles</button>
                </div>
            </div>
        </div>


    );

};

export default Modal;
