import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import axios from "../../services/axios";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faHardHat } from '@fortawesome/free-solid-svg-icons'; // Persona con casco
import { logout } from '../../store/authSlice';

import Modal from 'react-modal';

interface IFormInput {
  logo: FileList;
  companyName: string;
  numberOfEmployees: number;
  sector: string;
  division: string;
  email: string;
  contactNumber: string;
  socialLinks: { platform: string; url: string }[];
  description: string;
  ruc: string;          // RUC de la empresa, debe ser un string con 13 caracteres
  razon_s: string;     // Razón social de la empresa
  sitio: string;       // Sitio web de la empresa
  telefono: string;    // Teléfono de contacto de la empresa
}

interface Division {
  id: number;
  division: string;
}

const CompletarE: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<IFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cantons, setCantons] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [hasSocialLinks, setHasSocialLinks] = useState(false);
  const [sectores, setSectores] = useState<string[]>([]);
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [, setSelectedSector] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [isDivisionEnabled, setIsDivisionEnabled] = useState<boolean>(false);
  const [showAgreement, setShowAgreement] = useState<boolean>(false);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [termsText, setTermsText] = useState<string>('');
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false); // Para controlar la opción "Otro"
  const [otherSector, setOtherSector] = useState<string>('');
  const dispatch = useDispatch();
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload(); // Recarga la página cuando se presiona el botón "volver"
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('ubicaciones');
        setProvinces(response.data.provinces);
        setCantons(response.data.cantons);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCantons = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(`ubicaciones/cantones/${selectedProvince}`);
          setCantons(response.data);
        } catch (error) {
          console.error('Error fetching cantons:', error);
        }
      }
    };

    fetchCantons();
  }, [selectedProvince]);



  const handleProvinceChange = (event: any) => {
    setSelectedProvince(event.target.value);
    setSelectedCanton('');
  };

  const handleCantonChange = (event: any) => {
    setSelectedCanton(event.target.value);
  };

  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const response = await axios.get('sectores');
        setSectores(response.data.sectores);
      } catch (error) {
        console.error('Error fetching sectores:', error);
      }
    };

    fetchSectores();
  }, []);

  const handleSectorChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedSector(selected);
    setIsDivisionEnabled(false);
    setSelectedDivision(null);

    if (selected === '0') {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
      setOtherSector('');
      if (selected) {
        try {
          const response = await axios.get(`sectores/${encodeURIComponent(selected)}`);
          setDivisiones(response.data);
          setIsDivisionEnabled(true);
        } catch (error) {
          console.error('Error fetching divisiones:', error);
        }
      }
    }
  };

  const handleDivisionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = divisiones.find(div => div.division === event.target.value);
    setSelectedDivision(selected || null);
  };

  const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-blue-600" /> },
    { value: 'x', label: 'X', icon: <FaTwitter className="text-blue-400" /> },
    { value: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className="text-blue-700" /> },
  ];

  const handleAddSocialLink = () => {
    append({ platform: '', url: '' });
  };

  const handleRemoveSocialLink = (index: number) => {
    remove(index);
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = socialPlatforms.find((p) => p.value === platform);
    return platformData ? platformData.icon : null;
  };

  const fetchTerms = async () => {
    try {
      const response = await axios.get('/configuraciones'); // Asegúrate de que este endpoint devuelve los términos y condiciones
      const activeConfig = response.data.find((config: any) => config.vigencia);
      if (activeConfig) {
        setTermsText(activeConfig.terminos_condiciones);
      } else {
        setTermsText('No terms available');
      }
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      setTermsText('Error loading terms and conditions');
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleAgreementAccept = () => {
    setAgreementAccepted(!agreementAccepted);
  };

  const handleAgreementSubmit = () => {
    setShowAgreement(false);
    handleSubmit(onSubmit)();
  };

  const handleShowTerms = () => {
    setShowTerms(true);
  };

  const handleCloseTerms = () => {
    setShowTerms(false);
  };


  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (user && selectedProvince && selectedCanton && (selectedDivision || otherSector !== '')) {
      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor, espera mientras se procesa tu registro.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await axios.get(`ubicaciones/${selectedProvince}/${selectedCanton}`);
        const ubicacionId = response.data.ubicacion_id;

        // Define la URL base para el host
        const urlHost = `${import.meta.env.VITE_API_URL3}/storage/`;

        // Inicializa formData para enviar datos al backend
        const formData = new FormData();



        if (data.logo && data.logo.length > 0) {
          const logoFile = data.logo[0];
          let logoF = logoFile;
          formData.append('logo', logoF);  // Solo añadir el logo si existe
        }

        // Verificar si el sector es "Otro" y tomar el valor del input personalizado
        const sectorValue = selectedDivision ? selectedDivision?.id.toString() : '0';

        // Añade el resto de los datos al FormData
        formData.append('companyName', data.companyName);
        formData.append('numberOfEmployees', data.numberOfEmployees.toString());
        formData.append('sector', sectorValue);
        formData.append('division', otherSector ? otherSector : 'No'); // Usar valor personalizado o división seleccionada
        formData.append('ubicacion', ubicacionId);
        formData.append('email', data.email);
        formData.append('description', data.description || 'No hay descripción'); // Valor predeterminado si no hay descripción
        formData.append('usuario_id', user.id.toString());
        if(data.socialLinks && hasSocialLinks){
          formData.append('socialLinks', JSON.stringify(data.socialLinks));
        }
        
        formData.append('url', urlHost);
        // Enviar sitio como null si no está llenado
        formData.append('sitio', data.sitio || 'No definido');
        formData.append('ruc', data.ruc);
        formData.append('razon_s', data.razon_s);
        // Enviar teléfono como null si no está llenado
        formData.append('telefono', data.telefono || 'No definido');

        await axios.post('empresaC', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        Swal.fire({
          icon: 'success',
          title: '¡Registro completo!',
          text: 'Bienvenido a Postula',
        }).then(() => {
          navigate("/verOfertasE");
        });

      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo más tarde.',
        });
      }
    }
  };


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGestora = async () => {
    const result = await Swal.fire({
      title: 'Información',
      text: 'Esta funcionalidad es para los usuarios que forman parte de "Proasetel S.A". Si usted es parte de la empresa, haga clic en continuar, de lo contrario, en cancelar.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      if (user) {
        try {
          const formData = {
            usuario_id: user.id,
          };

          // Hacemos la solicitud con await
          await axios.post('parteG', formData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          Swal.fire('Usuario de la empresa gestora', 'Usted ha indicado que es parte de la empresa gestora. Será redirigido al inicio hasta que la empresa confirme su autenticidad por su nombre de usuario y correo. Por favor, espere hasta confirmación para continuar.', 'success')
            .then(() => {
              dispatch(logout())
              navigate('/'); // Redirigir a home
            });

        } catch (error) {
          console.error('Error al enviar el formulario:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al solicitar acceso de gestora. Por favor, inténtalo de nuevo más tarde.',
          });
        }
      }
    } else if (result.isDismissed) {
      Swal.fire('Cancelado', 'Usted ha cancelado la operación puede continuar con el registro', 'error');
    }
  };

  const handleDownloadPoli = async () => {
    try {
  
     
      const response = await axios.get('/poli/descargar', {
        responseType: 'blob', // Esto permite recibir el archivo como un blob
      });
  
      // Crear una URL para el archivo blob descargado
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Politica.pdf');
      document.body.appendChild(link);
      link.click(); // Simula el clic para descargar el archivo
      link.remove();
      
  
  
      // Muestra el mensaje de éxito con Swal
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Políticas de postula descargadas con éxito',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error al descargar la política:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un error al intentar descargar la politica',
      });
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8">Completar registro de empresa</h1>
      <form className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="form-group mb-8">
          <label htmlFor="logo" className="block text-gray-700 font-semibold mb-2">Logo (Opcional):</label>
          <div className="flex items-center">
            {logoPreview ? (
              <img src={logoPreview} alt="Preview" className="w-40 h-40 object-cover border border-gray-300 mr-4 rounded-lg" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center border border-gray-300 mr-4 rounded-lg bg-gray-200 text-gray-700 text-center">
                Seleccionar logo
              </div>
            )}
            <input
              type="file"
              id="logo"
              {...register('logo')}
              onChange={handleLogoChange}
              accept=".png, .jpg, .jpeg"
              className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 ${errors.logo ? 'border-red-500' : ''}`}
            />
            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-8 mb-8">
          <div className="form-group col-span-7 md:col-span-5">
            <label htmlFor="companyName" className="block text-gray-700 font-semibold mb-2">Nombre comercial:</label>
            <input
              type="text"
              id="companyName"
              {...register('companyName', { required: 'El nombre comercial es requerido.' })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.companyName ? 'border-red-500' : ''}`}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
          </div>

          <div className="form-group col-span-7 md:col-span-2">
            <label htmlFor="numberOfEmployees" className="block text-gray-700 font-semibold mb-2">Número de empleados:</label>
            <input
              type="number"
              id="numberOfEmployees"
              {...register('numberOfEmployees', {
                required: 'El número de empleados es requerido.',
                min: { value: 0, message: 'El número de empleados no puede ser negativo.' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.numberOfEmployees ? 'border-red-500' : ''}`}
            />
            {errors.numberOfEmployees && <p className="text-red-500 text-xs mt-1">{errors.numberOfEmployees.message}</p>}
          </div>
        </div>
        {/* RUC */}
        <div className="form-group col-span-7 md:col-span-2">
          <label htmlFor="ruc" className="block text-gray-700 font-semibold mb-2">RUC:</label>
          <input
            type="text"
            id="ruc"
            {...register('ruc', {
              required: 'El RUC es requerido.',
              pattern: {
                value: /^\d{13}$/,
                message: 'El RUC debe tener 13 dígitos.',
              },
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.ruc ? 'border-red-500' : ''}`}
          />
          {errors.ruc && <p className="text-red-500 text-xs mt-1">{errors.ruc.message}</p>}
        </div>

        {/* Razón Social */}
        <div className="form-group col-span-7 md:col-span-2">
          <label htmlFor="razon_s" className="block text-gray-700 font-semibold mb-2">Razón Social:</label>
          <input
            type="text"
            id="razon_s"
            {...register('razon_s', {
              required: 'La razón social es requerida.',
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.razon_s ? 'border-red-500' : ''}`}
          />
          {errors.razon_s && <p className="text-red-500 text-xs mt-1">{errors.razon_s.message}</p>}
        </div>

        {/* Sitio Web */}
        <div className="form-group col-span-7 md:col-span-2">
          <label htmlFor="sitio" className="block text-gray-700 font-semibold mb-2">Sitio Web (Opcional):</label>
          <input
            type="url"
            id="sitio"
            {...register('sitio'
            )}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.sitio ? 'border-red-500' : ''}`}
          />
          {errors.sitio && <p className="text-red-500 text-xs mt-1">{errors.sitio.message}</p>}
        </div>

        {/* Teléfono */}
        <div className="form-group col-span-7 md:col-span-2">
          <label htmlFor="telefono" className="block text-gray-700 font-semibold mb-2">Teléfono de contacto (Opcional):</label>
          <input
            type="text"
            id="telefono"
            {...register('telefono', {
              pattern: {
                value: /^\d{10}$/,  // Asumiendo un formato de 10 dígitos
                message: 'El teléfono debe tener 10 dígitos.',
              },
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.telefono ? 'border-red-500' : ''}`}
          />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
        </div>
        <div className="form-group mb-8">
          <label htmlFor="sector" className="block text-gray-700 font-semibold mb-2">Sector:</label>
          <select
            id="sector"
            onChange={handleSectorChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
          >
            <option value="">Seleccione</option>
            {sectores.map((sector, index) => (
              <option key={index} value={sector}>
                {sector}
              </option>
            ))}
            <option value="0">OTRO</option>
          </select>
        </div>

        {!isOtherSelected && (
          <div className="form-group mb-8">
            <label htmlFor="division" className="block text-gray-700 font-semibold mb-2">División:</label>
            <select
              id="division"
              value={selectedDivision?.division || ''}
              onChange={handleDivisionChange}
              disabled={!isDivisionEnabled}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="">Seleccione</option>
              {divisiones.map((division) => (
                <option key={division.id} value={division.division}>
                  {division.division}
                </option>
              ))}
            </select>
          </div>
        )}

        {isOtherSelected && (
          <div className="form-group mb-8">
            <label htmlFor="otherSector" className="block text-gray-700 font-semibold mb-2">Escriba el sector al que pertenece:</label>
            <input
              type="text"
              id="otherSector"
              value={otherSector}
              onChange={(e) => setOtherSector(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="form-group">
            <label htmlFor="province" className="block text-gray-700 font-semibold mb-2">Provincia:</label>
            <select
              id="province"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
              onChange={handleProvinceChange}
              style={{ position: 'relative' }}
            >
              <option value="">Seleccione</option>
              {provinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="canton" className="block text-gray-700 font-semibold mb-2">Cantón:</label>
            <select
              id="canton"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
              disabled={!selectedProvince}
              onChange={handleCantonChange}
              style={{ position: 'relative' }}
            >
              <option value="">Seleccione</option>
              {cantons.map((canton, index) => (
                <option key={index} value={canton}>
                  {canton}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-8">
          <label className="block text-gray-700 font-semibold mb-2">¿La empresa tiene redes sociales?</label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasSocialLinks"
              onChange={() => {
                setHasSocialLinks(!hasSocialLinks);
                if (!hasSocialLinks) {
                  setValue('socialLinks', []);
                } else {
                  setValue('socialLinks', [{ platform: '', url: '' }]);
                }
              }}
              className="mr-2"
            />
            <label htmlFor="hasSocialLinks" className="text-gray-700">Sí</label>
          </div>
        </div>

        {hasSocialLinks && (
          <div className="form-group mb-8">
            <label className="block text-gray-700 font-semibold mb-2">Redes Sociales:</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center mb-4">
                <button type="button" onClick={() => handleRemoveSocialLink(index)} className="bg-red-500 text-white py-2 px-4 rounded mr-2">
                  <FaTrashAlt />
                </button>
                <div className="flex items-center mr-2">
                  {getPlatformIcon(field.platform)}
                </div>
                <select
                  {...register(`socialLinks.${index}.platform`, { required: 'Seleccione una plataforma.' })}
                  className="form-select mr-2 w-48"
                  defaultValue={field.platform}
                  onChange={(e) => setValue(`socialLinks.${index}.platform`, e.target.value)}
                >
                  <option value="">Seleccione una plataforma</option>
                  {socialPlatforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  {...register(`socialLinks.${index}.url`, { required: 'La URL es requerida.' })}
                  placeholder="URL"
                  className="form-input flex-1"
                  defaultValue={field.url}
                  onChange={(e) => setValue(`socialLinks.${index}.url`, e.target.value)}
                />
                {errors.socialLinks && errors.socialLinks[index] && (
                  <>
                    {errors.socialLinks[index].platform && (
                      <p className="text-red-500 text-xs mt-1">{errors.socialLinks[index].platform.message}</p>
                    )}
                    {errors.socialLinks[index].url && (
                      <p className="text-red-500 text-xs mt-1">{errors.socialLinks[index].url.message}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddSocialLink} className="bg-green-500 text-white py-2 px-4 rounded flex items-center">
              <FaPlusCircle className="mr-2" /> Agregar otra red social
            </button>
          </div>
        )}

        <div className="form-group mb-8">
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Descripción:</label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Descripción de la empresa..."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.description ? 'border-red-500' : ''}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <button
          type="button"
          onClick={() => setShowAgreement(true)}
          className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-slate-600"
        >
          Registrar empresa
        </button>
      </form>
      <button
        type="button"
        onClick={handleGestora}
        className="fixed bottom-5 right-5 flex items-center py-3 px-4 bg-orange-400 text-white font-bold rounded-lg hover:bg-orange-900 shadow-lg"
      >
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        Soy parte de empresa gestora
        <FontAwesomeIcon icon={faHardHat} className="ml-2 text-white" />
      </button>

      <Modal
        isOpen={showAgreement}
        onRequestClose={() => setShowAgreement(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Acuerdo de Compromiso</h2>
          <p className="mb-4">
            Al registrar su empresa, usted acepta que la página Postula puede usar sus datos personales para los fines descritos en los
            <span
              onClick={handleShowTerms}
              className="text-blue-500 cursor-pointer"
            >
              {' '}términos y condiciones
            </span>.
            <hr className="my-4" />
            <a   onClick={() => {
                   // O el formato que desees
                    handleDownloadPoli();
                  }} target="_blank" rel="noopener noreferrer"  className="text-cyan-700 cursor-pointer">
                    Descargar pólitica de protección de datos personales
                </a>
          </p>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={agreementAccepted}
              onChange={handleAgreementAccept}
            />
            Acepto los términos y condiciones
          </label>
          <div className="flex justify-end">
            <button
              onClick={handleAgreementSubmit}
              disabled={!agreementAccepted}
              className={`px-4 py-2 rounded-md transition duration-300 ${agreementAccepted ? 'bg-blue-500 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
              Continuar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTerms}
        onRequestClose={handleCloseTerms}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md mx-auto max-h-full">
          <h2 className="text-xl font-semibold mb-4">Términos y Condiciones</h2>
          <div className="overflow-y-auto max-h-96">
            <div className="space-y-4 text-sm">
              <pre className="whitespace-pre-wrap">{termsText}</pre>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCloseTerms}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompletarE;
