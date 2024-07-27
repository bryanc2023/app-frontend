import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaLinkedin, FaFacebook, FaInstagram, FaXTwitter, FaGlobe, FaEye } from 'react-icons/fa6'; 
import { PostulanteData } from './layout/EmpresaLayout';

const iconMap = {
    'facebook': FaFacebook,
    'twitter': FaXTwitter,
    'linkedin': FaLinkedin,
    'instagram': FaInstagram,
    'website': FaGlobe,
};

interface PerfilPModalProps {
    isModalPost: boolean;
    closeModal: () => void;
    dataPost: PostulanteData;
    isLoadingPost: boolean;
}

const PerfilPModal: React.FC<PerfilPModalProps> = ({ isModalPost, closeModal, dataPost, isLoadingPost }) => {
  
    return (
        <Dialog open={isModalPost} onClose={closeModal} className="relative z-50">
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <DialogPanel className="w-full max-w-4xl max-h-screen p-6 bg-gray-300 rounded-lg shadow-md text-black overflow-y-auto">
                    <DialogTitle className="text-3xl font-semibold text-center">Detalles del Postulante</DialogTitle>
                    
                    {!isLoadingPost ? (
                        <div className="mt-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={dataPost.postulante.foto || ''}
                                    alt="Foto de perfil"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                                />
                                <div>
                                    <h1 className="text-3xl font-semibold">
                                        {`${dataPost.postulante.nombres || ''} ${dataPost.postulante.apellidos || ''}`}
                                    </h1>
                                    <p className="text-gray-600">{dataPost.postulante.genero}</p>
                                    <a href={dataPost.postulante.cv} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline mt-2 block">
                                        Ver CV
                                    </a>
                                </div>
                            </div>
                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Detalles del Perfil</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <p><strong>Fecha de Nacimiento:</strong> {new Date(dataPost.postulante.fecha_nac).toLocaleDateString()}</p>
                                    <p><strong>Edad:</strong> {dataPost.postulante.edad}</p>
                                    <p><strong>Estado Civil:</strong> {dataPost.postulante.estado_civil}</p>
                                    <p><strong>Cédula:</strong> {dataPost.postulante.cedula}</p>
                                </div>
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Presentación</h2>
                                <p className="text-black">{dataPost.postulante.informacion_extra}</p>
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Idiomas</h2>
                                {dataPost.idiomas.length > 0 ? (
                                    dataPost.idiomas.map(idioma => (
                                        <div key={idioma.id_idioma}>
                                            <p className='text-black font-semibold'>Idioma: <span className='font-normal'>{idioma.idioma_nombre}</span> </p>
                                            <p className='text-black font-semibold'>Nivel escrito: <span className='font-normal'>{idioma.nivel_escrito}</span> </p>
                                            <p className='text-black font-semibold'>Nivel oral: <span className='font-normal'>{idioma.nivel_oral}</span> </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-gray-500 text-center'>No hay datos</p>
                                )}
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Formaciones</h2>
                                {dataPost.formaciones.length > 0 ? (
                                    dataPost.formaciones.map(formacion => (
                                        <div key={formacion.id_titulo}>
                                            <p className='text-black font-semibold'>Institución: <span className='font-normal'>{formacion.institucion}</span> </p>
                                            <p className='text-black font-semibold'>Estado: <span className='font-normal'>{formacion.estado}</span> </p>
                                            <p className='text-black font-semibold'>Fecha de Inicio: <span className='font-normal'>{new Date(formacion.fecha_ini).toLocaleDateString()}</span> </p>
                                            <p className='text-black font-semibold'>Fecha de Fin: <span className='font-normal'>{new Date(formacion.fecha_fin).toLocaleDateString()}</span> </p>
                                            <p className='text-black font-semibold'>Título: <span className='font-normal'>{formacion.titulo_acreditado}</span> </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-gray-500 text-center'>No hay datos</p>
                                )}
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Redes</h2>
                                {dataPost.red.length > 0 ? (
                                    dataPost.red.map(red => {
                                        const Icon = iconMap[red.nombre_red.toLowerCase() as keyof typeof iconMap] || FaGlobe;

                                        return (
                                            <div key={red.id_postulante_red} className="flex items-center">
                                                <Icon className='text-blue-500' />
                                                <a href={red.enlace} target="_blank" rel="noopener noreferrer" className='text-blue-700 underline ml-2'>
                                                    {red.nombre_red}
                                                </a>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className='text-gray-500 text-center'>No hay datos</p>
                                )}
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Experiencia Profesional</h2>
                                {dataPost.formapro.length > 0 ? (
                                    dataPost.formapro.map(formacion => (
                                        <div key={formacion.id_formacion_pro}>
                                            <p className='text-black font-semibold'>Empresa: <span className='font-normal'>{formacion.empresa}</span> </p>
                                            <p className='text-black font-semibold'>Puesto: <span className='font-normal'>{formacion.puesto}</span> </p>
                                            <p className='text-black font-semibold'>Fecha de Inicio: <span className='font-normal'>{new Date(formacion.fecha_ini).toLocaleDateString()}</span> </p>
                                            <p className='text-black font-semibold'>Fecha de Fin: <span className='font-normal'>{new Date(formacion.fecha_fin).toLocaleDateString()}</span> </p>
                                            <p className='text-black font-semibold'>Descripción: <span className='font-normal'>{formacion.descripcion_responsabilidades}</span> </p>
                                            <p className='text-black font-semibold'>Persona de referencia: <span className='font-normal'>{formacion.persona_referencia}</span> </p>
                                            <p className='text-black font-semibold'>Contacto: <span className='font-normal'>{formacion.contacto}</span> </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-gray-500 text-center'>No hay datos</p>
                                )}
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Certificados</h2>
                                {dataPost.certificados.length > 0 ? (
                                    dataPost.certificados.map(certificado => (
                                        <div key={certificado.id_certificado} className='mb-4 flex items-center justify-between'>
                                            <p className='text-black font-semibold'>Título: <span className='font-normal'>{certificado.titulo}</span> </p>
                                            <a href={certificado.certificado} target="_blank" rel="noopener noreferrer" className='text-blue-700 underline ml-2 flex items-center'>
                                                <FaEye className='mr-1' /> Ver certificado
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-gray-500 text-center'>No hay datos</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className='text-xl mt-5 text-orange-500 text-center'>Cargando la información ...</p>
                    )}
                    <div   className="py-2">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                    >
                        Cerrar
                    </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};


export default PerfilPModal;
