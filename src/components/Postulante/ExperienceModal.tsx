import axios from '../../services/axios';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { Experiencia } from '../../types/ExperienciaType';
import { isAxiosError } from 'axios';
import { ProfileData } from '../../types/PostulanteType';

interface ExperienceModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: Experiencia) => void;
  experiencia: Experiencia | null; // Se añade para diferenciar entre agregar y editar
}

interface Area {
  id: number;
  nombre_area: string;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ isOpen, onRequestClose, onSubmit, experiencia }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Experiencia>();
  const [areas, setAreas] = useState<Area[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('areas');
        setAreas(response.data.areas);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (experiencia) {
      setValue('empresa', experiencia.empresa);
      setValue('puesto', experiencia.puesto);
      setValue('area', experiencia.area);
      setValue('fecha_ini', experiencia.fecha_ini);
      setValue('fecha_fin', experiencia.fecha_fin);
      setValue('descripcion_responsabilidades', experiencia.descripcion_responsabilidades);
      setValue('persona_referencia', experiencia.persona_referencia);
      setValue('contacto', experiencia.contacto);
    } else {
      reset();
    }
  }, [experiencia, reset, setValue]);

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

  const onSubmitForm: SubmitHandler<Experiencia> = async (data) => {
    if (!profileData || !profileData.postulante) {
      console.error('Profile data is missing');
      return;
    }

    const dataToSend = {
      ...data,
      id_postulante: profileData.postulante.id_postulante,
    };

    console.log('Data to send:', dataToSend); 

    if (experiencia && experiencia.id_formacion_pro) {
      // Editar experiencia
      try {
        const response = await axios.put(`/experiencia/${experiencia.id_formacion_pro}`, {
          ...dataToSend,
          id_experiencia: experiencia.id_formacion_pro,
        });
        console.log(response);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: response.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        onSubmit(data);
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
    } else {
      try {
        const response = await axios.post('/exp', dataToSend);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: response.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        onSubmit(data);
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
    }
    onRequestClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-4 md:mx-auto my-20 relative">
        <button onClick={onRequestClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-blue-500">{experiencia ? 'Editar Experiencia' : 'Agregar Experiencia'}</h2>
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <label className="block text-gray-700">Nombre de la Empresa:</label>
              <input
                {...register('empresa', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
              />
              {errors.empresa && <p className="text-red-500">{errors.empresa.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Área del puesto de trabajo:</label>
              <select
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                {...register('area', {
                  required: 'Área es requerida',
                  maxLength: { value: 250, message: 'Máximo 250 caracteres' }
                })}
              >
                <option value="">Seleccione</option>
                {areas.map(area => (
                  <option key={area.id} value={`${area.id},${area.nombre_area}`}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
              {errors.area && <p className="text-red-500">{errors.area.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Cargo en la empresa:</label>
              <input
                {...register('puesto', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
              />
              {errors.puesto && <p className="text-red-500">{errors.puesto.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Fecha de inicio labores:</label>
              <input
                type="date"
                {...register('fecha_ini', {
                  required: 'Este campo es obligatorio'
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
              />
              {errors.fecha_ini && <p className="text-red-500">{errors.fecha_ini.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Fecha de fin de labores:</label>
              <input
                type="date"
                {...register('fecha_fin', {
                  required: 'Este campo es obligatorio'
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
              />
              {errors.fecha_fin && <p className="text-red-500">{errors.fecha_fin.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Descripción de funciones y responsabilidades en la empresa:</label>
              <textarea
                {...register('descripcion_responsabilidades', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 500, message: 'Máximo 500 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
              />
              {errors.descripcion_responsabilidades && <p className="text-red-500">{errors.descripcion_responsabilidades.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Nombre Persona Referencia:</label>
              <input
                {...register('persona_referencia', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 250, message: 'Máximo 250 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                placeholder="Nombre (Cargo de la persona en la empresa)"
              />
              {errors.persona_referencia && <p className="text-red-500">{errors.persona_referencia.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Contacto de la persona de referencia:</label>
              <input
                type="text"
                {...register('contacto', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 250, message: 'Máximo 250 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                placeholder="Número o Correo de contacto de la persona de referencia"
              />
              {errors.contacto && <p className="text-red-500">{errors.contacto.message}</p>}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={onRequestClose} className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
