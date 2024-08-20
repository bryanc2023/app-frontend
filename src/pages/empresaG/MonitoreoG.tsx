import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import axios from '../../services/axios';
import { FiActivity } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
interface Area {
    id: number;
    nombre_area: string;
}

interface Oferta {
    month: number;
    year: number;
    total: number;
}

interface Usuario {
    month: number;
    year: number;
    total: number;
}

interface Postulacion {
    month: number;
    year: number;
    total: number;
}

const Estadisticas: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [areas, setAreas] = useState<Area[]>([]);
    const [barData, setBarData] = useState({ labels: [] as string[], datasets: [] as any[] });
    const [lineData, setLineData] = useState({ labels: [] as string[], datasets: [] as any[] });
    const [horizontalBarData, setHorizontalBarData] = useState({ labels: [] as string[], datasets: [] as any[] });
    const [areaData, setAreaData] = useState({ labels: [] as string[], datasets: [] as any[] });
    const [genderData, setGenderData] = useState({ labels: [] as string[], datasets: [] as any[] });
    const [provinces, setProvinces] = useState<string[]>([]);
    const [cantons, setCantons] = useState<string[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCanton, setSelectedCanton] = useState<string>('');
    const [ubicacionData, setUbicacionData] = useState({ labels: [] as string[], datasets: [] as any[] });

    const [summary, setSummary] = useState({
        totalOfertas: 0,
        totalUsuarios: 0,
        totalPostulaciones: 0,
        detallesOfertas: [] as Oferta[],
        detallesUsuarios: [] as Usuario[],
        detallesPostulaciones: [] as Postulacion[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('ubicaciones');
                setProvinces(response.data.provinces);
                setCantons(response.data.cantons);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchCantons = async () => {
            if (selectedProvince) {
                try {
                    const response = await axios.get(`ubicaciones/cantones/${selectedProvince}`);
                    setCantons(response.data);
                } catch (error) {
                    console.error('Error fetching cantons:', error);
                }
            }
        };

        fetchCantons();
    }, [selectedProvince]);

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);
        setSelectedCanton('');
    };

    const handleCantonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCanton(event.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchOfertasPorMes();
            await fetchUsuariosRegistradosPorMes();
            await fetchPostulacionesPorMes();
            await fetchAreas();
        };

        fetchData();
    }, [selectedYear, selectedArea]);

    const fetchAreas = async () => {
        try {
            const response = await axios.get('areas');
            setAreas(response.data.areas);
        } catch (error) {
            console.error('Error fetching areas', error);
        }
    };

    const fetchOfertasPorMes = async () => {
        try {
            const response = await axios.get(`/ofertas-por-mes?id_empresa=1&year=${selectedYear}`);
            const ofertas: Oferta[] = response.data;

            const labels = ofertas.map((oferta: Oferta) => `${monthNames[oferta.month - 1]} ${oferta.year}`);
            const data = ofertas.map((oferta: Oferta) => oferta.total);
            const totalOfertas = data.reduce((acc: number, curr: number) => acc + curr, 0);

            const sortedData = labels.map((label, index) => ({ label, data: data[index] }))
                .sort((a, b) => {
                    const [aMonth, aYear] = a.label.split(' ');
                    const [bMonth, bYear] = b.label.split(' ');
                    return new Date(parseInt(aYear), monthNames.indexOf(aMonth)).getTime() - new Date(parseInt(bYear), monthNames.indexOf(bMonth)).getTime();
                });

            setBarData({
                labels: sortedData.map(item => item.label),
                datasets: [
                    {
                        label: 'Ofertas Publicadas',
                        data: sortedData.map(item => item.data),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setSummary(prev => ({ ...prev, totalOfertas, detallesOfertas: ofertas }));
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const fetchUsuariosRegistradosPorMes = async () => {
        try {
            const response = await axios.get(`/usuarios-registrados-por-mes?year=${selectedYear}`);
            const usuarios: Usuario[] = response.data;

            const labels = usuarios.map((usuario: Usuario) => `${monthNames[usuario.month - 1]} ${usuario.year}`);
            const data = usuarios.map((usuario: Usuario) => usuario.total);
            const totalUsuarios = data.reduce((acc: number, curr: number) => acc + curr, 0);

            const sortedData = labels.map((label, index) => ({ label, data: data[index] }))
                .sort((a, b) => {
                    const [aMonth, aYear] = a.label.split(' ');
                    const [bMonth, bYear] = b.label.split(' ');
                    return new Date(parseInt(aYear), monthNames.indexOf(aMonth)).getTime() - new Date(parseInt(bYear), monthNames.indexOf(bMonth)).getTime();
                });

            setLineData({
                labels: sortedData.map(item => item.label),
                datasets: [
                    {
                        label: 'Usuarios Registrados',
                        data: sortedData.map(item => item.data),
                        fill: false,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                    },
                ],
            });

            setSummary(prev => ({ ...prev, totalUsuarios, detallesUsuarios: usuarios }));
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const fetchPostulacionesPorMes = async () => {
        try {
            const response = await axios.get(`/postulaciones-por-mes?year=${selectedYear}`);
            const postulaciones: Postulacion[] = response.data;

            const labels = postulaciones.map((postulacion: Postulacion) => `${monthNames[postulacion.month - 1]} ${postulacion.year}`);
            const data = postulaciones.map((postulacion: Postulacion) => postulacion.total);
            const totalPostulaciones = data.reduce((acc: number, curr: number) => acc + curr, 0);

            const sortedData = labels.map((label, index) => ({ label, data: data[index] }))
                .sort((a, b) => {
                    const [aMonth, aYear] = a.label.split(' ');
                    const [bMonth, bYear] = b.label.split(' ');
                    return new Date(parseInt(aYear), monthNames.indexOf(aMonth)).getTime() - new Date(parseInt(bYear), monthNames.indexOf(bMonth)).getTime();
                });

            setHorizontalBarData({
                labels: sortedData.map(item => item.label),
                datasets: [
                    {
                        label: 'Postulaciones Realizadas',
                        data: sortedData.map(item => item.data),
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setSummary(prev => ({ ...prev, totalPostulaciones, detallesPostulaciones: postulaciones }));
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        const fetchPostulantesPorGenero = async () => {
            try {
                const response = await axios.get('/postulantes-por-genero', {
                    params: { area: selectedArea }
                });
                const data = response.data;

                setGenderData({
                    labels: ['Masculino', 'Femenino', 'Otro'],
                    datasets: [
                        {
                            data: [data.masculino, data.femenino, data.otro],
                            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                            hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };

        const fetchPostulacionesOfertasPorArea = async () => {
            try {
                const response = await axios.get('/postulantes-por-area', {
                    params: { area: selectedArea }
                });
                const data = response.data;

                setAreaData({
                    labels: ['Postulaciones', 'Ofertas'],
                    datasets: [
                        {
                            label: 'Cantidad',
                            data: [data.postulaciones, data.ofertas],
                            backgroundColor: ['#36A2EB', '#FF6384'],
                            borderColor: ['#36A2EB', '#FF6384'],
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };

        if (selectedArea) {
            fetchPostulantesPorGenero();
            fetchPostulacionesOfertasPorArea();
        }
    }, [selectedArea]);

    useEffect(() => {
        const fetchPostulacionesOfertasPorUbicacion = async () => {
            try {
                const response2 = await axios.get(`ubicaciones/${selectedProvince}/${selectedCanton}`);
                const ubicacionId = response2.data.ubicacion_id;
                const response = await axios.get('/postulantes-por-ubicacion', {
                    params: { ubicacion: ubicacionId }
                });
                const data = response.data;

                setUbicacionData({
                    labels: ['Postulantes', 'Ofertas'],
                    datasets: [
                        {
                            label: 'Cantidad',
                            data: [data.postulaciones, data.ofertas],
                            backgroundColor: ['#36A2EB', '#FF6384'],
                            borderColor: ['#36A2EB', '#FF6384'],
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };

        if (selectedCanton) {
            fetchPostulacionesOfertasPorUbicacion();
        }
    }, [selectedCanton]);

    return (
        <div className="mb-4 text-center max-w-screen-lg mx-auto">
                <h1 className="text-3xl font-bold mb-4 flex justify-center items-center text-orange-500 ml-2">
      MONITOREO Y CONTROL DE LA APLICACIÓN WEB 
                    <FiActivity className="text-orange-500 ml-2" />
                </h1>
            
            <div className="mb-4">
                <center><p>En esta sección se muestra las estadísticas de la aplicación por año/mes de manera general:</p></center>
                <label className="block text-sm font-bold mb-2" htmlFor="yearSelect">Seleccione el Año:</label>
                <select
                    id="yearSelect"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="block w-full p-2 border rounded"
                >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="selectArea" className="block text-sm font-bold mb-2">Selecciona el Área:</label>
                <select
                    id="selectArea"
                    className="px-2 py-1 border border-gray-300 rounded w-full"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                >
                    <option value="">Todas</option>
                    {areas.map(area => (
                        <option key={area.id} value={area.id}>
                            {area.nombre_area}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="province" className="block text-sm font-bold mb-2">Provincia:</label>
                <select
                    id="province"
                    className="px-2 py-1 border border-gray-300 rounded w-full"
                    onChange={handleProvinceChange}
                >
                    <option value="">Seleccione</option>
                    {provinces.map((province, index) => (
                        <option key={index} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="canton" className="block text-sm font-bold mb-2">Cantón:</label>
                <select
                    id="canton"
                    className="px-2 py-1 border border-gray-300 rounded w-full"
                    disabled={!selectedProvince}
                    onChange={handleCantonChange}
                >
                    <option value="">Seleccione</option>
                    {cantons.map((canton, index) => (
                        <option key={index} value={canton}>
                            {canton}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Ofertas Publicadas por Mes</h3>
                <Bar data={barData} />
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Usuarios Registrados por Mes</h3>
                <Line data={lineData} />
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Postulaciones Realizadas por Mes</h3>
                <Bar data={horizontalBarData} options={{ indexAxis: 'y' }} />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Resumen</h3>
                <p><strong>Total de Ofertas Publicadas:</strong> {summary.totalOfertas}</p>
                <p><strong>Total de Usuarios Registrados:</strong> {summary.totalUsuarios}</p>
                <p><strong>Total de Postulaciones Realizadas:</strong> {summary.totalPostulaciones}</p>
                <table className="min-w-full bg-white border border-gray-200 mt-4">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b">Mes/Año</th>
                            <th className="px-4 py-2 border-b">Total Ofertas</th>
                            <th className="px-4 py-2 border-b">Total Usuarios</th>
                            <th className="px-4 py-2 border-b">Total Postulaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.detallesOfertas.map((oferta, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{`${monthNames[oferta.month - 1]} ${oferta.year}`}</td>
                                <td className="border px-4 py-2">{oferta.total}</td>
                                <td className="border px-4 py-2">{summary.detallesUsuarios[index] ? summary.detallesUsuarios[index].total : 'N/A'}</td>
                                <td className="border px-4 py-2">{summary.detallesPostulaciones[index] ? summary.detallesPostulaciones[index].total : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <hr className="my-4" />
                <div className="bg-white p-4 rounded shadow mb-8">
                    <center>
                        <p className="mb-4">En esta sección puedes visualizar datos puntuales de áreas y ubicaciones de ofertas, postulaciones y postulantes:</p>
                    </center>
                    {selectedArea && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Postulaciones y Ofertas en el Área determinada</h3>
                                <Bar data={areaData} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Postulantes y Ofertas en la Ubicación determinada</h3>
                                <Bar data={ubicacionData} />
                            </div>
                        </div>
                    )}
                    {selectedCanton && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Distribución de Postulantes por Género</h3>
                            <div className="w-1/2 mx-auto">
                                <Pie data={genderData} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Estadisticas;
