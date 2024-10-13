import '../components/css/Footer.css';
import { useState, useEffect } from 'react';
import Navbar from "../components/layout/Navbar";
import axios from "../services/axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { FaBriefcase } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaUser } from 'react-icons/fa';
import { logout } from '../store/authSlice';
import Modal from '../components/Postulante/PostulacionModalHome'
import './home.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CarruselOfertas.css';


interface Oferta {
  id_oferta: number;
  estado: string;
  cargo: string;
  areas: {
    id: number;
    nombre_area: string;
  };
  empresa: {
    id_empresa: string,
    nombre_comercial: string;
    logo: string;
    ubicacion: {
      canton: string;
      provincia: string;
    };
    sector: {
      sector: string;
      division: string;
    };
  };
  fecha_max_pos: string;
  n_mostrar_empresa: number;
  modalidad: string;
  carga_horaria: string;
  experiencia: number;
  fecha_publi: string;
  funciones: string;
  objetivo_cargo: string;
  detalles_adicionales: string;
  criterios: Criterio[];
  expe: {
    titulo: string;
    nivel_educacion: string;
    campo_amplio: string;
    pivot: {
      titulo_per2: string | null;
    };
  }[];
  sueldo: number;
  n_mostrar_sueldo: number;
  soli_sueldo: number;
  correo_contacto: string;
  numero_contacto: string;
  preguntas: Pregunta[];
  comisiones: number | null;
  horasExtras: number | null;
  viaticos: number | null;
  comentariosComisiones: string | null;
  comentariosHorasExtras: string | null;
  comentariosViaticos: string | null;
  exp_m: boolean;
  ciudad: string | null;
  empre_p: string | null;
  sector_p: string | null;
}

interface Pregunta {
  id: number;
  id_oferta: number;
  pregunta: string;
}

interface Criterio {
  criterio: string;
  pivot: {
    valor: string;
  };
}





const Home: React.FC = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
  const navigate = useNavigate();
  const { isLogged, role, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleOpenModal = (oferta: Oferta) => {
    setSelectedOferta(oferta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOferta(null);
    setIsModalOpen(false);
  };



  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        setIsLoading(true);
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
        } else {

          window.localStorage.removeItem("token");
          window.localStorage.removeItem('role');
          navigate("/");
          return;
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        // Maneja el error según sea necesario (p. ej., mostrar un mensaje al usuario)
      } finally {
        setIsLoading(false); // Ocultar indicador de carga después de la redirección
      }
    };



    checkRegistrationStatus();
  }, [isLogged, role, user, navigate]);
  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const destacadasResponse = await axios.get('/destacadas');
        const destacadasOfertas = destacadasResponse.data.ofertas;

        // Si hay menos de 3 ofertas destacadas, buscar más ofertas
        let ofertasToShow = destacadasOfertas.slice(0, 4);
        if (ofertasToShow.length < 4) {
          const response = await axios.get('ofertaHome');
          const otrasOfertas = response.data.ofertas;
          // Completar con otras ofertas hasta 3
          ofertasToShow = [...ofertasToShow, ...otrasOfertas.slice(0, 4 - ofertasToShow.length)];
        }

        setOfertas(ofertasToShow);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOfertas();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Actualizamos el estado cuando cambia el tamaño de la pantalla
    };

    window.addEventListener('resize', handleResize); // Escuchamos cambios en el tamaño de la ventana

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="text-white text-2xl font-bold">Cargando tu pagina principal un momento porfavor...</div>
        </div>
      )}
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
          <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <p className="text-lg sm:text-xl text-gray-700 mb-4">
              El trabajo de tus sueños espera por ti a un click
            </p>
            <a href="/registro" className="text-blue-500 hover:underline text-md sm:text-lg font-bold">Regístrate ahora</a>
          </div>
        ) : (
          <>
            <div className="section-title">
              <h2>OFERTAS DESTACADAS </h2>
            </div>

            <div className="carrusel-container">
              <Carousel
                showThumbs={false}
                infiniteLoop={true}
                autoPlay={true}
                showStatus={false}
                dynamicHeight={true}
                swipeable={true}
                emulateTouch={true}
                stopOnHover={!isMobile}
                showIndicators={!isMobile}
              >
                {ofertas.map((oferta) => (
                  <div
                    key={oferta.id_oferta}
                    className="oferta-card"
                    onClick={() => isMobile && handleOpenModal(oferta)}
                  >
                    <div className="oferta-content">
                      <div className="text-content">
                        <div className="text-content">
                          <h3 className='text-orange-500 text-2xl font-bold'>
                          {oferta.n_mostrar_empresa === 1 ? 'Empresa Confidencial' : oferta.empre_p
                                    ? oferta.empre_p.includes('/')
                                        ? oferta.empre_p.split('/')[0] // Muestra la parte antes de la barra
                                        : oferta.empre_p
                                    : oferta.empresa.nombre_comercial}
                          </h3>
                          <p className='font-semibold italic text-cyan-800'>
                          <span className='italic'>PERTENECIENTE AL SECTOR    {
                                    oferta.sector_p ?
                                        oferta.sector_p.includes('/')
                                            ? oferta.sector_p.split('/')[0] + ' DE ' + oferta.sector_p.split('/')[1] // Muestra la parte antes de la barra
                                            : oferta.sector_p
                                        :
                                        ` ${oferta.empresa.sector.sector}`
                                }</span>
                          </p>
                       
                        </div>
                        <p className='font-semibold'><strong className='text-cyan-800'>Esta buscando:</strong> {oferta.cargo}</p>
                        <p className='font-semibold'><strong className='text-cyan-800'>Modalidad:</strong> {oferta.modalidad}</p>
                        <p className='font-semibold'><strong className='text-cyan-800'>Fecha de publicación:</strong> {new Date(oferta.fecha_publi).toLocaleDateString()}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(oferta);
                          }}
                          className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm sm:text-xs lg:text-base"
                        >
                          VER DETALLES
                        </button>
                      </div>
                      <FaBriefcase className="icono-oferta" />
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>

            {isModalOpen && (
              <Modal
                oferta={selectedOferta}
                onClose={handleCloseModal}
              />
            )}
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
