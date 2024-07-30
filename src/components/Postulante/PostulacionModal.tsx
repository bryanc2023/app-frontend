// src/components/Postulante/PostulacionModal.tsx
import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCalendarAlt, faBuilding, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FaPaperPlane, FaTimes, FaMoneyBillAlt, FaBriefcase, FaClock, FaUserClock, FaBullseye, FaBookReader, FaClipboardCheck } from 'react-icons/fa';
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
    }[];
    sueldo: number;
    n_mostrar_sueldo: number;
    soli_sueldo: number;
    correo_contacto: string;
    numero_contacto: string;
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
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    if (!oferta) return null;

    const handlePostular = async () => {
        console.log(`id_usuario: ${userId}, id_oferta: ${oferta.id_oferta}, sueldo: ${sueldoDeseado}`);
        if (oferta.soli_sueldo === 1 && (sueldoDeseado === null || sueldoDeseado === undefined)) {
            Swal.fire({
                title: '¡Error!',
                text: 'El campo de sueldo es obligatorio.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }
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
                sueldo: sueldoDeseado
            };

            await axios.post('postular', postData);
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

        if (oferta.funciones.includes(',')) {
            const funcionesList = oferta.funciones.split(',').map((funcion, index) => (
                <li key={index}>+ {funcion.trim()} </li>
            ));
            return <ul> {funcionesList}</ul>;
        } else {
            return <p>{oferta.funciones}</p>;
        }
    };

    const renderDetalles = () => {
        if (!oferta.detalles_adicionales) return null;

        if (oferta.detalles_adicionales.includes(',')) {
            const detallesList = oferta.detalles_adicionales.split(',').map((detalle, index) => (
                <li key={index}>+ {detalle.trim()} </li>
            ));
            return <ul> {detallesList}</ul>;
        } else {
            return <p>{oferta.detalles_adicionales}</p>;
        }
    };

    const renderCriterioValor = (criterio: Criterio) => {
        if (criterio && criterio.pivot && criterio.pivot.valor) {
            const valorArray = criterio.pivot.valor.split(",");

            switch (criterio.criterio) {
                case 'Experiencia':
                    return criterio.pivot.valor ? "Los años mínimos indicados" : "Los años mínimos indicados";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados" : "Alguno de los títulos mencionados";
                case 'Sueldo':
                    return criterio.pivot.valor ? "Indicar el sueldo prospecto a ganar" : "Indicar el sueldo prospecto a ganar";
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
                    return criterio.pivot.valor ? "Los años mínimos indicados" : "Los años mínimos indicados";
                case 'Titulo':
                    return criterio.pivot.valor ? "Alguno de los títulos mencionados" : "Alguno de los títulos mencionados";
                case 'Sueldo':
                    return criterio.pivot.valor ? "Indicar el sueldo prospecto a ganar" : "Indicar el sueldo prospecto a ganar";
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
            <div className="bg-white p-4 rounded shadow-lg w-11/12 md:w-3/4 max-w-4xl text-center overflow-auto max-h-screen md:max-h-96" style={{ maxHeight: `calc(100vh - 30px)` }}>
                <div className="text-left mb-4 px-6 py-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center mb-4">
                        <img
                            src={oferta.n_mostrar_empresa === 1 ? '/images/anonima.png' : oferta.empresa.logo}
                            alt="Logo"
                            className="w-20 h-20 shadow-lg rounded-full mr-4"
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
                                <strong>Empresa: </strong> {oferta.empresa.nombre_comercial}
                            </p>
                            <p className="text-gray-700 mb-1 flex items-center">
                                <FiMapPin className="text-gray-700 mr-2" />
                                <strong>Ubicación: </strong> {oferta.empresa.ubicacion.provincia}, {oferta.empresa.ubicacion.canton}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-start">
                    <div className="w-full md:w-1/2">
                        <div className="text-left">
                            <p className="text-gray-700 mb-1 flex items-center">
                                {IconoSueldo} <strong>Sueldo:</strong> {oferta.sueldo === 0 ? 'No especificado' : `${oferta.sueldo} $`}
                            </p>
                            <p className="text-gray-700 mb-1 ">
                                <strong className='flex items-center'> {IconoExperiencia}Experiencia en cargos similares:</strong> {oferta.experiencia === 0 ? 'Ninguna' : `${oferta.experiencia} año/s`}
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
                    <div className="w-full md:w-1/2">
                        <div className="text-left">
                            <p className="text-gray-700 "><strong><p className="text-gray-700 mb-1 flex items-center"> {IconoLectura} Funciones:</p></strong> {renderFunciones()}</p>

                        </div>

                    </div>

                </div>
                <div className="text-left mb-4 px-6 py-4 bg-orange-50 rounded-lg">
                    <p className="text-slate-950 mb-1 "><strong><p className="text-gray-700 mb-1 flex items-center"> {IconoLectura} Detalles adicionales:</p></strong> {renderDetalles()}</p>

                    {oferta.criterios.length > 0 && (
                        <>
                            <hr className="my-4" />
                            <p className="text-slate-950 mb-1 "><strong className='flex items-center'> {IconoEvaluacion} Requisitos adicionales de evaluación:</strong></p>
                            <ul className="mb-4">
                                {oferta.criterios.map((criterio, index) => (
                                    <li key={index}>
                                        <p><strong className="text-orange-800 mb-1 ">⁃ {criterio.criterio}:</strong> {renderCriterioValor(criterio)}</p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {oferta.soli_sueldo === 1 && (
                        <div className="mt-4">
                            <hr className="my-4" />
                            <label htmlFor="sueldoDeseado" className="text-gray-700 block mb-2"><strong>Ingrese el sueldo deseado a ganar en el trabajo:</strong></label>
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
                                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-700 mr-2" />
                                <h3 className=" text-gray-700 mb-1 "><strong>Datos Extras de Contacto</strong></h3>
                            </div>
                            <p>Para esta oferta enviar hojas de vida al siguiente correo de contacto con asunto "Nombre del cargo"</p>
                            <p className="text-gray-700 mb-1"><strong>Correo electrónico:</strong> {oferta.correo_contacto}</p>
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


                </div>
                <div className="mt-4 flex justify-center">
                    <button onClick={handlePostular} className="bg-blue-500 text-white p-2 rounded flex items-center">  <FaPaperPlane className="mr-2" />Postular</button>
                </div>
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="bg-red-300 text-gray-700 px-4 py-2 rounded-lg shadow-md flex items-center">  <FaTimes className="mr-2" />  Cerrar Detalles</button>
                </div>
            </div>
        </div>


    );

};

export default Modal;
