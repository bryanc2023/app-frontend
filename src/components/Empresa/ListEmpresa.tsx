interface Empresa {
    id_empresa: number;
    nombre_comercial: string;
    logo: string;
}

interface ListEmpresaProps {
    empresa: {
        id_empresa: number;
        nombre_comercial: string;
        logo: string;
    };
    getEmpresa: (idEmpresa: Empresa['id_empresa']) => void;
    onClick?: () => void;
}

export default function ListEmpresa({ empresa, getEmpresa }: ListEmpresaProps) {
    return (
        <button
            onClick={() => getEmpresa(empresa.id_empresa)}
            className="flex items-center p-2 border-b-2 border-gray-200 w-full text-gray-700 hover:bg-gray-100"
        >
            <div className="h-12 w-12 rounded-full ring-2 ring-gray-200 flex-shrink-0">
                <img src={empresa.logo} alt={`Logo de la empresa ${empresa.nombre_comercial}`} className="h-12 w-12 rounded-full object-cover" />
            </div>
            <p className="ml-4 font-bold">{empresa.nombre_comercial}</p>
        </button>
    );
}
