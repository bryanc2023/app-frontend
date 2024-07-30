import React from 'react';

interface CargaModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    success: boolean;
}

const CargaModal: React.FC<CargaModalProps> = ({ show, onClose, title, children, success }) => {
    if (!show) return null;

    const buttonClass = success
        ? "px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
        : "px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <div className="mt-2 p-2">
                        {children}
                    </div>
                </div>
                <div className="items-center px-4 py-3">
                    <button
                        onClick={onClose}
                        className={buttonClass}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CargaModal;
