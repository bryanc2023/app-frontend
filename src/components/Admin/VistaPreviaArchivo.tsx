import { useEffect, useState, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "../../services/axios";
import ModalComponent from './NotiModal';

const getEndpoints = {
    ubicacion: 'ubicacionesR',
    titulo: 'titulosR',
    sector: 'sectoresR',
    area: 'areasR',
    criterio: 'criteriosR',
    idioma: 'idiomasR',
    competencia: 'competenciaR',
    habilidad: 'habilidadR',
} as const;

const updateEndpoints = {
    ubicacion: '/updateUbicaciones',
    titulo: '/updateTitulos',
    sector: '/updateSectores',
    area: '/updateAreas',
    criterio: '/updateCriterios',
    idioma: '/updateIdiomas',
    competencia: '/postulante_competencia/update',
    habilidad: '/postulante_habilidad/update',
} as const;

type FieldKeys = keyof typeof getEndpoints;

interface DataRow {
    [key: string]: any;
}

const VistaPreviaArchivo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { field } = location.state as { field: FieldKeys } || {};

    const [data, setData] = useState<DataRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(getEndpoints[field]);
                let responseData = response.data.data || response.data;

                if (field === 'competencia' && responseData.competencias) {
                    responseData = responseData.competencias;
                } else if (field === 'habilidad' && responseData.habilidades) {
                    responseData = responseData.habilidades;
                }

                if (Array.isArray(responseData)) {
                    const filteredData = responseData.map((row: DataRow) => {
                        const { created_at, updated_at, ...rest } = row;
                        return rest;
                    });
                    setData(filteredData);
                } else {
                    console.error(`Expected an array but got:`, responseData);
                }

                setIsLoading(false);
            } catch (error) {
                console.error(`Error fetching data:`, error);
                setIsLoading(false);
            }
        };

        if (field) {
            fetchData();
        }
    }, [field]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: string) => {
        const newData = [...data];
        newData[rowIndex][colIndex] = e.target.value;
        setData(newData);
    };

    const handleAddRow = () => {
        const headers = Object.keys(data[0] || {});
        const newRow: DataRow = headers.reduce((acc, header) => {
            acc[header] = '';
            return acc;
        }, {} as DataRow);

        setData([...data, newRow]);
    };

    const handleSaveChanges = async () => {
        try {
            const currentTime = new Date().toISOString();
            const dataWithTimestamps = data.map((row) => ({
                ...row,
                created_at: row.created_at || currentTime,
                updated_at: currentTime,
            }));

            await axios.post(updateEndpoints[field], { data: dataWithTimestamps });
            setModalContent({ title: 'Éxito', message: 'Datos actualizados correctamente', success: true });
            setModalOpen(true);
        } catch (error) {
            console.error(`Error updating data:`, error);
            setModalContent({ title: 'Error', message: 'Error actualizando datos', success: false });
            setModalOpen(true);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const renderPreview = (data: DataRow[]) => {
        if (data.length === 0) return <p>No hay datos para mostrar.</p>;

        const headers = Object.keys(data[0]);

        return (
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="px-4 py-2 border">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((header, colIndex) => (
                                <td key={colIndex} className="px-4 py-2 border">
                                    <input
                                        type="text"
                                        value={row[header]}
                                        onChange={(e) => handleInputChange(e, rowIndex, header)}
                                        className="w-full px-2 py-1 border"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Vista Previa de {field}</h1>
            {isLoading ? (
                <p>Cargando datos...</p>
            ) : (
                renderPreview(data)
            )}
            <button
                onClick={handleAddRow}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Agregar Fila
            </button>
            <button
                onClick={handleSaveChanges}
                className="mt-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Guardar Cambios
            </button>
            <button
                onClick={() => navigate(-1)}
                className="mt-4 ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
                Regresar
            </button>
            <ModalComponent
                isOpen={modalOpen}
                onRequestClose={closeModal}
                title={modalContent.title}
                message={modalContent.message}
                success={modalContent.success}
            />
        </div>
    );
};

export default VistaPreviaArchivo;
