import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import policeIcon from '@iconify-icons/mdi/police-badge';


const Unauthorized = () => {
  const navigate = useNavigate();
    const redirectToHome = () => {
        navigate('/');
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-900 text-white">
           <Icon icon={policeIcon} width="128" height="128" />
          <h1 className="text-4xl font-bold mt-4">Acceso no autorizado</h1>
          <p className="text-lg mt-2">No estás permitido a ingresar a este apartado</p>
          <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
              onClick={() => navigate('/')}
          >
              Volver al inicio
          </button>
      </div>
  );
};

export default Unauthorized;
