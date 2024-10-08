import React, { useState } from 'react';
import EducationTab from './EducationTab';
import ExperienceTab from './ExperienceTab';
import LanguagesTab from './LanguagesTab';
import CoursesTab from './CoursesTab';
import CurriTab from './CurriTab';
import HabilidadTab from './HabilidadTab';
import CompetenciaTab from './CompetenciaTab';
import { Competencia, Curso, Formacion, Habilidad, Idioma, ProfileData } from '../../types/PostulanteType';


interface TabsProps {
  profileData: ProfileData;
  openEditFormacionModal: (formacion: Formacion | null) => void;
  handleDeleteFormacion: (id: number) => void;
  openModal: (content: string) => void;
  openEditLanguageModal: (idioma: Idioma) => void;
  openEditHabilidadModal:(habilidad: Habilidad) =>void;
  openEditCompetenciaModal: (competencia: Competencia) => void;
  openEditCursoModal: (curso: Curso | null | undefined) => void;
  handleDeleteCurso: (id: number) => void;
  handleViewCV: (id: number) => void;
  handleDownloadCV: (url: string) => void;
}
const Tabs: React.FC<TabsProps> = ({
  profileData,
  openEditFormacionModal,
  handleDeleteFormacion,
  openModal,
  openEditLanguageModal,
  openEditHabilidadModal,
  openEditCompetenciaModal,
  openEditCursoModal,
  handleDeleteCurso,
  handleViewCV,
  handleDownloadCV,
}) => {
  const [activeTab, setActiveTab] = useState('education');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return (
          <EducationTab
            formaciones={profileData.formaciones}
            openEditFormacionModal={openEditFormacionModal}
            // @ts-expect-error: handleDeleteFormacion no es compatible con el tipo de setFormaciones
            setFormaciones={handleDeleteFormacion}

          />
        );
      case 'experience':
        return <ExperienceTab />;
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
           // @ts-expect-error: cvs le falta imagen
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
            openEditCompetenciaModal={openEditCompetenciaModal}
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
