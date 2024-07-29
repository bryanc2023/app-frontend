import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';
interface Habilidad{
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

interface EditCompetenciaModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  habilidad: Habilidad;
  onhabilidadUpdated: () => void;
}

interface FormValues {
  nivel:string;
}

const EditCompetenciaModal: React.FC< EditCompetenciaModalProps> = ({ isOpen, onRequestClose, habilidad, onhabilidadUpdated }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<any>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      nivel: habilidad.pivot?.nivel,
    }
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
          const response = await axios.get(`/perfil/${user.id}`);
          setProfileData(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    reset({
      nivel: habilidad.pivot?.nivel,
    });
  }, [habilidad, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('Datos enviados:', {
      id_postulante: profileData?.postulante?.id_postulante,
      id_competencia: habilidad.id,
      nivel: data.nivel
    });

    try {
      const response = await axios.put('/postulante_competencia/update', {
        id_postulante: profileData?.postulante?.id_postulante,
        id_competencia: habilidad.id,
        nivel: data.nivel
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
      onhabilidadUpdated();
      onRequestClose();
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
      };
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Editar Habilidad"
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto my-20 relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Editar Competencia</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Grupo</label>
            <input 
              type="text"
              value={habilidad.grupo}
              className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Competencia</label>
            <input 
              type="text"
              value={habilidad.nombre}
              className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Nivel de desarrollo <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2 border rounded-md" required
              {...register('nivel', { required: 'Este campo es requerido' })}>
              <option value="">Seleccionar nivel</option>
                            <option value="Alto">Alto</option>
                            <option value="Medio">Medio</option>
                            <option value="Bajo">Bajo</option>
            </select>
            {errors.nivel && <span className="text-red-500">{errors.nivel.message}</span>}
          </div>

         
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Actualizar</button>
          <button type="button" onClick={onRequestClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200">Cancelar</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCompetenciaModal;