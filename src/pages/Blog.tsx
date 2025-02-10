import { useState, useEffect } from "react";
import axios from "../services/axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronDown, faChevronUp, faReply, faNewspaper, faComment, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [userReactions, setUserReactions] = useState<{ [key: number]: string }>({});
  const [showAllResponses, setShowAllResponses] = useState(false);
  const navigate = useNavigate();

  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/publicacionesHome?page=${page}`);
      setPosts(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  return (

    <div className="flex flex-col min-h-screen">
      <Navbar />

  
      <header className="bg-cover bg-center text-white py-40 px-5 text-center" style={{ backgroundImage: "url('/images/blos.jpg')" }}>
        <div className="bg-black bg-opacity-50 p-6 rounded-lg inline-block">
          <h1 className="text-6xl mb-2 font-bold">Blog</h1>
          <p className="text-xl">Recibe más detalles sobre las ofertas o plazas de trabajo e interactua con los usuarios</p>
        </div>
      </header>
      <hr className="my-4" />
   
      {isLoading && <p className="text-center text-blue-500 font-semibold">Cargando publicaciones...</p>}
      {posts.length === 0 ? (
            <div className="flex justify-center mt-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                Aún no se han publicado ningún post, sé el primero en hacerlo
              </h3>
            </div>
          ) : (
      <div className="space-y-6 bg-slate-200">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-lg rounded-lg p-6 border hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">{post.title}</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <p>Publicado por: {post.user?.name || "Usuario desconocido"}</p>
              <p>Publicado el: {new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <hr />
            <p className="text-gray-700 mb-4">{post.content}</p>
          
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <div className="flex space-x-4 ml-auto">
                <FontAwesomeIcon icon={faComment} className="mr-1 text-blue-500" />
                <span>{post.comments}</span>
                <button onClick={() => navigate("/login")} className="bg-green-500 text-white px-2 py-1 rounded-full hover:scale-110">
                  <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />{post.reactionsp}
                </button>
                <button onClick={() => navigate("/login")} className="bg-red-500 text-white px-2 py-1 rounded-full hover:scale-110">
                  <FontAwesomeIcon icon={faThumbsDown} className="mr-2" />{post.reactionsn}
                </button>
              </div>
            </div>
          
            <hr />
            <div className="mt-4">
              {post.respuestas?.length ? (
                post.respuestas.slice(0, showAllResponses ? post.respuestas.length : 2).map((respuesta, idx) => (
                  <div key={idx} className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="font-semibold text-gray-800">{respuesta.nombre}</p>
                    <p className="text-sm text-gray-500">{new Date(respuesta.fecha).toLocaleString()}</p>
                    <p className="text-gray-600">{respuesta.comentario}</p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-gray-600">Sin respuestas</p>
                </div>
              )}
              {post.respuestas?.length > 2 && (
                <button onClick={() => setShowAllResponses(!showAllResponses)} className="bg-orange-400 text-white px-4 py-2 rounded-full hover:scale-110">
                  <FontAwesomeIcon icon={showAllResponses ? faChevronUp : faChevronDown} className="mr-2" />
                  {showAllResponses ? "Ver menos" : "Ver más"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
       )}
      <div className="flex justify-center mt-6">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-4 py-2 bg-blue-500 text-white rounded-l">
          Anterior
        </button>
        <span className="px-4 py-2 text-gray-700">{`Página ${currentPage} de ${totalPages}`}</span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="px-4 py-2 bg-blue-500 text-white rounded-r">
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Blog;
