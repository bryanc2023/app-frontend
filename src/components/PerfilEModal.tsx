import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaLinkedin, FaFacebook, FaInstagram, FaXTwitter, FaGlobe } from 'react-icons/fa6'; 
import { EmpresaData } from './layout/EmpresaGLayout';
import { IconType } from 'react-icons/lib';

const iconMap: { [key: string]: IconType } = {
    'facebook': FaFacebook,
    'twitter': FaXTwitter,
    'linkedin': FaLinkedin,
    'instagram': FaInstagram,
    'website': FaGlobe,
};

interface PerfilEModalProps {
    isModalEmpresa: boolean;
    closeModalEmpresa: () => void;
    dataEmpresa: EmpresaData;
    isLoadingEmpresa: boolean;
}

const PerfilEModal: React.FC<PerfilEModalProps> = ({ isModalEmpresa, closeModalEmpresa, dataEmpresa, isLoadingEmpresa }) => {
    return (
        <Dialog open={isModalEmpresa} onClose={closeModalEmpresa} className="relative z-50">
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <DialogPanel className="w-full max-w-4xl max-h-screen p-6 bg-gray-300 rounded-lg shadow-md text-black overflow-y-auto">
                    <DialogTitle className="text-3xl font-semibold text-center">Detalles de la Empresa</DialogTitle>
                    
                    {!isLoadingEmpresa ? (
                        <div className="mt-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={dataEmpresa.logo || ''}
                                    alt="Foto de perfil"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                                />
                                <div>
                                    <h1 className="text-3xl font-semibold">
                                        {dataEmpresa.nombre_comercial || ''}
                                    </h1>
                                    
                                    <p className="text-gray-600">{`Tamaño: ${dataEmpresa.tamanio}`}</p>
                                  
                                </div>
                            </div>
                           
                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Detalles del perfil</h2>
                                {dataEmpresa.ubicacion.provincia ? (
                                    <div>
                                       <p className="text-gray-600">{`Cantidad de empleados: ${dataEmpresa.cantidad_empleados}`}</p>
                                    <p className="text-gray-600">Provincia: <span className="font-normal">{dataEmpresa.ubicacion.provincia}</span></p>
                                    <p className="text-gray-600">Cantón: <span className="font-normal">{dataEmpresa.ubicacion.canton}</span></p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center">No hay datos</p>
                                )}
                            </div>
                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Descripción</h2>
                                {dataEmpresa.descripcion ? (
                                    <div>
                                       <p className="text-gray-600">{dataEmpresa.descripcion}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center">No hay datos</p>
                                )}
                            </div>
                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Sector</h2>
                                {dataEmpresa.sector ? (
                                    <div>
                                        <p className="text-black font-semibold">Sector: <span className="font-normal">{dataEmpresa.sector.sector}</span></p>
                                        <p className="text-black font-semibold">División: <span className="font-normal">{dataEmpresa.sector.division}</span></p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center">No hay datos</p>
                                )}
                            </div>

                            <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-inner text-black">
                                <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Redes</h2>
                                {dataEmpresa.red.length > 0 ? (
                                    dataEmpresa.red.map((red, index) => {
                                        const Icon = iconMap[red.nombre_red.toLowerCase()] || FaGlobe;
                                        return (
                                            <div key={index} className="flex items-center mb-2">
                                                <Icon className="text-blue-500" />
                                                <a href={red.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline ml-2">
                                                    {red.nombre_red}
                                                </a>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center">No hay datos</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xl mt-5 text-orange-500 text-center">Cargando la información ...</p>
                    )}
                    <div className="py-2">
                        <button
                            onClick={closeModalEmpresa}
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

export default PerfilEModal;
