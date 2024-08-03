import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import axios from "../../services/axios";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';

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

  const [sectores, setSectores] = useState<string[]>([]);
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [isDivisionEnabled, setIsDivisionEnabled] = useState<boolean>(false);

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

  const handleSectorChange = async (event: any) => {
    const selected = event.target.value;
    console.log(selectedSector);
    setSelectedSector(selected);
    setIsDivisionEnabled(false);
    if (selected) {
      try {
        const response = await axios.get(`sectores/${encodeURIComponent(selected)}`);
        setDivisiones(response.data);
        setIsDivisionEnabled(true);
      } catch (error) {
        console.error('Error fetching divisiones:', error);
      }
    }
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

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (user && selectedDivision && selectedProvince && selectedCanton) {
      try {
        const response = await axios.get(`ubicaciones/${selectedProvince}/${selectedCanton}`);
        const ubicacionId = response.data.ubicacion_id;

        const logoFile = data.logo[0];
        const storageRef = ref(storage, `logos/${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        const logoUrl = await getDownloadURL(storageRef);

        const formData = {
          logo: logoUrl, // URL del logo subido a Firebase
          companyName: data.companyName,
          numberOfEmployees: data.numberOfEmployees,
          sector: selectedDivision.id.toString(),
          ubicacion: ubicacionId,
          division: data.division,
          email: data.email,
          description: data.description,
          usuario_id: user.id,
          socialLinks: data.socialLinks
        };

        await axios.post('empresaC', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        Swal.fire({
          icon: 'success',
          title: '¡Registro completo!',
          text: 'Bienvenido a proajob',
        }).then(() => {
          navigate("/inicio-e");
        });

      } catch (error) {
        console.error('Error al enviar el formulario:', error);
      }
    }
  };

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8">Completar registro de empresa</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="form-group mb-8">
          <label htmlFor="logo" className="block text-gray-700 font-semibold mb-2">Logo:</label>
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
              {...register('logo', { required: 'El logo es requerido.' })}
              onChange={handleLogoChange}
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
          </select>
        </div>

        <div className="form-group mb-8">
          <label htmlFor="division" className="block text-gray-700 font-semibold mb-2">División:</label>
          <select
            id="division"
            value={selectedDivision?.division || ''}
            onChange={(e) => {
              const selected = divisiones.find(div => div.division === e.target.value);
              setSelectedDivision(selected || null);
            }}
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
            {...register('description', { required: 'La descripción es requerida.' })}
            placeholder="Descripción de la empresa..."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 ${errors.description ? 'border-red-500' : ''}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <button type="submit" className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-slate-600">Registrar empresa</button>
      </form>
    </div>
  );
};

export default CompletarE;
