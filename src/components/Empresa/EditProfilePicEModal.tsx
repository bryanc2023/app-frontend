import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import Modal from 'react-modal';
import axios from '../../services/axios';
import { getCroppedImg } from '../../../utils/cropImage';
import { storage } from '../../config/firebaseConfig';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import EmpresaDetails from '../../pages/empresa/PerfilE';

interface EditProfilePicEModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (croppedImage: string) => void;
  initialImage: string;
  empresaId?: number;
  empreName:string;
}

const EditProfilePicEModal: React.FC<EditProfilePicEModalProps> = ({
  isOpen,
  onRequestClose,
  onSave,
  initialImage,
  empresaId,
  empreName,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(initialImage);
  const [resolvedEmpresaId, setResolvedEmpresaId] = useState<number | null>(empresaId || null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchEmpresaId = async () => {
      try {
        if (!resolvedEmpresaId || resolvedEmpresaId === 0) {
          const response = await axios.get(`/empresaById/${user.id}`);
          const empresaData = response.data;
          setResolvedEmpresaId(empresaData.id_empresa);
        }
      } catch (error) {
        console.error('Error fetching empresa ID:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al obtener el ID de la empresa.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    };

    fetchEmpresaId();
  }, [empresaId]);

  const onCropComplete = useCallback((croppedAreaPercentage: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!resolvedEmpresaId || resolvedEmpresaId === 0) {
      console.error('Invalid empresaId, cannot save logo.');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'No se pudo obtener el ID de la empresa. Intenta nuevamente.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (croppedArea && imageSrc) {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedArea);

      // Mostrar el cargando con SweetAlert2
      Swal.fire({
        title: 'Guardando...',
        text: 'Por favor, espera mientras se guarda el logo.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

    
       // Definir la URL base del host
       const urlHost = `${import.meta.env.VITE_API_URL2.replace('/api', '')}/storage/`;

       // Crear un objeto FormData para enviar la imagen
       const formData = new FormData();
       formData.append('logo', croppedImageFile);
       formData.append('image_name', empreName+'.jpeg');  // La imagen recortada
       formData.append('url', urlHost); // Enviar la URL del host

      try {
        await axios.post(`/empresa/${resolvedEmpresaId}/updateLogo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const logoURL = urlHost + 'images/logos/' + croppedImageFile.name;
        onSave(logoURL);
        onRequestClose();

        // Cerrar el SweetAlert y mostrar éxito
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Logo guardado correctamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error('Error updating company logo:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Hubo un problema al guardar el logo. Por favor, intenta nuevamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md w-full mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Editar Logo de Empresa</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {imageSrc && (
          <>
            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Zoom:</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full ml-4"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onRequestClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfilePicEModal;
