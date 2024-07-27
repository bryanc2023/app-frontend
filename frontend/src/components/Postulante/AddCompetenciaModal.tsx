import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface AddCompetenciaModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    onHabilidadAdded: () => void;
    habilidades: { id: number; grupo: string, nombre:string }[];
    userId: number;
}

interface FormValues {
    competenciaId: number;
    nivel:string;
}

const AddCompetenciadModal: React.FC<AddCompetenciaModalProps> = ({ isOpen, onRequestClose, onHabilidadAdded, habilidades, userId }) => {
    const { register, handleSubmit, formState: { errors },reset } = useForm<FormValues>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedGrupo, setSelectedGrupo] = useState<string>('');
    const [filteredHabilidades, setFilteredHabilidades] = useState<{ id: number; grupo: string; nombre: string }[]>([]);


    useEffect(() => {
        if (selectedGrupo) {
            setFilteredHabilidades(habilidades.filter(habilidad => habilidad.grupo === selectedGrupo));
        } else {
            setFilteredHabilidades([]);
            reset({ competenciaId: 0 });
        }
    }, [selectedGrupo, habilidades, reset]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
      try {
          const response = await axios.post('/nuevocompetencia', {
              userId: user?.id,
              competenciaId: data.competenciaId,
              nivel: data.nivel,
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
          onHabilidadAdded();
          onRequestClose();
      } catch (error) {
          if (isAxiosError(error) && error.response) {
              let errorMessage = error.response.data.error || 'Error al agregar competencia';
              if (error.response.status === 409) { // Verificar si es un error de conflicto
                  errorMessage = 'La competencia ya está registrada para este postulante';
              }
              Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'error',
                  title: errorMessage,
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
              });
          }
      }
  };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Agregar Idioma"
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto my-20 relative"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agregar Competencia</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Grupo<span className="text-red-500">*</span></label>
                        <select 
                            className="w-full px-4 py-2 border rounded-md"
                            value={selectedGrupo}
                            onChange={(e) => setSelectedGrupo(e.target.value)}
                        >
                            <option value="">Seleccionar grupo</option>
                            {[...new Set(habilidades.map(habilidad => habilidad.grupo))].map((grupo, index) => (
                                <option key={index} value={grupo}>{grupo}</option>
                            ))}
                        </select>
                       
                    </div>


                    <div className="mb-4">
                        <label className="block text-gray-700">Competencia<span className="text-red-500">*</span></label>
                        <select 
                            className="w-full px-4 py-2 border rounded-md"
                            disabled={!selectedGrupo}
                            {...register('competenciaId', { required: 'Este campo es requerido' })}
                        >
                            <option value="">Seleccionar Competencia</option>
                            {filteredHabilidades.map((habilidad) => (
                                <option key={habilidad.id} value={habilidad.id}>{habilidad.nombre}</option>
                            ))}
                        </select>
                        {errors.competenciaId && <span className="text-red-500">{errors.competenciaId.message}</span>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nivel De Desarrollo <span className="text-red-500">*</span></label>
                        <select className="w-full px-4 py-2 border rounded-md" {...register('nivel', { required: 'Este campo es requerido' })}>
                            <option value="">Seleccionar nivel</option>
                            <option value="Alto">Alto</option>
                            <option value="Medio">Medio</option>
                            <option value="Bajo">Bajo</option>
                        </select>
                        {errors.nivel && <span className="text-red-500">{errors.nivel.message}</span>}
                    </div>

                  
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Agregar</button>
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200">Cancelar</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCompetenciadModal;