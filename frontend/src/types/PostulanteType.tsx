
export interface ProfileData {
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
    cv: string;
    telefono:string;
    provincia: string;
    canton: string;
    id_usuario: string;
    habilidades: Habilidad[];
    competencias:Competencia[];
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


export interface Competencia {
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

export interface TituloDetalle {
  id: number;
  titulo: string;
  nivel_educacion: string;
  campo_amplio: string;

}

export interface Idioma {
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

export interface Habilidad{
  id: number;
  habilidad: string;
  nivel: string;
  pivot?: {
    id_postulante: number;
    id_habilidad: number;
    nivel: string;
  };
}

export interface Curso {
  id_certificado: number;
  titulo: string;
  institucion: string;
  fechaini: string;
  fechafin: string;
  certificado: string;
}

export interface Red{
  id: number;
  nombre_red:string;
  enlace:string;
}

export interface Postulante {
  id: number;
  id_postulante: number;
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
  cv: string;
  telefono: string;
  provincia: string;
  canton: string;
  id_usuario:string;
}

export interface cvs {
  id: number;
  nombre: string;
  imagen: string;
  url: string;
}