import React, { useState } from 'react';

interface Comentario {
  id: number;
  texto: string;
  likes: number;
  dislikes: number;
  respuestas: Comentario[];
}

interface ComentarioProps {
  comentario: Comentario;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onResponder: (id: number, respuesta: string) => void;
}

const Comentario: React.FC<ComentarioProps> = ({ comentario, onLike, onDislike, onResponder }) => {
  const [respuesta, setRespuesta] = useState('');

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
      <p className="text-gray-800">{comentario.texto}</p>
      <div className="flex gap-2 mt-2">
        {/* Botón de Like con Emoticono 👍 */}
        <button
          onClick={() => onLike(comentario.id)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:text-blue-500"
        >
          <span>👍</span> {/* Emoticono de Like */}
          <span>{comentario.likes}</span> {/* Contador de Likes */}
        </button>

        {/* Botón de Dislike con Emoticono 👎 */}
        <button
          onClick={() => onDislike(comentario.id)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:text-red-500"
        >
          <span>👎</span> {/* Emoticono de Dislike */}
          <span>{comentario.dislikes}</span> {/* Contador de Dislikes */}
        </button>
      </div>
      <div className="pl-6 mt-4 border-l-2 border-gray-200">
        {comentario.respuestas.map((respuesta) => (
          <Comentario
            key={respuesta.id}
            comentario={respuesta}
            onLike={onLike} // Pasa onLike a las respuestas
            onDislike={onDislike} // Pasa onDislike a las respuestas
            onResponder={onResponder} // Pasa onResponder a las respuestas
          />
        ))}
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe una respuesta..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-center mt-2">
          <button
            onClick={() => {
              onResponder(comentario.id, respuesta);
              setRespuesta(''); // Limpiar el campo de respuesta después de enviar
            }}
            className="px-6 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            Responder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comentario;