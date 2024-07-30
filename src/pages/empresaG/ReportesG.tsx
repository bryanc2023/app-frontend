import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../../services/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Modal from 'react-modal';

interface ReportData {
  id: number;
  name: string;
  email: string;
  created_at: string;
  ubicacion: string;
  empresa?: {
    nombre_comercial: string;
    sector: string;
    tamanio: string;
    ubicacion: string;
    ofertas: {
      cargo: string;
      num_postulantes: number;
    }[];
  };
  cargo?: string;
  sueldo?: number;
  objetivo_cargo?: string;
  nombre_comercial?: string;
  experiencia?: number;
  funciones?: string;
  carga_horaria?: string;
  modalidad?: string;
  estado?: string;
  genero?: string;
  estado_civil?: string;
  provincia?: string;
  canton?: string;
  num_postulaciones?: number;
  detalles_postulaciones?: { cargo: string }[];
  vigencia?: string;
}

const Reportes: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState('empresas');
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [useFilters, setUseFilters] = useState<boolean>(false);

  // Filtros adicionales para empresas
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cantons, setCantons] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCanton, setSelectedCanton] = useState<string>('');
  const [sectores, setSectores] = useState<string[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedTamanio, setSelectedTamanio] = useState<string>('');

  // Filtros adicionales para ofertas
  const [cargo, setCargo] = useState<string>('');
  const [experiencia, setExperiencia] = useState<string>('');
  const [cargaHoraria, setCargaHoraria] = useState<string>('');
  const [modalidad, setModalidad] = useState<string>('');
  const [estado, setEstado] = useState<string>('');

  // Filtros adicionales para postulantes
  const [selectedGenero, setSelectedGenero] = useState<string>('');
  const [selectedEstadoCivil, setSelectedEstadoCivil] = useState<string>('');

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

  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const response = await axios.get('sectores');
        setSectores(response.data.sectores);
      } catch (error) {
        console.error('Error fetching sectores:', error);
      }
    };

    fetchSectores();
  }, []);

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(event.target.value);
    setSelectedCanton('');
  };

  const handleCantonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCanton(event.target.value);
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(event.target.value);
  };

  const handleTamanioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTamanio(event.target.value);
  };

  const handleCargoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCargo(event.target.value);
  };

  const handleExperienciaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExperiencia(event.target.value);
  };

  const handleCargaHorariaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCargaHoraria(event.target.value);
  };

  const handleModalidadChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModalidad(event.target.value);
  };

  const handleEstadoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(event.target.value);
  };

  const handleGeneroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenero(event.target.value);
  };

  const handleEstadoCivilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEstadoCivil(event.target.value);
  };

  const fetchData = async () => {
    if (useFilters && (!startDate || !endDate || startDate > endDate)) {
      setError('Por favor, selecciona fechas válidas.');
      return;
    }
    try {
      setLoading(true);
      let params: any = {};
      if (useFilters) {
        params = {
          startDate: startDate?.toISOString().split('T')[0],
          endDate: endDate?.toISOString().split('T')[0],
        };
      }
      if (reportType === 'empresas') {
        params = {
          ...params,
          provincia: selectedProvince || undefined,
          canton: selectedCanton || undefined,
          sector: selectedSector || undefined,
          tamanio: selectedTamanio || undefined,
        };
      } else if (reportType === 'ofertas') {
        params = {
          ...params,
          cargo: cargo || undefined,
          experiencia: experiencia || undefined,
          carga_horaria: cargaHoraria || undefined,
          modalidad: modalidad || undefined,
          estado: estado || undefined,
        };
      } else if (reportType === 'postulantes') {
        params = {
          ...params,
          genero: selectedGenero || undefined,
          estadoCivil: selectedEstadoCivil || undefined,
          provincia: selectedProvince || undefined,
          canton: selectedCanton || undefined,
        };
      }
      const response = await axios.get(`/usuarios/${reportType}`, { params });
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setError('Error al obtener los datos del reporte');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, reportType, selectedProvince, selectedCanton, selectedSector, selectedTamanio, cargo, experiencia, cargaHoraria, modalidad, estado, selectedGenero, selectedEstadoCivil]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Proajob', 14, 16);
    doc.setFontSize(10);
    doc.text(`Reporte de ${reportType}`, 14, 22);

    let tableColumn: string[] = [];
    let tableRows: any[] = [];

    if (reportType === 'empresas') {
      tableColumn = ["Nombre", "Correo", "Fecha de Creación", "Nombre Comercial", "Sector", "Tamaño", "Ubicación", "Ofertas"];
      tableRows = data.map(item => [
        item.name,
        item.email,
        item.created_at,
        item.empresa?.nombre_comercial,
        item.empresa?.sector,
        item.empresa?.tamanio,
        item.empresa?.ubicacion,
        item.empresa?.ofertas.map(oferta => `${oferta.cargo} (Postulantes: ${oferta.num_postulantes})`).join(', ')
      ]);
    } else if (reportType === 'ofertas') {
      tableColumn = ["Cargo", "Sueldo", "Objetivo del Cargo", "Nombre de la Empresa", "Experiencia", "Funciones", "Carga Horaria", "Modalidad", "Estado"];
      tableRows = data.map(item => [
        item.cargo,
        item.sueldo,
        item.objetivo_cargo,
        item.nombre_comercial,
        item.experiencia,
        item.funciones,
        item.carga_horaria,
        item.modalidad,
        item.estado
      ]);
    } else if (reportType === 'postulantes') {
      tableColumn = ["Nombre", "Correo", "Fecha de Creación", "Número de Postulaciones", "Postulaciones", "Vigencia", "Género", "Estado Civil", "Ubicación"];
      tableRows = data.map(item => [
        item.name,
        item.email,
        item.created_at,
        item.num_postulaciones,
        item.detalles_postulaciones?.map((detalle: { cargo: string }) => detalle.cargo).join(', '),
        item.vigencia,
        item.genero,
        item.estado_civil,
        item.ubicacion
      ]);
    }

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save('reporte.pdf');
  };

  const previewPDF = async () => {
    const doc = new jsPDF();
    doc.text('Proajob', 14, 16);
    doc.setFontSize(10);
    doc.text(`Reporte de ${reportType}`, 14, 22);

    let tableColumn: string[] = [];
    let tableRows: any[] = [];

    if (reportType === 'empresas') {
      tableColumn = ["Nombre", "Correo", "Fecha de Creación", "Nombre Comercial", "Sector", "Tamaño", "Ubicación", "Ofertas"];
      tableRows = data.map(item => [
        item.name,
        item.email,
        item.created_at,
        item.empresa?.nombre_comercial,
        item.empresa?.sector,
        item.empresa?.tamanio,
        item.empresa?.ubicacion,
        item.empresa?.ofertas.map(oferta => `${oferta.cargo} (Postulantes: ${oferta.num_postulantes})`).join(', ')
      ]);
    } else if (reportType === 'ofertas') {
      tableColumn = ["Cargo", "Sueldo", "Objetivo del Cargo", "Nombre de la Empresa", "Experiencia", "Funciones", "Carga Horaria", "Modalidad", "Estado"];
      tableRows = data.map(item => [
        item.cargo,
        item.sueldo,
        item.objetivo_cargo,
        item.nombre_comercial,
        item.experiencia,
        item.funciones,
        item.carga_horaria,
        item.modalidad,
        item.estado
      ]);
    } else if (reportType === 'postulantes') {
      tableColumn = ["Nombre", "Correo", "Fecha de Creación", "Número de Postulaciones", "Postulaciones", "Vigencia", "Género", "Estado Civil", "Ubicación"];
      tableRows = data.map(item => [
        item.name,
        item.email,
        item.created_at,
        item.num_postulaciones,
        item.detalles_postulaciones?.map((detalle: { cargo: string }) => detalle.cargo).join(', '),
        item.vigencia,
        item.genero,
        item.estado_civil,
        item.ubicacion
      ]);
    }

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] }
    });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPreviewUrl(url);
    setIsModalOpen(true);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value);
    setPreviewUrl(null);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setPreviewUrl(null);
    if (date && !endDate) {
      setError('Selecciona la fecha de fin.');
    } else {
      setError(null);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setPreviewUrl(null);
    if (startDate && date && date < startDate) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
    } else {
      setError(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewUrl(null);
  };

  return (
    <div className="mb-4 text-center max-w-screen-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Generar Reportes</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
        <select
          value={reportType}
          onChange={handleReportTypeChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="postulantes">Postulantes</option>
          <option value="empresas">Empresas</option>
          <option value="ofertas">Ofertas</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <input
            type="checkbox"
            checked={useFilters}
            onChange={(e) => setUseFilters(e.target.checked)}
            className="mr-2"
          />
          Usar filtros
        </label>
      </div>
      {useFilters && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                dateFormat="yyyy/MM/dd"
              />
            </div>
          </div>
        </>
      )}
      {reportType === 'empresas' && useFilters && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                {provinces.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantón</label>
              <select
                value={selectedCanton}
                onChange={handleCantonChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                disabled={!selectedProvince}
              >
                <option value="">Seleccione</option>
                {cantons.map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={selectedSector}
                onChange={handleSectorChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                {sectores.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
              <select
                value={selectedTamanio}
                onChange={handleTamanioChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Microempresa">Microempresa</option>
                <option value="Pequeña">Pequeña</option>
                <option value="Mediana">Mediana</option>
                <option value="Grande">Grande</option>
              </select>
            </div>
          </div>
        </>
      )}
      {reportType === 'ofertas' && useFilters && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={handleCargoChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experiencia</label>
              <input
                type="text"
                value={experiencia}
                onChange={handleExperienciaChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carga Horaria</label>
              <select
                value={cargaHoraria}
                onChange={handleCargaHorariaChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Tiempo Parcial">Tiempo Parcial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
              <select
                value={modalidad}
                onChange={handleModalidadChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Hibrida">Hibrida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={estado}
                onChange={handleEstadoChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Culminada">Culminada</option>
                <option value="En espera">En espera</option>
              </select>
            </div>
          </div>
        </>
      )}
      {reportType === 'postulantes' && useFilters && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={selectedGenero}
                onChange={handleGeneroChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
              <select
                value={selectedEstadoCivil}
                onChange={handleEstadoCivilChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                <option value="Soltero">Soltero/a</option>
                <option value="Casado">Casado/a</option>
                <option value="Divorciado">Divorciado/a</option>
                <option value="Viudo">Viudo/a</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccione</option>
                {provinces.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantón</label>
              <select
                value={selectedCanton}
                onChange={handleCantonChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                disabled={!selectedProvince}
              >
                <option value="">Seleccione</option>
                {cantons.map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Generar Reporte
        </button>
      </div>
      <div>
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            {data.length === 0 ? (
              <p className="text-center text-gray-500">
                {reportType === 'postulantes' ? 'No se han encontrado postulantes registrados' : (reportType === 'empresas' ? 'No se han encontrado empresas registradas' : 'No se han encontrado ofertas registradas')}
              </p>
            ) : (
              <>
                <div id="reportTable" className="bg-white p-4 rounded-md shadow-md">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {reportType === 'ofertas' && (
                          <>
                            <th className="w-2/12 px-4 py-2">Cargo</th>
                            <th className="w-2/12 px-4 py-2">Sueldo</th>
                            <th className="w-2/12 px-4 py-2">Objetivo del Cargo</th>
                            <th className="w-2/12 px-4 py-2">Nombre de la Empresa</th>
                            <th className="w-2/12 px-4 py-2">Experiencia</th>
                            <th className="w-2/12 px-4 py-2">Funciones</th>
                            <th className="w-2/12 px-4 py-2">Carga Horaria</th>
                            <th className="w-2/12 px-4 py-2">Modalidad</th>
                            <th className="w-2/12 px-4 py-2">Estado</th>
                          </>
                        )}
                        {reportType === 'postulantes' && (
                          <>
                            <th className="w-2/12 px-4 py-2">Nombre</th>
                            <th className="w-2/12 px-4 py-2">Correo</th>
                            <th className="w-2/12 px-4 py-2">Fecha de Creación</th>
                            <th className="w-2/12 px-4 py-2">Número de Postulaciones</th>
                            <th className="w-2/12 px-4 py-2">Postulaciones</th>
                            <th className="w-2/12 px-4 py-2">Vigencia</th>
                            <th className="w-2/12 px-4 py-2">Género</th>
                            <th className="w-2/12 px-4 py-2">Estado Civil</th>
                            <th className="w-2/12 px-4 py-2">Ubicación</th>
                          </>
                        )}
                        {reportType === 'empresas' && (
                          <>
                            <th className="w-2/12 px-4 py-2">Nombre</th>
                            <th className="w-2/12 px-4 py-2">Correo</th>
                            <th className="w-2/12 px-4 py-2">Fecha de Creación</th>
                            <th className="w-2/12 px-4 py-2">Nombre Comercial</th>
                            <th className="w-2/12 px-4 py-2">Sector</th>
                            <th className="w-2/12 px-4 py-2">Tamaño</th>
                            <th className="w-2/12 px-4 py-2">Ubicación</th>
                            <th className="w-2/12 px-4 py-2">Ofertas</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.id}>
                          {reportType === 'ofertas' && (
                            <>
                              <td className="border px-4 py-2">{item.cargo}</td>
                              <td className="border px-4 py-2">{item.sueldo}</td>
                              <td className="border px-4 py-2">{item.objetivo_cargo}</td>
                              <td className="border px-4 py-2">{item.nombre_comercial}</td>
                              <td className="border px-4 py-2">{item.experiencia}</td>
                              <td className="border px-4 py-2">{item.funciones}</td>
                              <td className="border px-4 py-2">{item.carga_horaria}</td>
                              <td className="border px-4 py-2">{item.modalidad}</td>
                              <td className="border px-4 py-2">{item.estado}</td>
                            </>
                          )}
                          {reportType === 'postulantes' && (
                            <>
                              <td className="border px-4 py-2">{item.name}</td>
                              <td className="border px-4 py-2">{item.email}</td>
                              <td className="border px-4 py-2">{item.created_at}</td>
                              <td className="border px-4 py-2">{item.num_postulaciones}</td>
                              <td className="border px-4 py-2">{item.detalles_postulaciones?.map((detalle: { cargo: string }) => detalle.cargo).join(', ')}</td>
                              <td className="border px-4 py-2">{item.vigencia}</td>
                              <td className="border px-4 py-2">{item.genero}</td>
                              <td className="border px-4 py-2">{item.estado_civil}</td>
                              <td className="border px-4 py-2">{item.ubicacion}</td>
                            </>
                          )}
                          {reportType === 'empresas' && item.empresa && (
                            <>
                              <td className="border px-4 py-2">{item.name}</td>
                              <td className="border px-4 py-2">{item.email}</td>
                              <td className="border px-4 py-2">{item.created_at}</td>
                              <td className="border px-4 py-2">{item.empresa.nombre_comercial}</td>
                              <td className="border px-4 py-2">{item.empresa.sector}</td>
                              <td className="border px-4 py-2">{item.empresa.tamanio}</td>
                              <td className="border px-4 py-2">{item.empresa.ubicacion}</td>
                              <td className="border px-4 py-2">
                                {item.empresa.ofertas.map(oferta => `${oferta.cargo} (Postulantes: ${oferta.num_postulantes})`).join(', ')}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={generatePDF}
                    className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    <FaDownload className="w-4 h-4" />
                  </button>
                  {data.length > 0 && (
                    <button
                      onClick={previewPDF}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Vista previa del PDF"
              className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto my-20 relative overflow-y-auto z-50"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
            >
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-4">Vista previa del reporte PDF</h3>
              {previewUrl && (
                <iframe src={previewUrl} width="100%" height="500px" style={{ border: 'none', minHeight: '300px' }}></iframe>
              )}
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default Reportes;
