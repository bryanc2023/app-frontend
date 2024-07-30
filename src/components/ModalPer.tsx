import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

// Define las propiedades del componente Modal usando TypeScript
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    children: ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-600">&times;</button>
                </div>
                {children}
                <div className="flex justify-end mt-4">
                    <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar</button>
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired
};

export default Modal;