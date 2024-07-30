interface Empresa {
    id_empresa: number;
    id_ubicacion: number;
    id_usuario: number;
    id_sector: number;
    nombre_comercial: string;
    tamanio: string;
    descripcion: string;
    logo: string;
    cantidad_empleados: number;
    red: {
        id_empresa_red: number;
        nombre_red: string;
        enlace: string;
    }[];
    sector: {
        id: number;
        sector: string;
        division: string;
    };
    ubicacion: {
        id: number;
        provincia: string;
        canton: string;
    };
}
