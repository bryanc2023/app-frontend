import { useState, useEffect } from 'react';
import axios from "../../services/axios";
import Modal from '../../components/Admin/CargaModal';
import Swal from 'sweetalert2';

interface Oferta {
    id_oferta: number;
    estado: string;
    cargo: string;
    areas: {
        id: number;
        nombre_area: string;
    };
    empresa: {
        id_empresa: string,
        nombre_comercial: string;
        logo: string;
        id_ubicacion: number;
        ubicacion: {
            provincia: string;
            canton: string;
        };
        sector: {
            sector: string;
            division: string;
        };
    };
    fecha_max_pos: string;
    fecha_publi: string;
    n_mostrar_empresa: number;
    modalidad: string;
    carga_horaria: string;
    experiencia: number;
    funciones: string;
    objetivo_cargo: string;
    detalles_adicionales: string;
    criterios: Criterio[];
    expe: {
        titulo: string;
        nivel_educacion: string;
        campo_amplio: string;
        pivot: {
            titulo_per2: string | null;
        };
    }[];
    sueldo: number;
    n_mostrar_sueldo: number;
    soli_sueldo: number;
    correo_contacto: string;
    numero_contacto: string;
    preguntas: Pregunta[];
    comisiones: number | null;
    horasExtras: number | null;
    viaticos: number | null;
    comentariosComisiones: string | null;
    comentariosHorasExtras: string | null;
    comentariosViaticos: string | null;
    exp_m: boolean;
    dest: boolean;
    ciudad: string | null;
    empre_p: string | null;
    sector_p: string | null;
}

interface Pregunta {
    id: number;
    id_oferta: number;
    pregunta: string;
}
interface Criterio {
    criterio: string;
    pivot: {
        valor: string;
    };
}

const GestionOfertas = () => {

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: false });

    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [filteredOfertas, setFilteredOfertas] = useState<Oferta[]>([]);

    // Estados para los filtros
    const [areaFilter, setAreaFilter] = useState<string>('');
    const [sectorFilter, setSectorFilter] = useState<string>('');
    const [fechaFilter, setFechaFilter] = useState<string>('');
    const [fechaCambioMasivo, setFechaCambioMasivo] = useState('');

    useEffect(() => {
        fetchOfertas();
    }, []);

    useEffect(() => {
        handleFilterChange();
    }, [areaFilter, sectorFilter, fechaFilter]);

    const fetchOfertas = async () => {
        try {
            const response = await axios.get('ofertasAd');
            if (response.data.ofertas) {
                setOfertas(response.data.ofertas);
                setFilteredOfertas(response.data.ofertas);  // Mostrar todas inicialmente
            }
        } catch (error) {
            console.error('Error fetching ofertas:', error);
        }
    };

    const handleFilterChange = () => {
        const filtered = ofertas.filter((oferta) => {
            const matchesArea = areaFilter ? oferta.areas.nombre_area === areaFilter : true;
            const matchesSector = sectorFilter ? oferta.empresa.sector.division === sectorFilter : true;
            const matchesDate = fechaFilter ? new Date(oferta.fecha_publi).toISOString().slice(0, 10) === fechaFilter : true;
            return matchesArea && matchesSector && matchesDate;
        });
        setFilteredOfertas(filtered);
    };

    const ocultarOferta = async (id_oferta: number) => {
        try {
            const response = await axios.put(`/ofertas/${id_oferta}/ocultar`);
            setModalContent({
                title: 'Estado actualizado',
                message: `Esta oferta se ha ocultado de la vista de la aplicación`,
                success: true
            });
            setModalOpen(true);

            await fetchOfertas(); // Recargar las ofertas
        } catch (error) {
            setModalContent({
                title: 'Error',
                message: `Ha ocurrido un error`,
                success: true
            });
            setModalOpen(true);
        }
    };

    const eliminarOferta = async (id_oferta: number) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¡Esta acción no se puede deshacer!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
            });

            if (result.isConfirmed) {
                await axios.delete(`/oferta/${id_oferta}`);
                Swal.fire('Eliminada', 'La oferta ha sido eliminada.', 'success');
                fetchOfertas(); // Recargar las ofertas
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar la oferta.', 'error');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const handleCambioMasivo = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esta acción ocultará todas las ofertas publicadas antes de la fecha seleccionada!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, realizar cambio',
            cancelButtonText: 'Cancelar',
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axios.put('/ofertas/cambio-masivo', { fecha: fechaCambioMasivo });
                if (response.data) {
                    const { message, ofertas_actualizadas } = response.data;
                    Swal.fire('Cambio realizado', `${message} ${ofertas_actualizadas} ofertas ocultadas con éxito.`, 'success');
                    await fetchOfertas(); // Recargar ofertas después del cambio
                } else {
                    Swal.fire('Error', 'No se pudo realizar el cambio.', 'error');
                }
            } catch (error) {
                console.error('Error en cambio masivo:', error);
                Swal.fire('Error', 'Ha ocurrido un error en la operación.', 'error');
            }
        }
    };
    
    const uniqueAreas = Array.from(new Set(ofertas.map(oferta => oferta.areas.nombre_area)));
    const uniqueSectors = Array.from(new Set(ofertas.map(oferta => oferta.empresa.sector.division)));

    return (
        <div className="p-4">
            <center><h1 className="text-2xl font-bold mb-4">Gestión de Ofertas</h1></center>
            <p>En esta sección se maneja la gestión de ofertas de la aplicación.</p>
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">Cambio masivo de ofertas</h1>
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
                        (Al realizar esta acción se ocultarán las ofertas hasta la fecha que se ingrese, precaución)
                    </h1>
                </div>
            </div>
            <div className="mb-4">
            <label htmlFor="fechaCambioMasivo" className="block mb-2 text-sm font-medium text-gray-700">Seleccione la fecha hasta la que se ocultaran las ofertas (según su fecha de publicación):</label>
            <input
                type="date"
                id="fechaCambioMasivo"
                className="block w-full p-2 border rounded-md"
                value={fechaCambioMasivo}
                onChange={(e) => setFechaCambioMasivo(e.target.value)}
            />
        </div>

        <button
            className="px-4 py-2 text-white bg-orange-500 rounded"
            onClick={handleCambioMasivo}
        >
            Cambio Masivo
        </button>
            <hr className="my-4" />
            <h1 className="text-xl text-orange-400 mb-4">Ofertas</h1>
            <hr className="my-4" />
            {/* Filtros */}
            <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="area" className="block mb-2 text-sm font-medium text-gray-700">Filtrar por Área</label>
                    <select
                        id="area"
                        className="block w-full p-2 border rounded-md"
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {uniqueAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="sector" className="block mb-2 text-sm font-medium text-gray-700">Filtrar por Sector</label>
                    <select
                        id="sector"
                        className="block w-full p-2 border rounded-md"
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {uniqueSectors.map((sector) => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="fecha" className="block mb-2 text-sm font-medium text-gray-700">Filtrar por Fecha de Publicación</label>
                    <input
                        type="date"
                        id="fecha"
                        className="block w-full p-2 border rounded-md"
                        value={fechaFilter}
                        onChange={(e) => setFechaFilter(e.target.value)}
                    />
                </div>
            </div>
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
                        (Las acciones realizadas en las ofertas son irreversibles,precaución)
                    </h1>
                </div>
            </div>

            <div className="overflow-x-auto">


                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área de la oferta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa que oferta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector de la empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha publicacion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha maxima de postulacion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOfertas.map((oferta, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{oferta.cargo}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{oferta.areas.nombre_area}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{oferta.empresa.nombre_comercial}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{oferta.empresa.sector.division}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(oferta.fecha_publi).toLocaleString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(oferta.fecha_max_pos).toLocaleString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{oferta.estado}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button
                                        className="block w-full px-4 py-2 mt-2 text-white bg-orange-500 rounded"
                                        onClick={() => ocultarOferta(oferta.id_oferta)}
                                    >
                                        Ocultar oferta
                                    </button>
                                    <button
                                        className="block w-full px-4 py-2 mt-2 text-white bg-red-500 rounded"
                                        onClick={() => eliminarOferta(oferta.id_oferta)}
                                    >
                                        Eliminar oferta
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr className="my-4" />

            <Modal show={modalOpen} onClose={closeModal} title={modalContent.title} success={modalContent.success}>
                <p>{modalContent.message}</p>
            </Modal>
        </div>
    );
};

export default GestionOfertas;
