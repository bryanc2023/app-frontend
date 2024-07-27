import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from '../../services/axios';
import { FaLinkedin, FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';

interface AddRedModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  reloadProfile: () => void;
  idPostulante: number;
}

const AddRedModal: React.FC<AddRedModalProps> = ({ isOpen, onRequestClose, reloadProfile, idPostulante }) => {
  const [nombreRed, setNombreRed] = useState('');
  const [enlace, setEnlace] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/postulante-red', {
        id_postulante: idPostulante,
        nombre_red: nombreRed,
        enlace: enlace,
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
      reloadProfile();
      onRequestClose();
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
  };

  const redes = [
    { nombre: 'LinkedIn', icono: <FaLinkedin className="text-blue-600 inline" /> },
    { nombre: 'Instagram', icono: <FaInstagram className="text-pink-600 inline" /> },
    { nombre: 'Facebook', icono: <FaFacebook className="text-blue-800 inline" /> },
    { nombre: 'X', icono: <FaXTwitter className="text-blue-400 inline" /> },
  ];

  const handleRedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRed = redes.find((red) => red.nombre === e.target.value);
    setNombreRed(selectedRed ? selectedRed.nombre : '');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Agregar Red Social"
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto my-20 relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <button onClick={onRequestClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
        &times;
      </button>
      <h2 className="text-xl font-semibold mb-4">Agregar Red Social</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nombre de la Red</label>
          <select
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
          <label className="block text-gray-700">Enlace</label>
          <input
            type="url"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
          Agregar
        </button>
      </form>
    </Modal>
  );
};

export default AddRedModal;
