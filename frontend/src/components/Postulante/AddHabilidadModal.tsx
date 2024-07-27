import React from 'react';
import Modal from 'react-modal';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface AddHabilidadModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    onHabilidadAdded: () => void;
    habilidades: { id: number; habilidad: string }[];
    userId: number;
}

interface FormValues {
    habilidadId: number;
    nivel:string;
}

const AddHabilidadModal: React.FC<AddHabilidadModalProps> = ({ isOpen, onRequestClose, onHabilidadAdded, habilidades, userId }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const { user } = useSelector((state: RootState) => state.auth);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const response = await axios.post('/nuevohabilidad', {
                userId: user?.id,
                habilidadId: data.habilidadId,
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
                let errorMessage = error.response.data.error || 'Error al agregar habilidad';
                if (error.response.status === 409) { // Verificar si es un error de conflicto
                    errorMessage = 'La habilidad ya está registrada para este postulante';
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agregar Habilidad</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Habilidad <span className="text-red-500">*</span></label>
                        <select className="w-full px-4 py-2 border rounded-md" {...register('habilidadId', { required: 'Este campo es requerido' })}>
                            <option value="">Seleccionar habilidad</option>
                            {habilidades.map((habilidad) => (
                                <option key={habilidad.id} value={habilidad.id}>{habilidad.habilidad}</option>
                            ))}
                        </select>
                        {errors.habilidadId && <span className="text-red-500">{errors.habilidadId.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Nivel De Destreza <span className="text-red-500">*</span></label>
                        <select className="w-full px-4 py-2 border rounded-md" {...register('nivel', { required: 'Este campo es requerido' })}>
                            <option value="">Seleccionar nivel</option>
                            <option value="Basico">Básico</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
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

export default AddHabilidadModal;