import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from "../../services/axios";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaLinkedin, FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6';

interface IFormInput {
  institucion: string;
  estado: string;
  fechaini: string;
  fechafin: string;
  titulo_acreditado:string;
  id_idioma: number;
  niveloral: string;
  nivelescrito: string;
  empresa:string;
  area:string;
  puesto:string;
  fechae1:string;
  fechae2:string;
  descripcion:string;
  referencia:string;
  contacto:string;
  red:string;
  enlace:string;

}

interface Titulo {
  id: number;
  titulo: string;
}

interface Idioma {
  id: number;
  nombre: string;
}

interface Area {
  id: number;
  nombre_area: string;
}


function CompletarP2() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm<IFormInput>();
  const [niveles, setNiveles] = useState<string[]>([]);
  const [campos, setCampos] = useState<string[]>([]);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedCampo, setSelectedCampo] = useState('');
  const [selectedTitulo, setSelectedTitulo] = useState('');
  const [selectedTituloId, setSelectedTituloId] = useState<string>('');
  const [isEnCurso, setIsEnCurso] = useState(false);
  const [languages, setLanguages] = useState<Idioma[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [hasExperience, setHasExperience] = useState(false);
  const [hasRed, setHasRed] = useState(false);
  const [nombreRed, setNombreRed] = useState('');
  const [enlace, setEnlace] = useState('');
  const { isLogged } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const getFirstLoginDate = async () => {
      try {
     
          if (!user || !user.id) {
            throw new Error('User ID not available');
          }
  
          const response = await axios.get(`first?user_id=${user.id}`);
          const { data } = response;
  
          if (!Object.prototype.hasOwnProperty.call(data, 'has_first_login')) {
            throw new Error('Invalid response format');
          }
          
  
          const hasFirstLogin = data.has_first_login;
     
  
          if (!hasFirstLogin && isLogged) {
            navigate('/completar-2'); // Redirigir a completar perfil si no tiene first_login_at y está logeado
          } else {
            navigate('/verOfertasAll'); // Redirigir a ver ofertas si tiene first_login_at
          }
        } catch (error) {
          console.error('Error fetching first login status:', error);
          // Manejar el error según tus necesidades, por ejemplo, mostrar un mensaje de error
        }
    };

    if (isLogged) {
      getFirstLoginDate();
    }
  }, [isLogged, navigate]);

  const redes = [
    { nombre: 'LinkedIn', icono: <FaLinkedin className="text-blue-600 inline" /> },
    { nombre: 'Instagram', icono: <FaInstagram className="text-pink-600 inline" /> },
    { nombre: 'Facebook', icono: <FaFacebook className="text-blue-800 inline" /> },
    { nombre: 'X', icono: <FaXTwitter className="text-blue-400 inline" /> }, // Reemplaza Twitter por X
];

const handleRedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRed = redes.find((red) => red.nombre === e.target.value);
    setNombreRed(selectedRed ? selectedRed.nombre : '');
};

  const handleCheckboxChange = () => {
    setHasExperience(!hasExperience);
    if (!hasExperience) {
      // Clear the values when experience is not checked
      setValue('empresa', '');
      setValue('area', '');
      setValue('puesto', '');
      setValue('fechae1', '');
      setValue('fechae2', '');
      setValue('descripcion', '');
      setValue('referencia', '');
      setValue('contacto', '');
    }
  };

  const handleCheckboxChange2 = () => {
    setHasRed(!hasRed);
    if (!hasRed) {
      // Clear the values when experience is not checked
      setValue('red', '');
      setValue('enlace', '');
      setNombreRed('');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('titulos');
        const response2 = await axios.get('idioma');
        const response3 = await axios.get('areas');
        setAreas(response3.data.areas);
        setNiveles(response.data.nivel);
        setCampos(response.data.campo);
        setTitulos(response.data.titulo);
        setLanguages(response2.data.idiomas);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCampos = async () => {
      if (selectedNivel) {
        try {
          const response = await axios.get(`titulos/${selectedNivel}`);
          setCampos(response.data);
        } catch (error) {
          console.error('Error fetching campos:', error);
        }
      }
    };

    fetchCampos();
  }, [selectedNivel]);

  useEffect(() => {
    const fetchTitulos = async () => {
      if (selectedNivel && selectedCampo) {
        try {
          const response = await axios.get(`titulos/${selectedNivel}/${selectedCampo}`);
          setTitulos(response.data);
        } catch (error) {
          console.error('Error fetching titulos:', error);
        }
      }
    };

    fetchTitulos();
  }, [selectedNivel, selectedCampo]);

  const handleNivelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNivel(event.target.value);
    setSelectedTitulo('');
    setSelectedTituloId('');
    setCampos([]);
    setTitulos([]);
    setValue('estado', '');
    clearErrors('estado');
  };
  
  const handleCampoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCampo(event.target.value);
    setSelectedTitulo('');
    setSelectedTituloId('');
    setTitulos([]);
    setValue('estado', '');
    clearErrors('estado');
  };
  
  const handleTituloChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTituloValue = event.target.value;
    setSelectedTitulo(selectedTituloValue);
  
    const selectedTituloObject = titulos.find(titulo => titulo.id.toString() === selectedTituloValue);
    if (selectedTituloObject) {
      setSelectedTituloId(selectedTituloObject.id.toString());
    } else {
      setSelectedTituloId('');
    }
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEstado = e.target.value;
    if (selectedEstado === 'En curso') {
      setIsEnCurso(true);
    } else {
      setIsEnCurso(false);
    }
  };
  

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (new Date(data.fechaini) > new Date(data.fechafin)) {
      alert('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }

    if (new Date(data.fechaini) > new Date(today) || new Date(data.fechafin) > new Date(today)) {
      alert('Las fechas no pueden ser mayores que el día de hoy');
      return;
    }

    if (user && selectedNivel && selectedCampo && selectedTitulo) {
      try {
        const response2 = await axios.get('postulanteId/id', {
          params: {
            id_usuario: user.id
          }
        });
        const postulanteId = response2.data.id_postulante;

       

        const formData = new FormData();
    
        if (hasExperience) {
          if(hasRed){
  
            formData.append('id_postulante', postulanteId.toString());
            formData.append('id_titulo', selectedTituloId);
            formData.append('institucion', data.institucion);
            formData.append('estado', data.estado);
            formData.append('fechaini', data.fechaini);
            formData.append('fechafin', data.fechafin);
            formData.append('id_idioma', data.id_idioma.toString());
            formData.append('niveloral', data.niveloral);
            formData.append('nivelescrito', data.nivelescrito);
            formData.append('titulo_acreditado', data.titulo_acreditado);
            formData.append('area', data.area);
            formData.append('empresa', data.empresa);
            formData.append('puesto', data.puesto);
            formData.append('fechae1', data.fechae1);
            formData.append('fechae2', data.fechae2);
            formData.append('descripcion', data.descripcion);
            formData.append('referencia', data.referencia);
            formData.append('contacto', data.contacto);
            formData.append('empresa', data.empresa);
            formData.append('area', data.area);
            formData.append('puesto', data.puesto);
            formData.append('fechae1', data.fechae1);
            formData.append('fechae2', data.fechae2);
            formData.append('descripcion', data.descripcion);
            formData.append('referencia', data.referencia);
            formData.append('contacto', data.contacto);
            formData.append('red',data.red);
            formData.append('enlace',data.enlace);
          }else{
            formData.append('id_postulante', postulanteId.toString());
            formData.append('id_titulo', selectedTituloId);
            formData.append('institucion', data.institucion);
            formData.append('estado', data.estado);
            formData.append('fechaini', data.fechaini);
            formData.append('fechafin', data.fechafin);
            formData.append('id_idioma', data.id_idioma.toString());
            formData.append('niveloral', data.niveloral);
            formData.append('nivelescrito', data.nivelescrito);
            formData.append('titulo_acreditado', data.titulo_acreditado);
            formData.append('area', data.area);
            formData.append('empresa', data.empresa);
            formData.append('puesto', data.puesto);
            formData.append('fechae1', data.fechae1);
            formData.append('fechae2', data.fechae2);
            formData.append('descripcion', data.descripcion);
            formData.append('referencia', data.referencia);
            formData.append('contacto', data.contacto);
            formData.append('empresa', data.empresa);
            formData.append('area', data.area);
            formData.append('puesto', data.puesto);
            formData.append('fechae1', data.fechae1);
            formData.append('fechae2', data.fechae2);
            formData.append('descripcion', data.descripcion);
            formData.append('referencia', data.referencia);
            formData.append('contacto', data.contacto);
          }
          
        } else {
          if(hasRed){
            formData.append('id_postulante', postulanteId.toString());
            formData.append('id_titulo', selectedTituloId);
            formData.append('institucion', data.institucion);
            formData.append('estado', data.estado);
            formData.append('fechaini', data.fechaini);
            formData.append('fechafin', data.fechafin);
            formData.append('id_idioma', data.id_idioma.toString());
            formData.append('niveloral', data.niveloral);
            formData.append('nivelescrito', data.nivelescrito);
            formData.append('titulo_acreditado', data.titulo_acreditado);
            formData.append('area', data.area);
            formData.append('empresa', data.empresa);
            formData.append('puesto', data.puesto);
            formData.append('fechae1', data.fechae1);
            formData.append('fechae2', data.fechae2);
            formData.append('descripcion', data.descripcion);
            formData.append('referencia', data.referencia);
            formData.append('contacto', data.contacto);
            formData.append('red', data.red);
            formData.append('enlace', data.enlace);
          }else{
            formData.append('id_postulante', postulanteId.toString());
            formData.append('id_titulo', selectedTituloId);
            formData.append('institucion', data.institucion);
            formData.append('estado', data.estado);
            formData.append('fechaini', data.fechaini);
            formData.append('fechafin', data.fechafin);
            formData.append('id_idioma', data.id_idioma.toString());
            formData.append('niveloral', data.niveloral);
            formData.append('nivelescrito', data.nivelescrito);
            formData.append('titulo_acreditado', data.titulo_acreditado);
            formData.append('area', data.area);
            formData.append('empresa', data.empresa);
            formData.append('puesto', data.puesto);
        
          }
          
        }

        await axios.post('postulante/forma', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log("Exito");
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro completo!',
          text: 'Bienvenido a proajob',
        }).then(() => {
          navigate("/perfilP");
          Swal.fire({
            icon: 'info',
            title: '¡Ya casi terminas!',
            text: 'Antes de postular genera tu cv con los datos que tengas ingresados, no te preocupes si deseas añadir más información o editarlas puedes generarlo siempre que desees en el apartado de "CV',
          })
        });
      } catch (error) {
        console.error('Error uploading CV or submitting form:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8">Completar registro</h1>
      <p className="text-center mb-8">Necesitamos más información acerca de tu trayectoria, tranquilo podras aumentar más experiencia, títulos y otros aspectos en tu perfil.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl text-center font-semibold mb-4 text-blue-500">Formación Académica</h2>
        <p className="text-center mb-8">Añade mínimo un título para comenzar:</p>
        <div className="form-group mb-8">
          <label htmlFor="nivelEducacion" className="block text-gray-700 font-semibold mb-2">Nivel de Educación:</label>
          <select id="nivelEducacion" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            onChange={handleNivelChange}>
            <option value="">Seleccione</option>
            {niveles.map((nivel, index) => (
              <option key={index} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-8">
          <label htmlFor="campoAmplio" className="block text-gray-700 font-semibold mb-2">Campo Amplio:</label>
          <select id="campoAmplio" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            onChange={handleCampoChange}
            disabled={!selectedNivel}>
            <option value="">Seleccione</option>
            {campos.map((campo, index) => (
              <option key={index} value={campo}>
                {campo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-8">
          <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-2">Título (Acreditado por la Senecyct):</label>
          <select id="titulo" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            onChange={handleTituloChange}
            disabled={!selectedNivel || !selectedCampo}>
            <option value="">Seleccione</option>
            {titulos.map((titulo, index) => (
              <option key={index} value={titulo.id}>
                {titulo.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="titulo_acreditado" className="block text-gray-700 font-semibold mb-2">Título Otorgado por la Institución:</label>
          <input type="text" id="titulo_acreditado" {...register('titulo_acreditado', { required: true })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
          {errors.titulo_acreditado && <span className="text-red-500">Este campo es obligatorio</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="form-group">
            <label htmlFor="institucion" className="block text-gray-700 font-semibold mb-2">Institución que otorga el título:</label>
            <input type="text" id="institucion" {...register('institucion', { required: 'Este campo es requerido' })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600" />
            {errors.institucion && <p className="text-red-500 text-sm mt-2">{errors.institucion.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="estado" className="block text-gray-700 font-semibold mb-2">Estado de la formación académica:</label>
            <select id="estado" {...register('estado', { required: 'Este campo es requerido' })} onChange={handleEstadoChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600">
              <option value="">Seleccione</option>
              <option value="En curso">En curso</option>
              <option value="Culminado">Culminado</option>
            </select>
            {errors.estado && <p className="text-red-500 text-sm mt-2">{errors.estado.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="form-group">
            <label htmlFor="fechaini" className="block text-gray-700 font-semibold mb-2">Fecha de inicio de formación:</label>
            <input type="date" id="fechaini" {...register('fechaini', { required: 'Este campo es requerido', validate: value => {
              const today = new Date().toISOString().split('T')[0];
              return value <= today || 'La fecha no puede ser mayor a hoy';
            } })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600" />
            {errors.fechaini && <p className="text-red-500 text-sm mt-2">{errors.fechaini.message}</p>}
          </div>

          {!isEnCurso && (
            <div className="form-group">
              <label htmlFor="fechafin" className="block text-gray-700 font-semibold mb-2">Fecha de Fin de formación:</label>
              <input type="date" id="fechafin" {...register('fechafin', { required: 'Este campo es requerido', validate: value => {
                const today = new Date().toISOString().split('T')[0];
                return value <= today || 'La fecha no puede ser mayor a hoy';
              } })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600" />
              {errors.fechafin && <p className="text-red-500 text-sm mt-2">{errors.fechafin.message}</p>}
            </div>
          )}
        </div>

        <h2 className="text-2xl text-center font-semibold mb-4 text-blue-500">Información sobre el postulante:</h2>
        <p className="text-center mb-8">Añade mínimo un idioma para comenzar:</p>
        <p className="text-right text-gray-500 text-sm">*Campos obligatorios</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Idioma <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2 border rounded-md" required
              {...register('id_idioma', { required: 'Este campo es requerido' })}>
              <option value="">Elige una opción</option>
              {languages.map((language: Idioma) => (
                <option key={language.id} value={language.id}>
                  {language.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Nivel escrito de desempeño en el lenguaje <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2 border rounded-md" required
              {...register('nivelescrito', { required: 'Este campo es requerido' })}>
              <option value="">Elige una opción</option>
              <option value="Basico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
              <option value="Nativo">Nativo</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Nivel oral de desempeño en el lenguaje <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2 border rounded-md" required
              {...register('niveloral', { required: 'Este campo es requerido' })}>
              <option value="">Elige una opción</option>
              <option value="Basico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
              <option value="Nativo">Nativo</option>
            </select>
            
          </div>
          
        </div>
        <h2 className="text-2xl text-center font-semibold mb-4 text-blue-500">Experiencia Profesional:</h2>
        <p className="text-center mb-8">¿Tienes experiencia profesional?</p>
      <div className="text-center mb-4">
        <input
          type="checkbox"
          id="hasExperience"
          checked={hasExperience}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="hasExperience" className="ml-2 text-gray-700">Sí, tengo experiencia</label>
      </div>
      
      {hasExperience && (
        <div className="grid grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Nombre de la Empresa:</label>
            <input 
              {...register('empresa', { 
                required: hasExperience ? 'Este campo es obligatorio' : false, 
                maxLength: { value: 100, message: 'Máximo 100 caracteres' } 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
            />
            {errors.empresa && <p className="text-red-500">{errors.empresa.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Área del puesto de trabajo:</label>
            <select 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
              {...register('area', { 
                required: hasExperience ? 'Área es requerida' : false, 
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
          <div className="mb-4">
            <label className="block text-gray-700">Cargo en la empresa:</label>
            <input 
              {...register('puesto', { 
                required: hasExperience ? 'Este campo es obligatorio' : false, 
                maxLength: { value: 100, message: 'Máximo 100 caracteres' } 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
            />
            {errors.puesto && <p className="text-red-500">{errors.puesto.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Fecha de inicio labores:</label>
            <input 
              type="date" 
              {...register('fechae1', { 
                required: hasExperience ? 'Este campo es obligatorio' : false 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
            />
            {errors.fechae1 && <p className="text-red-500">{errors.fechae1.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Fecha de fin de labores:</label>
            <input 
              type="date" 
              {...register('fechae2', { 
                required: hasExperience ? 'Este campo es obligatorio' : false 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
            />
            {errors.fechae2 && <p className="text-red-500">{errors.fechae2.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Descripción de funciones y responsabilidades en la empresa:</label>
            <textarea 
              {...register('descripcion', { 
                required: hasExperience ? 'Este campo es obligatorio' : false, 
                maxLength: { value: 500, message: 'Máximo 500 caracteres' } 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
            />
            {errors.descripcion && <p className="text-red-500">{errors.descripcion.message}</p>}
          </div>
          <div className="mb-4">
          <label className="block text-gray-700 "><b>Referencia Personal:</b></label>
            <label className="block text-gray-700">Nombre de la Persona Referencia:</label>
            <input 
              {...register('referencia', { 
                required: hasExperience ? 'Este campo es obligatorio' : false, 
                maxLength: { value: 250, message: 'Máximo 250 caracteres' } 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
              placeholder='Nombre persona (Cargo en la empresa)'
            />
            {errors.referencia && <p className="text-red-500">{errors.referencia.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contacto de la persona de referencia:</label>
            <input 
              type="text" 
              {...register('contacto', { 
                required: hasExperience ? 'Este campo es obligatorio' : false, 
                maxLength: { value: 250, message: 'Máximo 250 caracteres' } 
              })} 
              className="w-full px-4 py-2 border rounded-md text-gray-700" 
              placeholder="Número o Correo de contacto de la persona de referencia"
            />
            {errors.contacto && <p className="text-red-500">{errors.contacto.message}</p>}
          </div>
        </div>
      )}

<h2 className="text-2xl text-center font-semibold mb-4 text-blue-500">Redes sociales:</h2>
        <p className="text-center mb-8">¿Tienes redes sociales?</p>
      <div className="text-center mb-4">
        <input
          type="checkbox"
          id="hasRed"
          checked={hasRed}
          onChange={handleCheckboxChange2}
        />
        <label htmlFor="hasRed" className="ml-2 text-gray-700">Sí, cuento con una red social</label>
      </div>
      {hasRed && (
        <div className="grid grid-cols-1 gap-4">
          <div className="mb-4">
          <label className="block text-gray-700">Añade mínimo una red social para comenzar</label>
          <label className="block text-gray-700">Nombre de la Red</label>
                    <select
                           {...register('red', { 
                            required: hasRed ? 'Este campo es obligatorio' : false, 
                            maxLength: { value: 100, message: 'Máximo 100 caracteres' } 
                          })} 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        value={nombreRed}
                        onChange={handleRedChange}
                        required
                    >
                        <option value="" disabled>Seleccione una red social</option>
                        {redes.map((red) => (
                            <option key={red.nombre} value={red.nombre}>
                                {red.nombre}
                            </option>
                        ))}
                    </select>
                    </div>
                {nombreRed && (
                    <div className="flex items-center mt-2">
                        <span className="mr-2">Red Seleccionada:</span>
                        {redes.find((red) => red.nombre === nombreRed)?.icono}
                    </div>
                )}
                <div>
          </div>
          <div className="mb-4">
          <label className="block text-gray-700">Enlace</label>
                    <input
                           {...register('enlace', { 
                            required: hasRed ? 'Este campo es obligatorio' : false, 
                            maxLength: { value: 600, message: 'Máximo 600 caracteres' } 
                          })} 
                        type="url"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        value={enlace}
                        onChange={(e) => setEnlace(e.target.value)}
                        required
                    />
          </div>
       
        </div>
      )}
        <button type="submit" className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-slate-600">Culminar registro</button>
      </form>
    </div>
  );
}

export default CompletarP2;
