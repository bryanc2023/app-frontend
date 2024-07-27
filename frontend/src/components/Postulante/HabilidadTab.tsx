import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '../../store';
import AddHabilidadModal from './AddHabilidadModal';
import EditHabilidadModal from './EditHabilidadModal';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface HabilidadesTabProps {
  habilidades: Habilidad[];
}

export interface Habilidad {
  id: number;
  habilidad: string;
  nivel: string;
  pivot?: {
    id_postulante: number;
    id_habilidad: number;
    nivel: string;
  };
}

const HabilidadTab: React.FC<HabilidadesTabProps> = ({ habilidades }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { reset } = useForm<Idioma>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHabilidad, setSelectedHabilidad] = useState<Habilidad | null>(null);
  const [generalHabilidades, setGeneralHabilidades] = useState<Habilidad[]>([]);
  const [userHabilidades, setUserHabilidades] = useState<Habilidad[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [habilidadToDelete, setHabilidadToDelete] = useState<Habilidad| null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
         
          const response = await axios.get(`/perfil/${user.id}`);
        
          setProfileData(response.data);
          fetchUserHabilidades(response.data.postulante.id_postulante);
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
    fetchGeneralHabilidades();
  }, []);

  const fetchGeneralHabilidades = async () => {
    try {
      const response = await axios.get('/habilidadR');
      if (response.data && Array.isArray(response.data.habilidades)) {
        setGeneralHabilidades(response.data.habilidades);
      } else {
        setGeneralHabilidades([]);
      }
    } catch (error) {
      console.error('Error fetching idiomas:', error);
      setGeneralHabilidades([]);
    }
  };

  const fetchUserHabilidades = async (id_postulante: number) => {
    try {
     
      const response = await axios.get('/habilidades', { params: { id_postulante } });
     
      if (response.data && Array.isArray(response.data.habilidades)) {
        setUserHabilidades(response.data.habilidades);
      } else {
        console.error('Unexpected response format:', response.data);
        setUserHabilidades([]);
      }
    } catch (error) {
      console.error('Error fetching user idiomas:', error);
      setUserHabilidades([]);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (habilidad: Habilidad) => {
    setSelectedHabilidad(habilidad);
    setIsEditModalOpen(true);
  };

  const handleHabilidadAdded = async () => {
    setIsAddModalOpen(false);
    if (profileData) {
      await fetchUserHabilidades(profileData.postulante.id_postulante);
      fetchGeneralHabilidades();
    }
  };

  const handleHabilidadUpdated = async () => {
    reset();
    setIsEditModalOpen(false);
    if (profileData) {
      await fetchUserHabilidades(profileData.postulante.id_postulante);
      fetchGeneralHabilidades();
    }
  };

  const handleDeleteHabilidad = async () => {
    if (!habilidadToDelete || !profileData || typeof profileData.postulante.id_postulante === 'undefined') {
      console.error('Missing data: ', { habilidadToDelete, profileData });
      setDeleteMessage('Error al eliminar la habilidad: Datos incompletos');
      setTimeout(() => setDeleteMessage(null), 3000);
      return;
    }

    try {
      const response = await axios.delete('/postulante_habilidad/delete', {
        data: {
          id_postulante: profileData.postulante.id_postulante,
          id_habilidad: habilidadToDelete.id,
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
        await fetchUserHabilidades(profileData.postulante.id_postulante);
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

  const openConfirmationModal = (habilidad: Habilidad) => {
    setHabilidadToDelete(habilidad);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setHabilidadToDelete(null);
  };

  if (loading) {
    return <p className="text-gray-400">Cargando...</p>;
  }
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Habilidades</h3>
        <button onClick={handleOpenAddModal} className="text-orange-400 hover:underline">
          + Agregar habilidad
        </button>
      </div>
      {deleteMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${deleteMessage.includes('exitosamente') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      {userHabilidades.length > 0 ? (
        userHabilidades.map((habilidad, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
            <div className="flex justify-end space-x-2 mb-2">
              <button
                onClick={() => handleOpenEditModal(habilidad)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => openConfirmationModal(habilidad)}
                className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            <p><strong className='text-orange-400'>Hablidad:</strong> {habilidad.habilidad}</p>
            <p><strong className='text-orange-400' >Nivel de destreza:</strong> {habilidad.pivot?.nivel}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No hay habilidades disponibles en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={handleOpenAddModal}>
        <span className="text-gray-400">Agrega tu habilidad</span>
      </div>
      <AddHabilidadModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        onHabilidadAdded={handleHabilidadAdded}
        habilidades={generalHabilidades}
      />
      {selectedHabilidad && (
        <EditHabilidadModal
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
          habilidad={selectedHabilidad}
          onhabilidadUpdated={handleHabilidadUpdated}
        />
      )}

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirmar Acción</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar esta habilidad?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteHabilidad}
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

export default HabilidadTab;
