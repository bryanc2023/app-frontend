// types.ts
export interface Formacion {
    id_postulante: number;
    id_titulo: number;
    institucion: string;
    titulo_acreditado: string;
    estado: string;
    fechaini: string;
    fechafin: string;
    titulo: {
      id: number;
      titulo: string;
      nivel_educacion: string;
      campo_amplio: string;
    };
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
  