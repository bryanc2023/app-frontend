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
  const [currentJob, setCurrentJob] = useState(false);

  const [cargoReferencia, setCargoReferencia] = useState(''); // Estado para almacenar el cargo

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita el comportamiento predeterminado de saltar a una nueva línea
      const textarea = event.target;
      const currentValue = textarea.value;
      // Añade un punto y un salto de línea al final del texto actual
      textarea.value = currentValue + '.\n';
      // Mueve el cursor al final del textarea
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  };

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
      // Extraer cargo y nombre de la persona de referencia
      const personaReferencia = experiencia.persona_referencia || ''; // Asignar vacío si es null
      const [cargoReferencia, nombreReferencia] = personaReferencia.split('/').map(item => item.trim());

      // Si cargoReferencia es vacío, asignar "Persona Referencia"
      const valorCargoReferencia = cargoReferencia || "No definido";

      setCargoReferencia(valorCargoReferencia? valorCargoReferencia :'No definido'); // Establecer el cargo en el estado
      setValue('persona_referencia', nombreReferencia || ''); // Solo el nombre
      setValue('contacto', experiencia.contacto);
      setCurrentJob(experiencia.fecha_fin === null);
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

    // Concatenar el cargo y el nombre de la persona de referencia
    const personaReferenciaConCargo = `${cargoReferencia}/${data.persona_referencia}`;

    const dataToSend = {
      ...data,
      id_postulante: profileData.postulante.id_postulante,
      persona_referencia: personaReferenciaConCargo, // Guardar el campo concatenado
    };

    if (experiencia && experiencia.id_formacion_pro) {
      // Editar experiencia
      try {
        const response = await axios.put(`/experiencia/${experiencia.id_formacion_pro}`, {
          ...dataToSend,
          id_experiencia: experiencia.id_formacion_pro,
          fecha_fin: currentJob ? null : data.fecha_fin,
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
            {!currentJob && ( // Condicional para mostrar el campo solo si el checkbox no está marcado
              <div>
                <label className="block text-gray-700">Fecha de fin de labores:</label>
                <input
                  type="date"
                  {...register('fecha_fin')}
                  className="w-full px-4 py-2 border rounded-md text-gray-700"
                />
                {errors.fecha_fin && <p className="text-red-500">{errors.fecha_fin.message}</p>}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="currentJob"
                checked={currentJob}
                onChange={(e) => setCurrentJob(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="currentJob" className="text-gray-700">¿Hasta la actualidad?</label>
            </div>
            <div>
              <label className="block text-gray-700">Descripción de funciones y responsabilidades en la empresa:</label>
              <textarea
                {...register('descripcion_responsabilidades', {
                  required: 'Este campo es obligatorio',
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                rows={8}
                onKeyDown={handleKeyDown}
              />
              {errors.descripcion_responsabilidades && <p className="text-red-500">{errors.descripcion_responsabilidades.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Cargo de la persona de referencia:</label>
              <input
                type="text"
                value={cargoReferencia}
                onChange={(e) => setCargoReferencia(e.target.value)} // Guardar el valor en el estado
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                placeholder="Cargo de la persona"
              />
            </div>
            <div>
              <label className="block text-gray-700">Nombre Persona Referencia:</label>
              <input
                {...register('persona_referencia', {
                  required: 'Este campo es obligatorio',
                  maxLength: { value: 250, message: 'Máximo 250 caracteres' }
                })}
                className="w-full px-4 py-2 border rounded-md text-gray-700"
                placeholder="Nombre de la persona de referencia"
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
