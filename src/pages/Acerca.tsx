import '../components/css/Footer.css';
import  { useEffect} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserTie, faBriefcase, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Navbar from "../components/layout/Navbar";
import axios from "../services/axios";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {RootState} from '../store';

const Acerca: React.FC = () => {

  const navigate = useNavigate();
  const { isLogged, role ,user} = useSelector((state: RootState) => state.auth);
  useEffect(() => {
  const checkRegistrationStatus = async () => {
    try {
        if (isLogged && user) {
            // Llamada a la API para verificar el estado del registro
       

            const response = await axios.get('user/registration-status', {
                headers: {
                    Authorization: `Bearer ${user.token}`, // Usa el token de autenticación si es necesario
                },
            });

            const { profileCompleted } = response.data;

            if (!profileCompleted) {
                // Si el perfil no está completo, redirige a la página de completar perfil
              
                if (role === 'postulante') {
                  navigate('/completar');
                  return;
              } else if (role === 'empresa_oferente') {
                navigate('/completarE');
                return;
              } else if (role === 'admin') {
                  navigate('/inicioAdmin');
              } else if (role === 'empresa_gestora') {
                navigate('/completarE');
                return;
              }
            }

            // Redirige según el rol del usuario
            if (role === 'postulante') {
                navigate('/verOfertasAll');
            } else if (role === 'empresa_oferente') {
                navigate('/VerOfertasE');
            } else if (role === 'admin') {
                navigate('/inicioAdmin');
            } else if (role === 'empresa_gestora') {
                navigate('/inicioG');
            }
        }
    } catch (error) {
        console.error('Error checking registration status:', error);
        // Maneja el error según sea necesario (p. ej., mostrar un mensaje al usuario)
    }
};

checkRegistrationStatus();
}, [isLogged, role, user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <header className="bg-cover bg-center text-white py-40 px-5 text-center" style={{ backgroundImage: "url('/images/profesional.jpg')" }}>
        <div className="bg-black bg-opacity-50 p-6 rounded-lg inline-block">
          <h1 className="text-5xl mb-2 font-bold">Acerca de Postula</h1>
          <p className="text-xl">La nueva app de Proasetel S.A para gestionar ofertas de trabajo de manera eficiente</p>

        </div>
      </header>
     
      <section  className="bg-cover bg-center">
        <div className="flex flex-col md:flex-row justify-around items-center gap-8 w-full">
        <div className="bg-gray-50 rounded-lg shadow-md p-16 flex-1 max-w-2xl text-left flex flex-col justify-center">
            <h2 className="text-3xl mb-5">Acerca de Proasetel S.A</h2>
            <p className="text-lg text-gray-700">
              Proasetel S.A es una empresa líder en soluciones tecnológicas presenta Postula, nuestra nueva app diseñada para
              gestionar ofertas de trabajo de manera efectiva. Con Postula, puedes buscar, postularte y gestionar oportunidades laborales de manera
              sencilla y organizada, todo en una sola plataforma.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Nuestra misión es conectar a los mejores talentos con las empresas más destacadas, facilitando el proceso de contratación y asegurando
              que tanto empleadores como candidatos tengan la mejor experiencia posible.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-16 flex-1 max-w-2xl text-left flex flex-col justify-center">
            <h2 className="text-3xl mb-5">¿Impedimientos para registrarme?</h2>
            <p className="text-lg text-gray-700">
             No existen, se cuenta con un sistema para que puedas registrarte libremente independientemente sea cual sea tu nivel de conocimiento tanto en educación como en otros aspectos permitiendote que tu puedas destacar con tus bases frente a los demás
            </p>
          </div>
          
        </div>
      </section>
      <section className={`flex flex-col md:flex-row justify-around items-center py-16 px-5 bg-blue-900 mx-10 my-10 rounded-lg flex-grow transition-opacity duration-1000 $`}>
        <div className="bg-white rounded-lg shadow-md p-10 flex-1 max-w-md text-center flex flex-col justify-center">
          <FontAwesomeIcon icon={faUserTie} size="3x" className="text-indigo-600 mb-4" />
          <h3 className="text-2xl mb-4">Iniciar Sesión como Postulante</h3>
          <p className="text-lg text-gray-700 mb-5">Accede a tu cuenta para postularte a las mejores ofertas laborales.</p>
          <a href="/login" className="bg-orange-600 text-white py-3 px-6 rounded-full hover:bg-orange-500 transition duration-300">Iniciar Sesión</a>
        </div>
        <div className="bg-white rounded-lg shadow-md p-10 flex-1 max-w-md text-center flex flex-col justify-center">
          <FontAwesomeIcon icon={faBriefcase} size="3x" className="text-indigo-600 mb-4" />
          <h3 className="text-2xl mb-4">Iniciar Sesión como Empresa</h3>
          <p  className="text-lg text-gray-700 mb-5">Publica tus ofertas de trabajo y encuentra al candidato ideal.</p>
          <a href="/login" className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-500 transition duration-300">Iniciar Sesión</a>

        </div>
      </section>
      <footer  className={`bg-gray-800 text-white py-4 text-center transition-opacity duration-1000 $`}>
        &copy; 2024 Postula. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Acerca;
