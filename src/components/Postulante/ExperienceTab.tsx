import React, { useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import ExperienceModal from './ExperienceModal';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { Experiencia } from '../../types/ExperienciaType';
import { isAxiosError } from 'axios';

const ExperienceTab: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [deleteMessage] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experiencia | null>(null);

  const fetchExperiencia = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.error('User ID is missing');
        return;
      }
      const response = await axios.get(`/experiencia/${user.id}`);

      if (response.data && Array.isArray(response.data.experiencias)) {
        setExperiencias(response.data.experiencias);
      } else {
        setExperiencias([]);
      }
    } catch (error) {
      console.error('Error fetching experiencia:', error);
      setExperiencias([]);
    }
  }, [user]);

  useEffect(() => {
    fetchExperiencia();
  }, [fetchExperiencia, user]);

  const openModal = (experience: Experiencia | null = null) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  const handleAddOrEditExperiencia = () => {
    fetchExperiencia(); // Refresh experience list after adding or editing
    closeModal();
  };

  const handleDeleteExperiencia = async (id: number) => {
    try {
      const response = await axios.delete(`/experiencia/${id}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: response.data.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      fetchExperiencia(); // Refrescar las experiencias después de eliminar una
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
    setIsConfirmationModalOpen(false); // Cerrar el modal de confirmación
  };

  const openConfirmationModal = (id: number) => {
    setExperienceToDelete(id);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setExperienceToDelete(null);
  };

  const confirmDelete = () => {
    if (experienceToDelete !== null) {
      handleDeleteExperiencia(experienceToDelete);
    }
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    const fechaFormateada = format(fechaObj, 'MMMM yyyy', { locale: es });
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Experiencia Profesional</h3>
        <button onClick={() => openModal()} className="text-orange-400 hover:underline">
          + Agregar experiencia
        </button>
      </div>
      {deleteMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${deleteMessage.includes('exitosamente') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      {experiencias && experiencias.length > 0 ? (
        experiencias.map((experiencia, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
            <div className="flex justify-end space-x-2 mb-2">
              <button
                onClick={() => openModal(experiencia)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => openConfirmationModal(experiencia.id_formacion_pro)}
                className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            <p><strong className="text-orange-500">Empresa:</strong> {experiencia.empresa}</p>
            <p><strong className="text-orange-500">Cargo:</strong> {experiencia.puesto}</p>
            <p><strong className="text-orange-500">Fechas de labores:</strong> {formatearFecha(experiencia.fecha_ini)} - {formatearFecha(experiencia.fecha_fin)}</p>
            <p><strong className="text-orange-500">Área:</strong> {experiencia.area.split('.')[1]}</p>
            <p><strong className="text-orange-500">Funciones y responsabilidades en el cargo:</strong></p>
            {experiencia.descripcion_responsabilidades && experiencia.descripcion_responsabilidades.includes('.') ? (
              <ul className="list-disc list-inside">
                {experiencia.descripcion_responsabilidades
                  .split('.')
                  .map(item => item.trim()) // Eliminar espacios en blanco
                  .filter(item => item) // Filtrar los elementos vacíos
                  .map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
              </ul>
            ) : (
              <p>{experiencia.descripcion_responsabilidades}</p>
            )}

            <p><strong className="text-orange-500">Reporta a:</strong> {experiencia.persona_referencia}</p>
            <p><strong className="text-orange-500">Contacto:</strong> {experiencia.contacto}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No hay experiencia disponible en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={() => openModal()}>
        <span className="text-gray-400">Agrega tu experiencia</span>
      </div>

      <ExperienceModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onSubmit={handleAddOrEditExperiencia}
        experiencia={selectedExperience}
      />

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirmar Acción</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar esta experiencia?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmDelete}
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

export default ExperienceTab;
