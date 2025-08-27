import React, { useEffect } from "react";
import { PREGUNTAS } from "../data";
import { useJuegoContext } from "../contexts/JuegoContext.jsx";
import ControlPanel from "../components/ControlPanel.jsx";

export default function Panel() {
   const { ws, setWs, preguntaPreview, setPreguntaPreview, preguntasEnviadas, setPreguntasEnviadas, rondasJugadas, setRondasJugadas, handleConfirmarPregunta } =
      useJuegoContext();

   useEffect(() => {
      if (!ws) {
         const socket = new WebSocket("ws://localhost:8080");
         setWs(socket);
         return () => socket.close();
      }
   }, [ws, setWs]);

   return (
      <div className="h-screen p-6 bg-gray-900 text-white flex flex-col gap-3">
         <h1 className="text-3xl font-bold mb-4">🕹️ Panel de Control</h1>
         <div className="mb-2 flex items-center gap-4">
            <span className="text-lg font-semibold">
               Rondas jugadas: <span className="bg-yellow-500 text-black px-2 rounded">{rondasJugadas}</span>
            </span>
         </div>

         {/* <ControlPanel onSelectQuestion={} /> */}

         {preguntaPreview != null && (
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
               <h2 className="text-xl font-bold mb-2">Vista previa de la pregunta</h2>
               <div className="mb-2 font-semibold">{PREGUNTAS[preguntaPreview].texto}</div>
               <ul className="pl-4">
                  {PREGUNTAS[preguntaPreview].respuestas.map((r, i) => (
                     <li key={i} className="mb-1">
                        <span className="font-semibold">{i + 1}.</span> {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                     </li>
                  ))}
               </ul>
               <button
                  className="mt-4 bg-blue-600 px-4 py-2 rounded font-bold"
                  onClick={handleConfirmarPregunta}
                  disabled={preguntasEnviadas.includes(preguntaPreview)}
               >
                  {preguntasEnviadas.includes(preguntaPreview) ? "Ya enviada" : "Enviar al tablero"}
               </button>
            </div>
         )}
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {PREGUNTAS.map((pregunta, idx) => (
               <div
                  key={idx}
                  className={`p-4 rounded-lg border cursor-pointer transition-all
                     ${preguntasEnviadas.includes(idx) ? "bg-green-700 border-green-400 opacity-70" : "bg-gray-800 border-gray-600 hover:bg-blue-800"}
                     ${preguntaPreview === idx ? "ring-4 ring-blue-400" : ""}
                  `}
                  onClick={() => setPreguntaPreview(idx)}
               >
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-lg">{pregunta.texto}</span>
                     {preguntasEnviadas.includes(idx) && <span className="ml-2 text-green-300 font-bold">✔️</span>}
                  </div>
                  <ul className="text-sm pl-4">
                     {pregunta.respuestas.map((r, i) => (
                        <li key={i} className="mb-1">
                           <span className="font-semibold">{i + 1}.</span> {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      </div>
   );
}
