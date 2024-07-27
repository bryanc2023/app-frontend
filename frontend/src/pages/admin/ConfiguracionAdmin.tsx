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
}

const Configuracion = () => {
    const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
    const [form, setForm] = useState<Configuracion>({
        dias_max_edicion: 0,
        dias_max_eliminacion: 0,
        valor_prioridad_alta: 0,
        valor_prioridad_media: 0,
        valor_prioridad_baja: 0,
        vigencia: true,
        created_at: '',
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });
    const [showForm, setShowForm] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: name === "vigencia" ? value === "true" : Number(value),
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
            console.log(response, form);
        } catch (error) {
            console.error('Error guardando configuración:', error);
            setModalContent({ title: 'Error', message: `Error guardando configuración`, success: false });
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
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

    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de configuración</h1></center>
            <p> En esta sección se maneja la configuración básica del sistema en las ofertas, la configuración en vigencia es la que se encuentra actualmente operando en el sistema</p>
            <div className="overflow-x-auto">
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">CONFIGURACIÓNES ESTABLECIDAS</h1>
  <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
    <thead className="bg-gray-50">
      <tr>
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
          Vigencia
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
            {config.vigencia ? 'Sí' : 'No'}
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
        </div>
    );
};

export default Configuracion;
