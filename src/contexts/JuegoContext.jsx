import { createContext, useContext, useState, useRef, useEffect } from "react";
import useSound from "../hooks/useSound";
import sounds from "../const/sounds";
import { PREGUNTAS } from "../data";
import { sleep } from "../utils/helpers";

export const JuegoContext = createContext();

export function JuegoContextProvider({ children }) {
   const MAX_ERRORES = 3;
   const BLOQUEO_MS = 5000;

   const [ws, setWs] = useState(null);
   const [preguntaPreview, setPreguntaPreview] = useState(null);
   const [preguntasEnviadas, setPreguntasEnviadas] = useState([]);
   const [rondasJugadas, setRondasJugadas] = useState(0);
   /* NUEVO */
   const [preguntaIdx, setPreguntaIdx] = useState(null);
   const [allowKeyboard, setAllowKeyboard] = useState(true); // keyboard optional: only activate if allowKeyboard true (toggle)
   const [equipoActivo, setEquipoActivo] = useState(null);
   const [equipoBloqueado, setEquipoBloqueado] = useState(null);
   const [errores, setErrores] = useState({ e1: 0, e2: 0 });
   const [reveladas, setReveladas] = useState({}); // key: "q-i"
   const [puntosEquipo, setPuntosEquipo] = useState({ e1: 0, e2: 0 });
   const [acumuladoRonda, setAcumuladoRonda] = useState(0);
   const [enRobo, setEnRobo] = useState(false);
   const [animX, setAnimX] = useState({ e1: false, e2: false });
   const [equipoEsperandoError, setEquipoEsperandoError] = useState(null); // 1 o 2
   const bloqueoTimer = useRef(null);
   const [showCelebration, setShowCelebration] = useState(false);
   const [muerteSubita, setMuerteSubita] = useState(false);
   const [showLetrero, setShowLetrero] = useState(false);

   const [log, setLog] = useState([]);
   /* NUEVO */

   // Puedes agregar aquí más estados y funciones globales

   function handleWSMessage(data) {
      console.log("🚀 ~ handleWSMessage ~ data:", data);
      switch (data.action) {
         case "press":
            if (!equipoActivo) activarEquipo(Number(data.team));
            break;
         case "activateTeam":
            activarEquipo(data.team);
            break;
         case "setQuestion":
            mostrarPregunta(data.questionIdx);
            break;
         case "setAnswer":
            // setPreguntaIdx(data.questionIdx);
            destapar(data.answerIdx);
            break;
         case "markError":
            marcarError(data.slot);
            break;
         case "activarMuerteSubita":
            activarMuerteSubita();
            break;
         case "reset":
            resetJuego();
            break;
         case "repetida":
            reproducirRepetida();
            break;
         // Agrega más casos según tus acciones
         default:
            console.log("Acción WS desconocida:", data);
      }
   }

   useEffect(() => {
      let socket;
      let reconnectTimer;
      function connectWS() {
         socket = new WebSocket("ws://localhost:8080");
         setWs(socket);
         socket.onopen = () => {
            console.log("WebSocket conectado");
         };
         socket.onmessage = (msg) => {
            console.log("🚀 ~ JuegoContext ~ msg:", msg);
            const data = JSON.parse(msg.data);
            setLog((prev) => [...prev, JSON.stringify(data)]);
            handleWSMessage(data);
         };
         socket.onclose = () => {
            console.warn("WebSocket cerrado, reintentando en 2s...");
            // reconnectTimer = setTimeout(connectWS, 2000);
         };
         socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            socket.close();
         };
      }
      connectWS();
      return () => {
         if (socket) socket.close();
         if (reconnectTimer) clearTimeout(reconnectTimer);
      };
   }, [preguntaIdx, preguntaPreview, reveladas, equipoActivo, equipoBloqueado, errores, animX]);

   const send = (data) => {
      console.log("🚀 ~ send ~ data:", data);
      // console.log("🚀 ~ send ~ ws:", ws);
      // console.log("🚀 ~ send ~ WebSocket:", WebSocket.OPEN);
      if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify(data));
      }
   };

   const handleConfirmarPregunta = () => {
      // console.log("🚀 ~ handleConfirmarPregunta ~ handleConfirmarPregunta:", preguntaPreview);
      // if (preguntaPreview != null) {
      //    // send({ action: "setQuestion", questionIdx: preguntaPreview });
      //    setPreguntasEnviadas((prev) => [...prev, preguntaPreview]);
      //    setRondasJugadas((prev) => prev + 1);
      //    setPreguntaPreview(null);
      // }
   };

   /* NUEVO */
   // sounds
   const s = useSound();
   useEffect(() => {
      // load simple sounds ( these are placeholders, include your own in public/)
      // navigation
      console.log("🚀 ~ JuegoContextProvider ~ window:", window.location.pathname);
      if (!["/", "/tablero"].includes(window.location.pathname)) return;
      s.load("aJugar", sounds.aJugar);
      s.load("botonazo", sounds.botonazo);
      s.load("correcto", sounds.correcto);
      s.load("incorrecto", sounds.incorrecto);
      s.load("RE", sounds.RE);
      s.load("triunfo", sounds.triunfo);
      s.load("robo", sounds.robo);
   }, []);

   function mostrarPregunta(i) {
      console.log("🚀 ~ mostrarPregunta ~ mostrarPregunta ~ i:", i);
      console.log("🚀 ~ handleConfirmarPregunta ~ reveladas:", reveladas);

      s.play("aJugar");
      setPreguntaIdx(i);
      setEnRobo(false);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
      setAcumuladoRonda(0);
      if (bloqueoTimer.current) {
         clearTimeout(bloqueoTimer.current);
         bloqueoTimer.current = null;
      }
      // limpiar reveladas de esta pregunta
      setReveladas((prev) => {
         const copy = { ...prev };
         Object.keys(copy).forEach((k) => {
            if (k.startsWith(i + "-")) delete copy[k];
         });
         return copy;
      });
      setErrores({ e1: 0, e2: 0 });
      setPreguntasEnviadas((prev) => [...prev, preguntaPreview]);
      setRondasJugadas((prev) => prev + 1);
      // setPreguntaPreview(null);
   }

   function activarEquipo(n) {
      console.log("🚀 ~ activarEquipo ~ n:", n);
      // Solo permite activar si no hay equipo activo
      if (equipoActivo) return;
      s.play("botonazo");
      setEquipoActivo(n);
      const contrario = n === 1 ? 2 : 1;
      setEquipoBloqueado(contrario);
      if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
      bloqueoTimer.current = setTimeout(() => setEquipoBloqueado(null), BLOQUEO_MS);
   }

   async function destapar(i) {
      console.log("🚀 ~ destapar ~ i:", i); // 2-1:true
      if (!equipoActivo) return s.play("RE");
      if (preguntaIdx == null) return;
      const key = `${preguntaIdx}-${i}`;
      if (reveladas[key]) return;
      setReveladas((prev) => ({ ...prev, [key]: true }));
      const puntos = PREGUNTAS[preguntaIdx].respuestas[i].puntos || 0;
      s.play("correcto");
      await sleep(3000);
      setAcumuladoRonda((prev) => prev + puntos);

      // Si estamos en robo
      if (enRobo) {
         if (puntos > 0) {
            // El equipo que roba suma el acumulado + el puntaje de la respuesta que destapó
            setPuntosEquipo((prev) => {
               const copy = { ...prev };
               if (equipoActivo === 1) copy.e1 += acumuladoRonda + puntos;
               else copy.e2 += acumuladoRonda + puntos;
               return copy;
            });
         }
         setEnRobo(false);
         setAcumuladoRonda(0);
         setTimeout(() => {}, 600);
         return;
      }

      // Si hay equipo activo, aplicar lógica de escenario 1
      if (equipoActivo) {
         // ¿Ya se destaparon todas las respuestas?
         const totalRespuestas = PREGUNTAS[preguntaIdx].respuestas.length;
         const destapadas = Object.keys(reveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length + 1; // +1 por la actual
         if (destapadas === totalRespuestas) {
            // El equipo activo suma el acumulado
            s.play("triunfo");
            setShowCelebration(true);
            await sleep(4000);

            setPuntosEquipo((prev) => {
               const copy = { ...prev };
               if (equipoActivo === 1) copy.e1 += acumuladoRonda + puntos;
               else copy.e2 += acumuladoRonda + puntos;
               return copy;
            });
            setAcumuladoRonda(0);
         }

         // ¿Es la respuesta de mayor puntaje?
         const maxPuntos = Math.max(...PREGUNTAS[preguntaIdx].respuestas.map((r) => r.puntos || 0));
         if (puntos === maxPuntos) {
            setEquipoEsperandoError(equipoActivo);
            setMuerteSubita(false);
         } else {
            const totalRespuestas = PREGUNTAS[preguntaIdx].respuestas.length;
            const destapadas = Object.keys(reveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length + 1;
            if (destapadas === 1 || muerteSubita) {
               // Permitir que el equipo contrario intente responder
               setEquipoActivo(equipoActivo === 1 ? 2 : 1);
               setEquipoBloqueado(equipoActivo);
               setEquipoEsperandoError(null);
               setMuerteSubita(false);
            } else {
               setEquipoBloqueado(null);
               setEquipoEsperandoError(null);
            }
         }
      }
   }

   function activarMuerteSubita() {
      s.play("robo");
      setMuerteSubita(true);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
      setEquipoEsperandoError(null);
      setShowLetrero(true);
      // sleep(3000);
      // setShowLetrero(false);
      // Aquí podrías disparar una animación en Tablero
   }

   function marcarError(slot) {
      console.log("🚀 ~ marcarError ~ slot:", slot);
      if (slot === 0) {
         s.play("incorrecto");
         setAnimX((prev) => ({ ...prev, ind: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, ind: false })), 2000);
         // Si ambos equipos fallan, activar muerte súbita
         setEquipoActivo(null);
         setEquipoBloqueado(null);
         setEquipoEsperandoError(null);
         setMuerteSubita(true);
         return;
      }
      if (!equipoActivo) return;
      if (equipoActivo === 1) {
         // Solo permite marcar el siguiente error en orden
         if (slot !== errores.e1 + 1) return;
         setErrores((prev) => {
            s.play("incorrecto");
            const newV = { ...prev, e1: Math.min(MAX_ERRORES, slot) };
            if (newV.e1 >= MAX_ERRORES) activarRobo(2);
            return newV;
         });
         setAnimX((prev) => ({ ...prev, e1: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, e1: false })), 2000);
      } else {
         if (slot !== errores.e2 + 1) return;
         setErrores((prev) => {
            s.play("incorrecto");
            const newV = { ...prev, e2: Math.min(MAX_ERRORES, slot) };
            if (newV.e2 >= MAX_ERRORES) activarRobo(1);
            return newV;
         });
         setAnimX((prev) => ({ ...prev, e2: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, e2: false })), 2000);
      }
   }

   function reproducirRepetida() {
      s.play("RE");
   }

   function activarRobo(equipoQueRoba) {
      s.play("robo");
      setEnRobo(true);
      setEquipoActivo(equipoQueRoba);
   }

   function resetJuego() {
      console.log("🚀 ~ resetJuego ~ resetJuego:");
      setPreguntaIdx(null);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
      setErrores({ e1: 0, e2: 0 });
      setReveladas({});
      setPuntosEquipo({ e1: 0, e2: 0 });
      setEnRobo(false);
      setAcumuladoRonda(0);
      setRondasJugadas(0);
      setPreguntasEnviadas([]);
      setPreguntaPreview(null);
      setShowLetrero(false);
   }
   /* NUEVO */

   return (
      <JuegoContext.Provider
         value={{
            MAX_ERRORES,
            BLOQUEO_MS,
            ws,
            setWs,
            preguntaPreview,
            setPreguntaPreview,
            preguntasEnviadas,
            setPreguntasEnviadas,
            rondasJugadas,
            setRondasJugadas,
            send,
            handleConfirmarPregunta,
            /* NUEVO */
            mostrarPregunta,
            activarEquipo,
            destapar,
            marcarError,
            reproducirRepetida,
            activarRobo,
            resetJuego,
            log,
            setLog,
            showCelebration,
            setShowCelebration,
            muerteSubita,
            setMuerteSubita,
            activarMuerteSubita,
            showLetrero,
            setShowLetrero,

            handleWSMessage,
            /* estados */
            s,
            preguntaIdx,
            setPreguntaIdx,
            allowKeyboard,
            setAllowKeyboard,
            equipoActivo,
            setEquipoActivo,
            equipoBloqueado,
            setEquipoBloqueado,
            errores,
            setErrores,
            reveladas,
            setReveladas,
            puntosEquipo,
            setPuntosEquipo,
            acumuladoRonda,
            setAcumuladoRonda,
            enRobo,
            setEnRobo,
            animX,
            setAnimX,
            equipoEsperandoError,
            setEquipoEsperandoError
            /* estados */
         }}
      >
         {children}
      </JuegoContext.Provider>
   );
}

export function useJuegoContext() {
   return useContext(JuegoContext);
}
