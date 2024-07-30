export interface LanguagesTabProps {
  idiomas: Idioma[];
}

interface Idioma {
  id: number;
  nombre: string;
  pivot: Pivot;
}

interface Pivot {
  id_postulante: number;
  id_idioma: number;
  nivel_oral: string;
  nivel_escrito: string;
}
