import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useParams } from 'react-router-dom';

interface PostulanteDetailProps {
    postulante: {
      id_postulante: number;
      nombres: string;
      apellidos: string;
      fecha_nac: string;
      edad: number;
      estado_civil: string;
      cedula: string;
      genero: string;
      informacion_extra: string;
      foto: string;
      cv: string | null;
      total_evaluacion: number;
      ubicacion: {
        provincia: string;
        canton: string;
      };
      formaciones: {
        id_titulo: number;
        institucion: string;
        estado: string;
        fecha_ini: string;
        fecha_fin: string | null;
        titulo: {
          titulo: string;
        };
      }[];
      idiomas: {
        id_idioma: number;
        idioma: {
          nombre: string;
        };
        nivel_oral: string;
        nivel_escrito: string;
      }[];
    };
    
    onClose: () => void;
  }
  

function PostulanteDetallePage() {
  const { id_postulante } = useParams();
  const [postulanteData, setPostulanteData] = useState<PostulanteDetailProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostulanteData = async () => {
      try {
        const response = await axios.get(`perfildet/${id_postulante}`);
        setPostulanteData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching postulante data:', error);
        setLoading(false);
      }
    };

    fetchPostulanteData();
  }, [id_postulante]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!postulanteData) {
    return <div>No se encontraron datos del postulante.</div>;
  }

  return (
    <>
    <div className="p-6 bg-white rounded-lg shadow-lg">
    <button className="mb-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => window.history.back()}>Volver</button>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{postulanteData.postulante.nombres} {postulanteData.postulante.apellidos}</h1>
          <p><strong>Fecha de Nacimiento:</strong> {postulanteData.postulante.fecha_nac}</p>
          <p><strong>Edad:</strong> {postulanteData.postulante.edad}</p>
          <p><strong>Estado Civil:</strong> {postulanteData.postulante.estado_civil}</p>
          <p><strong>Cédula:</strong> {postulanteData.postulante.cedula}</p>
          <p><strong>Género:</strong> {postulanteData.postulante.genero}</p>
        </div>
        <div className="flex justify-center">
          {postulanteData.postulante.foto && (
            <img src={postulanteData.postulante.foto} alt="Foto del postulante" className="w-90 h-40 object-cover " />
          )}
        </div>
      </div>
      <h2 className="text-xl font-bold mt-4 mb-2">Ubicación</h2>
      <p><strong>Provincia:</strong> {postulanteData.postulante.ubicacion.provincia}</p>
      <p><strong>Cantón:</strong> {postulanteData.postulante.ubicacion.canton}</p>
  
      <h2 className="text-xl font-bold mt-4 mb-2">Formaciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {postulanteData.postulante.formaciones.map((formacion) => (
          <div className="p-4 bg-gray-100 rounded-lg shadow" key={formacion.id_titulo}>
            <p><strong>Institución:</strong> {formacion.institucion}</p>
            <p><strong>Estado:</strong> {formacion.estado}</p>
            <p><strong>Fecha de Inicio:</strong> {formacion.fecha_ini}</p>
            <p><strong>Fecha de Fin:</strong> {formacion.fecha_fin || 'En curso'}</p>
            <p><strong>Título:</strong> {formacion.titulo?.titulo}</p>
          </div>
        ))}
      </div>
  
      <h2 className="text-xl font-bold mt-4 mb-2">Idiomas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {postulanteData.postulante.idiomas.map((idioma) => (
          <div className="p-4 bg-gray-100 rounded-lg shadow" key={idioma.id_idioma}>
            <p><strong>Idioma:</strong> {idioma.idioma?.nombre}</p>
            <p><strong>Nivel Oral:</strong> {idioma.nivel_oral}</p>
            <p><strong>Nivel Escrito:</strong> {idioma.nivel_escrito}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
  
export default PostulanteDetallePage;
