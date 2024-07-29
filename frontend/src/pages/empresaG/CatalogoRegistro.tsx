import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';

interface Criterio {
  id_criterio: number;
  criterio: string;
  descripcion: string;
  vigencia: number;
  valor:string;
}

const CatalogoRegistro: React.FC = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);


  useEffect(() => {
    const fetchCriterios = async () => {
      try {
        const response = await axios.get('/criteriosAll'); // Asegúrate de que esta URL sea correcta
        if (Array.isArray(response.data)) {
          setCriterios(response.data);
        } else {
          console.error('API response is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching criterios:', error);
        setCriterios([]); // Asegurarse de que criterios sea un arreglo incluso si hay un error
      }
    };

    fetchCriterios();
  }, []);







  const handleEdit = (id_criterio: number) => {
    // Lógica para editar el criterio
    console.log('Editar criterio con ID:', id_criterio);
  };

  const handleDeactivate = (id_criterio: number) => {
    // Lógica para desactivar el criterio
    console.log('Desactivar criterio con ID:', id_criterio);
  };

  return (
    <div className="container mx-auto p-4">
      <center> <h2 className="text-2xl font-bold mb-4">Catálogo de evaluación de la aplicación</h2></center>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Católogo de evaluación:</h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Descripción</th>
              <th className="py-2 px-4 border-b">Vigencia</th>
              <th className="py-2 px-4 border-b">Acción</th>
            </tr>
          </thead>
          <tbody>
            {criterios.map((criterio) => (
              <tr key={criterio.id_criterio}>
                <td className="py-2 px-4 border-b">{criterio.criterio}</td>
                <td className="py-2 px-4 border-b">{criterio.descripcion}</td>
                <td className="py-2 px-4 border-b">{criterio.vigencia ? 'Vigente' : 'No Vigente'}</td>
                <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(criterio.id_criterio)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeactivate(criterio.id_criterio)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md"
                    >
                      Desactivar
                    </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogoRegistro;
