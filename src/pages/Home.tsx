import '../components/css/Footer.css';
import { useState, useEffect } from 'react';
import Navbar from "../components/layout/Navbar";
import axios from "../services/axios";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { FaFileAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaUser } from 'react-icons/fa';

interface Oferta {
  id_oferta: number;
  cargo: string;
  sueldo: number;
  carga_horaria: string;
  modalidad: string;
  funciones: string;
  fecha_publi: string;
  empresa: {
    nombre_comercial: string;
    logo: string;
  };
}

const Home: React.FC = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const navigate = useNavigate();
  const { isLogged, role, user } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const response = await axios.get('/ofertaHome');
        // Obtener solo las 3 primeras ofertas
        setOfertas(response.data.ofertas.slice(0, 3));
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOfertas();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-cover bg-center text-white py-40 px-5 text-center" style={{ backgroundImage: "url('/images/home.jpg')" }}>
        <div className="bg-black bg-opacity-50 p-6 rounded-lg inline-block">
          <h1 className="text-6xl mb-2 font-bold">Bienvenido a Postula</h1>
          <p className="text-xl">El lugar ideal para encontrar tu trabajo ideal</p>
        </div>
      </header>
      <section className={`flex flex-col justify-around items-center py-20 px-10 bg-white mx-10 my-10 rounded-lg flex-grow transition-opacity duration-1000 $`}>
        <div className="flex flex-col md:flex-row justify-around items-center gap-8 w-full">
          <div className="bg-gray-50 rounded-lg shadow-md p-16 flex-1 max-w-2xl text-left flex flex-col justify-center">
            <h2 className="text-3xl mb-5 font-bold text-orange-600">Postula.net</h2>
            <p className="text-lg text-gray-700">
              En un mundo cada vez más digital, la búsqueda de talento ha evolucionado. Nuestra plataforma te permite conectar con candidatos calificados de manera rápida y eficiente, facilitando el proceso de selección. Aquí, puedes explorar perfiles de profesionales de diversas industrias, acceder a herramientas de filtrado avanzadas y gestionar tus ofertas laborales con facilidad. Con nuestra tecnología, puedes optimizar tu búsqueda, reduciendo el tiempo y los costos asociados al reclutamiento tradicional.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Únete a nosotros y descubre cómo el reclutamiento en línea puede transformar tu manera de encontrar el talento ideal para tu empresa.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-16 flex-1 max-w-2xl text-center flex flex-col justify-center">
            <p className="text-lg font-semibold text-blue-800">¿Qué puedo hacer en Postula.net?</p>
            <div className="flex justify-between">
              <div className="flex flex-col items-center">
                <hr></hr>
                <p className="font-semibold">Como empresa</p>
                <FaBuilding className="text-gray-700 text-6xl mb-2" />
                <p className="font-light">▸Crear ofertas en base a tus parámetros específicos</p>
                <p className="font-light">▸Obtener tus postulantes ideales para cada oferta</p>
                <p className="font-light">▸Monitorear tu proceso de reclutamiento</p>
              </div>
              <div className="flex flex-col items-center">
              <hr></hr>
              <p className="font-semibold">Como postulante</p>
                <FaUser className="text-orange-500 text-6xl mb-2" />
                <p className="font-light">▸Postularte a las ofertas publicadas</p>
                <p className="font-light">▸Ver tus resultados directos</p>
                <p className="font-light">▸Mejorar tu hoja de vida constantemente</p>
              </div>
            </div>
          </div>

        </div>
      </section>
      <Navbar />

      <div className="flex-grow flex flex-col items-center bg-gray-100 py-10">
        {ofertas.length === 0 ? (
          <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-3xl">
            <p className="text-xl text-gray-700 mb-4">El trabajo de tus sueños espera por ti a un click</p>
            <a href="/registro" className="text-blue-500 hover:underline text-lg font-bold">Registrate ahora</a>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-orange-500">Actualmente se estan buscando las siguientes plazas de trabajo:</h2>
<hr></hr>
<hr></hr>
<hr></hr>
<hr></hr>
<hr></hr>
<hr></hr>
<div>.</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
              {ofertas.map(oferta => (
                <div key={oferta.id_oferta} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                  <FaFileAlt className="text-orange-500 text-6xl mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Se esta buscando:</h2>
                  <h2 className="text-2xl font-bold italic mb-2">"{oferta.cargo}"</h2>
                  <p className="text-gray-700"><p className="font-semibold">Modalidad:</p> <center>{oferta.modalidad}</center></p>
                  <p className="text-gray-700">
                    <p className="font-semibold">Fecha de publicación:</p>
                    <center>
                      {new Date(new Date(oferta.fecha_publi).setDate(new Date(oferta.fecha_publi).getDate() + 1)).toLocaleDateString('es-ES')}
                    </center>
                  </p> </div>
              ))}
            </div>
          
          
          </>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg shadow-md p-16 bg-cover bg-center flex flex-col justify-center">
             <center> <p className="text-lg text-gray-700 mb-5">¿Estás listo para comenzar? Regístrate para acceder a todas nuestras ofertas y comenzar a postularte hoy mismo.</p></center>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/registerE'}
                  className="bg-gray-800 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-700 transition duration-300"
                >
                  <FontAwesomeIcon icon={faBuilding} /> Registrarse como Empresa
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="bg-orange-600 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-orange-500 transition duration-300"
                >

                  <FontAwesomeIcon icon={faUserPlus} /> Registrarse como Postulante
                </button>


              </div>
            </div>
      <footer className="bg-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Postula - Todos los derechos reservados</p>
        <p className="text-sm">Desarrollado por Proasetel S.A</p>
      </footer>
    </div>

  );
};

export default Home;
