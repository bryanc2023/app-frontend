import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '../../store';
import AddCompetenciadModal from './AddCompetenciaModal';
import EditCompetenciaModal from './EditCompetenciaModal';

interface CompetenciasTabProps {
  // Elimina competencias si no se usa en el componente
  competencias: Competencia[];
  openEditCompetenciaModal?: (Competencia: Competencia) => void;
  openModal: (content: string) => void;
}

interface Competencia {
  id: number;
  grupo: string;
  nombre: string;
  descripcion: string;
  pivot?: {
    id_postulante: number;
    id_competencia: number;
    nivel: string;
  };
}

const CompetenciaTab: React.FC<CompetenciasTabProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { reset } = useForm<Competencia>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHabilidad, setSelectedHabilidad] = useState<Competencia | null>(null);
  const [generalHabilidades, setGeneralHabilidades] = useState<Competencia[]>([]);
  const [userHabilidades, setUserHabilidades] = useState<Competencia[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [habilidadToDelete, setHabilidadToDelete] = useState<Competencia| null>(null);
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
      const response = await axios.get('/competenciaR');
      if (response.data && Array.isArray(response.data.competencias)) {
        setGeneralHabilidades(response.data.competencias);
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
      const response = await axios.get('/competencias', { params: { id_postulante } });
      if (response.data && Array.isArray(response.data.competencias)) {
        setUserHabilidades(response.data.competencias);
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

  const handleOpenEditModal = (competencia: Competencia) => {
    setSelectedHabilidad(competencia);
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
      await axios.delete('/postulante_competencia/delete', {
        data: {
          id_postulante: profileData.postulante.id_postulante,
          id_competencia: habilidadToDelete.id,
        }
      });

      setDeleteMessage('Competencia eliminado exitosamente');
      setTimeout(() => setDeleteMessage(null), 3000);
      if (profileData) {
        await fetchUserHabilidades(profileData.postulante.id_postulante);
      }
    } catch (error: any) {
      console.error('Error eliminando la competencia:', error.response ? error.response.data : error);
      setDeleteMessage('Error al eliminar la competencia');
      setTimeout(() => setDeleteMessage(null), 3000);
    }

    setIsConfirmationModalOpen(false);
  };

  const openConfirmationModal = (competencia: Competencia) => {
    setHabilidadToDelete(competencia);
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
        <h3 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Competencias</h3>
        <button onClick={handleOpenAddModal} className="text-orange-400 hover:underline">
          + Agregar competencia
        </button>
      </div>
      {deleteMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${deleteMessage.includes('exitosamente') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      {userHabilidades.length > 0 ? (
        userHabilidades.map((competencia, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
            <div className="flex justify-end space-x-2 mb-2">
              <button
                onClick={() => handleOpenEditModal(competencia)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => openConfirmationModal(competencia)}
                className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            <p><strong className='text-orange-400'>Grupo de competencias:</strong> {competencia.grupo}</p>
            <p><strong className='text-orange-400'>Competencia:</strong> {competencia.nombre}</p>
            <p><strong className='text-orange-400' >Nivel de desarrollo:</strong> {competencia.pivot?.nivel}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No hay competencias disponibles en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={handleOpenAddModal}>
        <span className="text-gray-400">Agrega tu competencia</span>
      </div>
      <AddCompetenciadModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        onHabilidadAdded={handleHabilidadAdded}
        habilidades={generalHabilidades}
        userId={profileData ? profileData.postulante.id_postulante : 0} // Añadir userId
      />
      {selectedHabilidad && (
        <EditCompetenciaModal
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
            <p className="mb-4">¿Estás seguro de que deseas eliminar esta competencia?</p>
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

export default CompetenciaTab;