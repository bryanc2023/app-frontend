import '../components/css/Footer.css';
import { useState, useEffect } from 'react';
import Navbar from "../components/layout/Navbar";
import axios from "../services/axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { FaFileAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaUser } from 'react-icons/fa';
import { logout } from '../store/authSlice';
import Modal from '../components/Postulante/PostulacionModalHome'

import './home.css';


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
  const { isLogged, role, user} = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (oferta: Oferta) => {
      setSelectedOferta(oferta);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setSelectedOferta(null);
      setIsModalOpen(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? ofertas.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === ofertas.length - 1 ? 0 : prevIndex + 1));
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
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
        }else{
         
           window.localStorage.removeItem("token");
           window.localStorage.removeItem('role');
           navigate("/");
           return;
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        // Maneja el error según sea necesario (p. ej., mostrar un mensaje al usuario)
      }  finally {
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
        let ofertasToShow = destacadasOfertas.slice(0, 3);
        if (ofertasToShow.length < 3) {
          const response = await axios.get('ofertaHome');
          const otrasOfertas = response.data.ofertas;
          // Completar con otras ofertas hasta 3
          ofertasToShow = [...ofertasToShow, ...otrasOfertas.slice(0, 3 - ofertasToShow.length)];
        }
  
        setOfertas(ofertasToShow);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
  
    fetchOfertas();
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
          <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-3xl">
            <p className="text-xl text-gray-700 mb-4">El trabajo de tus sueños espera por ti a un click</p>
            <a href="/registro" className="text-blue-500 hover:underline text-lg font-bold">Registrate ahora</a>
          </div>
        ) : (
          <>
     <div className="relative">
      <center><h2 className="text-3xl font-bold text-orange-500">
        Actualmente se están buscando las siguientes plazas de trabajo:
      </h2></center>
      <div className="flex items-center">
        <button onClick={handlePrev} className="p-2 bg-gray-300 rounded-l">
          Anterior
        </button>
        <div className="flex overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {ofertas.map((oferta) => (
              <div key={oferta.id_oferta} className="min-w-full p-6 flex flex-col items-center bg-white shadow-md rounded-lg">
                <FaFileAlt className="text-orange-500 text-6xl mb-4" />
                <strong className="text-gray-700 mb-1">
                                                    
                                                    {oferta.n_mostrar_empresa === 1
                                                        ? 'Confidencial'
                                                        : oferta.empre_p
                                                            ? oferta.empre_p.includes('/')
                                                                ? oferta.empre_p.split('/')[0] // Muestra la parte antes de la barra
                                                                : oferta.empre_p
                                                            : oferta.empresa.nombre_comercial}
                                                </strong>
                                                <p className="text-gray-700 mb-1 flex items-center flex-wrap">
                                                    <strong>Del sector - </strong>
                                                    {oferta.n_mostrar_empresa === 1 ?
                                                        'Confidencial' :
                                                        oferta.sector_p? 
                                                                oferta.sector_p.includes('/')
                                                                ? '  '+ oferta.sector_p.split('/')[0]+' En '+oferta.sector_p.split('/')[1] // Muestra la parte antes de la barra
                                                                : '  '+ oferta.sector_p
                                                            : 
                                                        ` ${oferta.empresa.sector.division} EN ${oferta.empresa.sector.sector}`
                                                    }
                                                </p>
                                                <strong>Esta buscando:</strong>
                <h2 className="text-2xl font-bold italic mb-2">"{oferta.cargo}"</h2>
                <p className="text-gray-700">
                  <strong>Modalidad:</strong> {oferta.modalidad}
                </p>
                <p className="text-gray-700">
                  <strong>Fecha de publicación:</strong> {new Date(oferta.fecha_publi).toLocaleDateString('es-ES')}
                </p>
                <button 
                        onClick={() => handleOpenModal(oferta)} 
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                       Ver
                    </button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleNext} className="p-2 bg-gray-300 rounded-r">
          Siguiente
        </button>
      </div>
    </div>
     {/* Modal Component */}
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
