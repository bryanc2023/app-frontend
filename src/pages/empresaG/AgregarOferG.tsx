import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';


interface Titulo {
  id: number;
  titulo: string;
  customTitulo: string | '';
}

interface Criterio {
  id_criterio: number;
  criterio: string;
  descripcion: string;
  valor: string | '';
}

interface Area {
  id: number;
  nombre_area: string;
}

interface SelectedCriterio extends Criterio {
  valor: string | '',
  prioridad: number;
}

interface idioma {
  id: number;
  nombre: string;

}

interface canton {
  id: number;
  canton: string;

}

function AgregarO() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [niveles, setNiveles] = useState([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [campos, setCampos] = useState([]);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedCampo, setSelectedCampo] = useState('');
  const [selectedTituloId, setSelectedTituloId] = useState<number>();
  const [requireEducation, setRequireEducation] = useState(false);
  const [soliSueldo, setSolicitarSueldo] = useState(false);
  const [requireCriterio, setRequireCriterio] = useState(false);
  const [requirePregunta, setRequirePregunta] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState<Titulo[]>([]);
  const [showCorreo, setShowCorreo] = useState(false);
  const [showNumeroContacto, setShowNumeroContacto] = useState(false);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [selectedCriterios, setSelectedCriterios] = useState<SelectedCriterio[]>([]);
  const [selectedCriterioId, setSelectedCriterioId] = useState<number | null>(null);
  const [valorCriterio, setValorCriterio] = useState<string>('');
  const [prioridadCriterio, setPrioridadCriterio] = useState<number | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [languages, setLanguages] = useState<idioma[]>([]);
  const [showExperiencia, setShowExperiencia] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cantons, setCantons] = useState<canton[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [customTitulo, setCustomTitulo] = useState<string>(''); // Estado para almacenar el título personalizado
  const [showCustomInput, setShowCustomInput] = useState(false); // State to toggle custom input
  const [showCheckbox, setShowCheckbox] = useState(false);
  // Toggle custom title input
  const handleToggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
    setCustomTitulo('');
  };
  const handleCustomTituloChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitulo(event.target.value);
  };

  const handleAgregarPregunta = () => {
    if (preguntas.length < 5 && nuevaPregunta.trim() !== '') {
      // Agregar signos de interrogación si no están presentes
      let preguntaConInterrogacion = nuevaPregunta.trim();
      if (!preguntaConInterrogacion.startsWith('¿')) {
        preguntaConInterrogacion = '¿' + preguntaConInterrogacion;
      }
      if (!preguntaConInterrogacion.endsWith('?')) {
        preguntaConInterrogacion = preguntaConInterrogacion + '?';
      }

      setPreguntas([...preguntas, preguntaConInterrogacion]);
      setNuevaPregunta('');

    } else if (preguntas.length >= 5) {

      Swal.fire({
        icon: 'error',
        title: 'Límite alcanzado',
        text: 'Solo puedes añadir hasta 5 preguntas.',
      });
    }
  };

  const handleEliminarPregunta = (index) => {
    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(nuevasPreguntas);
  };



  const handleCheckboxChange = (event: any) => {
    setShowExperiencia(event.target.checked);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('titulos');
        const response2 = await axios.get('areas');
        const response3 = await axios.get('criterios');
        const response4 = await axios.get('ubicaciones');
        setProvinces(response4.data.provinces);
        setCantons(response4.data.cantons);
        axios.get('idioma')
          .then(response => {
            setLanguages(response.data.idiomas);
          })
          .catch(error => {
            console.error('Error fetching languages:', error);
          });
        setNiveles(response.data.nivel);
        setCampos(response.data.campo);
        setTitulos(response.data.titulo);
        setAreas(response2.data.areas);
        setCriterios(response3.data.criterios);
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
    const fetchCantons = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(`ubicaciones/cantonesid/${selectedProvince}`);
          setCantons(response.data);
        } catch (error) {
          console.error('Error fetching cantons:', error);
        }
      }
    };

    fetchCantons();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchTitulos = async () => {
      if (selectedNivel && selectedCampo) {
        try {
          // Si no se ha seleccionado un campo específico ("No especificado"), traer todos los títulos del nivel
          const campoQuery = selectedCampo === 'No' ? 'todos' : selectedCampo;
          const response = await axios.get(`titulos/${selectedNivel}/${campoQuery}`);
          setTitulos(response.data);
        } catch (error) {
          console.error('Error fetching titulos:', error);
        }
      }
    };

    fetchTitulos();
  }, [selectedNivel, selectedCampo]);

  const handleProvinceChange = (event: any) => {
    setSelectedProvince(event.target.value);

  };

  const handleCantonChange = (event: any) => {
    const cantonValue = event.target.value;
    setSelectedCanton(cantonValue);
    setValorCriterio(`${cantonValue},${selectedProvince}`);
    // Esto asegura que valorCriterio se actualice con el ID y el nombre del cantón
  };

  const handleNivelChange = (event: any) => {
    setSelectedNivel(event.target.value);
    setSelectedTituloId(0);
  };

  const handleCampoChange = (event: any) => {
    setSelectedCampo(event.target.value);
    setSelectedTituloId(0);
  };

  const handleCriterioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(event.target.value);
    setSelectedCriterioId(id);
    setValorCriterio('');
    if (id === 3) {
      setSolicitarSueldo(true);
    } else {
      setSolicitarSueldo(false);
    }
  };

  const handleAgregarCriterio = () => {
    if (selectedCriterioId && prioridadCriterio) {
      const criterioSeleccionado = criterios.find(criterio => criterio.id_criterio === selectedCriterioId);
      if (criterioSeleccionado) {
        const exists = selectedCriterios.some(c => c.id_criterio === selectedCriterioId);
        if (!exists) {
          const criterioConValor: SelectedCriterio = {
            ...criterioSeleccionado,
            valor: selectedCriterioId === 3 ? '' : valorCriterio || '',
            prioridad: prioridadCriterio
          };
          setSelectedCriterios([...selectedCriterios, criterioConValor]);
          setSelectedCriterioId(null);
          setValorCriterio('');
          setPrioridadCriterio(null);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este criterio ya ha sido seleccionado.'
          });
        }
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Seleccione un criterio y complete la prioridad antes de agregarlo.'
      });
    }
  };


  const handleEliminarCriterio = (id: number) => {
    const updatedCriterios = selectedCriterios.filter(c => c.id_criterio !== id);
    setSelectedCriterios(updatedCriterios);
    if (id === 3) {
      setSolicitarSueldo(false);
    } else {
      setSolicitarSueldo(true);
    }
  };

  const handleTituloChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTituloId = parseInt(event.target.value, 10);
    setSelectedTituloId(selectedTituloId);
    if (isNaN(selectedTituloId)) {
      setShowCheckbox(false);
    } else {
      setShowCheckbox(true);
    }
    if (!showCheckbox) {
      setCustomTitulo('');
      setShowCustomInput(false);
    } else {
      setShowCustomInput(false);
    }

  };

  const handleAgregarTitulo = () => {
    // Verifica si se debe ingresar un título específico y si el campo está vacío
    if (showCustomInput && customTitulo.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Inserte su título específico.',
      });
      return; // Sale de la función si el título específico no se ha ingresado
    }

    // Si se selecciona un título de la lista
    if (selectedTituloId !== undefined || showCustomInput) {
      const exists = selectedTitles.some(titulo => titulo.id === selectedTituloId);
      if (exists) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Este título ya ha sido seleccionado.',
        });
      }

      if (exists) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Este título ya ha sido seleccionado.',
        });
      } else {
        // Crear el nuevo título a agregar
        const tituloToAdd: Titulo = {
          id: selectedTituloId || 0, // Si no hay un id, poner 0 (indica título personalizado)
          titulo: showCustomInput ? customTitulo : titulos.find(titulo => titulo.id === selectedTituloId)?.titulo || '', // Usa el título personalizado o el seleccionado
          customTitulo: showCustomInput ? customTitulo : '' // Si es personalizado, lo añadimos
        };

        setSelectedTitles([...selectedTitles, tituloToAdd]);

        // Limpiar el campo de título personalizado después de agregarlo
        if (showCustomInput) {
          setCustomTitulo('');
        }

        console.log('Título agregado:', tituloToAdd);
      }
    }
  };


  const handleEliminarTitulo = (tituloId: number) => {
    const updatedTitles = selectedTitles.filter(titulo => titulo.id !== tituloId);
    setSelectedTitles(updatedTitles);
  };

  useEffect(() => {
    if (!requireEducation) {
      setSelectedTitles([]);
    }
  }, [requireEducation]);

  const validateFechaMaxPost = (value: string) => {
    const today = new Date().toISOString().split('T')[0];
    return value >= today || 'La fecha máxima de postulación no puede ser menor al día de hoy';
  };

  const validateNoNegative = (value: number) => {
    return value >= 0 || 'Este campo no puede contener números negativos';
  };



  const onSubmit = handleSubmit(async (values) => {
    if (user) {
      try {
        const usuario = user.id;
        const dataToSend = {
          ...values,
          usuario: usuario,
          experiencia: showExperiencia ? values.experiencia : 0,
          correo_contacto: showCorreo ? values.correo_contacto : null,
          numero_contacto: showNumeroContacto ? values.numero_contacto : null,
          solicitar_sueldo: soliSueldo ? soliSueldo : 0,
          titulos: selectedTitles,
          criterios: selectedCriterios,
          preguntas: preguntas,
        };



        await axios.post('add-oferta', dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        Swal.fire({
          title: '¡Publicada!',
          text: 'La oferta se encuentra publicada',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          navigate("/inicioG");
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  const criterioDescripcion = criterios.find(c => c.id_criterio === selectedCriterioId)?.descripcion || '';

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg ">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold flex justify-center items-center text-blue-900">
            Publicar Oferta
            <FiPlus className="text-blue-900 ml-2" />
          </h3>
        </div>
        <p>Para publicar una oferta completa los datos necesarios:</p>
        <hr className="my-4" />
        <h3 className="text-1xl text-red-500 font-bold mb-4">Datos de la oferta:</h3>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="cargo">
              • Puesto de trabajo
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span>
            </label>
            <input
              className="w-full p-2 border rounded"
              type="text"
              id="cargo"
              placeholder="Cargo"
              {...register('cargo', { required: 'Puesto es requerido' })}
            />
            {errors.cargo && <p className="text-red-500">{String(errors.cargo.message)}</p>}
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <input
                className="mr-2 leading-tight"
                type="checkbox"
                id="requireEducation"
                checked={requireEducation}
                onChange={() => setRequireEducation(!requireEducation)}
              />
              <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="requireEducation">
                ¿Requiere titulo o educación específico?
              </label>
            </div>
          </div>
          <hr className="my-4" />

          {requireEducation && (
            <>
              <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                <div className="form-group mb-8">
                  <label htmlFor="nivelEducacion" className="block text-gray-700 font-semibold mb-2">Nivel de Educación:</label>
                  <select
                    id="nivelEducacion"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
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
                  <select
                    id="campoAmplio"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                    onChange={handleCampoChange}
                    disabled={!selectedNivel}>
                    <option value="">Seleccione</option>
                    <option value="No">No especificado</option>
                    {campos.map((campo, index) => (
                      <option key={index} value={campo}>
                        {campo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-8">
                  <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-2">Título:</label>
                  <select
                    id="titulo"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
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
                {/* Checkbox for custom title */}
                {showCheckbox && (
                  <div className="form-group mb-8 flex items-center">
                    <input
                      type="checkbox"
                      id="customTitleCheckbox"
                      className="mr-2"
                      checked={showCustomInput}
                      onChange={handleToggleCustomInput}
                    />
                    <label htmlFor="customTitleCheckbox" className="text-gray-700 font-semibold">
                      Escribir título específico?
                    </label>
                  </div>
                )}

                {/* Custom title input displayed when the checkbox is checked */}
                {showCustomInput && (
                  <div className="form-group mb-8 flex items-center">
                    <input
                      id="customTitulo"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                      type="text"
                      value={customTitulo}
                      onChange={handleCustomTituloChange}
                      placeholder="Escribe el título específico"
                    />

                  </div>
                )}


                <div className="flex justify-center">
                  <button
                    type="button"
                    className={`mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${!selectedTituloId && !customTitulo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleAgregarTitulo}
                    disabled={(!selectedTituloId)}
                  >
                    Agregar Título
                  </button>
                </div>
                {selectedTitles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Títulos Seleccionados:</h4>
                    <ul className="list-disc pl-4">
                      {selectedTitles.map((titulo, index) => (
                        <li key={index} className="flex items-center">
                          <span>{titulo.titulo}</span>
                          <button
                            type="button"
                            className="ml-2 text-red-600"
                            onClick={() => handleEliminarTitulo(titulo.id)}
                          >
                            x
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


              </div>
              <hr className="my-4" />
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="id_area"> •  Área del puesto de trabajo
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span>
            </label>
            <select className="w-full p-2 border rounded" id="id_area" {...register('id_area', { required: 'Área es requerida' })}>
              <option value="">Seleccione</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.nombre_area}
                </option>
              ))}
            </select>
            {errors.id_area && <p className="text-red-500">{String(errors.id_area.message)}</p>}
          </div>


          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="experienciaCheckbox">
              <input
                type="checkbox"
                id="experienciaCheckbox"
                onChange={handleCheckboxChange}
              />{' '}
              ¿Requiere años de experiencia en cargos similares?
            </label>
            <hr className="my-4" />
            {showExperiencia && (
              <>
                <div id="experienciaContainer" className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <label className="block text-sm font-bold mb-2" htmlFor="experiencia">
                    Años de Experiencia requerida
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    id="experiencia"
                    placeholder="Número de  años de experiencia en puestos similares"
                    {...register('experiencia', {
                      required: 'Experiencia es requerida',
                      validate: validateNoNegative,
                    })}
                  />
                  {errors.experiencia && (
                    <p className="text-red-500">{String(errors.experiencia.message)}</p>
                  )}
                </div>
                <hr className="my-4" />
              </>

            )}
          </div>


          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="objetivo_cargo">• Objetivo del puesto de trabajo
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio, Máximo 500 palabras)</span>
            </label>
            <textarea
              className="w-full p-2 border rounded"
              id="objetivo_cargo"
              placeholder="Describa en breves palabras el objetivo del puesto de trabajo"
              {...register('objetivo_cargo', { required: 'Objetivo del Cargo es requerido' })}
            />
            {errors.objetivo_cargo && <p className="text-red-500">{String(errors.objetivo_cargo.message)}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="sueldo">• Sueldo a ofrecer <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span></label>

            <input
              className="w-full p-2 border rounded"
              type="number"
              id="sueldo"
              placeholder="Ingrese el sueldo a ofrecer al postulante"
              {...register('sueldo', { validate: validateNoNegative })}
            />
            {errors.sueldo && <p className="text-red-500">{String(errors.sueldo.message)}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="funciones">• Funciones del puesto:
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio, Máximo 800 palabras)</span>
            </label>
            <textarea
              className="w-full p-2 border rounded"
              id="funciones"
              placeholder="Describa a manera breve las funciones o actividades a realizarse en el puesto. Cada función sepárela con una coma . Ejemplo: Funcion 1, Funcion2"
              {...register('funciones', { required: 'Funciones son requeridas' })}
            />
            {errors.funciones && <p className="text-red-500">{String(errors.funciones.message)}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="fecha_max_pos"> • Fecha Máxima de Postulación
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span>
            </label>
            <input
              className="w-full p-2 border rounded"
              type="date"
              id="fecha_max_pos"
              placeholder="Fecha Máxima de Postulación"
              {...register('fecha_max_pos', { required: 'Fecha Máxima de Postulación es requerida', validate: validateFechaMaxPost })}
            />
            {errors.fecha_max_pos && <p className="text-red-500">{String(errors.fecha_max_pos.message)}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="carga_horaria"> • Carga Horaria
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span>
            </label>
            <select
              className="w-full p-2 border rounded"
              id="carga"
              {...register('carga_horaria', { required: 'Carga horaria es requerida' })}>
              <option value="">Seleccione una carga</option>
              <option value="Tiempo Completo">Tiempo Completo</option>
              <option value="Tiempo Parcial">Tiempo Parcial</option>
            </select>
            {errors.carga_horaria && <p className="text-red-500">{String(errors.carga_horaria.message)}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="modalidad">• Modalidad
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-600 text-sm ml-2">(Campo obligatorio)</span>
            </label>
            <select
              className="w-full p-2 border rounded"
              id="modalidad"
              {...register('modalidad', { required: 'Modalidad es requerida' })}>
              <option value="">Seleccione una modalidad</option>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Hibrida">Hibrida</option>
            </select>
            {errors.modalidad && <p className="text-red-500">{String(errors.modalidad.message)}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="detalles_adicionales">• Detalles Adicionales</label>
            <textarea
              className="w-full p-2 border rounded"
              id="detalles_adicionales"
              placeholder="Detalles Adicionales que desee agregar a la oferta. Cada Detalle sepárela con una coma . Ejemplo: Detalle 1, Detalle 2"
              {...register('detalles_adicionales')}
            ></textarea>
            {errors.detalles_adicionales && <p className="text-red-500">{String(errors.detalles_adicionales.message)}</p>}
          </div>
          <hr className="my-4" />

          <hr className="my-4" />
          <div className="bg-white p-6 rounded-lg shadow-lg py-8" >
            <h3 className="text-1xl text-red-500 font-bold mb-4">Datos de contacto extra:</h3>
            {/* Mensaje de aviso mejorado */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-yellow-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12A9 9 0 1112 3a9 9 0 019 9z"
                  />
                </svg>
                <h1 className="text-xs font-semibold">
                  (Si desea que las hojas de vida solo lleguen al portal, no seleccionar ninguna opción de estas dos)
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <input
                className="mr-2 leading-tight"
                type="checkbox"
                id="showCorreo"
                checked={showCorreo}
                onChange={() => setShowCorreo(!showCorreo)}
              />
              <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="showCorreo">
                ¿Requiere correo extra de contacto?
              </label>
            </div>
            {showCorreo && (
              <>
                <hr className="my-4" />
                <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <label className="block text-sm font-bold mb-2" htmlFor="correo_contacto">Correo de Contacto</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="email"
                    id="correo_contacto"
                    placeholder="Correo de Contacto"
                    {...register('correo_contacto')}
                  />
                </div>
                <hr className="my-4" />
              </>
            )}
            <div className="flex items-center">
              <input
                className="mr-2 leading-tight"
                type="checkbox"
                id="showNumeroContacto"
                checked={showNumeroContacto}
                onChange={() => setShowNumeroContacto(!showNumeroContacto)}
              />
              <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="showNumeroContacto">
                ¿Requiere un número extra de contacto?
              </label>
            </div>
            {showNumeroContacto && (
              <>
                <hr className="my-4" />
                <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <label className="block text-sm font-bold mb-2" htmlFor="numero_contacto">Número de Contacto</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="tel"
                    id="numero_contacto"
                    placeholder="Número de Contacto"
                    {...register('numero_contacto')}
                  />
                </div>
                <hr className="my-4" />
              </>
            )}
          </div>
          <div></div>
          <div className="bg-white p-6 rounded-lg shadow-lg py-8" style={{ marginTop: '20px' }}>
            <h3 className="text-1xl text-red-500 font-bold mb-4">Datos confidenciales:</h3>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="mostrar_sueldo"
                  {...register('mostrar_sueldo')}
                />
                <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="mostrar_sueldo">
                  No mostrar el sueldo ofrecido al postulante
                </label>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="mostrar_empresa"
                  {...register('mostrar_empresa')}
                />
                <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="mostrar_empresa">
                  No mostrar nombre de Empresa publicadora
                </label>
              </div>

            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg py-7" style={{ marginTop: '20px' }}>

            <h3 className="text-1xl text-red-500 font-bold mb-4">Requisitos extra de evaluación:</h3>
            <span>Para mostrar postulantes capaces,puede seleccionar prioridad y requisitos extras de un postulante. Si no selecciona ningún criterio automaticamente se buscaran postulantes con los puntos de la oferta anteriormente planteada:</span>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="requireCriterio"
                  checked={requireCriterio}
                  onChange={() => setRequireCriterio(!requireCriterio)}
                />
                <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="requireCriterio">
                  ¿Requiere requisitos extras?
                </label>
              </div>
            </div>

            {requireCriterio && (
              <>
                <hr className="my-4" />
                <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <label className="block text-sm font-bold mb-2" htmlFor="id_criterio">Criterio</label>
                  <div className="flex flex-col md:flex-row">
                    <select
                      className="w-full md:w-2/3 p-2 border rounded"
                      id="criterio"
                      onChange={handleCriterioChange}
                      value={selectedCriterioId || ''}>
                      <option value="0">Seleccione un criterio...</option>
                      {criterios.map(criterio => (
                        <option key={criterio.id_criterio} value={criterio.id_criterio}>
                          {criterio.criterio}
                        </option>
                      ))}
                    </select>
                    {selectedCriterioId && (
                      <>
                        {selectedCriterioId === 4 ? (
                          <>

                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="valor g"
                              value={valorCriterio}
                              onChange={(e) => setValorCriterio(e.target.value)}
                            >
                              <option value="">Seleccione un género...</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Femenino">Femenino</option>
                              <option value="Otro">Otro</option>
                            </select>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="prioridad"
                              value={prioridadCriterio || ''}
                              onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                              <option value="">Seleccione una prioridad...</option>
                              <option value="1">Alta</option>
                              <option value="2">Media</option>
                              <option value="3">Baja</option>
                            </select>

                          </>
                        ) : selectedCriterioId === 5 ? (
                          <>
                            <select
                              className="w-full md:w-2/3 p-2 border rounded"
                              id="valor e"
                              value={valorCriterio}
                              onChange={(e) => setValorCriterio(e.target.value)}
                            >
                              <option value="">Seleccione un estado civil...</option>
                              <option value="Casado">Casado/a</option>
                              <option value="Soltero">Soltero/a</option>
                              <option value="Viudo">Viudo/a</option>
                            </select>
                            <select
                              className="w-full md:w-2/3 p-2 border rounded"
                              id="prioridad"
                              value={prioridadCriterio || ''}
                              onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                              <option value="">Seleccione una prioridad...</option>
                              <option value="1">Alta</option>
                              <option value="2">Media</option>
                              <option value="3">Baja</option>
                            </select>
                          </>
                        ) : selectedCriterioId === 6 ? (
                          <>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="valor e"
                              value={valorCriterio}
                              onChange={(e) => setValorCriterio(e.target.value)}
                            >
                              <option value="">Seleccione un idioma...</option>

                              {languages.map((language: idioma) => (
                                <option key={language.id} value={language.id + ',' + language.nombre}>
                                  {language.nombre}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="prioridad"
                              value={prioridadCriterio || ''}
                              onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                              <option value="">Seleccione una prioridad...</option>
                              <option value="1">Alta</option>
                              <option value="2">Media</option>
                              <option value="3">Baja</option>
                            </select>
                          </>
                        ) : selectedCriterioId === 7 ? (
                          <>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="valor e"
                              value={valorCriterio}
                              onChange={(e) => setValorCriterio(e.target.value)}
                            >
                              <option value="">Rango de edad...</option>
                              <option value="Joven,(18-25 años)">18 - 25 años</option>
                              <option value="Adulto,(26-35 años)">26 - 35 años</option>
                              <option value="Mayor,(Más de 36 años)">36 años en adelante</option>
                            </select>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="prioridad"
                              value={prioridadCriterio || ''}
                              onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                              <option value="">Seleccione una prioridad...</option>
                              <option value="1">Alta</option>
                              <option value="2">Media</option>
                              <option value="3">Baja</option>
                            </select>
                          </>

                        ) : selectedCriterioId === 8 ? (

                          <>

                            <select id="province" className="w-full md:w-full p-2 border rounded" onChange={handleProvinceChange}
                              value={selectedProvince}>
                              <option value="">Provincia..</option>
                              {provinces.map((province, index) => (
                                <option key={index} value={province}>
                                  {province}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="valor e"
                              value={selectedCanton}
                              onChange={handleCantonChange}
                              disabled={!selectedProvince}
                            >
                              <option value="">Canton..</option>
                              {cantons.map((canton) => (
                                <option key={canton.id} value={`${canton.id},${canton.canton}`}>
                                  {canton.canton}
                                </option>
                              ))}

                            </select>
                            <select
                              className="w-full md:w-full p-2 border rounded"
                              id="prioridad"
                              value={prioridadCriterio || ''}
                              onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                              <option value="">Seleccione una prioridad...</option>
                              <option value="1">Alta</option>
                              <option value="2">Media</option>
                              <option value="3">Baja</option>
                            </select>
                          </>
                        ) : (
                          <select
                            className="w-full md:w-full p-2 border rounded"
                            id="prioridad"
                            value={prioridadCriterio || ''}
                            onChange={(e) => setPrioridadCriterio(parseInt(e.target.value))}>
                            <option value="">Seleccione una prioridad...</option>
                            <option value="1">Alta</option>
                            <option value="2">Media</option>
                            <option value="3">Baja</option>
                          </select>
                        )}
                      </>
                    )}

                  </div>
                  {criterioDescripcion && (
                    <p className="mt-2 text-gray-600"><strong>¿Qué se evalua?</strong> {criterioDescripcion}</p>
                  )}
                  <button
                    type="button"
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleAgregarCriterio}
                  >
                    Agregar Criterio
                  </button>
                  {selectedCriterios.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Criterios Seleccionados:</h4>
                      <ul>
                        {selectedCriterios.map(criterio => (
                          <li key={criterio.id_criterio} className="flex items-center justify-between mb-2">
                            <span>{criterio.valor ? `${criterio.criterio} = ${criterio.valor}  ` : `${criterio.criterio}`}</span>
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={() => handleEliminarCriterio(criterio.id_criterio)}
                            >
                              x
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <hr className="my-4" />
              </>)}

          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg py-7" style={{ marginTop: '20px' }}>

            <h3 className="text-1xl text-red-500 font-bold mb-4">Preguntas de evaluación:</h3>
            <span>Puede realizar 5 preguntas como máximo para los postulantes de esta oferta. Este apartado no es obligatorio</span>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="requireCriterio"
                  checked={requirePregunta}
                  onChange={() => setRequirePregunta(!requirePregunta)}
                />
                <label className="block text-sm font-bold mb-2 text-blue-500" htmlFor="requirePregunta">
                  ¿Realizar preguntas específicas a los postulantes?
                </label>
              </div>
            </div>

            {requirePregunta && (
              <>
                <hr className="my-4" />
                <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <label className="block text-sm font-bold mb-2" htmlFor="nuevaPregunta">Nueva Pregunta</label>
                  <div className="flex flex-col md:flex-row">
                    <input
                      className="w-full md:w-2/3 p-2 border rounded mb-4"
                      id="nuevaPregunta"
                      type="text"
                      value={nuevaPregunta}
                      onChange={(e) => setNuevaPregunta(e.target.value)}
                    />
                    <button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={handleAgregarPregunta}
                    >
                      Agregar Pregunta
                    </button>
                  </div>

                  {preguntas.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Preguntas Añadidas:</h4>
                      <ul>
                        {preguntas.map((pregunta, index) => (
                          <li key={index} className="flex items-center justify-between mb-2">
                            <span>{pregunta}</span>
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={() => handleEliminarPregunta(index)}
                            >
                              x
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <hr className="my-4" />
              </>)}

          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/inicioG')}
              className="bg-red-500 text-white p-2 rounded-lg mt-4 mr-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg mt-4"
            >
              Publicar Oferta
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default AgregarO;
