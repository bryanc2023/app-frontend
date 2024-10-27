import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import { FaEye, FaCheck, FaThumbsUp } from 'react-icons/fa'; // Import the Eye icon from react-icons

interface Respuesta {
    id_pregunta: number;
    pregunta: string;
    id_oferta: number;
    respuesta: string;
}

interface Postulante {
    id_postulante: number;
    nombres: string;
    apellidos: string;
    edad: number;
    estado_civil: string;
    genero: string;
    informacion_extra: string;
    foto: string;
    cv: string | null;
    total_evaluacion: number;
    estado_postulacion: string;
    respuestas: Respuesta[];
}

interface PostulanteDetailProps {
    postulante: Postulante;
    idOferta: number;
    onClose: () => void;
}

const PostulanteDetail: React.FC<PostulanteDetailProps> = ({ postulante, idOferta, onClose }) => {
    const [showComentarioModal, setShowComentarioModal] = useState(false);
    const [showRespuestasModal, setShowRespuestasModal] = useState(false);
    const [comentario, setComentario] = useState('');
    const [hayAprobado, setHayAprobado] = useState(false);
    const navigate = useNavigate();
    const { role } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const verificarPostulacionAprobada = async (idOferta: number) => {
            try {
                const response = await axios.get(`existe-aprobado?id_oferta=${idOferta}`);
                setHayAprobado(response.data.existe_aprobado);
            } catch (error) {
                console.error('Error al verificar postulación aprobada:', error);
                setHayAprobado(false);
            }
        };
        verificarPostulacionAprobada(idOferta);
    }, [idOferta]);

    const handleOpenComentarioModal = () => {
        setShowComentarioModal(true);
    };

    const handleCloseComentarioModal = () => {
        setShowComentarioModal(false);
    };
    const handleCancelComentario = () => {
        // Limpiar el campo de comentario
        setComentario('');
        // Cerrar el modal de comentario
        handleCloseComentarioModal();
    };

    const handleSubmitComentario = async () => {
        try {
            const comentarioData = {
                comentario: comentario,
                id_postulante: postulante.id_postulante,
                id_oferta: idOferta,
            };

            const response = await axios.post('actualizar-postulaciones', comentarioData);

            if (response.status === 200) {

                // Mostrar SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: 'Postulante Aceptado',
                    text: 'Se le ha notificado al postulante y a los demás enlistados la decisión.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    if (role === 'empresa_oferente') {
                        navigate('/verOfertasE');
                    } else if (role === 'empresa_gestora') {
                        navigate('/inicioG');
                    } else if (role === 'p_empresa_g') {
                        navigate('/inicioG');
                    }

                });
            } else {
                console.error('Error al enviar comentario:', response.status);
            }
        } catch (error) {
            console.error('Error al enviar comentario:', error);
        }

        // Limpiar el campo de comentario después de enviar
        setComentario('');
        // Cerrar el modal de comentario
        handleCloseComentarioModal();
    };


    const handleAprobarPostulante = () => {
        if (hayAprobado) {
            Swal.fire({
                title: '¿Está seguro?',
                text: 'Al aprobar este postulante, el anterior será rechazado.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, aceptar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    handleOpenComentarioModal();
                }
            });
        } else {
            handleOpenComentarioModal();
        }
    };

    const handleOpenRespuestasModal = () => {
        setShowRespuestasModal(true);
    };

    const handleCloseRespuestasModal = () => {
        setShowRespuestasModal(false);
    };

    const handleDownloadCV = async (urls:string) => {
        try {
    
          const parts = urls.split('/');
          const titulo = parts[parts.length - 1].split('.')[0];
          const response = await axios.post('/cv/descargar', {
            titulo: titulo, // Envía el título del certificado
          }, {
            responseType: 'blob', // Esto es importante para manejar la respuesta como archivo
          });
          console.log(titulo);
    
          // Crear una URL para el archivo que se ha descargado
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${titulo}.pdf`); // Nombre del archivo
          document.body.appendChild(link);
          link.click(); // Simula el clic para descargar el archivo
          link.remove(); // Elimina el enlace después de hacer clic
    
          // Muestra el mensaje de éxito con Swal
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Hoja de vida descargada con éxito',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } catch (error) {
          console.error('Error al descargar la hoja de vida:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un error al intentar descargar la hoja de vida',
          });
        }
    };


    return (
        <div className="p-4 bg-white text-gray-900 rounded-lg relative">
            {/* Postulante Details */}
            <div>
                <h2 className="text-2xl font-semibold text-orange-600">{postulante.nombres} {postulante.apellidos}</h2>
                <center>
                    <img src={postulante.foto} alt="Postulante" className="h-32 w-32 rounded-full" />
                </center>
                <p><strong className='text-cyan-700'>Edad: </strong>{postulante.edad}</p>
                <p><strong className='text-cyan-700'>Estado civil: </strong> {postulante.estado_civil}</p>
                <p><strong className='text-cyan-700'>Género: </strong> {postulante.genero}</p>

                {/* Condición para mostrar la Presentación si no es nulo */}
                {postulante.informacion_extra && (
                    <div className="mt-4"> {/* Espacio adicional si es necesario */}
                        <p>
                            <strong className='text-cyan-700'>Presentación: </strong>
                            <hr />
                            {postulante.informacion_extra}
                        </p>
                        <hr />
                    </div>
                )}
                <strong className='text-cyan-700'>Hoja de vida: </strong>
                <a   onClick={() => {
                    const nombreArchivo = `${postulante.nombres}_CV.pdf`; // O el formato que desees
                    handleDownloadCV(`${postulante.cv}`);
                  }} target="_blank" rel="noopener noreferrer"  className="text-cyan-700 cursor-pointer">
                    Descargar hoja de vida
                </a>

                {postulante.respuestas && postulante.respuestas.length > 0 && (
                    <center>
                        <div className="mt-6"> {/* Added margin-top for spacing */}
                            <button
                                onClick={handleOpenRespuestasModal}
                                className="bg-cyan-500 text-white py-2 px-4 rounded hover:bg-cyan-950 flex items-center justify-center"
                            >
                                <FaEye className="mr-2" /> {/* Add an icon to the button */}
                                Ver respuestas del postulante a las preguntas de evaluación
                            </button>
                        </div>
                    </center>
                )}

                {postulante.estado_postulacion !== 'A' && (
                    <center>
                        <div className="mt-6">
                            <button
                                onClick={handleAprobarPostulante}
                                className={`py-2 px-4 rounded mr-4 ${hayAprobado ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-green-500 text-white hover:bg-green-600'} flex items-center justify-center`} // Añadir flex para centrar el icono y el texto
                            >
                                {hayAprobado ? <FaCheck className="mr-2" /> : <FaThumbsUp className="mr-2" />} {/* Cambiar el ícono según el estado */}
                                {hayAprobado ? 'Aprobar nuevo postulante' : 'Aceptar Postulante'}
                            </button>
                        </div>
                    </center>
                )}


            </div>

            {/* Modal de Comentario */}
            {showComentarioModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> {/* No overflow */}
                    <div className="relative w-auto max-w-md mx-auto bg-white rounded-lg shadow-lg">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-center mb-4">¿Deseas Aceptar Este Postulante Para La Oferta?</h3>
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
                                        (Aqui puede ingresar información específica al postulante acerca de la aceptación, si no es necesario le llegará un "Aceptado" al postulante)
                                    </h1>
                                </div>
                            </div>
                            <textarea
                                className="border rounded-lg w-full h-32 p-2 mb-4"
                                placeholder="Escribe un comentario y un medio de contacto para el postulante (email, telefono)"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                            ></textarea>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleCancelComentario}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitComentario}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Respuestas */}
            {showRespuestasModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> {/* Overflow en el modal */}
                    <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-screen overflow-y-auto"> {/* Se agrega overflow al modal */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-orange-600">RESPUESTAS DEL POSTULANTE</h3>
                                <button
                                    className="text-black text-2xl"
                                    onClick={handleCloseRespuestasModal}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="overflow-y-auto max-h-96"> {/* Limita la altura del contenido */}
                                {postulante.respuestas.map((respuesta, index) => (
                                    <div key={index} className="mb-4">
                                        <p className="font-bold">Pregunta {index + 1}:</p>
                                        <p className="text-gray-700">{respuesta.pregunta}</p>
                                        <p className="font-bold mt-2">Respuesta:</p>
                                        <p className="text-gray-700">{respuesta.respuesta}</p>
                                        <hr className="my-4" />
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};
export default PostulanteDetail;

