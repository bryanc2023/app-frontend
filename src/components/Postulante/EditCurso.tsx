import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootState } from '../../store';
import Swal from 'sweetalert2';
import { isAxiosError } from 'axios';
import { ProfileData } from '../../types/PostulanteType';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FieldError } from 'react-hook-form';

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
  // Estado para el checkbox
  const [isPhysicalCertificate, setIsPhysicalCertificate] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // Estado para manejar el archivo PDF

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

    let certificadoUrl = certificado; // Mantiene la URL del certificado existente

    // Solo subir el PDF si es un certificado físico
    if (isPhysicalCertificate && pdfFile) {
      if (pdfFile.size > 5 * 1024 * 1024) { // Verifica que el archivo no exceda 5 MB
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El archivo debe ser menor de 5 MB.',
        });
        return;
      }
    
    

      const storageRef = ref(storage, `certificados/${pdfFile.name}`);
      await uploadBytes(storageRef, pdfFile);
      certificadoUrl = await getDownloadURL(storageRef); // Obtiene la URL del archivo subido
    } else if (isPhysicalCertificate) {
      certificadoUrl = ''; // Si es físico pero no hay archivo, vacía el campo
    }

    const updatedCurso = {
      id_postulante: profileData.postulante.id_postulante,
      titulo: nombre,
      certificado: certificadoUrl, // Actualiza con la URL del certificado
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
          {/* Checkbox para certificado físico */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={isPhysicalCertificate}
              onChange={(e) => setIsPhysicalCertificate(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-700">¿Es certificado físico?</label>
          </div>

{/* Campo de carga del PDF, visible solo si es físico */}
{isPhysicalCertificate && (
            <div className="mb-4">
              <label className="block text-gray-700">Puede subir su certificado escaneado y que sea menos de 2MB y formato PDF (Opcional):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2 border rounded-md text-gray-900"
              />
            </div>
          )}
          {/* Campo de URL del certificado, visible solo si no es físico */}
          {!isPhysicalCertificate && (
            <div className="mb-4">
              <label className="block text-gray-700">Certificado online (URL) (Opcional)</label>
              <input
                type="url"
                className="w-full px-4 py-2 border rounded-md text-gray-900"
                placeholder="URL del Certificado"
                value={certificado}
                onChange={(e) => setCertificado(e.target.value)}
              />
            </div>
          )}

          {certificado && !isPhysicalCertificate && (
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
