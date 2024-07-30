// types.ts
export interface TituloDetalle {
  id: number;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;
}

export interface Formacion {
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
  
  export interface ProfileData {
    postulante: {
      foto: string;
      nombres: string;
      apellidos: string;
      fecha_nac: string;
      edad: number;
      estado_civil: string;
      cedula: string;
      genero: string;
      id_postulante: number;
    };
    ubicacion: {
      provincia: string;
      canton: string;
    };
    cursos: Curso[]; 
  }
  
  export interface Curso {
   id_certificado: number;
  titulo: string;
  institucion: string;
  fechaini: string;
  fechafin: string;
  certificado: string;
  }