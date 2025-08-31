import React, { useEffect } from "react";
import { PREGUNTAS } from "../data";
import { useJuegoContext } from "../contexts/JuegoContext.jsx";
import ControlPanel from "../components/ControlPanel.jsx";

export default function Panel() {
   const {
      ws,
      setWs,
      send,
      preguntaPreview,
      setPreguntaPreview,
      preguntasEnviadas,
      setPreguntasEnviadas,
      rondasJugadas,
      setRondasJugadas,
      handleConfirmarPregunta,
      mostrarPregunta,
      preguntaIdx,
      setPreguntaIdx,
      activarEquipo,
      equipoBloqueado,
      equipoActivo,
      resetJuego,
      errores,
      marcarError,
      reveladas,
      enRobo,
      reproducirRepetida,
      activarMuerteSubita
   } = useJuegoContext();

   useEffect(() => {
      if (!ws) {
         const socket = new WebSocket("ws://localhost:8080");
         setWs(socket);
         return () => socket.close();
      }
   }, []);

   function setPregunta(idx) {
      setPreguntaPreview(idx);
      setPreguntaIdx(idx);
   }

   function destaparRespuesta(answerIdx) {
      const action = "setAnswer";
      const payload = { answerIdx };
      if (ws && ws.readyState === WebSocket.OPEN) {
         send({ action, ...payload });
      } else {
         console.warn("WebSocket no está abierto. No se puede enviar la acción:", action);
      }
   }

   return (
      <div className="h-screen p-6 bg-gray-900 text-white flex flex-col gap-3">
         <h1 className="text-3xl font-bold mb-4">🕹️ Panel de Control</h1>
         <div className="mb-2 flex items-center gap-4">
            <span className="text-lg font-semibold">
               Rondas jugadas: <span className="bg-yellow-500 text-black px-2 rounded">{rondasJugadas}</span>
            </span>
         </div>

         <div className="flex flex-col items-center justify-between mt-6  w-full bg-amber-500">
            {/* ZONA DE RONDAS */}
            {/* <div className="flex gap-2 justify-around w-full">
               {Array.from({ length: 10 }).map((_, i) => (
                  <button
                     key={i}
                     onClick={() => send({ action: "setQuestion", questionIdx: i })}
                     className={`btn btn-neutral rounded-full shadow text-5xl font-black p-5 w-25 h-25 ${preguntaIdx === i ? "animate-pulse" : ""}`}
                     disabled={i < preguntaIdx}
                  >
                     {i + 1}
                  </button>
               ))}
            </div> */}

            <div className="flex w-full justify-between items-center">
               <div className="mt-4 flex gap-2">
                  <div className="flex gap-1">
                     <button
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 1
                           })
                        }
                        className={`btn btn-error`}
                        disabled={errores.e1 >= 1 || errores.e2 >= 1}
                     >
                        Err 1
                     </button>
                     <button
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 2
                           })
                        }
                        className={`btn btn-error`}
                        disabled={errores.e1 >= 2 || errores.e2 >= 2}
                     >
                        Err 2
                     </button>
                     <button
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 3
                           })
                        }
                        className={`btn btn-error`}
                        disabled={errores.e1 >= 3 || errores.e2 >= 3}
                     >
                        Err 3
                     </button>
                  </div>

                  <div className="flex ml-4 text-sm font-medium text-gray-600 justify-center items-center">
                     <p>Equipo activo: {equipoActivo ?? "-"}</p>
                     <p>En robo: {enRobo ? "SI" : "NO"}</p>
                     <p className="mt-2">
                        <label className="mr-2">Permitir teclado</label>
                        <input type="checkbox" checked={true} onChange={() => {}} readOnly />
                     </p>
                  </div>
               </div>
               <div className="flex gap-2 items-center">
                  <button onClick={() => send({ action: "activarMuerteSubita" })} className="btn btn-error text-white text-lg font-bold px-6 py-2 rounded-xl shadow">
                     Activar Muerte Súbita
                  </button>
                  <button
                     onClick={() => send({ action: "activateTeam", team: 1 })}
                     disabled={equipoBloqueado === 1 || equipoActivo !== null}
                     className={`btn btn-soft bg-neutral font-bold disabled:${
                        equipoBloqueado === 1 ? "opacity-10" : equipoActivo === 1 ? "opacity-50" : "opacity-100"
                     }`}
                  >
                     Seleccionar E1 (<kbd className="kbd">1</kbd>)
                  </button>
                  <button
                     onClick={() => send({ action: "activateTeam", team: 2 })}
                     disabled={equipoBloqueado === 2 || equipoActivo !== null}
                     className={`btn btn-soft bg-neutral-content font-bold text-neutral disabled:${
                        equipoBloqueado === 2 ? "opacity-10" : equipoActivo === 2 ? "opacity-50" : "opacity-100"
                     }`}
                  >
                     Seleccionar E2 (<kbd className="kbd text-neutral-content">2</kbd>)
                  </button>
                  {/* BOTONES INDEPENDIENTES DE ERROR Y REPETIDA */}
                  <div className="flex justify-center gap-6 mt-6">
                     <button
                        className="btn btn-error text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 0
                           })
                        }
                     >
                        X
                     </button>
                     <button className="btn btn-warning text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={() => send({ action: "repetida" })}>
                        R/E
                     </button>
                  </div>
                  <button
                     onClick={() =>
                        send({
                           action: "reset"
                        })
                     }
                     className="btn btn-accent"
                  >
                     Reset Juego
                  </button>
               </div>
            </div>
         </div>

         {preguntaPreview != null && (
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
               <h2 className="text-xl font-bold mb-2">Vista previa de la pregunta</h2>
               <div className="mb-2 font-semibold">{PREGUNTAS[preguntaPreview].texto}</div>
               <ul className="pl-4">
                  {PREGUNTAS[preguntaPreview].respuestas.map((r, i) => (
                     <li
                        key={i}
                        className={`mb-5 text-3xl font-semibold transition-all ${
                           reveladas[`${preguntaPreview}-${i}`] === true ? "text-green-400 opacity-75" : "cursor-pointer hover:font-black"
                        }`}
                        onClick={() => (reveladas[`${preguntaPreview}-${i}`] === true ? null : destaparRespuesta(i))}
                     >
                        <span className="font-semibold">{i + 1}.</span> {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                     </li>
                  ))}
               </ul>
               <button
                  className="btn btn-info mt-4 px-4 py-2 rounded font-bold"
                  onClick={() => send({ action: "setQuestion", questionIdx: preguntaPreview })}
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
                  onClick={() => setPregunta(idx)}
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
