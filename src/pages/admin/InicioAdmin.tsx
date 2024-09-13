import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal'; 

interface UploadFields {
    ubicacion: string;
    titulo: string;
    sector: string;
    area: string;
    criterio: string;
    idioma: string;
    competencia: string;
    habilidad: string;
}

const uploadEndpoints: UploadFields = {
    ubicacion: 'uploadUbi',
    titulo: 'uploadTit',
    sector: 'uploadSec',
    area: 'uploadA',
    criterio: 'uploadC',
    idioma: 'uploadI',
    competencia: 'uploadCom',
    habilidad: 'uploadH',
};

const fields = [
    { name: 'ubicacion', label: 'Subir Ubicación' },
    { name: 'titulo', label: 'Subir Títulos' },
    { name: 'sector', label: 'Subir Sector Económico' },
    { name: 'area', label: 'Subir Áreas' },
    { name: 'criterio', label: 'Subir Criterios' },
    { name: 'idioma', label: 'Subir Idiomas' },
    { name: 'competencia', label: 'Subir Competencias' },
    { name: 'habilidad', label: 'Subir Habilidades' },
];

function InicioAdmin() {
    const navigate = useNavigate();
    const [files, setFiles] = useState<{ [K in keyof UploadFields]: File | null }>({
        ubicacion: null,
        titulo: null,
        sector: null,
        area: null,
        criterio: null,
        idioma: null,
        competencia: null,
        habilidad: null,
    });
    const [loading, setLoading] = useState<{ [K in keyof UploadFields]: boolean }>({
        ubicacion: false,
        titulo: false,
        sector: false,
        area: false,
        criterio: false,
        idioma: false,
        competencia: false,
        habilidad: false,
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UploadFields) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFiles({ ...files, [field]: file });
    };

    const handlePreview = (field: keyof UploadFields) => {
        navigate('/vista-previa', { state: { field } });
    };

    const handleSubmit = async (e: React.FormEvent, field: keyof UploadFields) => {
        e.preventDefault();
        const file = files[field];
        if (file) {
            const data = new FormData();
            data.append('file', file);

            setLoading({ ...loading, [field]: true });
            setModalContent({ title: 'Cargando...', message: `Subiendo ${field}...`, success: false });
            setModalOpen(true);

            try {
                const response = await axios.post(uploadEndpoints[field], data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                setModalContent({ title: 'Éxito', message: `${field} subido correctamente`, success: true });
            } catch (error) {
                console.error(`Error uploading ${field}:`, error);
                setModalContent({ title: 'Error', message: `Error subiendo ${field}`, success: false });
            } finally {
                setLoading({ ...loading, [field]: false });
            }
        } else {
            setModalContent({ title: 'Advertencia', message: 'Seleccione un archivo primero', success: false });
            setModalOpen(true);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de tablas satélites</h1></center>
            <p> En esta sección se maneja los datos de las tablas satélites de la aplicación esenciales para el funcionamiento correcto de la aplicación web</p>
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">TABLAS SATÉLITES</h1>
            {fields.map(({ name, label }) => (
                <form key={name} onSubmit={(e) => handleSubmit(e, name as keyof UploadFields)} className="mb-4 p-4 border border-gray-300 rounded shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-2">{label}</h2>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, name as keyof UploadFields)} 
                        accept=".xlsx, .xls" 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="flex space-x-4 mt-2">
                        <button 
                            type="button" 
                            onClick={() => handlePreview(name as keyof UploadFields)} 
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Vista Previa
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading[name as keyof UploadFields]} // Disable button while loading
                        >
                            {loading[name as keyof UploadFields] ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Cargando...
                                </div>
                            ) : 'Subir'}
                        </button>
                    </div>
                </form>
            ))}
            <Modal show={modalOpen} onClose={closeModal} title={modalContent.title} success={modalContent.success}>
                <p>{modalContent.message}</p>
            </Modal>
        </div>
    );
}

export default InicioAdmin;
