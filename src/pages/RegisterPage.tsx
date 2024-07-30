
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/layout/Navbar';

function RegisterPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-col justify-center items-center flex-grow gap-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 animate-fade-in">Seleccione el tipo de usuario para registrarse</h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-5">
          <Link to="/registerE" className="w-64 h-64 bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col justify-center items-center rounded-lg text-white no-underline relative overflow-hidden">
            <img src="/images/empresaR.webp" alt="Empresa" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="flex flex-col justify-center items-center h-full relative z-10 text-center px-4">
              <FontAwesomeIcon icon={faBuilding} className="text-5xl mb-2" />
              <span className="font-bold text-lg">Soy empresa</span>
              <span className="text-center text-sm">Regístrate como empresa para publicar ofertas de trabajo y encontrar los mejores talentos.</span>
            </div>
          </Link>
          <Link to="/register" className="w-64 h-64 bg-[#c2410c] shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col justify-center items-center rounded-lg text-white no-underline relative overflow-hidden">
            <img src="/images/postulanteR.webp" alt="Postulante" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="flex flex-col justify-center items-center h-full relative z-10 text-center px-4">
              <FontAwesomeIcon icon={faUser} className="text-5xl mb-2" />
              <span className="font-bold text-lg">Soy postulante</span>
              <span className="text-center text-sm">Regístrate como postulante para buscar ofertas de trabajo y aplicar a las que más te interesen.</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
