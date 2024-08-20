import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from '../../services/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Modal from 'react-modal';
import { FiList } from 'react-icons/fi';

interface ReportData {
  id: number;
  name?: string;
  email?: string;
  created_at?: string;
  ubicacion?: string;
  nombre_comercial?: string;
  sector?: string;
  tamanio?: string;
  total_ofertas?: number;
  cargo?: string;
  estado?: string;
  num_postulaciones?: number;
  vigencia?: string;
  genero?: string;
  estado_civil?: string;
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

  const handleEstadoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(event.target.value);
  };

  const handleGeneroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenero(event.target.value);
  };

  const handleEstadoCivilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEstadoCivil(event.target.value);
  };

  const clearFilters = () => {
    setUseFilters(false);
    setStartDate(null);
    setEndDate(null);
    setSelectedProvince('');
    setSelectedCanton('');
    setSelectedSector('');
    setSelectedTamanio('');
    setCargo('');
    setEstado('');
    setSelectedGenero('');
    setSelectedEstadoCivil('');
    setError(null); // Limpiar cualquier error
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
  }, [startDate, endDate, reportType, selectedProvince, selectedCanton, selectedSector, selectedTamanio, cargo, estado, selectedGenero, selectedEstadoCivil]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    doc.setFontSize(18);
    doc.setTextColor(255, 87, 34); // Color naranja
    doc.setFont('helvetica', 'bold');
    doc.text('POSTÚLATE', doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });

    // Subtítulo con el tipo de reporte y la fecha
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el subtítulo y la fecha
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte de ${reportType}`, doc.internal.pageSize.getWidth() / 2, 24, { align: 'center' });
    doc.text(`Fecha: ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Mostrar los filtros seleccionados
    doc.setFontSize(10);
    let yPos = 35;

    if (useFilters) {
        doc.text(`Datos basados en:`, 14, yPos);
        yPos += 5;
        if (startDate && endDate) {
            doc.text(`- Fechas: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`, 14, yPos);
            yPos += 5;
        }
        if (reportType === 'empresas') {
            if (selectedProvince) {
                doc.text(`- Provincia: ${selectedProvince}`, 14, yPos);
                yPos += 5;
            }
            if (selectedCanton) {
                doc.text(`- Cantón: ${selectedCanton}`, 14, yPos);
                yPos += 5;
            }
            if (selectedSector) {
                doc.text(`- Sector: ${selectedSector}`, 14, yPos);
                yPos += 5;
            }
            if (selectedTamanio) {
                doc.text(`- Tamaño: ${selectedTamanio}`, 14, yPos);
                yPos += 5;
            }
        } else if (reportType === 'ofertas') {
            if (cargo) {
                doc.text(`- Cargo: ${cargo}`, 14, yPos);
                yPos += 5;
            }
            if (estado) {
                doc.text(`- Estado: ${estado}`, 14, yPos);
                yPos += 5;
            }
        } else if (reportType === 'postulantes') {
            if (selectedGenero) {
                doc.text(`- Género: ${selectedGenero}`, 14, yPos);
                yPos += 5;
            }
            if (selectedEstadoCivil) {
                doc.text(`- Estado Civil: ${selectedEstadoCivil}`, 14, yPos);
                yPos += 5;
            }
            if (selectedProvince) {
                doc.text(`- Provincia: ${selectedProvince}`, 14, yPos);
                yPos += 5;
            }
            if (selectedCanton) {
                doc.text(`- Cantón: ${selectedCanton}`, 14, yPos);
                yPos += 5;
            }
        }
    }

    // Agregar un espacio adicional entre los filtros y la tabla
    yPos += 10;

    let tableColumn: string[] = [];
    let tableRows: any[] = [];

    if (reportType === 'empresas') {
        tableColumn = ["#", "Nombre Comercial", "Tamaño", "Ubicación", "Sector", "Cantidad de Ofertas"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.nombre_comercial,
            item.tamanio,
            item.ubicacion,
            item.sector,
            item.total_ofertas || 0,
        ]);
    } else if (reportType === 'ofertas') {
        tableColumn = ["#", "Cargo", "Nombre de la Empresa", "Estado", "Cantidad de Postulaciones"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.cargo,
            item.nombre_comercial,
            item.estado,
            item.num_postulaciones || 0,
        ]);
    } else if (reportType === 'postulantes') {
        tableColumn = ["#", "Nombre", "Vigencia", "Género", "Estado Civil", "Ubicación"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.name,
            item.vigencia,
            item.genero,
            item.estado_civil,
            item.ubicacion,
        ]);
    }

    // Estilo de la tabla en color naranja
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,  // Usar yPos para la posición de inicio de la tabla
        theme: 'striped',
        headStyles: { fillColor: [255, 87, 34] }, // Color naranja
        styles: { cellPadding: 3 },
    });

    // Pie de página con la fecha y un pequeño mensaje
    doc.setFontSize(10);
    doc.text('Generado por Postúlate APP', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('Este reporte contiene información confidencial.', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

    doc.save(`ReportePostulate_${reportType}_${formattedDate}.pdf`);
};

  const previewPDF = async () => {
    const doc = new jsPDF();
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    doc.setFontSize(18);
    doc.setTextColor(255, 87, 34); // Color naranja
    doc.setFont('helvetica', 'bold');
    doc.text('POSTÚLATE', doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });

    // Subtítulo con el tipo de reporte y la fecha
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el subtítulo y la fecha
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte de ${reportType}`, doc.internal.pageSize.getWidth() / 2, 24, { align: 'center' });
    doc.text(`Fecha: ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Mostrar los filtros seleccionados
    doc.setFontSize(10);
    let yPos = 35;

    if (useFilters) {
        doc.text(`Datos basados en:`, 14, yPos);
        yPos += 5;
        if (startDate && endDate) {
            doc.text(`- Fechas: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`, 14, yPos);
            yPos += 5;
        }
        if (reportType === 'empresas') {
            if (selectedProvince) {
                doc.text(`- Provincia: ${selectedProvince}`, 14, yPos);
                yPos += 5;
            }
            if (selectedCanton) {
                doc.text(`- Cantón: ${selectedCanton}`, 14, yPos);
                yPos += 5;
            }
            if (selectedSector) {
                doc.text(`- Sector: ${selectedSector}`, 14, yPos);
                yPos += 5;
            }
            if (selectedTamanio) {
                doc.text(`- Tamaño: ${selectedTamanio}`, 14, yPos);
                yPos += 5;
            }
        } else if (reportType === 'ofertas') {
            if (cargo) {
                doc.text(`- Cargo: ${cargo}`, 14, yPos);
                yPos += 5;
            }
            if (estado) {
                doc.text(`- Estado: ${estado}`, 14, yPos);
                yPos += 5;
            }
        } else if (reportType === 'postulantes') {
            if (selectedGenero) {
                doc.text(`- Género: ${selectedGenero}`, 14, yPos);
                yPos += 5;
            }
            if (selectedEstadoCivil) {
                doc.text(`- Estado Civil: ${selectedEstadoCivil}`, 14, yPos);
                yPos += 5;
            }
            if (selectedProvince) {
                doc.text(`- Provincia: ${selectedProvince}`, 14, yPos);
                yPos += 5;
            }
            if (selectedCanton) {
                doc.text(`- Cantón: ${selectedCanton}`, 14, yPos);
                yPos += 5;
            }
        }
    }

    // Agregar un espacio adicional entre los filtros y la tabla
    yPos += 10;

    let tableColumn: string[] = [];
    let tableRows: any[] = [];

    if (reportType === 'empresas') {
        tableColumn = ["#", "Nombre Comercial", "Tamaño", "Ubicación", "Sector", "Cantidad de Ofertas"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.nombre_comercial,
            item.tamanio,
            item.ubicacion,
            item.sector,
            item.total_ofertas || 0,
        ]);
    } else if (reportType === 'ofertas') {
        tableColumn = ["#", "Cargo", "Nombre de la Empresa", "Estado", "Cantidad de Postulaciones"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.cargo,
            item.nombre_comercial,
            item.estado,
            item.num_postulaciones || 0,
        ]);
    } else if (reportType === 'postulantes') {
        tableColumn = ["#", "Nombre", "Vigencia", "Género", "Estado Civil", "Ubicación"];
        tableRows = data.map((item, index) => [
            index + 1,  // Número de fila
            item.name,
            item.vigencia,
            item.genero,
            item.estado_civil,
            item.ubicacion,
        ]);
    }

    // Estilo de la tabla en color naranja
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,  // Usar yPos para la posición de inicio de la tabla
        theme: 'striped',
        headStyles: { fillColor: [255, 87, 34] }, // Color naranja
        styles: { cellPadding: 3 },
    });

    // Pie de página con la fecha y un pequeño mensaje
    doc.setFontSize(10);
    doc.text('Generado por Postúlate APP', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('Este reporte contiene información confidencial.', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

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

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-4 flex justify-center items-center text-orange-500 ml-2">
          REPORTES
          <FiList className="text-orange-500 ml-2" />
        </h1>
        <center><p>En esta sección se generan los reportes respectivos de la aplicación web</p></center>
        <hr className="my-4" />
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
          <hr className="my-4" />
          <div className="mt-4">
  <button
    onClick={clearFilters}
    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
  >
    Limpiar filtros
  </button>
</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                dateFormat="dd/MM/yyyy"
                locale="es"
                placeholderText='dd/mm/aaaa'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                dateFormat="dd/MM/yyyy"
                locale="es"
                placeholderText='dd/mm/aaaa'
              />
            </div>
          </div>
          
        </>
      )}
      {reportType === 'empresas' && useFilters && (
        <>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos</option>
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
                <option value="">Todos</option>
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
                <option value="">Todos</option>
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
                <option value="">Todas</option>
                <option value="Microempresa">Microempresa</option>
                <option value="Pequeña">Pequeña</option>
                <option value="Mediana">Mediana</option>
                <option value="Grande">Grande</option>
              </select>
            </div>
          </div>
          <hr className="my-4" />
        </>
      )}
      {reportType === 'ofertas' && useFilters && (
        <>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={handleCargoChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder='Cargos que incluyan estas palabras clave'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={estado}
                onChange={handleEstadoChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas</option>
                <option value="Culminada">Culminada</option>
                <option value="En espera">En espera</option>
              </select>
            </div>
          </div>
          <hr className="my-4" />
        </>
      )}
      {reportType === 'postulantes' && useFilters && (
        <>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={selectedGenero}
                onChange={handleGeneroChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos</option>
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
                <option value="">Todos</option>
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
                <option value="">Todos</option>
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
                <option value="">Todos</option>
                {cantons.map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>
          </div>
          <hr className="my-4" />
        </>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
  
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="font-bold">Cargando reporte...</span>
            </div>
          </div>
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

                <div className="flex-col bg-gray-200 rounded-lg shadow-md items-center p-10">
                  <p className="text-lg font-semibold text-gray-700 mb-4">
                    Una vez seleccionados los datos para el reporte requeridos, puede realizar las siguientes opciones:
                  </p>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={generatePDF}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-300 flex items-center space-x-2"
                    >
                      <FaDownload className="w-4 h-4" />
                      <span>Descargar reporte</span>
                    </button>

                    {data.length > 0 && (
                      <button
                        onClick={previewPDF}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center space-x-2"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>Visualizar reporte</span>
                      </button>
                    )}
                    
                  </div>
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
