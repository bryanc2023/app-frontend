import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FaLinkedin, FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6'; // Importa el nuevo ícono

interface AddRedModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    reloadProfile: () => void;
    idEmpresa: number;
}

const AddRedModal: React.FC<AddRedModalProps> = ({ isOpen, onRequestClose, reloadProfile, idEmpresa }) => {
    const [nombreRed, setNombreRed] = useState('');
    const [enlace, setEnlace] = useState('');
    const [idEmpresaState, setIdEmpresaState] = useState<number | null>(idEmpresa); // Estado para almacenar el id_empresa
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (user) {
                    const response = await axios.get(`/empresaById/${user.id}`);
                    const empresaData = response.data;
                    setIdEmpresaState(empresaData.id_empresa); // Guardar el id_empresa en el estado
                   
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/empresa-red', {
                id_empresa: idEmpresaState,
                nombre_red: nombreRed,
                enlace: enlace,
            });
            reloadProfile(); // Recargar los datos del perfil
            onRequestClose(); // Cerrar el modal
        } catch (error) {
            console.error('Error al agregar la red:', error);
        }
    };

    const redes = [
        { nombre: 'LinkedIn', icono: <FaLinkedin className="text-blue-600 inline" /> },
        { nombre: 'Instagram', icono: <FaInstagram className="text-pink-600 inline" /> },
        { nombre: 'Facebook', icono: <FaFacebook className="text-blue-800 inline" /> },
        { nombre: 'X', icono: <FaXTwitter className="text-blue-400 inline" /> }, // Reemplaza Twitter por X
    ];

    const handleRedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRed = redes.find((red) => red.nombre === e.target.value);
        setNombreRed(selectedRed ? selectedRed.nombre : '');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Agregar Red Social"
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto my-20 relative"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
            <button onClick={onRequestClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
                &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Agregar Red Social</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Nombre de la Red</label>
                    <select
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        value={nombreRed}
                        onChange={handleRedChange}
                        required
                    >
                        <option value="" disabled>Seleccione una red social</option>
                        {redes.map((red) => (
                            <option key={red.nombre} value={red.nombre}>
                                {red.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                {nombreRed && (
                    <div className="flex items-center mt-2">
                        <span className="mr-2">Red Seleccionada:</span>
                        {redes.find((red) => red.nombre === nombreRed)?.icono}
                    </div>
                )}
                <div>
                    <label className="block text-gray-700">Enlace</label>
                    <input
                        type="url"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        value={enlace}
                        onChange={(e) => setEnlace(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
                    Agregar
                </button>
            </form>
        </Modal>
    );
};

export default AddRedModal;
