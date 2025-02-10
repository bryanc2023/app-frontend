import '../components/css/Footer.css';
import { useState, useEffect } from 'react';
import Navbar from "../components/layout/Navbar";
import axios from "../services/axios";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaUser } from 'react-icons/fa';
import Modal from '../components/Postulante/PostulacionModalHome'
import './home.css';
import './CarruselOfertas.css';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  titulo: string;
  content: string;
  createdAt: string;
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredOfertaId, setHoveredOfertaId] = useState(null);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]); // New state for posts

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/publicacionesPas');
       // Verifica la estructura de la respuesta
        if (response.data) {  // Asegúrate de que haya datos
          const latestPosts = response.data.slice(0, 3); // Obtener los últimos 3 posts
          setPosts(latestPosts);
        } else {
          console.error('No posts found in the response');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);


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

        // Si hay menos de 4 ofertas destacadas, buscar más ofertas
        let ofertasToShow = destacadasOfertas.slice(0, 4);
        if (ofertasToShow.length < 4) {
          const response = await axios.get('ofertaHome');
          const otrasOfertas = response.data.ofertas;

          // Combinar ofertas destacadas y otras, asegurando que no haya duplicados
          const combinedOfertas = [...ofertasToShow, ...otrasOfertas.slice(0, 4 - ofertasToShow.length)];

          // Filtrar duplicados basándose en `id_oferta`
          ofertasToShow = combinedOfertas.filter(
            (oferta, index, self) => self.findIndex(o => o.id_oferta === oferta.id_oferta) === index
          );
        }

        setOfertas(ofertasToShow);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOfertas();
  }, []);

  const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const nextPost = () => {
    setCurrentPostIndex((prevIndex) => (prevIndex + 1) % posts.length); // Navegar al siguiente post
  };

  const prevPost = () => {
    setCurrentPostIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length); // Navegar al anterior post
  };

  // Si no hay posts, muestra un mensaje

  const currentPost = posts[currentPostIndex]; // Obtén el post actual basado en el índice
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
            <h2 className="text-3xl mb-5 font-bold text-orange-600">Postula</h2>
            <p className="text-lg text-gray-700">
              En un mundo cada vez más digital, la búsqueda de talento ha evolucionado. Nuestra plataforma te permite conectar con candidatos calificados de manera rápida y eficiente, facilitando el proceso de selección. Aquí, puedes explorar perfiles de profesionales de diversas industrias, acceder a herramientas de filtrado avanzadas y gestionar tus ofertas laborales con facilidad. Con nuestra tecnología, puedes optimizar tu búsqueda, reduciendo el tiempo y los costos asociados al reclutamiento tradicional.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Únete a nosotros y descubre cómo el reclutamiento en línea puede transformar tu manera de encontrar el talento ideal para tu empresa.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-16 flex-1 max-w-2xl text-center flex flex-col justify-center">
            <p className="text-lg font-semibold text-blue-800">¿Qué puedo hacer en Postula?</p>
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
      <section className="py-10 px-5 bg-gray-200">
        <div className="section-title">
          <h2>ULTIMOS POST'S</h2>
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={prevPost}
            className="bg-blue-500 text-white p-4 rounded-full mr-6 transform transition-transform duration-300 hover:scale-110"
            aria-label="Previous post"
          >
            &#8592;
          </button>

          {/* Verificación si no hay posts */}
          {posts.length === 0 ? (
            <div className="carousel-item bg-white p-8 rounded-2xl shadow-2xl w-2/3 h-[300px] transform transition-transform duration-300 hover:scale-105 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
              Aún no se han publicado ningún post, sé el primero en hacerlo
              </h3>
            </div>
          ) : (
            <div className="carousel-item bg-white p-8 rounded-2xl shadow-2xl w-2/3 h-[300px] transform transition-transform duration-300 hover:scale-105 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                {currentPost.titulo}
              </h3>

              {/* Ajuste para el contenido del post con barra lateral */}
              <p className="text-md mb-4 text-gray-700 text-center overflow-y-auto max-h-[150px]">
                {currentPost.content}
              </p>

              <p className="text-xs text-gray-500 text-center">
                {new Date(currentPost.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <button
            onClick={nextPost}
            className="bg-blue-500 text-white p-4 rounded-full ml-6 transform transition-transform duration-300 hover:scale-110"
            aria-label="Next post"
          >
            &#8594;
          </button>
        </div>

        {/* Botón "Ver más" */}
        <div className="flex justify-center mt-6">
          <Link to="/Blog">
            <button className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transform transition-transform duration-300">
              Ver más
            </button>
          </Link>
        </div>
      </section>
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

            <div className="ofertas-container flex flex-col gap-4 w-full">
              {ofertas.map((oferta) => (
                <div
                  key={oferta.id_oferta}
                  className={`oferta-card border border-gray-200 p-6 rounded-lg shadow-lg transition-shadow flex justify-between items-center bg-white relative ${hoveredOfertaId && oferta.id_oferta !== hoveredOfertaId ? 'opacity-25' : ''
                    }`}
                  onMouseEnter={() => setHoveredOfertaId(oferta.id_oferta)}
                  onMouseLeave={() => setHoveredOfertaId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/oferta/${oferta.id_oferta}`)
                  }}
                >
                  <div className="oferta-content flex flex-col w-full">
                    <h3 className="text-orange-500 text-2xl font-bold mb-2">
                      {oferta.n_mostrar_empresa === 1
                        ? 'Empresa Confidencial'
                        : oferta.empre_p
                          ? oferta.empre_p.includes('/')
                            ? oferta.empre_p.split('/')[0]
                            : oferta.empre_p
                          : oferta.empresa.nombre_comercial}
                    </h3>
                    <p className="font-semibold italic text-cyan-800 mb-1">
                      Perteneciente al sector{' '}
                      {oferta.sector_p
                        ? oferta.sector_p.includes('/')
                          ? `${oferta.sector_p.split('/')[0]} de ${oferta.sector_p.split('/')[1]}`
                          : oferta.sector_p
                        : capitalizeFirstLetter(oferta.empresa.sector.sector)}
                    </p>
                    <p className="font-semibold mb-1">
                      <strong className="text-cyan-800">Esta buscando:</strong> {oferta.cargo}
                    </p>
                    <p className="font-semibold mb-1">
                      <strong className="text-cyan-800">Modalidad:</strong> {oferta.modalidad}
                    </p>
                    <p className="font-semibold mb-1">
                      <strong className="text-cyan-800">Fecha de publicación:</strong>{' '}
                      {new Date(`${oferta.fecha_publi}T00:00:00`).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/oferta/${oferta.id_oferta}`)
                      }}
                      className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                    >
                      Ver Oferta
                    </button>
                  </div>
                </div>
              ))}
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
          <Link to='/registerE'
            className="bg-gray-800 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faBuilding} /> Registrarse como Empresa
          </Link>
          <Link to='/register'
            className="bg-orange-600 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-orange-500 transition duration-300"
          >
            <FontAwesomeIcon icon={faUserPlus} /> Registrarse como Postulante
          </Link>
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
