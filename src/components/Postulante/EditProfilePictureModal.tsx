import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import Modal from 'react-modal';
import axios from '../../services/axios';
import { getCroppedImg } from '../../../utils/cropImage';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EditProfilePictureModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (croppedImage: string) => void;
  initialImage: string;
  postulanteId: number; // Cambiar a postulanteId
}

const EditProfilePictureModal: React.FC<EditProfilePictureModalProps> = ({
  isOpen,
  onRequestClose,
  onSave,
  initialImage,
  postulanteId, // Cambiar a postulanteId
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(initialImage);

  const onCropComplete = useCallback((croppedAreaPercentage: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedArea && imageSrc) {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedArea);
      const storageRef = ref(storage, `profile_pictures/${croppedImageFile.name}`);
      await uploadBytes(storageRef, croppedImageFile);
      const photoURL = await getDownloadURL(storageRef);

      try {
        await axios.post(`postulante/${postulanteId}/updateProfilePicture`, { foto: photoURL });
        onSave(photoURL);
        onRequestClose();
      } catch (error) {
        console.error('Error updating profile picture:', error);
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
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Editar Foto de Perfil</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
        {imageSrc && (
          <div className="relative w-full h-64 bg-gray-200">
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
        )}
        <div className="flex justify-between items-center mt-4">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onRequestClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition duration-300 mr-2"
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

export default EditProfilePictureModal;
