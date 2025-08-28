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

   const [log, setLog] = useState([]);
   /* NUEVO */

   // Puedes agregar aquí más estados y funciones globales

   function handleWSMessage(data) {
      console.log("🚀 ~ handleWSMessage ~ data:", data);
      switch (data.action) {
         case "press":
            console.log("🚀 ~ handleWSMessage ~ equipoActivo:", equipoActivo);
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
   // useEffect(() => {}, [preguntaIdx, preguntaPreview, reveladas, equipoActivo, equipoBloqueado, errores, animX]);
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
      // load simple sounds (these are placeholders, include your own in public/)
      // navigation
      console.log("🚀 ~ JuegoContextProvider ~ window:", window.location.pathname);
      if (!["/", "/tablero"].includes(window.location.pathname)) return;
      s.load("aJugar", sounds.aJugar);
      s.load("botonazo", sounds.botonazo);
      s.load("correcto", sounds.correcto);
      s.load("incorrecto", sounds.incorrecto);
      s.load("RE", sounds.RE);
      s.load("triunfo", sounds.triunfo);
   }, []);

   // useEffect(() => {
   //    // Escuchar mensajes del WebSocket y actualizar el estado global
   //    if (!ws) return;
   //    ws.onmessage = (event) => {
   //       console.log("🚀 ~ JuegoContextProvider ~ event:", event)
   //       try {
   //          const data = JSON.parse(event.data);
   //          // Ejemplo: manejar acciones y actualizar estados
   //          switch (data.action) {
   //             case "setQuestion":
   //                setPreguntaIdx(data.questionIdx);
   //                setEnRobo(false);
   //                setEquipoActivo(null);
   //                setEquipoBloqueado(null);
   //                setAcumuladoRonda(0);
   //                setReveladas({});
   //                setErrores({ e1: 0, e2: 0 });
   //                break;
   //             case "press":
   //                // Activar equipo
   //                setEquipoActivo(data.team);
   //                setEquipoBloqueado(data.team === 1 ? 2 : 1);
   //                break;
   //             // Agrega aquí más acciones según tu flujo
   //             // Por ejemplo: destapar, marcarError, reproducirRepetida, etc.
   //             default:
   //                break;
   //          }
   //       } catch (err) {
   //          console.error("Error al procesar mensaje WS:", err);
   //       }
   //    };
   // }, [ws, s]);

   function mostrarPregunta(i) {
      console.log("🚀 ~ mostrarPregunta ~ mostrarPregunta ~ i:", i);
      console.log("🚀 ~ handleConfirmarPregunta ~ reveladas:", reveladas);

      // send({ action: "setQuestion", questionIdx: i });
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
      console.log("🚀 ~ activarEquipo: todo bien hasta aqui");
      setEquipoActivo(n);
      const contrario = n === 1 ? 2 : 1;
      setEquipoBloqueado(contrario);
      if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
      bloqueoTimer.current = setTimeout(() => setEquipoBloqueado(null), BLOQUEO_MS);
   }

   async function destapar(i) {
      console.log("🚀 ~ destapar ~ i:", i); // 2-1:true
      console.log("🚀 ~ mostrarPregunta ~ reveladas:", reveladas);
      console.log("🚀 ~ destapar ~ preguntaIdx:", preguntaIdx);
      if (!equipoActivo) return s.play("RE");
      if (preguntaIdx == null) return;
      const key = `${preguntaIdx}-${i}`;
      if (reveladas[key]) return;
      setReveladas((prev) => ({ ...prev, [key]: true }));
      const puntos = PREGUNTAS[preguntaIdx].respuestas[i].puntos || 0;
      s.play("correcto");
      await sleep(2000);
      console.log("🚀 ~ mostrarPregunta ~ reveladas2:", reveladas);
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
            // Sigue el equipo activo respondiendo
            setEquipoEsperandoError(equipoActivo); // solo el equipo activo puede marcar error
         } else {
            // Permitir que el equipo contrario intente responder
            setEquipoBloqueado(null); // ambos pueden responder
            // setEquipoActivo(null); // nadie activo hasta que el contrario responda
            setEquipoEsperandoError(null); // nadie esperando error
         }
      }
   }

   function marcarError(slot) {
      console.log("🚀 ~ marcarError ~ slot:", slot);
      if (slot === 0) {
         s.play("incorrecto");
         setAnimX((prev) => ({ ...prev, ind: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, ind: false })), 2000);
         setEquipoActivo(null);
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
