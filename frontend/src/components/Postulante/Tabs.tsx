import React, { useState } from 'react';
import EducationTab from './EducationTab';
import ExperienceTab from './ExperienceTab';
import LanguagesTab from './LanguagesTab';
import CoursesTab from './CoursesTab';
import CurriTab from './CurriTab';
import HabilidadTab from './HabilidadTab';
import CompetenciaTab from './CompetenciaTab';

interface TabsProps {
  profileData: ProfileData;
  openEditFormacionModal: (formacion: Formacion| null) => void;
  handleDeleteFormacion: (id: number) => void;
  openModal: (content: string) => void;
  openEditLanguageModal: (idioma: Idioma) => void;
  openEditHabilidadModal?: (habilidad: Habilidad) => void;
  openEditCompetenciadModal?: (competencia: Competencia) => void;
  openEditCursoModal: (curso: Curso | null | undefined) => void;
  handleDeleteCurso: (id: number) => void;
  handleViewCV: (id: number) => void;
  handleDownloadCV: (url: string) => void;
}

interface ProfileData {
  postulante: {
    id:number;
    id_postulante:number;
    foto: string;
    nombres: string;
    apellidos: string;
    fecha_nac: string;
    edad: number;
    estado_civil: string;
    cedula: string;
    genero: string;
    informacion_extra: string;
    idiomas: Idioma[];
    habilidades: Habilidad[];
    competencias:Competencia[];
    cv: string;
  };
  ubicacion: {
    provincia: string;
    canton: string;
  };
  formaciones: Formacion[];
  cursos: Curso[];
  redes: Red[];
  habilidades: Habilidad[];
  cvs: cvs[];

}
interface Competencia {
  id: number;
  grupo: string;
  nombre: string;
  descripcion: string;
  pivot?: {
    id_postulante: number;
    id_competencia: number;
    nivel: string;
  };
}

interface Formacion {
  id: number;
  id_postulante: number;
  id_titulo: number;
  institucion: string;
  estado: string;
  fechaini: string;
  fechafin: string;
  titulo: TituloDetalle;
  titulo_acreditado: string;
}

interface TituloDetalle {
  id: number;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;

}
interface Idioma {
  nivel_oral: string;
  nivel_escrito: string;
  id: number;
  nombre: string;
  pivot?: {
    id_postulante: number;
    id_idioma: number;
    nivel_oral: string;
    nivel_escrito: string;
  };
}

interface Habilidad{
  id: number;
  habilidad: string;
  nivel: string;
  pivot?: {
    id_postulante: number;
    id_habilidad: number;
    nivel: string;
  };
}

interface Curso {
  id_certificado: number;
  titulo: string;
  institucion: string;
  fechaini: string;
  fechafin: string;
  certificado: string;
}



interface Red{
  id: number;
  nombre_red:string;
  enlace:string;
}

interface cvs {
  id: number;
  nombre: string;
  imagen: string;
  url: string;
}

const Tabs: React.FC<TabsProps> = ({
  profileData,
  openEditFormacionModal,
  openModal,
  openEditLanguageModal,
  openEditCursoModal,
  openEditHabilidadModal,
  openEditCompetenciadModal,
  handleDeleteCurso,
  handleViewCV,
  handleDownloadCV,
}) => {
  const [activeTab, setActiveTab] = useState('education');
  const [formaciones, setFormaciones] = useState<Formacion[]>(profileData.formaciones);

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return (
          <EducationTab
          formaciones={formaciones}
          openEditFormacionModal={openEditFormacionModal}
          setFormaciones={setFormaciones}
            
          />
        );
      case 'experience':
        return <ExperienceTab openModal={openModal} />;
      case 'languages':
        return (
          <LanguagesTab
            idiomas={profileData.postulante.idiomas}
            openEditLanguageModal={openEditLanguageModal}
            openModal={openModal}
          />
        );
      case 'courses':
        return (
          <CoursesTab
            cursos={profileData.cursos}
            openEditCursoModal={openEditCursoModal}
            handleDeleteCurso={handleDeleteCurso}
          />
        );
      case 'cv':
        return (
          <CurriTab
            cvs={[
              {
                id: profileData.postulante.id,
                nombre: `${profileData.postulante.nombres} ${profileData.postulante.apellidos}`,
                imagen: profileData.postulante.foto,
                url: profileData.postulante.cv,
              },
            ]}
            handleViewCV={handleViewCV}
            handleDownloadCV={handleDownloadCV}
          />
        );
        case 'habilidades':
          return (
            <HabilidadTab
            habilidades={profileData.postulante.habilidades}
            openEditHabilidadModal={openEditHabilidadModal}
            openModal={openModal}
          />
        );
        case 'competencias':
          return (
            <CompetenciaTab
            competencias={profileData.postulante.competencias}
            openEditCompetenciaModal={openEditCompetenciadModal}
            openModal={openModal}
          />
          );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('education')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'education' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Educación
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'experience' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Experiencia
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'languages' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Idiomas
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'courses' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Cursos
        </button>
        <button
          onClick={() => setActiveTab('habilidades')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'habilidades' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Habilidades
        </button>

        <button
          onClick={() => setActiveTab('competencias')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'competencias' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          Competencias
        </button>
        <button
          onClick={() => setActiveTab('cv')}
          className={`py-2 px-4 flex-shrink-0 ${activeTab === 'cv' ? 'bg-gray-800 text-white rounded-t-lg' : 'bg-gray-400 text-black rounded-lg'}`}
        >
          CV
        </button>
      </div>
      <div className="p-4 bg-gray-700 rounded-b-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Tabs;
