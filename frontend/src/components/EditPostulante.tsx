import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from '../services/axios';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface EditPostulanteModalProps {
  isOpen: boolean;
  closeModal: () => void;
  postulante: Postulante;
  onProfileUpdate: (updatedProfile: Postulante) => void;
}

const validarCedulaEcuatoriana = (cedula: string): boolean => {
  if (cedula.length !== 10) return false;

  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cedula[i], 10) * coeficientes[i];
    suma += digito > 9 ? digito - 9 : digito;
  }

  const ultimoDigito = parseInt(cedula[9], 10);
  const digitoVerificador = 10 - (suma % 10);

  return digitoVerificador === ultimoDigito || (digitoVerificador === 10 && ultimoDigito === 0);
};

const EditPostulanteModal: React.FC<EditPostulanteModalProps> = ({ isOpen, closeModal, postulante, onProfileUpdate }) => {
  const [nombres, setNombres] = useState(postulante.nombres);
  const [apellidos, setApellidos] = useState(postulante.apellidos);
  const [fecha_nac, setFechaNac] = useState(postulante.fecha_nac);
  const [estado_civil, setEstadoCivil] = useState(postulante.estado_civil);
  const [genero, setGenero] = useState(postulante.genero);
  const [cedula, setCedula] = useState(postulante.cedula);
  const [informacion_extra, setInformacionExtra] = useState(postulante.informacion_extra);
  const [errorCedula, setErrorCedula] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cantons, setCantons] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState(postulante.provincia || '');
  const [selectedCanton, setSelectedCanton] = useState(postulante.canton || '');

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('ubicaciones');
        setProvinces(response.data.provinces || []);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchCantons = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(`ubicaciones/cantones/${selectedProvince}`);
          setCantons(response.data || []);
        } catch (error) {
          console.error('Error fetching cantons:', error);
        }
      }
    };

    if (isOpen && selectedProvince) {
      fetchCantons();
    }
  }, [selectedProvince, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setNombres(postulante.nombres);
      setApellidos(postulante.apellidos);
      setFechaNac(postulante.fecha_nac);
      setEstadoCivil(postulante.estado_civil);
      setGenero(postulante.genero);
      setCedula(postulante.cedula);
      setInformacionExtra(postulante.informacion_extra);
      setSelectedProvince(postulante.provincia);
      setSelectedCanton(postulante.canton);
    }
  }, [isOpen, postulante]);

  const reloadProfile = async () => {
    try {
      const response = await axios.get(`/perfil/${postulante.id_usuario}`);
      onProfileUpdate(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleSave = async () => {
    if (validarCedulaEcuatoriana(cedula)) {
      try {
        const updatedProfile = {
          nombres,
          apellidos,
          fecha_nac,
          estado_civil,
          genero,
          cedula,
          informacion_extra,
          provincia: selectedProvince,
          canton: selectedCanton,
        };
        const response = await axios.put(`/updatePostulanteById/${postulante.id_usuario}`, updatedProfile);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: response.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
      });
        setTimeout(() => {
          setSuccessMessage(null);
          closeModal();
          reloadProfile();
        }, 3000);
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
      setErrorCedula("Cédula inválida");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'nombres':
        setNombres(value);
        break;
      case 'apellidos':
        setApellidos(value);
        break;
      case 'fecha_nac':
        setFechaNac(value);
        break;
      case 'estado_civil':
        setEstadoCivil(value);
        break;
      case 'genero':
        setGenero(value);
        break;
      case 'cedula':
        setCedula(value);
        break;
      case 'informacion_extra':
        setInformacionExtra(value);
        break;
      case 'provincia':
        setSelectedProvince(value);
        setSelectedCanton(''); // Reset canton when province changes
        break;
      case 'canton':
        setSelectedCanton(value);
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Editar Datos del Postulante"
      className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto my-4 relative overflow-y-auto max-h-[85vh] mt-[2rem]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-[2rem]"
    >
      <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
        &times;
      </button>
      <h2 className="text-xl text-center font-semibold mb-2 text-blue-500">Editar Datos</h2>
      <div className="space-y-2">
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative" role="alert">
            <strong className="font-bold">Éxito! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-gray-700">Nombres</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded-md"
              name="nombres"
              value={nombres}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Apellidos</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded-md"
              name="apellidos"
              value={apellidos}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-gray-700">Fecha de Nacimiento</label>
            <input
              type="date"
              className="w-full px-2 py-1 border rounded-md"
              name="fecha_nac"
              value={fecha_nac}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Estado Civil</label>
            <select
              className="w-full px-2 py-1 border rounded-md"
              name="estado_civil"
              value={estado_civil}
              onChange={handleInputChange}
            >
              <option value="Soltero">Soltero/a</option>
              <option value="Casado">Casado/a</option>
              <option value="Divorciado">Divorciado/a</option>
              <option value="Viudo">Viudo/a</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-gray-700">Género</label>
            <select
              className="w-full px-2 py-1 border rounded-md"
              name="genero"
              value={genero}
              onChange={handleInputChange}
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Cédula</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded-md"
              name="cedula"
              value={cedula}
              onChange={handleInputChange}
            />
            {errorCedula && <p className="text-red-500 text-sm mt-1">{errorCedula}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="provincia">
              Provincia
            </label>
            <select
              id="provincia"
              name="provincia"
              value={selectedProvince}
              onChange={(e) => {
                handleInputChange(e);
                setSelectedProvince(e.target.value);
                setSelectedCanton(''); // Reset canton when province changes
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccione</option>
              {provinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="canton">
              Cantón
            </label>
            <select
              id="canton"
              name="canton"
              value={selectedCanton}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <div>
          <label className="block text-gray-700">Información Extra</label>
          <textarea
            className="w-full px-2 py-1 border rounded-md"
            rows={2}
            name="informacion_extra"
            value={informacion_extra}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={closeModal} className="px-3 py-1 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white">Cancelar</button>
          <button type="button" onClick={handleSave} className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700">Guardar</button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostulanteModal;
