import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import Swal from 'sweetalert2';
interface Postulante {
    id_postulante: number;
    nombres: string;
    apellidos: string;
    fecha_nac: string;
    edad: number;
    estado_civil: string;
    cedula: string;
    genero: string;
    informacion_extra: string;
    foto: string;
    cv: string | null;
    total_evaluacion: number;
    fecha: string;
    estado_postulacion: string;
}

interface PostulanteDetailProps {
    postulante: Postulante;
    idOferta: number;
    onClose: () => void;
}

const PostulanteDetail: React.FC<PostulanteDetailProps> = ({ postulante, idOferta, onClose }) => {
    const [showComentarioModal, setShowComentarioModal] = useState(false);
    const [comentario, setComentario] = useState('');
    const [hayAprobado, setHayAprobado] = useState(false);

    useEffect(() => {
        const verificarPostulacionAprobada = async (idOferta: number) => {
            try {
                const response = await axios.get(`existe-aprobado?id_oferta=${idOferta}`);
                setHayAprobado(response.data.existe_aprobado);
            } catch (error) {
                console.error('Error al verificar postulación aprobada:', error);
                setHayAprobado(false); // Manejo del error según tu lógica de frontend
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

            const response = await axios.post(`actualizar-postulaciones`, comentarioData);

            if (response.status === 200) {
              
                // Mostrar SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: 'Postulante Aceptado',
                    text: 'Se le ha notificado al postulante y a los demás enlistados la decisión.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Recargar la página
                    window.location.reload();
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

    return (
        <div className="p-4 bg-white text-gray-900 rounded-lg relative">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Detalles del Postulante</h1>
            <div className="flex items-center justify-center mb-4">
                <img src={postulante.foto} alt="Foto del postulante" className="w-32 h-32 object-cover rounded-full" />
            </div>
            <div className="mb-4">
                <p className="text-gray-900 mb-2"><span className="font-bold">Nombre:</span> {postulante.nombres} {postulante.apellidos}</p>
                <p className="text-gray-900 mb-2"><span className="font-bold">Edad:</span> {postulante.edad}</p>
                <p className="text-gray-900 mb-2"><span className="font-bold">Estado civil:</span> {postulante.estado_civil}</p>
                <p className="text-gray-900 mb-2"><span className="font-bold">Género:</span> {postulante.genero}</p>
                <p className="text-gray-900 mb-2"><span className="font-bold">Presentación:</span> {postulante.informacion_extra}</p>
            </div>
            {postulante.cv && (
                <div className="mb-4">
                    <p className="text-gray-900 mb-2">
                        <span className="font-bold">Hoja de vida:</span>
                        <a href={postulante.cv} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">Ver hoja de vida</a>
                    </p>
                </div>
            )}
            <div className="flex justify-end mt-4">
                {postulante.estado_postulacion !== 'A' && (
                    <button
                        onClick={handleAprobarPostulante}
                        className={`py-2 px-4 rounded mr-4 ${hayAprobado ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                    >
                        {hayAprobado ? 'Aprobar nuevo postulante' : 'Aceptar Postulante'}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Cerrar
                </button>
            </div>

            {/* Modal de Comentario */}
            {showComentarioModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                    <div className="relative w-auto max-w-md mx-auto my-6">
                        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                            <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                                <h3 className="text-2xl font-semibold">
                                    <center>  ¿Deseas Aceptar Este Postulante Para La Oferta?</center>
                                </h3>
                                <button
                                    className="p-1 ml-auto  border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                    onClick={handleCloseComentarioModal}
                                >
                                    <span className=" text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">×</span>
                                </button>
                            </div>
                            <div className="relative p-6 flex-auto">
                                <p>Para aceptar al postulante ingresa la información como el contacto que deseas que se comunique el postulante, o un comentario:</p>
                                <textarea
                                    className="border rounded-lg w-full h-32 p-2 mb-4"
                                    placeholder="Escribe un comentario y un medio de contacto para el postulante (email,telefono)"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                ></textarea>
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleCancelComentario}
                                        className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-4"
                                        type="button"
                                        style={{ transition: "all .15s ease" }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmitComentario}
                                        className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none"
                                        type="button"
                                        style={{ transition: "all .15s ease" }}
                                    >
                                        Aceptar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showComentarioModal && <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>}
        </div>
    );
};

export default PostulanteDetail;

