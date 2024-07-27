import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import AddIdiomaModal from './AddIdiomaModal';
import EditIdiomaModal from './EditIdiomaModal';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface LanguagesTabProps {
  idiomas: Idioma[];
}

interface Idioma {
  nivel_oral: string;
  nivel_escrito: string;
  id: number;
  nombre: string;
  pivot?: {
    id_postulante: number;
    id_idioma: number;
    nivel_oral: string;
    nivel_escrito: string;
  };
}

const LanguagesTab: React.FC<LanguagesTabProps> = ({ idiomas }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { reset } = useForm<Idioma>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIdioma, setSelectedIdioma] = useState<Idioma | null>(null);
  const [generalLanguages, setGeneralLanguages] = useState<Idioma[]>([]);
  const [userLanguages, setUserLanguages] = useState<Idioma[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [idiomaToDelete, setIdiomaToDelete] = useState<Idioma | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
         
          const response = await axios.get(`/perfil/${user.id}`);
        
          setProfileData(response.data);
          fetchUserLanguages(response.data.postulante.id_postulante);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    fetchGeneralLanguages();
  }, []);

  const fetchGeneralLanguages = async () => {
    try {
      const response = await axios.get('/idioma');
      if (response.data && Array.isArray(response.data.idiomas)) {
        setGeneralLanguages(response.data.idiomas);
      } else {
        setGeneralLanguages([]);
      }
    } catch (error) {
      console.error('Error fetching idiomas:', error);
      setGeneralLanguages([]);
    }
  };

  const fetchUserLanguages = async (id_postulante: number) => {
    try {
     
      const response = await axios.get('/idiomas', { params: { id_postulante } });
     
      if (response.data && Array.isArray(response.data.idiomas)) {
        setUserLanguages(response.data.idiomas);
      } else {
        console.error('Unexpected response format:', response.data);
        setUserLanguages([]);
      }
    } catch (error) {
      console.error('Error fetching user idiomas:', error);
      setUserLanguages([]);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (idioma: Idioma) => {
    setSelectedIdioma(idioma);
    setIsEditModalOpen(true);
  };

  const handleIdiomaAdded = async () => {
    setIsAddModalOpen(false);
    if (profileData) {
      await fetchUserLanguages(profileData.postulante.id_postulante);
      fetchGeneralLanguages();
    }
  };

  const handleIdiomaUpdated = async () => {
    reset();
    setIsEditModalOpen(false);
    if (profileData) {
      await fetchUserLanguages(profileData.postulante.id_postulante);
      fetchGeneralLanguages();
    }
  };

  const handleDeleteIdioma = async () => {
    if (!idiomaToDelete || !profileData || typeof profileData.postulante.id_postulante === 'undefined') {
      console.error('Missing data: ', { idiomaToDelete, profileData });
      setDeleteMessage('Error al eliminar el idioma: Datos incompletos');
      setTimeout(() => setDeleteMessage(null), 3000);
      return;
    }

    try {
      const response = await axios.delete('/postulante_idioma/delete', {
        data: {
          id_postulante: profileData.postulante.id_postulante,
          id_idioma: idiomaToDelete.id,
        }
      });

       Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: response.data.message,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
      if (profileData) {
        await fetchUserLanguages(profileData.postulante.id_postulante);
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

  const openConfirmationModal = (idioma: Idioma) => {
    setIdiomaToDelete(idioma);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setIdiomaToDelete(null);
  };

  if (loading) {
    return <p className="text-gray-400">Cargando...</p>;
  }
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Idiomas</h3>
        <button onClick={handleOpenAddModal} className="text-orange-400 hover:underline">
          + Agregar idioma
        </button>
      </div>
      {deleteMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${deleteMessage.includes('exitosamente') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      {userLanguages.length > 0 ? (
        userLanguages.map((idioma, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
            <div className="flex justify-end space-x-2 mb-2">
              <button
                onClick={() => handleOpenEditModal(idioma)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => openConfirmationModal(idioma)}
                className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            <p><strong className='text-orange-400'>Idioma:</strong> {idioma.nombre}</p>
            <p><strong className='text-orange-400' >Nivel De Desempeño Oral :</strong> {idioma.pivot?.nivel_oral}</p>
            <p><strong className='text-orange-400' >Nivel De Desempeño Escrito :</strong> {idioma.pivot?.nivel_escrito}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No hay idiomas disponibles en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={handleOpenAddModal}>
        <span className="text-gray-400">Agrega tu idioma</span>
      </div>
      <AddIdiomaModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        onIdiomaAdded={handleIdiomaAdded}
        languages={generalLanguages}
      />
      {selectedIdioma && (
        <EditIdiomaModal
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
          idioma={selectedIdioma}
          onIdiomaUpdated={handleIdiomaUpdated}
        />
      )}

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirmar Acción</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar este idioma?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteIdioma}
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
    </div>
  );
};

export default LanguagesTab;
