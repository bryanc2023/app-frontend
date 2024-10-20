// CoursesTab.tsx
import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import EditCurso from './EditCurso';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';
import { RootState } from '../../store';
import { Curso } from '../../types/CursoType';
import { ProfileData } from '../../types/PostulanteType';

interface CoursesTabProps {
  handleDeleteCurso: (id: number) => void;  // Añadir esta línea
  openEditCursoModal: (curso: Curso | null | undefined) => void;
  cursos: Curso[];
}






const CoursesTab: React.FC<CoursesTabProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [cursoToDelete, setCursoToDelete] = useState<Curso | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [cursoToEdit, setCursoToEdit] = useState<Curso | null | undefined>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const fetchProfileData = async () => {
    try {
      if (user) {
        const response = await axios.get(`/perfil/${user.id}`);
        setProfileData(response.data);
        fetchCursos(response.data.postulante.id_postulante);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async (id_postulante: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/certificados/${id_postulante}`);
      const certificados = response.data.map((certificado: Curso) => ({
        id_certificado: certificado.id_certificado,
        titulo: certificado.titulo,
        certificado: certificado.certificado
      }));

      setCursos(certificados);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleDeleteCurso = async () => {
    if (!cursoToDelete) {
      setDeleteMessage('Error al eliminar el curso: Datos incompletos');
      setTimeout(() => setDeleteMessage(null), 3000);
      return;
    }

    try {
      const response = await axios.delete(`/certificadoD/${cursoToDelete.id_certificado}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: response.data.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      if (profileData && profileData.postulante) {
        fetchCursos(profileData.postulante.id_postulante);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
    setIsConfirmationModalOpen(false);
  };

  const openConfirmationModal = (curso: Curso) => {
    setCursoToDelete(curso);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setCursoToDelete(null);
  };

  const openEditModal = (curso: Curso | null) => {
    setCursoToEdit(curso);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCursoToEdit(null);
  };

  if (loading) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  const handleCertificadoClick = (certificadoUrl) => {
    // Verifica si el URL pertenece a tu servidor

    const isLocalPdf = certificadoUrl.includes('storage/certificados/'); // Cambia 'tudominio.com' por tu dominio real

    if (isLocalPdf) {
      // Si es un PDF local, descárgalo
      downloadCertificado(certificadoUrl);
    } else {
      // Si es un URL externo, abre en una nueva pestaña
      window.open(certificadoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadCertificado = async (certificado) => {
    try {

      const parts = certificado.split('/');
      const titulo = parts[parts.length - 1].split('.')[0];
console.log(titulo)
      const response = await axios.post('/certificados/descargar', {
        titulo: titulo, // Envía el título del certificado
      }, {
        responseType: 'blob', // Esto es importante para manejar la respuesta como archivo
      });

      // Crear una URL para el archivo que se ha descargado
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${titulo}.pdf`); // Nombre del archivo
      document.body.appendChild(link);
      link.click(); // Simula el clic para descargar el archivo
      link.remove(); // Elimina el enlace después de hacer clic

      // Muestra el mensaje de éxito con Swal
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Certificado descargado con éxito',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error al descargar el certificado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un error al intentar descargar el certificado',
      });
    }
  };
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Cursos ,Participaciones y Capacitaciones</h2>
        <button onClick={() => openEditModal(null)} className="text-orange-400 hover:underline">
          + Agregar curso
        </button>
      </div>
      {deleteMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${deleteMessage.includes('exitosamente') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      {cursos.length > 0 ? (
        cursos.map((curso, index) => (
          <div key={`${curso.id_certificado}-${index}`} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
            <div className="flex justify-end space-x-2 mb-2">
              <button
                onClick={() => openEditModal(curso)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => openConfirmationModal(curso)}
                className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            <p><strong className='text-orange-500'>Título:</strong> {curso.titulo}</p>
            <p>
              <strong className='text-orange-500'>Certificado:</strong>
              {curso.certificado ? (
                <a
                  href="#"
                  onClick={() => handleCertificadoClick(curso.certificado)} // Pasamos el URL del certificado a la función
                  className="text-blue-400 hover:underline"
                >
                  Ver certificado
                </a>
              ) : (
                <span className="text-gray-600">No adjuntado</span>
              )}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No hay cursos ni capacitaciones disponibles en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={() => openEditModal(null)}>
        <span className="text-gray-400">Agrega tu curso</span>
      </div>

      {isConfirmationModalOpen && cursoToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar el curso "{cursoToDelete.titulo}"?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCurso}
                className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Eliminar
              </button>
              <button
                onClick={closeConfirmationModal}
                className="px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <EditCurso
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          reloadCursos={() => {
            if (profileData?.postulante?.id_postulante) {
              fetchCursos(profileData.postulante.id_postulante);
            }
          }}
          curso={cursoToEdit}
        />
      )}
    </div>
  );
};

export default CoursesTab;
