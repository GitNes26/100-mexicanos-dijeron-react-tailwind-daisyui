import { createContext, useContext, useState, useRef, useEffect, useMemo } from "react";
import useSound from "../hooks/useSound";
import sounds from "../const/sounds";
import { PREGUNTAS } from "../data";
import { sleep } from "../utils/helpers";
import env from "../const/env";

const JuegoContext = createContext();

export function JuegoContextProvider({ children }) {
   const MAX_ERRORES = 3;
   const BLOQUEO_MS = 5000;
   const META_PUNTOS = 300;

   // --- WebSocket / Sala ---
   const [ws, setWs] = useState(null);
   const wsRef = useRef(null);
   const [wsReady, setWsReady] = useState(false);
   const [wsError, setWsError] = useState(null);
   const [roomCode, setRoomCode] = useState(null);

   // --- Equipos (TODO: nombre, puntos, errores, activo, bloqueado, esperandoError) ---
   const [equipos, setEquipos] = useState({
      1: { nombre: "", puntos: 0, errores: 0, activo: false, bloqueado: false, esperandoError: false },
      2: { nombre: "", puntos: 0, errores: 0, activo: false, bloqueado: false, esperandoError: false }
   });
   const bloqueoTimer = useRef(null);

   // Valores derivados (para mantener compatibilidad con consumidores)
   const eqActivo = equipos[1].activo ? 1 : equipos[2].activo ? 2 : null;
   const eqBloqueado = equipos[1].bloqueado ? 1 : equipos[2].bloqueado ? 2 : null;
   const eqEsperandoError = equipos[1].esperandoError ? 1 : equipos[2].esperandoError ? 2 : null;

   // --- Ronda ---
   const [ronda, setRonda] = useState({
      activa: false,
      preguntaIdx: null,
      acumulado: 0,
      jugadas: 0,
      reveladas: {},
      enRobo: false,
      unoVsUno: false,
      muerteSubita: false
   });

   // --- UI / Admin ---
   const [preguntaPreview, setPreguntaPreview] = useState(null);
   const [preguntasEnviadas, setPreguntasEnviadas] = useState([]);
   const [allowKeyboard, setAllowKeyboard] = useState(true);
   const [animX, setAnimX] = useState({ e1: false, e2: false });
   const [showCelebration, setShowCelebration] = useState(false);
   const [showLetrero, setShowLetrero] = useState(false);
   const [teamVictoria, setTeamVictoria] = useState(null);
   const [contadorActivo, setContadorActivo] = useState(false);
   const [tiempoRestante, setTiempoRestante] = useState(10);
   const contadorRef = useRef(null);
   const [log, setLog] = useState([]);

   // --- Sonidos ---
   const s = useSound();
   useEffect(() => {
      if (!["/", "/tablero"].includes(window.location.pathname)) return;
      s.load("aJugar", sounds.aJugar);
      s.load("botonazo", sounds.botonazo);
      s.load("correcto", sounds.correcto);
      s.load("incorrecto", sounds.incorrecto);
      s.load("RE", sounds.RE);
      s.load("triunfo", sounds.triunfo);
      s.load("robo", sounds.robo);
      s.load("temporizador", sounds.temporizador);
   }, []);

   // --- WebSocket ---
   const handleWSMessageRef = useRef(null);

   function handleWSMessage(data) {
      switch (data.action) {
         case "roomCreated":
            setRoomCode(data.code);
            break;
         case "roomJoined":
            setRoomCode(data.code);
            break;
         case "playerJoined":
            break;
         case "updateAllState":
            if (data.teamNames)
               setEquipos((prev) => ({ ...prev, 1: { ...prev[1], nombre: data.teamNames.e1 || "" }, 2: { ...prev[2], nombre: data.teamNames.e2 || "" } }));
            if (data.puntosEquipo)
               setEquipos((prev) => ({ ...prev, 1: { ...prev[1], puntos: data.puntosEquipo.e1 ?? 0 }, 2: { ...prev[2], puntos: data.puntosEquipo.e2 ?? 0 } }));
            break;
         case "syncAll":
            if (data.teamNames)
               setEquipos((prev) => ({ ...prev, 1: { ...prev[1], nombre: data.teamNames.e1 || "" }, 2: { ...prev[2], nombre: data.teamNames.e2 || "" } }));
            if (data.puntosEquipo)
               setEquipos((prev) => ({ ...prev, 1: { ...prev[1], puntos: data.puntosEquipo.e1 ?? 0 }, 2: { ...prev[2], puntos: data.puntosEquipo.e2 ?? 0 } }));
            break;
         case "error":
            setWsError(data.message);
            break;
         case "updateTeamName":
            setEquipos((prev) => ({ ...prev, [data.team === "e1" ? 1 : 2]: { ...prev[data.team === "e1" ? 1 : 2], nombre: data.name } }));
            break;
         case "updateTeamScore":
            console.log("updateTeamScore", data);
            setEquipos((prev) => ({ ...prev, [data.team === "e1" ? 1 : 2]: { ...prev[data.team === "e1" ? 1 : 2], puntos: data.score } }));
            break;
         case "press":
            if (!eqActivo) {
               s.play("botonazo");
               activarEquipo(Number(data.team));
            }
            break;
         case "activateTeam":
            activarEquipo(data.team);
            break;
         case "setQuestion":
            mostrarPregunta(data.questionIdx);
            break;
         case "setAnswer":
            destapar(data.answerIdx);
            break;
         case "markError":
            marcarError(data.slot);
            break;
         case "activarMuerteSubita":
            activarMuerteSubita();
            break;
         case "contador":
            data.activar ? activarContador() : desactivarContador();
            break;
         case "darVictoria":
            victoria(data.team);
            break;
         case "reset":
            resetJuego();
            break;
         case "repetida":
            reproducirRepetida();
            break;
         case "goToLobby":
            resetJuego();
            window.location.hash = "#/";
            break;
      }
   }

   handleWSMessageRef.current = handleWSMessage;

   useEffect(() => {
      let socket, reconnectTimer;
      function connectWS() {
         socket = new WebSocket(env.VITE_WS_URL);
         setWs(socket);
         wsRef.current = socket;
         socket.onopen = () => {
            setWsReady(true);
            setWsError(null);
         };
         socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            setLog((prev) => [...prev, JSON.stringify(data)]);
            handleWSMessageRef.current(data);
         };
         socket.onclose = () => {
            setWsReady(false);
            setWsError("Conexión perdida. Reconectando...");
            reconnectTimer = setTimeout(connectWS, 2000);
         };
         socket.onerror = () => socket.close();
      }
      connectWS();
      return () => {
         if (socket) socket.close();
         if (reconnectTimer) clearTimeout(reconnectTimer);
      };
   }, []);

   function crearSala() {
      setWsError(null);
      send({ action: "createRoom" });
   }
   function unirseaSala(code) {
      setWsError(null);
      send({ action: "joinRoom", code });
   }

   const send = (data) => {
      const socket = wsRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
   };

   // --- Contador ---
   function activarContador() {
      setContadorActivo(true);
      setTiempoRestante(10);
      if (contadorRef.current) clearInterval(contadorRef.current);
      s.play("temporizador");
      contadorRef.current = setInterval(() => {
         setTiempoRestante((prev) => {
            if (prev <= 1) {
               clearInterval(contadorRef.current);
               setContadorActivo(false);
               s.stop("temporizador");
               // agregar aqui
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
   }
   function desactivarContador() {
      s.stop("temporizador");
      setContadorActivo(false);
      setTiempoRestante(10);
      if (contadorRef.current) clearInterval(contadorRef.current);
   }

   // --- Game Logic ---
   function mostrarPregunta(i) {
      s.play("aJugar");
      setRonda({ activa: true, preguntaIdx: i, acumulado: 0, jugadas: ronda.jugadas + 1, reveladas: {}, enRobo: false, unoVsUno: true, muerteSubita: false });
      setEquipos((prev) => ({
         ...prev,
         1: { ...prev[1], errores: 0, activo: false, bloqueado: false, esperandoError: false },
         2: { ...prev[2], errores: 0, activo: false, bloqueado: false, esperandoError: false }
      }));
      setPreguntasEnviadas((prev) => [...prev, i]);
      if (bloqueoTimer.current) {
         clearTimeout(bloqueoTimer.current);
         bloqueoTimer.current = null;
      }
   }

   function activarEquipo(n) {
      if (eqActivo) return;
      setEquipos((prev) => ({
         ...prev,
         1: { ...prev[1], activo: n === 1, bloqueado: n === 2 },
         2: { ...prev[2], activo: n === 2, bloqueado: n === 1 }
      }));
      if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
      bloqueoTimer.current = setTimeout(
         () => setEquipos((prev) => ({ ...prev, 1: { ...prev[1], bloqueado: false }, 2: { ...prev[2], bloqueado: false } })),
         BLOQUEO_MS
      );
   }

   async function actualizarPuntaje(key = null) {
      const prevReveladas = ronda.reveladas;
      const respuestasReveladas = key ? { ...prevReveladas, [key]: true } : { ...prevReveladas };
      const destapadas = Object.keys(respuestasReveladas).filter((k) => k.startsWith(`${ronda.preguntaIdx}-`)).length;
      const idxDestapadas = Object.keys(respuestasReveladas).map((k) => Number(k.split(`${ronda.preguntaIdx}-`).reverse()[0]));
      setRonda((prev) => ({ ...prev, reveladas: respuestasReveladas }));
      let puntosAcumulados = 0;
      PREGUNTAS[ronda.preguntaIdx]?.respuestas.forEach((r, i) => {
         if (idxDestapadas.includes(i)) puntosAcumulados += r.puntos;
      });
      return { destapadas, puntosAcumulados };
   }

   async function ganaRonda(puntosAcumulados, equipoGanador = null) {
      s.play("triunfo");
      setShowCelebration(true);
      await sleep(4000);
      const ganador = equipoGanador || eqActivo;
      setEquipos((prev) => ({ ...prev, [ganador]: { ...prev[ganador], puntos: prev[ganador].puntos + puntosAcumulados } }));
      await sleep(1000);
      setRonda((prev) => ({ ...prev, acumulado: 0, activa: false }));
   }

   function victoria(team) {
      s.play("triunfo");
      setTeamVictoria(team);
      setShowCelebration(true);
   }

   async function destapar(i) {
      desactivarContador();
      if (!eqActivo) return s.play("RE");
      if (ronda.preguntaIdx == null) return;
      const key = `${ronda.preguntaIdx}-${i}`;
      if (ronda.reveladas[key]) return;
      const { destapadas, puntosAcumulados } = await actualizarPuntaje(key);
      const puntos = PREGUNTAS[ronda.preguntaIdx].respuestas[i].puntos || 0;
      s.play("correcto");
      await sleep(3000);
      setRonda((prev) => ({ ...prev, acumulado: puntosAcumulados }));
      if (!ronda.activa) return;
      if (eqActivo) {
         const totalRespuestas = PREGUNTAS[ronda.preguntaIdx].respuestas.length;
         if (destapadas === totalRespuestas) {
            await ganaRonda(puntosAcumulados);
            return;
         }
         const maxPuntos = Math.max(...PREGUNTAS[ronda.preguntaIdx].respuestas.map((r) => r.puntos || 0));
         if (ronda.unoVsUno || ronda.muerteSubita) {
            if (ronda.enRobo) {
               if (puntos < puntosAcumulados - puntos)
                  setEquipos((prev) => ({ ...prev, 1: { ...prev[1], activo: eqActivo === 2 }, 2: { ...prev[2], activo: eqActivo === 1 } })); //setRonda((prev) => ({ ...prev, unoVsUno: false, muerteSubita: false, enRobo: false }));
               // if (puntos === maxPuntos) setRonda((prev) => ({ ...prev, unoVsUno: false, muerteSubita: false, enRobo: false }));
               // else {

               setRonda((prev) => ({ ...prev, unoVsUno: false, muerteSubita: false, enRobo: false }));
               // }
               return;
            }
            if (puntos === maxPuntos) {
               setEquipos((prev) => ({
                  ...prev,
                  [eqActivo]: { ...prev[eqActivo], esperandoError: true },
                  [eqActivo === 1 ? 2 : 1]: { ...prev[eqActivo === 1 ? 2 : 1], esperandoError: false }
               }));
               setRonda((prev) => ({ ...prev, muerteSubita: false, unoVsUno: false }));
            } else {
               activarRobo(eqActivo === 1 ? 2 : 1);
               setEquipos((prev) => ({ ...prev, [eqActivo]: { ...prev[eqActivo], bloqueado: true, esperandoError: false } }));
            }
            setRonda((prev) => ({ ...prev, muerteSubita: false }));
            return;
         }
         if (ronda.enRobo) {
            if (puntos > 0) {
               s.play("triunfo");
               setShowCelebration(true);
               await sleep(4000);
               setEquipos((prev) => ({ ...prev, [eqActivo]: { ...prev[eqActivo], puntos: prev[eqActivo].puntos + puntosAcumulados } }));
               await sleep(1000);
            } else {
               const otro = eqActivo === 1 ? 2 : 1;
               setEquipos((prev) => ({ ...prev, 1: { ...prev[1], activo: otro === 1 }, 2: { ...prev[2], activo: otro === 2 } }));
               s.play("triunfo");
               setShowCelebration(true);
               await sleep(4000);
               setEquipos((prev) => ({ ...prev, [otro]: { ...prev[otro], puntos: prev[otro].puntos + puntosAcumulados } }));
            }
            setRonda((prev) => ({ ...prev, activa: false, enRobo: false, acumulado: 0 }));
         }
      }
   }

   function activarMuerteSubita() {
      s.play("robo");
      setRonda((prev) => ({ ...prev, muerteSubita: true }));
      setEquipos((prev) => ({
         ...prev,
         1: { ...prev[1], activo: false, bloqueado: false, esperandoError: false },
         2: { ...prev[2], activo: false, bloqueado: false, esperandoError: false }
      }));
      setShowLetrero(true);
   }

   async function marcarError(slot) {
      if (slot === 0) {
         s.play("incorrecto");
         setAnimX((prev) => ({ ...prev, ind: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, ind: false })), 2000);
         if (!eqActivo) return;
         if (ronda.unoVsUno || ronda.muerteSubita) {
            if (ronda.enRobo) {
               if (ronda.unoVsUno && Object.keys(ronda.reveladas).length > 0) {
                  setEquipos((prev) => ({ ...prev, 1: { ...prev[1], activo: eqActivo === 2 }, 2: { ...prev[2], activo: eqActivo === 1 } }));
                  setRonda((prev) => ({ ...prev, unoVsUno: false }));
               } else setEquipos((prev) => ({ ...prev, 1: { ...prev[1], activo: false }, 2: { ...prev[2], activo: false } }));
               setEquipos((prev) => ({
                  ...prev,
                  1: { ...prev[1], bloqueado: false, esperandoError: false },
                  2: { ...prev[2], bloqueado: false, esperandoError: false }
               }));
               setRonda((prev) => ({ ...prev, enRobo: false, muerteSubita: false }));
            } else activarRobo(eqActivo === 1 ? 2 : 1);
            return;
         }
         if (ronda.enRobo) {
            const equipoGanador = eqActivo === 1 ? 2 : 1;
            setEquipos((prev) => ({ ...prev, 1: { ...prev[1], activo: equipoGanador === 1 }, 2: { ...prev[2], activo: equipoGanador === 2 } }));
            const { puntosAcumulados } = await actualizarPuntaje();
            ganaRonda(puntosAcumulados, equipoGanador);
            setRonda((prev) => ({ ...prev, activa: false }));
         }
         return;
      }
      if (!eqActivo) return;
      const eqKey = eqActivo;
      if (slot !== equipos[eqKey].errores + 1) return;
      s.play("incorrecto");
      setEquipos((prev) => {
         const err = Math.min(MAX_ERRORES, slot);
         if (err >= MAX_ERRORES) activarRobo(eqActivo === 1 ? 2 : 1);
         return { ...prev, [eqKey]: { ...prev[eqKey], errores: err } };
      });
      setAnimX((prev) => ({ ...prev, [eqKey === 1 ? "e1" : "e2"]: true }));
      setTimeout(() => setAnimX((prev) => ({ ...prev, [eqKey === 1 ? "e1" : "e2"]: false })), 2000);
   }

   function reproducirRepetida() {
      s.play("RE");
   }

   function activarRobo(equipoQueRoba) {
      s.play("robo");
      setRonda((prev) => ({ ...prev, enRobo: true }));
      setEquipos((prev) => ({
         ...prev,
         1: { ...prev[1], activo: equipoQueRoba === 1, bloqueado: equipoQueRoba === 2 },
         2: { ...prev[2], activo: equipoQueRoba === 2, bloqueado: equipoQueRoba === 1 }
      }));
   }

   function resetJuego() {
      setEquipos({
         1: { nombre: "", puntos: 0, errores: 0, activo: false, bloqueado: false, esperandoError: false },
         2: { nombre: "", puntos: 0, errores: 0, activo: false, bloqueado: false, esperandoError: false }
      });
      setRonda({ activa: false, preguntaIdx: null, acumulado: 0, jugadas: 0, reveladas: {}, enRobo: false, unoVsUno: false, muerteSubita: false });
      setPreguntasEnviadas([]);
      setPreguntaPreview(null);
      setShowLetrero(false);
      setShowCelebration(false);
      setContadorActivo(false);
      setTeamVictoria(null);
   }

   const contextValue = useMemo(
      () => ({
         MAX_ERRORES,
         BLOQUEO_MS,
         META_PUNTOS,
         ws,
         wsReady,
         wsError,
         roomCode,
         crearSala,
         unirseaSala,
         send,
         equipos,
         setEquipos,
         ronda,
         setRonda,
         equipoActivo: eqActivo,
         equipoBloqueado: eqBloqueado,
         equipoEsperandoError: eqEsperandoError,
         animX,
         setAnimX,
         preguntaPreview,
         setPreguntaPreview,
         preguntasEnviadas,
         setPreguntasEnviadas,
         allowKeyboard,
         setAllowKeyboard,
         showCelebration,
         setShowCelebration,
         showLetrero,
         setShowLetrero,
         contadorActivo,
         tiempoRestante,
         mostrarPregunta,
         activarEquipo,
         destapar,
         marcarError,
         reproducirRepetida,
         activarRobo,
         resetJuego,
         activarMuerteSubita,
         activarContador,
         desactivarContador,
         handleWSMessage,
         s,
         victoria,
         teamVictoria
      }),
      [
         MAX_ERRORES,
         BLOQUEO_MS,
         META_PUNTOS,
         ws,
         wsReady,
         wsError,
         roomCode,
         crearSala,
         unirseaSala,
         send,
         equipos,
         setEquipos,
         ronda,
         setRonda,
         eqActivo,
         eqBloqueado,
         eqEsperandoError,
         animX,
         setAnimX,
         preguntaPreview,
         setPreguntaPreview,
         preguntasEnviadas,
         setPreguntasEnviadas,
         allowKeyboard,
         setAllowKeyboard,
         showCelebration,
         setShowCelebration,
         showLetrero,
         setShowLetrero,
         contadorActivo,
         tiempoRestante,
         mostrarPregunta,
         activarEquipo,
         destapar,
         marcarError,
         reproducirRepetida,
         activarRobo,
         resetJuego,
         activarMuerteSubita,
         activarContador,
         desactivarContador,
         handleWSMessage,
         s,
         victoria,
         teamVictoria
      ]
   );

   return <JuegoContext.Provider value={contextValue}>{children}</JuegoContext.Provider>;
}

export function useJuegoContext() {
   return useContext(JuegoContext);
}
