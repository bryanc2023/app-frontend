export interface Titulo {
    id: number;
    titulo: string;
    nivel_educacion: string;
    campo_amplio: string;
 
  }
  
  export interface Formacion {
    id_postulante: number;
    institucion: string;
    estado: string;
    fechaini: string;
    fechafin: string;
    titulo: Titulo;
    titulo_acreditado: string;
  }
  