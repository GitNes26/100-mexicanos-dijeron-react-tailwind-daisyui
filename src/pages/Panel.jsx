import React, { useEffect } from "react";
import { PREGUNTAS } from "../data";
import { useJuegoContext } from "../contexts/JuegoContext.jsx";
import ControlPanel from "../components/ControlPanel.jsx";
import icons from "../const/icons.js";

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
      <div className="h-screen max-h-12/12 w-full p-4 bg-gray-900 text-white gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
         {/* HEADER */}
         <div className="card w-full h-1/12 bg-orange-500 mb-2 ">
            <div className="flex justify-between items-center h-full">
               <h1 className="text-2xl font-bold bg-warning-content h-full rounded-l-lg p-1">🕹️ Panel de Control</h1>

               <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg  font-bold">
                  <div className="text-lg font-semibold">
                     Rondas jugadas: <span className="bg-warning-content font-black  px-2 rounded">{rondasJugadas}</span>
                  </div>
                  <div className="text-lg font-semibold">
                     Equipo Activo: <span className="bg-warning-content font-black  px-2 rounded">{equipoActivo ?? "-"}</span>
                  </div>
                  <div className="text-lg font-semibold">
                     Equipo En Robo: <span className="bg-warning-content font-black  px-2 rounded">{enRobo ? "SI" : "NO"}</span>
                  </div>
                  <div className="text-lg font-semibold">
                     Muerte Subita: <input className="checkbox checkbox-warning" type="checkbox" checked={true} onChange={() => {}} readOnly />
                  </div>
                  <div className="text-lg font-semibold">
                     Permitir Teclado: <input className="checkbox checkbox-warning" type="checkbox" checked={true} onChange={() => {}} readOnly />
                  </div>
               </div>

               <div className="bg-warning-content h-full rounded-r-lg p-4">
                  <button onClick={() => send({ action: "reset" })} className="btn btn-soft">
                     Reset Juego
                  </button>
               </div>
            </div>
         </div>

         {/* CUERPO */}
         <div className="card py-2 px-4 w-full max-w-screen flex-1 wrap-anywhere bg-gray-800 grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
            {/* VISTA PREVIA PREGUNTA */}
            <div className="col-span-3 h-full">
               <h2 className="text-2xl font-bold mb-4 text-center">Vista Previa de la Pregunta</h2>
               <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="mb-2 text-3xl font-semibold">{PREGUNTAS[preguntaPreview]?.texto ?? "¿ .......... ?"}</div>
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
                                <span className="font-semibold">{i + 1}.</span> {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                             </li>
                          ))
                        : Array.from({ length: 5 }).map((_, i) => (
                             <li key={i} className={`mb-5 text-3xl font-semibold btn w-full`} disabled>
                                <span className="font-semibold">{i + 1}.</span> {"....."} <span className="text-yellow-400 font-bold">{"..."}</span>
                             </li>
                          ))}
                  </ul>
                  {preguntaPreview !== null ? (
                     <button
                        className="btn btn-info px-4 py-2 rounded font-bold"
                        onClick={() => send({ action: "setQuestion", questionIdx: preguntaPreview })}
                        disabled={preguntasEnviadas.includes(preguntaPreview)}
                     >
                        {preguntasEnviadas.includes(preguntaPreview) ? "Ya enviada" : "Enviar al tablero"}
                     </button>
                  ) : (
                     <button className="btn" disabled>
                        Selecciona una pregunta
                     </button>
                  )}
               </div>
            </div>

            {/* CONTROLES */}
            <div className="col-span-2 w-full">
               <h2 className="text-2xl text-center font-bold mb-4">Controles</h2>

               <div className="mt-4 flex gap-4 flex-wrap">
                  {/* MARCAR ERRORES */}
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl">Marcar Errores</p>
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
                              className={`btn btn-error btn-circle font-black btn-xl`}
                              disabled={errores.e1 >= i + 1 || errores.e2 >= i + 1}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                     {/* <button
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
                     </button> */}
                  </div>
                  {/* SELECCION DE EQUIPOS */}
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl">Activar Equipo</p>
                     <div className="flex gap-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                           <button
                              key={`btn-activar-equipo-${i}`}
                              onClick={() => send({ action: "activateTeam", team: i + 1 })}
                              disabled={equipoBloqueado === i + 1 || equipoActivo !== null}
                              className={`btn btn-soft btn-xl ${i + 1 === 1 ? "bg-red-500" : "bg-blue-500"} font-bold disabled:${
                                 equipoBloqueado === i + 1 ? "opacity-10" : equipoActivo === i + 1 ? "opacity-50" : "opacity-100"
                              }`}
                           >
                              E{i + 1} <kbd className="kbd">{i + 1}</kbd>
                           </button>
                        ))}
                     </div>
                  </div>
                  {/* RESPUESTA REPETIDA */}
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl">Resp. Repetida</p>
                     <button className="btn btn-warning btn-xl text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={() => send({ action: "repetida" })}>
                        R/E
                     </button>
                  </div>
                  {/* MUERTE SUBITA */}
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl">Activar Muerte Súbita</p>
                     <button
                        onClick={() => send({ action: "activarMuerteSubita" })}
                        className="btn btn-error btn-xl text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                     >
                        Activar
                     </button>
                  </div>
                  {/* ERROR INDEPENDIENTE */}
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl">Activar Error Independiente</p>
                     <button
                        className="btn btn-error btn-xl text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: 0
                           })
                        }
                     >
                        X
                     </button>
                     {/* <button
                        key={`btn-error-${i + 1}`}
                        onClick={() =>
                           send({
                              action: "markError",
                              slot: i + 1
                           })
                        }
                        className={`btn btn-error btn-circle font-black btn-xl`}
                        disabled={errores.e1 >= i + 1 || errores.e2 >= i + 1}
                     >
                        {i + 1}
                     </button> */}
                  </div>
               </div>
               <div className="divider divider-warning font-bold text-2xl">FILTROS DE BUSQUEDA PREGUNTAS</div>

               {/* FILTROS RESPUESTA */}
               <div className="flex gap-2 w-full justify-center items-center bg-gray-700 p-4 rounded-lg">
                  <fieldset className="fieldset w-full">
                     <legend className="fieldset-legend">Buscador General</legend>
                     <input type="text" className="input" placeholder="Ingresa tu busqueda..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
         </div>

         {/* CATALOGO DE PREGUNTAS */}
         <div className="card p-4 w-full max-w-screen h-4/12  bg-gray-800 rounded-lg overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
               {preguntasFiltradas.map((pregunta, idx) => (
                  <div
                     key={idx}
                     className={`p-4 rounded-lg border cursor-pointer transition-all
                     ${preguntasEnviadas.includes(idx) ? "bg-green-700 border-green-400 opacity-70" : "bg-gray-800 border-gray-600 hover:bg-blue-800"}
                     ${preguntaPreview === idx ? "ring-4 ring-blue-400" : ""}
                  `}
                     onClick={() => setPregunta(idx)}
                  >
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{pregunta.texto}</span>
                        {preguntasEnviadas.includes(idx) && (
                           <span className="ml-2 text-green-300 font-bold">{<icons.io.IoMdCheckmarkCircleOutline size={30} color="white" />} </span>
                        )}
                        <span className="badge badge-soft badge-warning">{pregunta.categoria}</span>
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
