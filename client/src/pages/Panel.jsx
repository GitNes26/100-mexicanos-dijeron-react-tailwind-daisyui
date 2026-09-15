import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useJuegoContext } from "../contexts/JuegoContext.jsx";
import icons from "../const/icons.js";
import Swal from "sweetalert2";
import { PREGUNTAS as PREGUNTAS_ANTERIORES } from "../data_v2";

const jsonBanks = import.meta.glob("../data/question-banks/*.json", { eager: true, import: "default" });

export default function Panel() {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const roomCode = searchParams.get("room");

   const {
      PREGUNTAS,
      wsReady,
      send,
      unirseaSala,
      equipos,
      setEquipos,
      setPreguntas,
      ronda,
      equipoActivo,
      equipoBloqueado,
      preguntaPreview,
      setPreguntaPreview,
      preguntasEnviadas,
      setPreguntasEnviadas,
      resetJuego,
      contadorActivo,
      tiempoRestante
   } = useJuegoContext();

   const [search, setSearch] = useState("");
   const [bancoSeleccionado, setBancoSeleccionado] = useState("data-torreon-90-2026");
   const [bancosExtra, setBancosExtra] = useState([]);
   const archivoBancoRef = useRef(null);
   const bancosJson = [...Object.entries(jsonBanks).map(([path, data]) => ({ id: path.split("/").pop().replace(/\.json$/, ""), nombre: data?.nombre || path.split("/").pop(), preguntas: data?.preguntas || [] })), ...bancosExtra];
   const categorias = Array.from(new Set(PREGUNTAS.map((p) => p.categoria).filter(Boolean)));
   const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
   const categoriasFiltradas = categorias;
   const preguntasFiltradas = PREGUNTAS.filter(
      (p) => (!search || p.texto.toLowerCase().includes(search.toLowerCase())) && (!categoriaSeleccionada || p.categoria === categoriaSeleccionada)
   );

   useEffect(() => {
      if (!roomCode) navigate("/", { replace: true });
      else if (wsReady) unirseaSala(roomCode);
   }, [roomCode, wsReady]);

   function cargarBanco(id) {
      setBancoSeleccionado(id);
      if (id === "integrado") { setPreguntas(PREGUNTAS_ANTERIORES); setPreguntasEnviadas([]); setPreguntaPreview(null); send({ action: "updateQuestions", preguntas: PREGUNTAS_ANTERIORES }); return; }
      const banco = bancosJson.find((item) => item.id === id);
      if (!banco?.preguntas?.length) return;
      setPreguntas(banco.preguntas);
      setPreguntasEnviadas([]);
      setPreguntaPreview(null);
      send({ action: "updateQuestions", preguntas: banco.preguntas });
   }

   function validarBanco(data) {
      if (!data || !Array.isArray(data.preguntas) || !data.preguntas.length) return "El JSON debe incluir un arreglo preguntas con al menos una pregunta.";
      const valido = data.preguntas.every((p) => typeof p.texto === "string" && p.texto.trim() && Array.isArray(p.respuestas) && p.respuestas.length > 0 && p.respuestas.every((r) => typeof r.texto === "string" && Number.isFinite(Number(r.puntos))));
      return valido ? null : "Cada pregunta debe tener texto y respuestas con texto y puntos numéricos.";
   }

   function importarBanco(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
         try {
            const data = JSON.parse(reader.result);
            const error = validarBanco(data);
            if (error) return Swal.fire({ title: "JSON no válido", text: error, icon: "error" });
            const id = `archivo-${Date.now()}`;
            const banco = { id, nombre: data.nombre || file.name, preguntas: data.preguntas };
            setBancosExtra((prev) => [...prev, banco]);
            setBancoSeleccionado(id);
            setPreguntas(banco.preguntas);
            setPreguntasEnviadas([]);
            setPreguntaPreview(null);
            send({ action: "updateQuestions", preguntas: banco.preguntas });
         } catch { Swal.fire({ title: "No se pudo leer el archivo", text: "Selecciona un JSON válido.", icon: "error" }); }
      };
      reader.readAsText(file);
      event.target.value = "";
   }

   function setPregunta(idx) {
      setPreguntaPreview(idx);
   }

   function destaparRespuesta(answerIdx) {
      if (ronda.preguntaIdx === null && preguntaPreview === null) return;
      send({ action: "setAnswer", answerIdx });
   }

   const sendAllState = (nombres, pts) => {
      send({ action: "updateAllState", teamNames: nombres, puntosEquipo: pts });
   };

   const handleCloseRoom = () => {
      Swal.fire({
         title: "¿Cerrar sala?",
         text: "Todos los jugadores de esta sala serán redirigidos al lobby",
         icon: "warning",
         showCancelButton: true,
         confirmButtonColor: "#dc2626",
         cancelButtonColor: "#6b7280",
         confirmButtonText: "Sí, cerrar sala",
         cancelButtonText: "Cancelar"
      }).then((result) => {
         if (result.isConfirmed) {
            resetJuego();
            send({ action: "closeRoom" });
         }
      });
   };

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
                     Rondas: <span className="bg-warning-content px-1 rounded">{ronda.jugadas}</span>
                  </span>
                  <span>
                     Equipo: <span className="bg-warning-content px-1 rounded">{equipoActivo ?? "-"}</span>
                  </span>
                  <span>
                     Ronda Activa: <span className="bg-warning-content px-1 rounded">{ronda.activa ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     1 vs 1: <span className="bg-warning-content px-1 rounded">{ronda.unoVsUno ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     Robo: <span className="bg-warning-content px-1 rounded">{ronda.enRobo ? "SI" : "NO"}</span>
                  </span>
                  <span>
                     Muerte Subita: <span className="bg-warning-content px-1 rounded">{ronda.muerteSubita ? "SI" : "NO"}</span>
                  </span>
               </div>
               <button onClick={() => send({ action: "reset" })} className="btn btn-soft">
                  Reset Juego
               </button>
               <button onClick={handleCloseRoom} className="btn btn-error text-white font-bold h-full">
                  Cerrar Sala
               </button>
            </div>
         </div>

         {/* CUERPO */}
         <div className="flex-grow flex gap-2 min-h-0">
            {/* VISTA PREVIA */}
            <div className="card bg-gray-800 flex-1 p-4 overflow-y-auto min-h-0">
               <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-gray-700 p-3">
                  <label htmlFor="banco-preguntas" className="font-bold">Banco de preguntas:</label>
                  <select id="banco-preguntas" className="select select-bordered min-w-56" value={bancoSeleccionado} onChange={(e) => cargarBanco(e.target.value)} disabled={ronda.activa}>
                     <option value="integrado">Banco anterior (data_v2)</option>
                     {bancosJson.map((banco) => <option key={banco.id} value={banco.id}>{banco.nombre} ({banco.preguntas.length})</option>)}
                  </select>
                  <input ref={archivoBancoRef} type="file" accept="application/json,.json" className="hidden" onChange={importarBanco} />
                  <button type="button" className="btn btn-sm btn-outline btn-warning" onClick={() => archivoBancoRef.current?.click()} disabled={ronda.activa}>Cargar JSON</button>
                  <span className="text-xs opacity-70">Selecciona antes de enviar la primera pregunta.</span>
               </div>
               <div className="bg-gray-700 p-2 rounded-lg mb-4">
                  <div className="text-3xl font-semibold text-center mb-2">{PREGUNTAS[preguntaPreview]?.texto ?? "Selecciona una pregunta"}</div>
                  <ul className="pl-4">
                     {preguntaPreview !== null
                        ? PREGUNTAS[preguntaPreview]?.respuestas.map((r, i) => (
                             <li
                                key={`key-respuesta-${i}`}
                                className={`mb-5 text-3xl font-semibold transition-all btn w-full ${
                                   ronda.reveladas[`${preguntaPreview}-${i}`] === true ? "text-green-400 opacity-75" : "cursor-pointer hover:font-black"
                                }`}
                                onClick={() => (ronda.reveladas[`${preguntaPreview}-${i}`] === true ? null : destaparRespuesta(i))}
                             >
                                {i + 1}. {r.texto} <span className="text-yellow-400 font-bold">{r.puntos}</span>
                             </li>
                          ))
                        : Array.from({ length: 5 }).map((_, i) => (
                             <li key={i} className="mb-5 text-3xl font-semibold btn w-full" disabled>
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
                           const noEnviadas = PREGUNTAS.map((_, idx) => idx).filter((idx) => !preguntasEnviadas.includes(idx));
                           if (noEnviadas.length === 0) return;
                           setPregunta(noEnviadas[Math.floor(Math.random() * noEnviadas.length)]);
                        }}
                        disabled={PREGUNTAS.length === preguntasEnviadas.length}
                     >
                        {<icons.fa.FaRandom />} Pregunta Random
                     </button>
                  </div>
               </div>

               <div className="divider divider-warning font-bold text-2xl sm:text-base">FILTROS DE BUSQUEDA PREGUNTAS</div>
               <div className="flex gap-2 w-full justify-center items-center bg-gray-700 p-4 rounded-lg">
                  <fieldset className="fieldset w-full">
                     <legend className="fieldset-legend">Buscador General</legend>
                     <input type="text" className="input w-full" placeholder="Ingresa tu busqueda..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </fieldset>
                  <fieldset className="fieldset w-full">
                     <legend className="fieldset-legend">Categorías</legend>
                     <select className="select w-full" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {categoriasFiltradas.map((cat, i) => (
                           <option key={i} value={cat}>
                              {cat}
                           </option>
                        ))}
                     </select>
                  </fieldset>
               </div>
            </div>

            {/* CONTROLES */}
            <div className="card bg-gray-800 w-2/5 p-4 overflow-y-auto min-h-0">
               <h2 className="text-lg font-bold text-center mb-2">MARCADOR</h2>
               <div className="bg-gray-700 p-2 rounded-lg mb-4">
                  <div className="flex gap-2 w-full">
                     {/* EQUIPO 1 */}
                     <div className={`flex-grow flex justify-center items-center card card-body gap-2 bg-red-500 ${equipoActivo === 1 ? "skeleton" : "opacity-75"}`}>
                        <div className="font-medium text-lg">
                           Equipo 1
                           <button
                              onClick={() => send({ action: "activateTeam", team: 1 })}
                              disabled={equipoBloqueado === 1 || equipoActivo !== null}
                              className="btn btn-sm ml-3 bg-red-600 font-bold"
                              style={{ opacity: equipoBloqueado === 1 ? 0.4 : equipoActivo === 1 ? 0.5 : 1 }}
                           >
                              ACTIVAR
                           </button>
                        </div>
                        <div className="flex gap-2">
                           <input
                              className="input"
                              placeholder="Nombre"
                              type="search"
                              value={equipos[1].nombre}
                              onChange={(e) => {
                                 const name = e.target.value.toUpperCase();
                                 const newNames = { e1: name, e2: equipos[2].nombre };
                                 setEquipos((prev) => ({ ...prev, 1: { ...prev[1], nombre: name } }));
                                 send({ action: "updateTeamName", team: "e1", name });
                                 sendAllState(newNames, { e1: equipos[1].puntos, e2: equipos[2].puntos });
                              }}
                           />
                           <input
                              className="input"
                              placeholder="Ptos"
                              type="number"
                              value={equipos[1].puntos}
                              onChange={(e) => {
                                 const pts = parseInt(e.target.value, 10) || 0;
                                 setEquipos((prev) => ({ ...prev, 1: { ...prev[1], puntos: pts } }));
                                 send({ action: "updateTeamScore", team: "e1", score: pts });
                                 sendAllState({ e1: equipos[1].nombre, e2: equipos[2].nombre }, { e1: pts, e2: equipos[2].puntos });
                              }}
                           />
                        </div>
                        <button className="btn btn-wide" type="button" onClick={() => send({ action: "darVictoria", team: 1 })}>
                           DAR VICTORIA 🎉
                        </button>
                     </div>
                     {/* PUNTOS ACUMULADOS */}
                     <div className="flex-grow flex justify-center items-center card card-body gap-2 bg-black text-success font-black">
                        Puntaje <span className="text-5xl">{ronda.acumulado}</span>
                     </div>
                     {/* EQUIPO 2 */}
                     <div className={`flex-grow flex justify-center items-center card card-body gap-2 bg-blue-500 ${equipoActivo === 2 ? "skeleton" : "opacity-75"}`}>
                        <div className="font-medium text-lg">
                           Equipo 2
                           <button
                              onClick={() => send({ action: "activateTeam", team: 2 })}
                              disabled={equipoBloqueado === 2 || equipoActivo !== null}
                              className="btn btn-sm ml-3 bg-blue-600 font-bold"
                              style={{ opacity: equipoBloqueado === 2 ? 0.4 : equipoActivo === 2 ? 0.5 : 1 }}
                           >
                              ACTIVAR
                           </button>
                        </div>
                        <div className="flex gap-2">
                           <input
                              className="input"
                              placeholder="Nombre"
                              type="search"
                              value={equipos[2].nombre}
                              onChange={(e) => {
                                 const name = e.target.value.toUpperCase();
                                 setEquipos((prev) => ({ ...prev, 2: { ...prev[2], nombre: name } }));
                                 send({ action: "updateTeamName", team: "e2", name });
                                 sendAllState({ e1: equipos[1].nombre, e2: name }, { e1: equipos[1].puntos, e2: equipos[2].puntos });
                              }}
                           />
                           <input
                              className="input"
                              placeholder="Ptos"
                              type="number"
                              value={equipos[2].puntos}
                              onChange={(e) => {
                                 const pts = parseInt(e.target.value, 10) || 0;
                                 setEquipos((prev) => ({ ...prev, 2: { ...prev[2], puntos: pts } }));
                                 send({ action: "updateTeamScore", team: "e2", score: pts });
                                 sendAllState({ e1: equipos[1].nombre, e2: equipos[2].nombre }, { e1: equipos[1].puntos, e2: pts });
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
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Marcar Errores</p>
                     <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <button
                              key={`btn-error-${i + 1}`}
                              onClick={() => send({ action: "markError", slot: i + 1 })}
                              className="btn btn-error btn-circle font-black btn-xl sm:btn-md"
                              disabled={
                                 equipos[1].errores >= i + 1 || equipos[2].errores >= i + 1 || ronda.unoVsUno || ronda.enRobo || ronda.muerteSubita || !ronda.activa
                              }
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Activar Equipo</p>
                     <div className="flex gap-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                           <button
                              key={`btn-activar-equipo-${i}`}
                              onClick={() => send({ action: "activateTeam", team: i + 1 })}
                              disabled={equipoBloqueado === i + 1 || equipoActivo !== null}
                              className="btn btn-soft btn-xl sm:btn-md font-bold"
                              style={{ backgroundColor: i === 0 ? "#ef4444" : "#3b82f6", opacity: equipoBloqueado === i + 1 ? 0.4 : equipoActivo === i + 1 ? 0.5 : 1 }}
                           >
                              E{i + 1} <kbd className="kbd">{i + 1}</kbd>
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Contador (10 seg)</p>
                     <button
                        className={`btn btn-warning ${contadorActivo ? "btn-outline" : ""}`}
                        onClick={() => send({ action: "contador", activar: !contadorActivo })}
                     >
                        {contadorActivo ? `Desactivar (${tiempoRestante}s)` : "Activar Contador"}
                     </button>
                  </div>
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Repetir Resp.</p>
                     <button className="btn btn-warning btn-xl sm:btn-md text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={() => send({ action: "repetida" })}>
                        R/E
                     </button>
                  </div>
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Muerte Subita</p>
                     <button
                        onClick={() => send({ action: "activarMuerteSubita" })}
                        className="btn btn-error btn-xl sm:btn-md text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                     >
                        Activar
                     </button>
                  </div>
                  <div className="flex flex-col flex-grow gap-2 justify-center items-center bg-gray-700 p-4 rounded-lg">
                     <p className="font-medium text-2xl sm:text-base">Mostrar X</p>
                     <button
                        className="btn btn-error btn-xl sm:btn-md text-white text-lg font-bold px-6 py-2 rounded-xl shadow"
                        onClick={() => send({ action: "markError", slot: 0 })}
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
                     ${preguntaPreview === idx ? "ring-4 ring-blue-400" : ""}`}
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
                           <span className="ml-2 text-green-300 font-bold">{<icons.io.IoMdCheckmarkCircleOutline size={30} color="white" />}</span>
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
