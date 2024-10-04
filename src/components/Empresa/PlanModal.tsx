import React from 'react';
import Modal from 'react-modal';
import { FaUserTie, FaBriefcase, FaGem, FaCrown } from 'react-icons/fa6'; // Importar los íconos que deseas usar
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

interface PlanModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    currentPlan: string;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onRequestClose, currentPlan }) => {
    const plans = [
        {
            name: 'Gratuito',
            description: 'Publica hasta 3 ofertas de trabajo al mes.',
            icon: <FaUserTie className="text-green-500 text-2xl" />, // Ícono para el plan gratuito
        },
        {
            name: 'Estándar',
            description: 'Publica hasta 10 ofertas de trabajo al mes y obtén mayor visibilidad.',
            icon: <FaBriefcase className="text-blue-500 text-2xl" />, // Ícono para el plan estándar
        },
        {
            name: 'Premium',
            description: 'Publica hasta 50 ofertas de trabajo al mes y recibe destacados en tus ofertas.',
            icon: <FaGem className="text-purple-500 text-2xl" />, // Ícono para el plan premium
        },
        {
            name: 'Ultimate',
            description: 'Ofertas ilimitadas y máxima visibilidad en la plataforma.',
            icon: <FaCrown className="text-yellow-500 text-2xl" />, // Ícono para el plan ultimate
        },
    ];

     // Función que muestra la alerta
     const showPlanInfo = () => {
        Swal.fire({
            title: 'Información',
            text: 'Actualmente Postula.net ofrece el plan estándar a todos los registrados actualmente, para los planes futuros espera las próximas actualizaciones.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50"
        >
            <h2 className="text-2xl font-semibold mb-4">Selecciona un Plan</h2>
            <p className="mb-4 text-gray-700">Plan actual: <span className="font-bold">{currentPlan}</span></p>

            {/* Se agrega un contenedor con scroll */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {plans.map((plan) => (
                    <div key={plan.name} className="p-4 border rounded-lg shadow-sm flex items-center space-x-4">
                        <div>{plan.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold">{plan.name}</h3>
                            <p className="text-gray-600">{plan.description}</p>
                        </div>
                        <button 
                            className={`ml-auto px-4 py-2 rounded ${plan.name === currentPlan ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                            disabled={plan.name === currentPlan}
                            onClick={showPlanInfo} 
                        >
                            {plan.name === currentPlan ? 'Seleccionado' : 'Seleccionado'}
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={onRequestClose} className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                Cerrar
            </button>
        </Modal>
    );
};

export default PlanModal;
