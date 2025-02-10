import React, { useState, useCallback } from 'react';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Modal from 'react-modal';
import Tabs from './../../components/Postulante/Tabs';
import EditPostulanteModal from '../../components/EditPostulante';
import FormacionPEditar from '../../components/FormacionPEditar';
import EditCurso from '../../components/Postulante/EditCurso';
import AddRedModal from '../../components/Postulante/AddRedModal';
import AddIdiomaModal from '../../components/Postulante/AddIdiomaModal';
import EditProfilePictureModal from '../../components/Postulante/EditProfilePictureModal';
import { FaLinkedin, FaFacebook, FaInstagram, FaXTwitter, FaGlobe, FaTrash, FaEnvelope } from 'react-icons/fa6';
import { ProfileData, Formacion, Idioma, Curso, Red, Habilidad, Competencia } from '../../types/PostulanteType';
import { FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');
interface Area {
  id: number;
  nombre_area: string;
}

interface Area2 {
  id_area: number;
  nombre_area: string;
}
const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEditProfilePicModalOpen, setIsEditProfilePicModalOpen] = useState<boolean>(false);
  const [selectedFormacion, setSelectedFormacion] = useState<Formacion | Idioma | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null | undefined>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);
  const [isAddRedModalOpen, setIsAddRedModalOpen] = useState<boolean>(false);
  const [isAddIdiomaModalOpen, setIsAddIdiomaModalOpen] = useState<boolean>(false);
  const [redes, setRedes] = useState<Red[]>([]);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [redToDelete, setRedToDelete] = useState<Red | null>(null);
  const [languages, setLanguages] = useState<{ id: number; nombre: string }[]>([]);
  const [, setSelectedHabilidad] = useState<Habilidad | null>(null);
  const [, setSelectedCompetencia] = useState<Competencia | null>(null);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areas2, setAreas2] = useState<Area2[]>([]);

  const [selectedArea, setSelectedArea] = useState('');

  const fetchAreas = async () => {
    try {
      const response = await axios.get('areas');
      if (response.data.areas) {
        setAreas(response.data.areas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchProfileData = useCallback(async () => {
    try {
      if (user) {
        const response = await axios.get(`/perfil/${user.id}`);
        const data = response.data;
        if (!data.cursos) {
          data.cursos = [];
        }
        if (!data.experiencia) {
          data.experiencia = [];
        }
        if (!data.idiomas) {
          data.idiomas = [];
          setLanguages(data.idiomas);
        }
        setProfileData(data);
        if (!isCedulaValid(data.postulante.cedula)) {
          setCedulaError('Cédula inválida');
        } else {
          setCedulaError(null);
        }
        try {
          const redesResponse = await axios.get(`/postulante-red/${data.postulante.id_postulante}`);
          setRedes(redesResponse.data || []);
        } catch (redesError) {
          setRedes([]);
        }
        try {
          const arResponse = await axios.get(`/postulante-noti/${data.postulante.id_postulante}`);
          setAreas2(arResponse.data || []);
        } catch (redesError) {
          setAreas2([]);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
    fetchAreas();
  }, [user]);



  const reloadProfile = useCallback(async () => {
    await fetchProfileData();
  }, [fetchProfileData]);

  const openConfirmDeleteModal = (red: Red) => {
    setRedToDelete(red);
    setIsConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
    setRedToDelete(null);
  };

  const isCedulaValid = (cedula: string): boolean => {
    if (cedula.length !== 10) return false;
    const digits = cedula.split('').map(Number);
    const provinceCode = parseInt(cedula.substring(0, 2), 10);
    if (provinceCode < 1 || provinceCode > 24) return false;
    const verifier = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
      if (index % 2 === 0) {
        const product = digit * 2;
        return acc + (product > 9 ? product - 9 : product);
      } else {
        return acc + digit;
      }
    }, 0);
    const modulus = sum % 10;
    return modulus === 0 ? verifier === 0 : 10 - modulus === verifier;
  };

  const openModal = useCallback((content: string) => {
    setModalContent(content);
    setSelectedFormacion(null);
    setSelectedCurso(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalContent('');
  }, []);

  const openEditModal = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const openEditFormacionModal = useCallback((formacion: Formacion | null) => {
    setSelectedFormacion(formacion);
    setModalContent('formacion');
    setIsModalOpen(true);
  }, []);

  const openEditCursoModal = useCallback((curso: Curso | null | undefined) => {
    setSelectedCurso(curso);
    setModalContent('curso');
    setIsModalOpen(true);
  }, []);

  const openEditLanguageModal = useCallback((idioma: Idioma) => {
    setSelectedFormacion(idioma);
    setModalContent('editIdioma');
    setIsModalOpen(true);
  }, []);

  const openEditHabilidadModal = useCallback((habilidad: Habilidad) => {
    setModalContent('habilidad');
    setSelectedHabilidad(habilidad);
    setIsModalOpen(true);
  }, []);

  const openEditCompetenciaModal = useCallback((competencia: Competencia) => {
    setModalContent('competencia');
    setSelectedCompetencia(competencia);
    setIsModalOpen(true);
  }, []);

  const handleProfileUpdate = useCallback((updatedProfile: ProfileData) => {
    setProfileData(updatedProfile);
  }, []);

  const openAddRedModal = useCallback(() => {
    setIsAddRedModalOpen(true);
  }, []);

  const closeAddRedModal = useCallback(() => {
    setIsAddRedModalOpen(false);
  }, []);

  const closeAddIdiomaModal = useCallback(() => {
    setIsAddIdiomaModalOpen(false);
  }, []);

  const handleDeleteRed = async (id: number) => {
    try {
      await axios.delete(`/red/${id}`);
      // Actualiza el estado eliminando la red del arreglo
      setRedes(redes.filter((red) => red.id_postulante_red !== id));
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Red social eliminada exitosamente',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error eliminando la red:', error);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Hubo un error al eliminar la red social',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };


  const renderIcon = useCallback((nombreRed: string) => {
    switch (nombreRed.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'x':
        return <FaXTwitter className="text-blue-400" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      default:
        return <FaGlobe className="text-gray-400" />;
    }
  }, []);

  const getModifiedEstadoCivil = useCallback((estadoCivil: string, genero: string) => {
    if (genero.toLowerCase() === 'femenino') {
      if (estadoCivil.endsWith('o')) {
        return estadoCivil.slice(0, -1) + 'a';
      }
    }
    return estadoCivil;
  }, []);

  React.useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-screen">No profile data found</div>;
  }
  const handleAceptar = async () => {
    const idDelPostulante = profileData?.postulante.id_postulante; // Obtén el id del postulante
    if (user) {
      if (!idDelPostulante || !selectedArea) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'ID del postulante o área no válidos.',
        });
        return; // Salir de la función si no son válidos
      }
      // Verificar si el id_area ya está asociado al id_postulante
      const areaExists = areas2.some(area => area.id_area.toString() === selectedArea);

      if (areaExists) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El área seleccionada ya está asociada a este postulante.',
        });
        return; // Salir de la función si ya está asociada
      }
      try {
        const response = await axios.post(`/notifica-a`, {
          id_postulante: idDelPostulante,
          id_area: selectedArea,
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
        setModalOpen2(false);
      } catch (error) {
        console.error("Error de Axios:", error); // Agregado para registro
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: Object.values(errors).flat().join(', '),
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud.',
          });
        }
        setModalOpen2(false);
      }

    }
  };
  const handleDeleteNoti = async (id: number) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Ya no recibiras notificaciones de esta área',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {

        try {
           const idDelPostulante = profileData?.postulante.id_postulante;
            const response = await axios.delete(`/notify/${id}/${idDelPostulante}`);
            
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
            setModalOpen2(false);
        } catch (error) {
          
            Swal.fire('Error', 'Hubo un error al eliminar la notificación.', 'error');
        }

    }
};

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#111827] rounded-lg shadow-md text-white pb-6" id="profile-content">
   
      {/* Modal */}
      {modalOpen2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-cyan-600 p-10 rounded shadow-md w-1/2">
            <h2 className="text-lg font-semibold mb-4">Notificaciones personalizadas</h2>
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
                  (Se recibiran notificaciones al correo de ofertas que se publiquen con estas area de interés)
                </h1>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="area" className="block font-medium text-white">
                Seleccione el área de ofertas:
              </label>
              <select
                id="area"
                className="border border-gray-300 p-2 rounded w-full mt-2 text-black"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <button
                className="bg-green-500 text-white p-2 rounded"
                onClick={handleAceptar}
              >
                Aceptar
              </button>
              <button
                className="bg-red-500 text-white p-2 rounded ml-2"
                onClick={() => setModalOpen2(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-4">

        <img
          src={profileData.postulante.foto}
          alt={`${profileData.postulante.nombres} ${profileData.postulante.apellidos}`}
          className="w-24 h-24 rounded-full object-cover border-4 border-white cursor-pointer"
          onClick={() => setIsEditProfilePicModalOpen(true)}
        />
        <div>
          <h1 className="text-3xl font-semibold">
            {profileData.postulante.nombres} {profileData.postulante.apellidos}
          </h1>
          <p className="text-gray-400">{profileData.ubicacion.provincia}, {profileData.ubicacion.canton}</p>
          <button onClick={openEditModal} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Editar Datos</button>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Detalles del Perfil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p><strong>Fecha de Nacimiento:</strong> {profileData.postulante.fecha_nac}</p>
          <p><strong>Edad:</strong> {profileData.postulante.edad}</p>
          <p><strong>Estado Civil:</strong> {getModifiedEstadoCivil(profileData.postulante.estado_civil, profileData.postulante.genero)}</p>
          <p>
            <strong>Cédula:</strong> {profileData.postulante.cedula}
            {cedulaError && <span className="text-red-500 ml-2">{cedulaError}</span>}
          </p>
          <p>
            <strong>Teléfono:</strong> {profileData.postulante.telefono}
          </p>
          <p><strong>Género:</strong> {profileData.postulante.genero}</p>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Presentación</h2>
        {profileData.postulante.informacion_extra
          ? profileData.postulante.informacion_extra.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-400 mb-2">{paragraph.trim()}</p> // Añade margen entre párrafos
          ))
          : <p className="text-gray-400 mb-2">Ninguna</p> // Si es null, muestra "Ninguna"
        }
      </div>



      <div className="mt-6 bg-gray-800 p-4 rounded-lg pb-6 shadow-inner text-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Redes</h2>

          {/* Ícono de información con tooltip */}
          <div className="relative group">
            <FaInfoCircle className="text-white text-lg cursor-pointer" />

            {/* Tooltip */}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-8 w-max bg-white text-gray-800 text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Si necesita cambiar una red social, elimine la existente y agregue la nueva red social.
            </span>
          </div>

          <button onClick={openAddRedModal} className="text-orange-400 hover:underline">
            + Agregar red
          </button>
        </div>

        {/* Renderizado condicional de redes */}
        {redes && redes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
            {redes.map((red: Red) => (
              <div key={red.id_postulante_red} className="flex items-center space-x-2">
                <span>{red.nombre_red}</span>
                <a href={red.enlace} target="_blank" rel="noopener noreferrer" className="text-2xl hover:underline">
                  {renderIcon(red.nombre_red)}
                </a>
                {/* Botón para eliminar red con confirmación */}
                <button
                  onClick={() => openConfirmDeleteModal(red)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash className="text-sm" />
                </button>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600 text-gray-300">
            <span>No hay redes sociales agregadas.</span>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-lg pb-6 shadow-inner text-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Notificaciones personalizadas</h2>

          {/* Ícono de información con tooltip */}
          <div className="relative group">
            <FaInfoCircle className="text-white text-lg cursor-pointer" />

            {/* Tooltip */}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-8 w-max bg-white text-gray-800 text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Si necesitas que ya no se te notifique de una área en específico, elimine la existente
            </span>
          </div>

          <button onClick={() => setModalOpen2(true)} className="text-orange-400 hover:underline">
            + Agregar notifaciones personalizadas
          </button>
        </div>

        {/* Renderizado condicional de redes */}
        {areas2 && areas2.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
            {areas2.map(area => (
              <div key={area.id_area} className="flex items-center space-x-2">
                <span>{area.nombre_area}</span> {/* Accede a `nombre_area` correctamente */}
                <button
                  onClick={() => handleDeleteNoti(area.id_area)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No se han configurado notificaciones personalizadas.</p> // Mensaje por si no hay áreas
        )}

      </div>


      <Tabs
        profileData={profileData}
        openEditFormacionModal={openEditFormacionModal}
        handleDeleteFormacion={reloadProfile}
        openModal={openModal}
        openEditLanguageModal={openEditLanguageModal}
        openEditHabilidadModal={openEditHabilidadModal}
        openEditCompetenciaModal={openEditCompetenciaModal}
        openEditCursoModal={openEditCursoModal}
        handleDeleteCurso={reloadProfile}
        handleViewCV={(id: number) => { console.log(id) }}
        handleDownloadCV={(url: string) => { console.log(url) }}
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Agregar Información"
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto my-20 relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
          &times;
        </button>
        {modalContent === 'formacion' && (
          <FormacionPEditar
            isOpen={isModalOpen}
            closeModal={closeModal}
            reloadProfile={reloadProfile}
            formacion={selectedFormacion as Formacion}
          />
        )}
        {modalContent === 'curso' && (
          <EditCurso
            isOpen={isModalOpen}
            closeModal={closeModal}
            reloadCursos={reloadProfile}
            curso={selectedCurso as Curso}
          />
        )}
      </Modal>

      <EditPostulanteModal
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
        postulante={profileData.postulante}
        onProfileUpdate={handleProfileUpdate}
      />

      <AddRedModal
        isOpen={isAddRedModalOpen}
        onRequestClose={closeAddRedModal}
        reloadProfile={reloadProfile}
        idPostulante={profileData.postulante.id_postulante}
      />

      <AddIdiomaModal
        isOpen={isAddIdiomaModalOpen}
        onRequestClose={closeAddIdiomaModal}
        onIdiomaAdded={reloadProfile} // Llama a reloadProfile después de agregar un idioma
        languages={languages}
        userId={profileData.postulante.id_postulante}
      />

      <Modal
        isOpen={isConfirmDeleteModalOpen}
        onRequestClose={closeConfirmDeleteModal}
        contentLabel="Confirmar eliminación"
        className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-full max-w-lg mx-auto my-20 relative"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
        <p className="mb-4">¿Estás seguro de que deseas eliminar la red social <strong>{redToDelete?.nombre_red}</strong>?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={closeConfirmDeleteModal}
            className="px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (redToDelete) {
                handleDeleteRed(redToDelete.id_postulante_red);
              }
              closeConfirmDeleteModal();
            }}
            className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Eliminar
          </button>
        </div>
      </Modal>


      <EditProfilePictureModal
        isOpen={isEditProfilePicModalOpen}
        onRequestClose={() => {
          setIsEditProfilePicModalOpen(false);
          window.location.reload(); // Recargar los datos del postulante al cerrar el modal
        }}
        onSave={(newPhotoURL: string) => {
          setProfileData((prevData) => {
            if (prevData) {
              return { ...prevData, postulante: { ...prevData.postulante, foto: newPhotoURL } };
            }
            
            return prevData;
          });
        }}
        initialImage={profileData.postulante.foto}
        postulanteId={profileData.postulante.id_postulante} // Pasar el id_postulante
      />
    </div>
  );
};

export default Profile;
