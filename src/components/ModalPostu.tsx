import React, { ReactNode, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './css/ModalPostu.css';

interface ModalOferProps {
    show: boolean;
    onClose: () => void;
    children: ReactNode;
}

const ModalDetail: React.FC<ModalOferProps> = ({ show, onClose, children }) => {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-[70%] relative overflow-auto h-5/6" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <button
                    className="absolute top-0 right-0 mt-2 mr-2 text-red-600"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="modal-content overflow-y-auto max-h-screen p-2">
                    {children}
                </div>
            </div>
        </div>

    );
};

export default ModalDetail;
