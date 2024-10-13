import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from '../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';
import Select from 'react-select';


interface IFormInput {
  institucion: string;
  estado: string;
  fechaini: string;
  fechafin: string;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;
  titulo_acreditado: string;

}

interface Titulo {
  id: number;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;
  titulo_acreditado: string;
}

interface TituloDetalle {
  id: number;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;

}

interface Postulante {
  id_postulante: number;
  foto: string;
  nombres: string;
  apellidos: string;
  fecha_nac: string;
  edad: number;
  estado_civil: string;
  cedula: string;
  genero: string;
  informacion_extra?: string;
}

interface Formacion {
  id: number;
  institucion: string;
  estado: string;
  fechaini: string;
  fechafin: string;
  titulo: TituloDetalle;
  id_postulante: number;
  titulo_acreditado: string;
}

interface Ubicacion {
  provincia: string;
  canton: string;
}

interface ProfileData {
  postulante: Postulante;
  ubicacion: Ubicacion;
  formaciones?: Formacion[];
}

interface EditFormacionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  formacion?: Formacion;
  reloadProfile: () => void;
}

const EditFormacionModal: React.FC<EditFormacionModalProps> = ({ isOpen, closeModal, formacion, reloadProfile }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<IFormInput>();
  const [niveles, setNiveles] = useState<string[]>([]);
  const [titulos2, setTitulos2] = useState([]);
 
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedCampo, setSelectedCampo] = useState('');
  const [selectedTitulo, setSelectedTitulo] = useState<number | null>(null);
  const [selectedTituloId, setSelectedTituloId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEnCurso, setIsEnCurso] = useState(false);
  const [filteredTitulos, setFilteredTitulos] = useState([]);

  const fechaini = watch('fechaini');
  const fechafin = watch('fechafin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('titulos');
        setNiveles(response.data.nivel);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
    if (formacion) {
      setIsEnCurso(false);
      setValue('institucion', formacion.institucion);
      setValue('estado', formacion.estado);
      if (formacion.estado === 'En curso') {
        setIsEnCurso(true);
        setValue('fechaini', formacion.fechaini);
      } else {
        setIsEnCurso(false);
        setValue('fechaini', formacion.fechaini);
        setValue('fechafin', formacion.fechafin);
      }

      // Cargar el nivel de educación y el título
      setSelectedNivel(formacion.titulo.nivel_educacion); // Asegúrate de que este valor existe
      setSelectedCampo(formacion.titulo.campo_amplio); // Este valor se puede mantener para otros propósitos
      setSelectedTitulo(formacion.titulo.id); // Debe coincidir con los valores de titulos2
      setSelectedTituloId(formacion.titulo.id.toString());
      setValue('titulo_acreditado', formacion.titulo_acreditado);
      const loadTitulos = async () => {
        const response = await axios.get(`titulos/${formacion.titulo.nivel_educacion}/todos`);
        const titulosOptions = response.data.map(titulo => ({
          value: titulo.id,
          label: titulo.titulo,
        }));
        setTitulos2(titulosOptions);
      };


      loadTitulos();
    } else {
      reset({
        institucion: '',
        estado: '',
        fechaini: '',
        fechafin: '',
        titulo_acreditado: '',
      });
      setSelectedNivel('');
      setSelectedCampo('');
      setSelectedTitulo(0);
      setSelectedTituloId('');
      setIsEnCurso(false);
    }

  }, [formacion, setValue, reset]);



  useEffect(() => {
    if (selectedNivel) {
      const fetchTitulos = async () => {
        try {
          const response = await axios.get(`titulos/${selectedNivel}/todos`);
          // Verificar la respuesta de la API
          // Transformar los datos a formato adecuado para react-select
          const titulosOptions = response.data.map(titulo => {
            if (titulo.id && titulo.titulo) {
              return {
                value: titulo.id,  // El valor que se usará al seleccionar
                label: titulo.titulo  // La etiqueta que se mostrará en la lista
              };
            }
            return null; // Devuelve null si la estructura no es correcta
          }).filter(option => option !== null); // Filtrar opciones nulas

          setTitulos2(titulosOptions);
        } catch (error) {
          console.error('Error fetching titulos:', error);
        }
      };

      fetchTitulos();
    }
  }, [selectedNivel, selectedCampo]);

  const handleNivelChange = (event) => {
    const nivelSeleccionado = event.target.value;
    setSelectedNivel(nivelSeleccionado);

    // Limpiar los valores de título y su ID
    setSelectedTitulo(0); // O el valor inicial que desees
    setSelectedTituloId('');

    // Aquí puedes agregar la lógica para cargar los títulos según el nivel seleccionado
  };


  const handleTituloChange = (option) => {
    if (option) {
      setSelectedTituloId(option.value); // Guarda solo el id del título

    } else {
      // Si no se selecciona nada
      setSelectedTitulo(0);
      setSelectedTituloId(''); // Resetear el id
      setValue('titulo_acreditado', '');
    }
  };


  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEstado = e.target.value;
    if (selectedEstado === 'En curso') {
      setIsEnCurso(true);
      setValue('fechafin', null);
    } else {
      setIsEnCurso(false);
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
   

    if (user && profileData && selectedTituloId) {
      if (data.estado !== 'En curso') {


        if (new Date(fechaini) > new Date(fechafin)) {
          setErrorMessage('La fecha de inicio no puede ser mayor que la fecha de finalización.');
          setSuccessMessage(null);
          return;
        }
      }



      try {

        const formData = {
          id_postulante: profileData?.postulante?.id_postulante,
          id_titulo: selectedTituloId,
          institucion: data.institucion,
          estado: data.estado,
          fechaini: data.fechaini,
          fechafin: data.fechafin,
          nivel_educacion: selectedNivel,
          campo_amplio: selectedCampo,
          titulo: selectedTituloId,
          titulo_acreditado: data.titulo_acreditado,
        };
     
        const response = formacion ? await axios.put(`/formacion_academica/update`, formData) : await axios.post('postulante/forma2', formData);

        if (response.status === 200) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: response.data.message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else {
          setErrorMessage('Error al guardar la formación.');
        }

        closeModal();
        await reloadProfile();
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
        setSuccessMessage(null);
      }
    } else {
      setErrorMessage('Por favor complete todos los campos.');
      setSuccessMessage(null);
    }
  };

 

  useEffect(() => {
    // Auto-select the first title if only one option is available
    if (filteredTitulos.length === 1) {
      setSelectedTitulo(filteredTitulos[0].id);
    }
  }, [filteredTitulos]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Editar Formación Académica"
      className="bg-white p-4 rounded-lg shadow-md w-full max-w-3xl mx-auto my-20 relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        overlay: {
          zIndex: 1000,
        },
        content: {
          zIndex: 1001,
        },
      }}
    >
      <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
        &times;
      </button>
      <h2 className="text-2xl text-center font-semibold mb-4 text-blue-500">{formacion ? 'Editar' : 'Agregar'} Formación Académica</h2>
      {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{errorMessage}</span>
        <span onClick={() => setErrorMessage(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 5.652a.5.5 0 00-.707 0L10 9.293 6.36 5.652a.5.5 0 10-.707.707L9.293 10l-3.64 3.64a.5.5 0 10.707.707L10 10.707l3.64-3.64a.5.5 0 000-.707z" /></svg>
        </span>
      </div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Éxito: </strong>
        <span className="block sm:inline">{successMessage}</span>
        <span onClick={() => setSuccessMessage(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 5.652a.5.5 0 00-.707 0L10 9.293 6.36 5.652a.5.5 0 10-.707.707L9.293 10l-3.64 3.64a.5.5 0 10.707.707L10 10.707l3.64-3.64a.5.5 0 000-.707z" /></svg>
        </span>
      </div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex flex-wrap gap-3 max-w-full">
          {/* Nivel de Educación */}
          <div className="form-group w-80">
            <label
              htmlFor="nivelEducacion"
              className="block text-gray-700 font-semibold mb-2"
            >
              Nivel de Educación:
            </label>
            {formacion ? ( // Mostrar valor en modo no seleccionable
              <span className="block w-full px-4 py-2 border rounded-lg bg-gray-100" onClick={() => {
                Swal.fire({
                  title: 'Cambio de nivel o título',
                  text: 'Si deseas cambiar el nivel o el título, debes crear otra formación',
                  icon: 'info',
                  confirmButtonText: 'Entendido',
                  confirmButtonColor: '#3085d6',
                });
              }}>
                {selectedNivel || "Cargando"}
              </span>
            ) : (
              <select
                id="nivelEducacion"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                onChange={handleNivelChange}
                value={selectedNivel}
                disabled={!!formacion}
              >
                <option value="">Seleccione</option>
                {niveles.map((nivel, index) => (
                  <option key={index} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* Título */}
          <div className="form-group w-1/2">
            <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-2">
              Título (Acreditado por la Senecyt):
            </label>
            {formacion ? ( // Mostrar valor en modo no seleccionable
              <span className="block w-full px-4 py-2 border rounded-lg bg-gray-100" onClick={() => {
                Swal.fire({
                  title: 'Cambio de nivel o título',
                  text: 'Si deseas cambiar el nivel o el título, debes crear otra formación',
                  icon: 'info',
                  confirmButtonText: 'Entendido',
                  confirmButtonColor: '#3085d6',
                });
              }}>
                {titulos2.find(titulo => titulo.value === selectedTitulo)?.label || "Cargando..."}
              </span>
            ) : (
              <Select
                id="titulo"
                options={titulos2} // Usar los títulos cargados desde la API
                onChange={(option) => {
                  handleTituloChange(option);
                  setSelectedTitulo(option.value); // Guardar el id seleccionado
                }}  // Manejar el cambio
                value={titulos2.find(titulo => titulo.value === selectedTitulo) || null}  // Mostrar el valor seleccionado
                isClearable  // Permitir limpiar el campo
                placeholder="Escribe o selecciona un título..."
                noOptionsMessage={() => "No hay opciones disponibles"} // Mensaje cuando no hay opciones
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                isDisabled={!selectedNivel}
              />
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="titulo_acreditado" className="block text-gray-700 font-semibold mb-2">Título Acreditado por la institución:</label>
          <input type="text" id="titulo_acreditado" {...register('titulo_acreditado', { required: true })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
          {errors.titulo_acreditado && <span className="text-red-500">Este campo es obligatorio</span>}
        </div>
        <div className="form-group">
          <label htmlFor="institucion" className="block text-gray-700 font-semibold mb-2">Institución que otorga el título:</label>
          <input type="text" id="institucion" {...register('institucion', { required: true })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
          {errors.institucion && <span className="text-red-500">Este campo es obligatorio</span>}
        </div>
        <div className="form-group">
          <label htmlFor="estado" className="block text-gray-700 font-semibold mb-2">Estado de la formación académica:</label>
          <select id="estado" {...register('estado', { required: true })} onChange={handleEstadoChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option value="">Seleccione</option>
            <option value="En curso">En curso</option>
            <option value="Culminado">Culminado</option>
          </select>
          {errors.estado && <span className="text-red-500">Este campo es obligatorio</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="fechaini" className="block text-gray-700 font-semibold mb-2">Fecha de Inicio:</label>
            <input type="date" id="fechaini" {...register('fechaini', { required: true })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            {errors.fechaini && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          {!isEnCurso && (
            <div className="form-group">
              <label htmlFor="fechafin" className="block text-gray-700 font-semibold mb-2">Fecha de Fin:</label>
              <input type="date" id="fechafin" {...register('fechafin', {
                required: 'Este campo es requerido', validate: value => {
                  const today = new Date().toISOString().split('T')[0];
                  return value <= today || 'La fecha no puede ser mayor a hoy';
                }
              })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600" />
              {errors.fechafin && <p className="text-red-500 text-sm mt-2">{errors.fechafin.message}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={closeModal} className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">{formacion ? 'Guardar' : 'Añadir'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFormacionModal;