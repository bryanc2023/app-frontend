import React from 'react';
import Modal from 'react-modal';

interface ModalComponentProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title: string;
    message: string;
    success: boolean;
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, onRequestClose, title, message, success }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            ariaHideApp={false}
        >
            <div>
                <h2 className={success ? 'text-green-500' : 'text-red-500'}>{title}</h2>
                <p>{message}</p>
                <button onClick={onRequestClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Cerrar
                </button>
            </div>
        </Modal>
    );
};

export default ModalComponent;
