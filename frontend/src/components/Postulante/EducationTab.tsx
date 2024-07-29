import React, { useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import axios from '../../services/axios';
import { Formacion } from '../../types/FormacionType';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';  // Importar el locale en español
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface EducationTabProps {
  formaciones: Formacion[];
  openEditFormacionModal: (formacion: Formacion | null) => void;
  setFormaciones: React.Dispatch<React.SetStateAction<Formacion[]>>;
}

const EducationTab: React.FC<EducationTabProps> = ({ formaciones, openEditFormacionModal, setFormaciones }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState<{ type: string, text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [deleteInfo, setDeleteInfo] = useState<{ id_postulante: number, id_titulo: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<any>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      if (user) {
        const data = await axios.get(`/perfil/${user.id}`).then(response => response.data);
        setProfileData(data);

        if (data.postulante && data.postulante.formaciones) {
          setFormaciones(data.postulante.formaciones);
         
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData, user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeleteFormacion = async (id_postulante: number, id_titulo: number) => {
    try {
     
      const response = await axios.delete('/formacion_academica/delete', {
        data: { id_postulante, id_titulo },
        headers: { 'Content-Type': 'application/json' },
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
    
      setFormaciones(prevFormaciones => prevFormaciones.filter(f => !(f.id_postulante === id_postulante && f.titulo.id === id_titulo)));
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
    } finally {
      setShowConfirmModal(false); // Cerrar el modal de confirmación
    }
  };
  const openConfirmModal = (formacion: Formacion) => {
    if (profileData && profileData.postulante) {
        
        setDeleteInfo({ id_postulante: profileData.postulante.id_postulante, id_titulo: formacion?.titulo?.id }); // Cambiar a formacion?.titulo?.id
        setShowConfirmModal(true);
    }
};




  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setDeleteInfo(null); // Restablecer `deleteInfo` después de cerrar el modal
  };

  const confirmDelete = () => {
    if (deleteInfo) {
      handleDeleteFormacion(deleteInfo.id_postulante, deleteInfo.id_titulo);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  const formatearFecha = (fecha:any) => {
    const fechaObj = new Date(fecha);
    const fechaFormateada = format(fechaObj, 'MMMM yyyy', { locale: es });
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  };


  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Formación Académica</h2>
        <button onClick={() => openEditFormacionModal(null)} className="text-orange-400 hover:underline">
          + Agregar formación académica
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {message.text}
        </div>
      )}

     
{formaciones.length > 0 ? (
        formaciones.map((formacion, index) => {
          const fechainiFormateada = formatearFecha(formacion.fechaini);
          const fechafinFormateada = formacion.fechafin ? formatearFecha(formacion.fechafin) : 'Presente';

          return (
            <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative">
              <div className="flex justify-end space-x-2 mb-2">
                <button
                  onClick={() => openEditFormacionModal(formacion)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <FaPencilAlt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openConfirmModal(formacion)}
                  className="px-2 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
              <p><strong className='text-orange-500'>Título:</strong><strong className='text-blue-100'> {formacion.titulo_acreditado}</strong> </p>
              <p><strong className='text-orange-500'>Fechas: </strong>{fechainiFormateada} - {fechafinFormateada}</p>
              <p><strong className='text-orange-500'>Institución que otorga el título:</strong> {formacion.institucion}</p>
              <p><strong className='text-orange-500' >Estado de la formación:</strong> {formacion.estado}</p>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400">No hay formación académica disponible en este momento.</p>
      )}
      <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer" onClick={() => openEditFormacionModal(null)}>
        <span className="text-gray-400">Agrega tu formación</span>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirmar Acción</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar esta formación académica?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Eliminar
              </button>
              <button
                onClick={closeConfirmModal}
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

export default EducationTab;