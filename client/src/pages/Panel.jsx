import React, { useEffect } from "react";
import { PREGUNTAS } from "../data.js";
import { useJuegoContext } from "../contexts/JuegoContext.jsx";
import ControlPanel from "../components/ControlPanel.jsx";
import icons from "../const/icons.js";
import env from "../const/env.js";

export default function Panel() {
   const {
      ws,
      setWs,
      send,
      teamNames,
      setTeamNames,
      puntosEquipo,
      setPuntosEquipo,
      acumuladoRonda,
      preguntaPreview,
      setPreguntaPreview,
      preguntasEnviadas,
      setPreguntasEnviadas,
      rondasJugadas,
      setRondasJugadas,
      rondaActiva,
      setRondaActiva,
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
      unoVsUno,
      muerteSubita,
      activarContador,
      desactivarContador,
      contadorActivo,
      tiempoRestante
   } = useJuegoContext();
   const [search, setSearch] = React.useState("");
   const categorias = Array.from(new Set(PREGUNTAS.map((p) => p.categoria).filter(Boolean)));
   const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
   // ...existing code...
   const [searchCategoria, setSearchCategoria] = React.useState("");
   const categoriasFiltradas = categorias.filter((cat) => cat.toLowerCase().includes(searchCategoria.toLowerCase()));
   // ...existing code...
   const preguntasFiltradas = PREGUNTAS.filter(
      (p) => (!search || p.texto.toLowerCase().includes(search.toLowerCase())) && (!categoriaSeleccionada || p.categoria === categoriaSeleccionada)
   );
   let debounceTimer = null;

   useEffect(() => {
      if (!ws) {
         const socket = new WebSocket(env.VITE_WS_URL);
         setWs(socket);
         return () => socket.close();
      }
   }, []);

   function setPregunta(idx) {
      setPreguntaPreview(idx);
   }

   function destaparRespuesta(answerIdx) {
      // console.log("🚀 ~ destaparRespuesta ~ answerIdx:", answerIdx);
      // console.log("🚀 ~ destaparRespuesta ~ preguntaIdx:", preguntaIdx);
      // console.log("🚀 ~ destaparRespuesta ~ preguntaPreview:", preguntaPreview);
      if (preguntaIdx === null && preguntaPreview === null) return;
      const action = "setAnswer";
      const payload = { answerIdx };
      if (ws && ws.readyState === WebSocket.OPEN) {
         send({ action, ...payload });
      } else {
         console.warn("WebSocket no está abierto. No se puede enviar la acción:", action);
      }
   }

   return (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white p-2 gap-2">
         {/* HEADER */}
         <div className="card bg-orange-500 h-16 flex-shrink-0">
            <div className="flex justify-between items-center h-full">
               <h1 className="flex text-center items-center text-xl font-bold bg-warning-content rounded-l-lg px-2 h-full">
                  🕹️ <br /> Panel de Control
               </h1>

               <div className="flex gap-6 text-sm font-bold">
                  <span>
                     Rondas: <span className="bg-warning-content px-1 rounded">{rondasJugadas}</span>
                  </span>
                  <span>
                     Equipo: <span className="bg-warning-content px-1 rounded">{equipoActivo ?? "-"}</span>
                  </span>
                  <span>
                     Ronda Activa: <span className="bg-warning-content px-1 rounded">{rondaActiva ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     1 vs 1: <span className="bg-warning-content px-1 rounded">{unoVsUno ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     Robo: <span className="bg-warning-content px-1 rounded">{enRobo ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     Muerte Subita: <span className="bg-warning-content px-1 rounded">{muerteSubita ? "SI" : "NO"}</span>
                  </span>
               </div>

               <button onClick={() => send({ action: "reset" })} className="btn btn-soft h-full rounded-l-none">
                  Reset Juego
               </button>
               {/* <div className="text-lg font-semibold">
                     Permitir Teclado: <input className="checkbox checkbox-warning" type="checkbox" checked={true} onChange={() => {}} readOnly />
                  </div> */}
               {/* </div> */}
            </div>
         </div>

         {/* CUERPO */}
         <div className="flex-grow flex gap-2 min-h-0">
            {/* VISTA PREVIA TABLERO Y MARCADOR */}
            <div className="card bg-gray-800 flex-1 p-4 overflow-y-auto min-h-0">
               {/* VISTA PREVIA TABLERO */}
               {/* <h2 className="text-lg font-bold text-center mb-2">Vista Previa</h2> */}
               <div className="bg-gray-700 p-2 rounded-lg mb-4">
                  <div className="text-3xl font-semibold text-center mb-2">{PREGUNTAS[preguntaPreview]?.texto ?? "Selecciona una pregunta"}</div>
                  <ul className="pl-4">
                     {preguntaPreview !== null
                        ? PREGUNTAS[preguntaPreview]?.respuestas.map((r, i) => (
                             <li
                                key={`key-respuesta-${i}}`}
                                className={`mb-5 text-3xl font-semibold transition-all btn w-full ${
                                   reveladas[`${preguntaPreview}-${i}`] === true ? "text-green-400 opacity-75" : "cursor-pointer hover:font-black"
                                }`}
                                onClick={() => (reveladas[`${preguntaPreview}-${i}`] === true ? null : destaparRespuesta(i))}
                             >
                                {i + 1}. {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                             </li>
                          ))
                        : Array.from({ length: 5 }).map((_, i) => (
                             <li key={i} className={`mb-5 text-3xl font-semibold btn w-full`} disabled>
                                <span className="font-semibold">{i + 1}.</span> {"....."} <span className="text-yellow-400 font-bold">{"..."}</span>
                             </li>
                          ))}
                  </ul>
                  <div className="flex justify-between items-center">
                     {preguntaPreview !== null ? (
                        <>
                           <button
                              className="btn btn-info px-4 py-2 rounded font-bold"
                              onClick={() => send({ action: "setQuestion", questionIdx: preguntaPreview })}
                              disabled={preguntasEnviadas.includes(preguntaPreview)}
                           >
                              <icons.md.MdConnectedTv size={20} />
                              {preguntasEnviadas.includes(preguntaPreview) ? "Ya enviada" : "Enviar al tablero"}
                           </button>

                           <div className="flex justify-between w-6/12 font-bold">
                              <span className="badge badge-soft badge-warning">{preguntaPreview}</span>
                              <span className="badge badge-soft badge-warning">
                                 {PREGUNTAS[preguntaPreview].respuestas.reduce((total, r) => total + r.puntos, 0)} Pts.
                              </span>
                              <span className="badge badge-soft badge-warning">{PREGUNTAS[preguntaPreview].categoria}</span>
                           </div>
                        </>
                     ) : (
                        <button className="btn" disabled>
                           Selecciona una pregunta
                        </button>
                     )}

                     <button
                        className="btn btn-soft"
                        onClick={() => {
                           // Filtrar preguntas no enviadas
                           const noEnviadas = PREGUNTAS.map((_, idx) => idx).filter((idx) => !preguntasEnviadas.includes(idx));
                           if (noEnviadas.length === 0) return;
                           // Elegir una al azar
                           const randomIdx = noEnviadas[Math.floor(Math.random() * noEnviadas.length)];
                           setPregunta(randomIdx);
                        }}
                        disabled={PREGUNTAS.length === preguntasEnviadas.length}
                     >
                        {<icons.fa.FaRandom />} Pregunta Random
                     </button>
                  </div>
               </div>

               {/* FILTROS RESPUESTA */}
               <div className="divider divider-warning font-bold text-2xl sm:text-base">FILTROS DE BUSQUEDA PREGUNTAS</div>
               <div className="flex gap-2 w-full justify-center items-center bg-gray-700 p-4 rounded-lg">
                  <fieldset className="fieldset w-full">
                     <legend className="fieldset-legend">Buscador General</legend>
                     <input type="text" className="input w-full" placeholder="Ingresa tu busqueda..." value={search} onChange={(e) => setSearch(e.target.value)} />
                     {/* <p className="label">Optional</p> */}
                  </fieldset>
                  <fieldset className="fieldset w-full">
                     <legend className="fieldset-legend">Categorías</legend>
                     <select className="select w-full" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
                        {/* <input
                           type="text"
                           className="input input-bordered w-full mb-2"
                           placeholder="Buscar categoría..."
                           value={searchCategoria}
                           onChange={(e) => setSearchCategoria(e.target.value)}
                        /> */}
                        <option value="">Todas las categorías</option>
                        {categoriasFiltradas.map((cat, i) => (
                           <option key={i} value={cat}>
                              {cat}
                           </option>
                        ))}
                     </select>
                     {/* <span className="label">Opcional</span> */}
                  </fieldset>
               </div>
            </div>

            {/* CONTROLES */}
            <div className="card bg-gray-800 w-2/5 p-4 overflow-y-auto min-h-0">
               {/* MARCADOR */}
               <h2 className="text-lg font-bold text-center mb-2">MARCADOR</h2>
               <div className="bg-gray-700 p-2 rounded-lg mb-4">
                  <div className=" flex gap-2 w-full">
                     {/* EQUIPO 1 */}
                     <div className={`flex-grow flex justify-center items-center card card-body gap-2 bg-red-500 ${equipoActivo === 1 ? "skeleton" : "opacity-75"}`}>
                        <div className="font-medium text-lg">
                           Equipo 1
                           <button
                              onClick={() => send({ action: "activateTeam", team: 1 })}
                              disabled={equipoBloqueado === 1 || equipoActivo !== null}
                              className={`btn btn-sm ml-3 bg-red-600 font-bold disabled:${
                                 equipoBloqueado === 1 ? "opacity-10" : equipoActivo === 1 ? "opacity-50" : "opacity-100"
                              }`}
                           >
                              ACTIVAR
                           </button>
                        </div>
                        <div className="flex gap-2">
                           <input
                              className="input"
                              placeholder="Escribe el Nombre del equipo 1"
                              type="search"
                              value={teamNames.e1}
                              onChange={(e) => {
                                 const nuevoNombre = e.target.value.toUpperCase();

                                 send({ action: "updateTeamName", team: "e1", name: nuevoNombre });
                              }}
                           />
                           <input
                              className="input"
                              placeholder="Puntaje del equipo 1"
                              type="number"
                              value={puntosEquipo.e1}
                              onChange={(e) => {
                                 const puntaje = parseInt(e.target.value, 10) || 0;

                                 send({ action: "updateTeamScore", team: "e1", score: puntaje });
                              }}
                           />
                        </div>
                        <button className="btn btn-wide" type="button" onClick={() => send({ action: "darVictoria", team: 1 })}>
                           DAR VICTORIA 🎉
                        </button>
                     </div>

                     {/* PUNTOS */}
                     <div className="flex-grow flex justify-center items-center card card-body gap-2 bg-black text-success font-black ">
                        Puntaje
                        <span className="text-5xl">{acumuladoRonda}</span>
                     </div>

                     {/* EQUIPO 2 */}
                     <div className={`flex-grow flex justify-center items-center card card-body gap-2 bg-blue-500 ${equipoActivo === 2 ? "skeleton" : "opacity-75"}`}>
                        <div className="font-medium text-lg">
                           Equipo 2
                           <button
                              onClick={() => send({ action: "activateTeam", team: 2 })}
                              disabled={equipoBloqueado === 2 || equipoActivo !== null}
                              className={`btn btn-sm ml-3 bg-blue-600 font-bold disabled:${
                                 equipoBloqueado === 2 ? "opacity-10" : equipoActivo === 2 ? "opacity-50" : "opacity-100"
                              }`}
                           >
                              ACTIVAR
                           </button>
                        </div>
                        <div className="flex gap-2">
                           <input
                              className="input"
                              placeholder="Escribe el Nombre del equipo 2"
                              type="search"
                              value={teamNames.e2}
                              onChange={(e) => {
                                 const nuevoNombre = e.target.value.toUpperCase();

                                 // setTeamNames((prev) => ({
                                 //    ...prev,
                                 //    e2: nuevoNombre
                                 // }));
                                 send({ action: "updateTeamName", team: "e2", name: nuevoNombre });
                              }}
                           />
                           <input
                              className="input"
                              placeholder="Puntaje del equipo 2"
                              type="number"
                              value={puntosEquipo.e2}
                              onChange={(e) => {
                                 const puntaje = parseInt(e.target.value, 10) || 0;

                                 // setPuntosEquipo((prev) => ({
                                 //    ...prev,
                                 //    e2: puntaje
                                 // }));
                                 // // Limpiamos cualquier timeout previo
                                 // if (debounceTimer) clearTimeout(debounceTimer);

                                 // // Creamos un nuevo timeout de 500ms
                                 // debounceTimer = setTimeout(() => {
                                 send({ action: "updateTeamScore", team: "e2", score: puntaje });
                                 // }, 500); // retrazo de medio segundo
                              }}
                           />
                        </div>
                        <button className="btn btn-wide" type="button" onClick={() => send({ action: "darVictoria", team: 2 })}>
                           DAR VICTORIA 🎉
                        </button>
                     </div>
                  </div>
               </div>

               <h2 className="text-lg font-bold text-center mb-2">CONTROLES</h2>
               <div className="mt-4 flex gap-4 flex-wrap">
                  {/* MARCAR ERRORES */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base ">Marcar Errores</p>
                     <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <button
                              key={`btn-error-${i + 1}`}
                              onClick={() =>
                                 send({
                                    action: "markError",
                                    slot: i + 1
                                 })
                              }
                              className={`btn btn-error btn-circle font-black btn-xl sm:btn-md`}
                              disabled={errores.e1 >= i + 1 || errores.e2 >= i + 1 || unoVsUno || enRobo || muerteSubita || !rondaActiva}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                  </div>
                  {/* SELECCION DE EQUIPOS */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg" style={{ display: "none" }}>
                     <p className="font-medium text-2xl sm:text-base">Activar Equipo</p>
                     <div className="flex gap-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                           <button
                              key={`btn-activar-equipo-${i}`}
                              onClick={() => send({ action: "activateTeam", team: i + 1 })}
                              disabled={equipoBloqueado === i + 1 || equipoActivo !== null}
                              className={`btn btn-soft btn-xl sm:btn-md ${i + 1 === 1 ? "bg-red-500" : "bg-blue-500"} font-bold disabled:${
                                 equipoBloqueado === i + 1 ? "opacity-10" : equipoActivo === i + 1 ? "opacity-50" : "opacity-100"
                              }`}
                           >
                              E{i + 1} <kbd className="kbd">{i + 1}</kbd>
                           </button>
                        ))}
                     </div>
                  </div>
                  {/* CONTADOR */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Contador (10 seg)</p>
                     <button
                        className={`btn btn-warning ${contadorActivo ? "btn-outline" : ""}`}
                        onClick={() => {
                           if (contadorActivo) {
                              send({ action: "contador", activar: false });
                              // desactivarContador();
                           } else {
                              send({ action: "contador", activar: true });
                              // activarContador();
                           }
                        }}
                     >
                        {contadorActivo ? `Desactivar Contador (${tiempoRestante}s)` : "Activar Contador"}
                     </button>
                  </div>
                  {/* RESPUESTA REPETIDA */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Especificar Resp.</p>
                     <button className="btn btn-warning btn-xl sm:btn-md text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={() => send({ action: "repetida" })}>
                        E/R
                     </button>
                  </div>
                  {/* MUERTE SUBITA */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Muerte Súbita</p>
                     <button
                        onClick={() => send({ action: "activarMuerteSubita" })}
                        className="btn btn-error btn-xl sm:btn-md text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                     >
                        Activar
                     </button>
                  </div>
                  {/* ERROR INDEPENDIENTE */}
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Mostrar X</p>
                     <button
                        className="btn btn-error btn-xl sm:btn-md text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 0
                           })
                        }
                     >
                        X
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* CATALOGO DE PREGUNTAS */}
         <div className="card bg-gray-800 p-4 h-48 flex-shrink-0 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
               {preguntasFiltradas.map((pregunta, idx) => (
                  <div
                     key={idx}
                     className={`p-2 rounded-lg border cursor-pointer transition-all
                     ${preguntasEnviadas.includes(idx) ? "bg-green-700 border-green-400 opacity-70" : "bg-gray-800 border-gray-600 hover:bg-blue-800"}
                     ${preguntaPreview === idx ? "ring-4 ring-blue-400" : ""}
                  `}
                     onClick={() => setPregunta(idx)}
                  >
                     <div className="flex justify-between w-full">
                        <span className="badge badge-soft badge-warning">{idx}</span>
                        <div className="flex items-center">
                           <span className="badge badge-soft badge-warning">{pregunta.respuestas.reduce((total, r) => total + r.puntos, 0)} Pts.</span>
                           <span className="badge badge-soft badge-warning">{pregunta.categoria}</span>
                        </div>
                     </div>
                     <div className="flex gap-1 items-center">
                        <span className="font-bold text-lg">{pregunta.texto}</span>
                        {preguntasEnviadas.includes(idx) && (
                           <span className="ml-2 text-green-300 font-bold">{<icons.io.IoMdCheckmarkCircleOutline size={30} color="white" />} </span>
                        )}
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
      </div>
   );
}
