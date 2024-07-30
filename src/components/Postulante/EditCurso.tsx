import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';
import { ProfileData } from '../../types/PostulanteType';

interface EditCursoProps {
  isOpen: boolean;
  closeModal: () => void;
  curso?: Curso | null ;
  reloadCursos: () => void;
}

interface Curso {
  id_certificado: number;
  titulo: string;
  institucion: string;
  fechaini: string;
  fechafin: string;
  certificado: string;
}

const EditCurso: React.FC<EditCursoProps> = ({ isOpen, closeModal, reloadCursos, curso }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
          const response = await axios.get(`/perfil/${user.id}`);
          setProfileData(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const [nombre, setNombre] = useState(curso ? curso.titulo : '');

  const [certificado, setCertificado] = useState(curso ? curso.certificado : '');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData || !profileData.postulante) {
      console.error("Missing profile data");
      return;
    }

    const updatedCurso = {
      id_postulante: profileData.postulante.id_postulante,
      titulo: nombre,
      certificado: certificado,
    };

    try {
      if (curso && curso.id_certificado) {
        await axios.put(`/certificadoU/${curso.id_certificado}`, updatedCurso);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Curso actualizado',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
      });
      } else {
        await axios.post('/certificadoC', updatedCurso);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Curso agregado correctamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
      });
      }
      reloadCursos(); // Llama a fetchCursos después de agregar o editar
      closeModal();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
          Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al guardar el curso',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
          });
      }
    }
  };

  if (loading) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  return (
    <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 flex items-center justify-center bg-black bg-opacity-50`}>
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">{curso ? 'Editar Curso' : 'Agregar Curso'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre del Curso</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md text-gray-900"
              placeholder="Nombre del Curso"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Certificado (URL)</label>
            <input
              type="url"
              className="w-full px-4 py-2 border rounded-md text-gray-900"
              placeholder="URL del Certificado"
              value={certificado}
              onChange={(e) => setCertificado(e.target.value)}
              required
            />
          </div>
          {certificado && (
            <div className="mb-4">
              <a href={certificado} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Ver Certificado
              </a>
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCurso;
