import React, { useState, useEffect } from 'react';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal';

interface Configuracion {
    id?: number;
    dias_max_edicion: number;
    dias_max_eliminacion: number;
    valor_prioridad_alta: number;
    valor_prioridad_media: number;
    valor_prioridad_baja: number;
    vigencia: boolean;
    created_at: string;
    terminos_condiciones?: string;
    gratis_ofer: number;
    gratis_d: number;
    estandar_ofer: number;
    estandar_d: number;
    premium_ofer: number;
    premiun_d: number;
    u_ofer: number;
    u_d: number;
}

const ConfiguracionComponent = () => {
    const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
    const [form, setForm] = useState<Configuracion>({
        dias_max_edicion: 1,
        dias_max_eliminacion: 1,
        valor_prioridad_alta: 1,
        valor_prioridad_media: 1,
        valor_prioridad_baja: 1,
        vigencia: true,
        created_at: '',
        terminos_condiciones: '',
        gratis_ofer: 3,
        gratis_d: 1,
        estandar_ofer: 10,
        estandar_d: 5,
        premium_ofer: 50,
        premiun_d: 0,
        u_ofer: 0,
        u_d: 0,
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });
    const [showForm, setShowForm] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsText, setTermsText] = useState('');

    useEffect(() => {
        fetchConfiguraciones();
    }, []);

    const fetchConfiguraciones = async () => {
        try {
            const response = await axios.get('/configuraciones');
            setConfiguraciones(response.data);
        } catch (error) {
            console.error('Error fetching configuraciones:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: name === "vigencia" ? value === "true" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalContent({ title: 'Cargando...', message: `Guardando configuración...`, success: false });
        setModalOpen(true);

        try {
            const response = await axios.post('/configuraciones', form);
            setModalContent({ title: 'Éxito', message: `Configuración guardada correctamente`, success: true });
            fetchConfiguraciones(); // Refresh the list of configuraciones
            console.log(response);
        } catch (error) {
            console.error('Error guardando configuración:', error);
            setModalContent({ title: 'Error', message: `Error guardando configuración`, success: false });
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleActivate = async (id: number) => {
        setModalContent({ title: 'Cargando...', message: `Activando configuración...`, success: false });
        setModalOpen(true);
        try {
            await axios.post(`/configuraciones/${id}/activate`);
            setModalContent({ title: 'Éxito', message: `Configuración activada correctamente`, success: true });
            fetchConfiguraciones(); // Refresh the list of configuraciones
        } catch (error) {
            console.error('Error activando configuración:', error);
            setModalContent({ title: 'Error', message: `Error activando configuración`, success: false });
        }
    };

    const handleShowTerms = (terms: string) => {
        setTermsText(terms || 'No terms available');
        setShowTermsModal(true);
    };

    const handleCloseTermsModal = () => {
        setShowTermsModal(false);
    };


    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de configuración</h1></center>
            <p> En esta sección se maneja la configuración básica del sistema en las ofertas, la configuración en vigencia es la que se encuentra actualmente operando en el sistema</p>
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">CONFIGURACIÓNES ESTABLECIDAS</h1>
            {/* Mensaje de aviso mejorado */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4">
                <div className="flex items-center">
                    <svg
                        className="h-5 w-5 text-yellow-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12A9 9 0 1112 3a9 9 0 019 9z"
                        />
                    </svg>
                    <h1 className="text-xs font-semibold">
                        (Solo se puede mantener una configuracion activa)
                    </h1>
                </div>
            </div>
            <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">

                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vigencia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Días Máx Edición
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Días Máx Eliminación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Prioridad Alta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Prioridad Media
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Prioridad Baja
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Gratis Ofertas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Gratis Ofertas Destacadas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Estándar Ofertas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Estándar Ofertas Destacadas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Premium Ofertas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Premium Ofertas Destacadas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Ultimate Ofertas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan Ultimate Ofertas Destacadas Máximas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha de creación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {configuraciones.map((config, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.vigencia ? 'Sí' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.dias_max_edicion}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.dias_max_eliminacion}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.valor_prioridad_alta}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.valor_prioridad_media}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.valor_prioridad_baja}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.gratis_ofer == 0 ? 'Ilimitada' : config.gratis_ofer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.gratis_d == 0 ? 'Ilimitada' : config.gratis_d}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.estandar_ofer == 0 ? 'Ilimitada' : config.estandar_ofer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.estandar_d == 0 ? 'Ilimitada' : config.estandar_d}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.premium_ofer == 0 ? 'Ilimitada' : config.premium_ofer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.premiun_d == 0 ? 'Ilimitada' : config.premiun_d}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.u_ofer == 0 ? 'Ilimitada' : config.u_ofer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {config.u_d == 0 ? 'Ilimitada' : config.u_d}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(config.created_at).toLocaleString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {!config.vigencia && (
                                        <button
                                            onClick={() => handleActivate(config.id!)}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Activar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleShowTerms(config.terminos_condiciones || 'No terms available')}
                                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Mostrar Términos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr className="my-4" />
            <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Nueva Configuración
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-300 rounded shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-2">Nueva Configuración</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Días Máx Edición:</label>
                        <input
                            type="number"
                            name="dias_max_edicion"
                            value={form.dias_max_edicion}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Días Máx Eliminación:</label>
                        <input
                            type="number"
                            name="dias_max_eliminacion"
                            value={form.dias_max_eliminacion}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Valor Prioridad Alta:</label>
                        <input
                            type="number"
                            name="valor_prioridad_alta"
                            value={form.valor_prioridad_alta}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Valor Prioridad Media:</label>
                        <input
                            type="number"
                            name="valor_prioridad_media"
                            value={form.valor_prioridad_media}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Valor Prioridad Baja:</label>
                        <input
                            type="number"
                            name="valor_prioridad_baja"
                            value={form.valor_prioridad_baja}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-4">


                        <label className="block text-sm font-medium text-gray-700">Términos y Condiciones:</label>

                        <textarea
                            name="terminos_condiciones"
                            value={form.terminos_condiciones}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            rows={10}
                        />
                    </div>
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4">
                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 text-yellow-500 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12A9 9 0 1112 3a9 9 0 019 9z"
                                />
                            </svg>
                            <h1 className="text-xs font-semibold">
                                (Al ingresar el valor "0" se entiende como número ilimatado en el caso de planes)
                            </h1>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Gratis máximo ofertas:</label>
                        <input
                            type="number"
                            name="gratis_ofer"
                            value={form.gratis_ofer}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Gratis máximo destacadas:</label>
                        <input
                            type="number"
                            name="gratis_d"
                            value={form.gratis_d}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Estándar máximo ofertas:</label>
                        <input
                            type="number"
                            name="estandar_ofer"
                            value={form.estandar_ofer}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Estándar máximo destacadas:</label>
                        <input
                            type="number"
                            name="estandar_d"
                            value={form.estandar_d}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Premium máximo ofertas:</label>
                        <input
                            type="number"
                            name="premium_ofer"
                            value={form.premium_ofer}
                            min="1"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Premium máximo destacadas:</label>
                        <input
                            type="number"
                            name="premiun_d"
                            value={form.premiun_d}
                            min="0"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Ultimate máximo ofertas:</label>
                        <input
                            type="number"
                            name="u_ofer"
                            value={form.u_ofer}
                            min="0"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Plan Ultimate máximo destacadas:</label>
                        <input
                            type="number"
                            name="u_d"
                            value={form.u_d}
                            min="0"
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </form>
            )}

            <Modal show={modalOpen} onClose={closeModal} title={modalContent.title} success={modalContent.success}>
                <p>{modalContent.message}</p>
            </Modal>

            <Modal show={showTermsModal} onClose={handleCloseTermsModal} title="Términos y Condiciones" success={false}>
                <div className="p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{termsText}</pre>
                </div>
            </Modal>
        </div>
    );
};

export default ConfiguracionComponent;
