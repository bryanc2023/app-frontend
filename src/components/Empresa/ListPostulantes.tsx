

interface Postulante {
    id_postulante: number;
    nombres: string;
    apellidos: string;
    foto: string;
}

interface ListPostulantesProps {
    postulante: Postulante;
    getPostulante: (postulante: Postulante) => void;
    onClick?: () => void;
}

export default function ListPostulantes({ postulante, getPostulante }: ListPostulantesProps) {
    return (
        <button 
            onClick={() => getPostulante(postulante)} 
            className="flex items-center p-2 border-b-2 border-gray-200 w-full text-gray-700 hover:bg-gray-100"
        >
            <div className="flex-shrink-0 h-10 w-10 rounded-full ring-2 ring-gray-200">
                <img src={postulante.foto} alt={`Foto del postulante ${postulante.nombres}`} className="h-10 w-10 rounded-full object-cover" />
            </div>
            <p className="ml-4 font-bold truncate">{`${postulante.nombres} ${postulante.apellidos}`}</p>
        </button>
    );
}
