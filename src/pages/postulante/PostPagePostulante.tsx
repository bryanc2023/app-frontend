import { useState, useEffect } from "react";
import axios from "../../services/axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronDown, faChevronUp, faReply, faNewspaper, faComment, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  reactionsp: number;
  reactionsn: number;
  comments: number;
  createdAt: string;
  user: User;
  respuestas: any[];
}

const PostPagePostulante: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [userReactions, setUserReactions] = useState<{ [key: number]: string }>({}); // Reacciones por post
  const [clickedReaction, setClickedReaction] = useState<{ [key: number]: string }>({});
  const [showAllResponses, setShowAllResponses] = useState(false);

  // Función para obtener los posts
  const fetchPosts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/obtenerpubli?page=${page}`);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleSubmitPost = async () => {
    try {
      setIsLoading(true);
      await axios.post("/posts", {
        ...newPost,
        id_usuario: user.id,
      });

      setShowModal(false);
      setNewPost({ title: "", content: "" });

      await fetchPosts(currentPage);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newPost.content.trim()) {
      return; // No enviar si el contenido está vacío
    }

    const commentData = {
      nombre: user.name,
      comentario: newPost.content,
    };
    // Asegúrate de que `commentData` tiene los datos correctos

    try {
      setIsLoading(true);
      await axios.post(`/posts/${selectedPostId}/respuesta`, commentData, {  // Enviar el comentario directamente
        headers: {
          Authorization: `Bearer ${user.token}`, // Usa el token de autenticación si es necesario
        },
      });

      // Reiniciar el campo de respuesta
      setNewPost({ title: "", content: "" });
      setShowModal2(false);

      // Refrescar las publicaciones
      await fetchPosts(currentPage);
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    // Verificar si el usuario ya reaccionó a este post
    if (userReactions[postId]) {
      if (userReactions[postId] === reactionType) {
        Swal.fire({
          title: '¡Ya has reaccionado!',
          text: 'No puedes cambiar a la misma reacción.',
          icon: 'info', // Icono de información
          confirmButtonText: 'Aceptar',
        });
        return;  // No hacer nada si la reacción es la misma
      }

      // Confirmar cambio de reacción
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Quieres cambiar tu reacción.',
        icon: 'warning', // Icono de advertencia
        showCancelButton: true, // Mostrar el botón de cancelación
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Enviar la nueva reacción al servidor
            await axios.post(`/posts/${postId}/react2`, {
              userId: user.id,
              reactionType, // 'like' o 'dislike'
            });

            // Actualizar el estado local de las reacciones
            setUserReactions((prevReactions) => ({
              ...prevReactions,
              [postId]: reactionType,
            }));

            // Marcar que se hizo clic en el botón de reacción
            setClickedReaction((prev) => ({
              ...prev,
              [postId]: reactionType,
            }));

            // Refrescar las publicaciones
            await fetchPosts();
          } catch (error) {
            console.error("Error al cambiar la reacción:", error);
          }
        }
      });
    } else {
      try {
        // Enviar la reacción al servidor si es la primera vez que reacciona
        await axios.post(`/posts/${postId}/react`, {
          userId: user.id,
          reactionType, // 'like' o 'dislike'
        });

        // Actualizar el estado local de las reacciones
        setUserReactions((prevReactions) => ({
          ...prevReactions,
          [postId]: reactionType,
        }));

        // Marcar que se hizo clic en el botón de reacción
        setClickedReaction((prev) => ({
          ...prev,
          [postId]: reactionType,
        }));

        // Refrescar las publicaciones
        await fetchPosts();
      } catch (error) {
        console.error("Error enviando la reacción:", error);
      }
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'; // 1 millón
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'; // 1,000
    }
    return num;
  };


  const handleDeletePost = async (postId) => {
    // Confirmación antes de eliminar el post
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este post será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {

        // Llamada a la API para eliminar el post
        axios
          .delete(`posts/${postId}`) // Asegúrate de que la ruta de la API sea correcta
          .then((response) => {
            // Si la eliminación es exitosa, eliminamos el post del estado local
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
            Swal.fire('Eliminado', 'El post ha sido eliminado correctamente.', 'success');
          })

          .catch((error) => {
            // Manejo de errores en caso de que falle la eliminación
            Swal.fire('Error', 'Hubo un problema al eliminar el post. Intenta nuevamente.', 'error');
          });
      }
    });
    await fetchPosts(currentPage);

  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center mb-4 text-blue-500 ">
        <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
        <h1 className="text-2xl font-semibold text-blue-500">PUBLICACIONES</h1>
      </div>
      <center>
        <p>En esta sección te mostramos todas las publicaciones acerca de Postula</p>
      </center>
      <hr className="my-4" />

      <div className="flex justify-between mb-4">
        {/* Botón para "Nuevo Post" */}
        <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
          onClick={() => setShowModal(true)}>
          + Nuevo Post
        </button>


      </div>

      {isLoading && <p className="text-center text-blue-500 font-semibold">Cargando publicaciones...</p>}
      {posts.length === 0 ? (
        <div className="space-y-6">    <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          Aún no se han publicado ningún post, sé el primero en hacerlo
        </h3>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-blue-600 mb-3">{post.title}</h2>

              {/* Contenedor flex para 'Publicado por' y 'Publicado el' */}
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <p className="flex-1">
                  Publicado por: {post.user ? post.user.name : "Usuario desconocido"}
                </p>
                <p className="flex-1 text-right">
                  Publicado el: {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>

              <hr />
              <p className="text-gray-700 mb-4">{post.content}</p>
              {/* Botón de "Ver más" si hay más de 2 respuestas */}
              {post.user && post.user.id === user.id && (
                <div className="flex flex-col items-start mt-2 bg-blue-100 p-3 rounded-lg w-40">
                  <span className="text-sm text-gray-600 mb-1 font-thin">Acciones de mi post</span>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Eliminar
                  </button>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>.</span>

                <div className="flex space-x-4">
                  <div className="flex justify-between items-center w-full">
                    <FontAwesomeIcon icon={faComment} className="mr-1 text-blue-500" />
                    <span>{post.comments}</span>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleReaction(post.id, "like")}
                      disabled={userReactions[post.id] === "like"}
                      className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
                      {formatNumber(post.reactionsp)}
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, "dislike")}
                      disabled={userReactions[post.id] === "dislike"}
                      className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faThumbsDown} className="mr-2" />
                      {formatNumber(post.reactionsn)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón de Responder centrado con ícono */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    const userResponses = post.respuestas.filter((respuesta) => respuesta.nombre === user.name);
                    if (userResponses.length >= 2) {
                      Swal.fire({
                        title: '¡Has respondido más de dos veces!',
                        text: 'No puedes responder más de dos veces a este post.',
                        icon: 'info',
                        confirmButtonText: 'Aceptar',
                      });
                      return;
                    }

                    setSelectedPostId(post.id);
                    setShowModal2(true);
                  }}
                  className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"

                >
                  <FontAwesomeIcon icon={faReply} className="mr-2" />
                  Responder
                </button>
              </div>

              <hr />

              {/* Mostrar las respuestas debajo de la publicación */}
              <div className="mt-4">
                {post.respuestas && post.respuestas.length > 0 ? (
                  <>
                    {/* Mostrar solo las primeras 2 respuestas inicialmente */}
                    {post.respuestas.slice(0, 2).map((respuesta, idx) => (
                      <div key={idx} className="bg-gray-100 p-4 rounded-lg mb-4">
                        <p className="font-semibold text-gray-800">{respuesta.nombre}</p>
                        <p className="text-sm text-gray-500">{new Date(respuesta.fecha).toLocaleString()}</p>
                        <p className="text-gray-600">{respuesta.comentario}</p>
                      </div>
                    ))}

                    {/* Botón de "Ver más" si hay más de 2 respuestas */}
                    {post.respuestas.length > 2 && (
                      <button
                        onClick={() => setShowAllResponses((prevState) => !prevState)}
                        className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
                      >
                        <FontAwesomeIcon
                          icon={showAllResponses ? faChevronUp : faChevronDown}
                          className="mr-2"
                        />
                        {showAllResponses ? "Ver menos" : "Ver más"}
                      </button>
                    )}

                    {/* Mostrar las respuestas adicionales si se hace clic en "Ver más" */}
                    {showAllResponses && (
                      post.respuestas.slice(2).map((respuesta, idx) => (
                        <div key={idx} className="bg-gray-100 p-4 rounded-lg mb-4">
                          <p className="font-semibold text-gray-800">{respuesta.nombre}</p>
                          <p className="text-sm text-gray-500">{new Date(respuesta.fecha).toLocaleString()}</p>
                          <p className="text-gray-600">{respuesta.comentario}</p>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-gray-600">Sin respuestas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-l"
        >
          Anterior
        </button>
        <span className="px-4 py-2 text-gray-700">{`Página ${currentPage} de ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
        >
          Siguiente
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Nuevo Post</h2>

            <div className="mb-4">
              <label className="block text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded"
                placeholder="Título de la publicación"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Descripción</label>
              <textarea
                name="content"
                value={newPost.content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded h-56" // Aumenta la altura con `h-32`
                placeholder="Descripción del post"
              />

            </div>

            <div className="flex justify-between">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleSubmitPost}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                {isLoading ? "Publicando..." : "Crear Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Responder publicación</h2>

            <div className="mb-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded h-40"
                placeholder="Escribe tu respuesta"
              />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setShowModal2(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleSubmitComment}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PostPagePostulante;
