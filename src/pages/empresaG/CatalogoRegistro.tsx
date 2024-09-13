import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { FiCheck } from 'react-icons/fi';

interface Criterio {
  id_criterio: number;
  criterio: string;
  descripcion: string;
  vigencia: number;
}

const CatalogoRegistro: React.FC = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [editCriterio, setEditCriterio] = useState<Criterio | null>(null);
  const [error, setError] = useState<{ criterio?: string; descripcion?: string }>({});

  useEffect(() => {
    const fetchCriterios = async () => {
      try {
        const response = await axios.get('/criteriosAll');
        if (Array.isArray(response.data)) {
          setCriterios(response.data);
        } else {
          console.error('API response is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching criterios:', error);
        setCriterios([]);
      }
    };

    fetchCriterios();
  }, []);

  const handleEdit = (criterio: Criterio) => {
    setEditCriterio(criterio);
    setError({}); // Clear previous errors when starting to edit a new item
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const value = e.target.value;

    if (field === 'criterio' && value.length <= 100) {
      setEditCriterio((prev) => prev ? { ...prev, criterio: value } : null);
      setError((prev) => ({ ...prev, criterio: undefined }));
    } else if (field === 'descripcion' && value.length <= 150) {
      setEditCriterio((prev) => prev ? { ...prev, descripcion: value } : null);
      setError((prev) => ({ ...prev, descripcion: undefined }));
    } else {
      setError((prev) => ({
        ...prev,
        [field]: field === 'criterio' ? 'El nombre no puede exceder 100 caracteres' : 'La descripción no puede exceder 150 caracteres'
      }));
    }
  };

  const handleToggleVigencia = async (id_criterio: number, currentVigencia: number) => {
    try {
      const newVigencia = currentVigencia ? 0 : 1;
      await axios.put(`/criterios/${id_criterio}/toggleVigencia`, { vigencia: newVigencia });
      setCriterios((prevCriterios) =>
        prevCriterios.map((criterio) =>
          criterio.id_criterio === id_criterio
            ? { ...criterio, vigencia: newVigencia }
            : criterio
        )
      );
    } catch (error) {
      console.error('Error toggling vigencia:', error);
    }
  };

  const handleSave = async () => {
    if (editCriterio) {
      try {
        await axios.put(`/criterios/${editCriterio.id_criterio}`, {
          criterio: editCriterio.criterio,
          descripcion: editCriterio.descripcion,
        });
        setCriterios((prevCriterios) =>
          prevCriterios.map((criterio) =>
            criterio.id_criterio === editCriterio.id_criterio
              ? editCriterio
              : criterio
          )
        );
        setEditCriterio(null);
      } catch (error) {
        console.error('Error updating criterio:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
       <h1 className="text-3xl font-bold mb-4 flex justify-center items-center text-orange-500 ml-2">
       GESTIÓN DE CRITERIOS DE EVALUACIÓN
                    <FiCheck className="text-orange-500 ml-2" />
                </h1>
     
      <center><p className="text-gray-700 mb-6">En este apartado puede editar los criterios de evaluación presentes en la aplicación web "Postúlate". Puede editar los nombres y la descripción de cada uno de ellos así como eliminarlos por medio de la vigencia (Si está vigente, está presente en la aplicación).</p></center>
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Criterios de evaluación:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-700" title="Este campo muestra el nombre del criterio que se evalúa (Máximo: 100 caracteres)">Nombre</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-700" title="Esta corta descripción se mostrará en cada criterio para mejor entendimiento de qué se evaluará (Máximo: 150 caracteres)">Descripción</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-700">Vigencia</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {criterios.map((criterio) => (
                <tr key={criterio.id_criterio} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-2 px-4 border-b">
                    {editCriterio && editCriterio.id_criterio === criterio.id_criterio ? (
                      <>
                        <input
                          type="text"
                          value={editCriterio.criterio}
                          onChange={(e) => handleInputChange(e, 'criterio')}
                          className="border rounded px-2 py-1 block w-full mb-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        {error.criterio && <p className="text-red-500 text-sm">{error.criterio}</p>}
                      </>
                    ) : (
                      criterio.criterio
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editCriterio && editCriterio.id_criterio === criterio.id_criterio ? (
                      <>
                        <textarea
                          value={editCriterio.descripcion}
                          onChange={(e) => handleInputChange(e, 'descripcion')}
                          className="border rounded px-2 py-1 block w-full h-20 mb-2 resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        {error.descripcion && <p className="text-red-500 text-sm">{error.descripcion}</p>}
                      </>
                    ) : (
                      criterio.descripcion
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{criterio.vigencia ? 'Vigente' : 'No Vigente'}</td>
                  <td className="py-2 px-4 border-b flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    {editCriterio && editCriterio.id_criterio === criterio.id_criterio ? (
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        disabled={!!error.criterio || !!error.descripcion}
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(criterio)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleVigencia(criterio.id_criterio, criterio.vigencia)}
                      className={`${
                        criterio.vigencia ? 'bg-red-500' : 'bg-green-500'
                      } text-white px-4 py-2 rounded-md hover:${
                        criterio.vigencia ? 'bg-red-600' : 'bg-green-600'
                      } focus:ring-2 focus:ring-${
                        criterio.vigencia ? 'red-500' : 'green-500'
                      } focus:outline-none`}
                    >
                      {criterio.vigencia ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default CatalogoRegistro;
