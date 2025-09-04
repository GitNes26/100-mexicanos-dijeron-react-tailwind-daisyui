import { createContext, useContext, useState, useRef, useEffect } from "react";
import useSound from "../hooks/useSound";
import sounds from "../const/sounds";
import { PREGUNTAS } from "../data";
import { sleep } from "../utils/helpers";
import env from "../const/env";

const JuegoContext = createContext();

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
   const [teamNames, setTeamNames] = useState({ e1: "", e2: "" });
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
   const [unoVsUno, setUnoVsUno] = useState(false);
   const [muerteSubita, setMuerteSubita] = useState(false);
   const [showLetrero, setShowLetrero] = useState(false);
   const [rondaActiva, setRondaActiva] = useState(false);

   const [log, setLog] = useState([]);
   const [contadorActivo, setContadorActivo] = useState(false);
   const [tiempoRestante, setTiempoRestante] = useState(10);
   const contadorRef = useRef(null);

   function activarContador() {
      setContadorActivo(true);
      console.log("🚀 ~ activarContador ~ contadorActivo:", contadorActivo);
      setTiempoRestante(tiempoRestante);
      if (contadorRef.current) clearInterval(contadorRef.current);
      contadorRef.current = setInterval(() => {
         setTiempoRestante((prev) => {
            if (prev <= 1) {
               clearInterval(contadorRef.current);
               setContadorActivo(false);
               // Marcar error según la dinámica actual
               if (equipoActivo) {
                  marcarError(equipoActivo === 1 ? errores.e1 + 1 : errores.e2 + 1);
               }
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
   }
   function desactivarContador() {
      setContadorActivo(false);
      setTiempoRestante(tiempoRestante);
      if (contadorRef.current) clearInterval(contadorRef.current);
   }
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
            destapar(data.answerIdx);
            break;
         case "markError":
            marcarError(data.slot);
            break;
         case "activarMuerteSubita":
            activarMuerteSubita();
            break;
         case "contador":
            if (data.activar) activarContador();
            else desactivarContador();
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
         socket = new WebSocket(env.VITE_WS_URL);
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
   }, [preguntaIdx, preguntaPreview, reveladas, equipoActivo, equipoBloqueado, errores, animX, enRobo, unoVsUno]);

   const send = (data) => {
      // console.log("🚀 ~ send ~ data:", data);
      // console.log("🚀 ~ send ~ ws:", ws);
      // console.log("🚀 ~ send ~ WebSocket:", WebSocket.OPEN);
      if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify(data));
      }
   };

   /* NUEVO */
   // sounds
   const s = useSound();
   useEffect(() => {
      // load simple sounds ( these are placeholders, include your own in public/)
      // navigation
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
      s.play("aJugar");
      setRondaActiva(true);
      setPreguntaIdx(i);
      setEnRobo(false);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
      setAcumuladoRonda(0);
      setUnoVsUno(true);
      if (bloqueoTimer.current) {
         clearTimeout(bloqueoTimer.current);
         bloqueoTimer.current = null;
      }
      // // limpiar reveladas de esta pregunta
      // setReveladas((prev) => {
      //    const copy = { ...prev };
      //    Object.keys(copy).forEach((k) => {
      //       if (k.startsWith(i + "-")) delete copy[k];
      //    });
      //    return copy;
      // });
      // limpiar objeto de reveladas
      setReveladas({});
      setErrores({ e1: 0, e2: 0 });
      setPreguntasEnviadas((prev) => [...prev, preguntaPreview]);
      setRondasJugadas((prev) => prev + 1);
      // setPreguntaPreview(null);
   }

   function activarEquipo(n) {
      console.log("🚀 ~ activarEquipo ~ n:", n);
      // Solo permite activar si no hay equipo activo
      if (equipoActivo) return;
      // s.play("botonazo");
      setEquipoActivo(n);
      const contrario = n === 1 ? 2 : 1;
      setEquipoBloqueado(contrario);
      if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
      bloqueoTimer.current = setTimeout(() => setEquipoBloqueado(null), BLOQUEO_MS);
   }

   async function actualizarPuntaje(key = null) {
      const respuestasReveladas = key ? { ...reveladas, [key]: true } : { ...reveladas };
      const destapadas = Object.keys(respuestasReveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length;
      const idxDestapadas = Object.keys(respuestasReveladas).map((k) => Number(k.split(`${preguntaIdx}-`).reverse()[0]));
      console.log("🚀 ~ actualizarPuntaje ~ idxDestapadas:", idxDestapadas);
      setReveladas(respuestasReveladas);
      let puntosAcumulados = 0;
      PREGUNTAS[preguntaIdx].respuestas.map((r, i) => {
         if (idxDestapadas.includes(i)) puntosAcumulados += r.puntos;
      });
      console.log("🚀 ~ actualizarPuntaje ~ puntosAcumulados:", puntosAcumulados);
      return { destapadas, puntosAcumulados };
   }

   async function ganaRonda(puntosAcumulados, equipoGanador = null) {
      s.play("triunfo");
      setShowCelebration(true);
      await sleep(4000);

      const ganador = equipoGanador ? equipoGanador : equipoActivo;

      setPuntosEquipo((prev) => {
         const copy = { ...prev };
         if (ganador === 1) copy.e1 += puntosAcumulados;
         else copy.e2 += puntosAcumulados;
         return copy;
      });
      await sleep(1000);
      setAcumuladoRonda(0);
   }

   async function destapar(i) {
      console.log("🚀 ~ destapar ~ i:", i); // 2-1:true
      if (!equipoActivo) return s.play("RE");
      if (preguntaIdx == null) return;
      const key = `${preguntaIdx}-${i}`;
      if (reveladas[key]) return;

      // const respuestasReveladas = { ...reveladas, [key]: true };
      // const destapadas = Object.keys(respuestasReveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length;
      // setReveladas(respuestasReveladas);
      // // setReveladas((prev) => ({ ...prev, [key]: true }));
      const { destapadas, puntosAcumulados } = await actualizarPuntaje(key);
      const puntos = PREGUNTAS[preguntaIdx].respuestas[i].puntos || 0;
      s.play("correcto");
      // const puntosAcumulados = acumuladoRonda + puntos;
      await sleep(3000);
      setAcumuladoRonda(puntosAcumulados);

      // esta bandera ayuda para poder destapar las respuestas sin que se le sumen puntos a ningun equipo
      if (!rondaActiva) return console.log("hasta aqui para el robo noams destapar");

      console.log("ya se paso el destape con ronda inactiva", rondaActiva ? "activa" : "inactiva");

      // Si hay equipo activo, aplicar lógica de escenario 1
      if (equipoActivo) {
         // ¿Ya se destaparon todas las respuestas?
         const totalRespuestas = PREGUNTAS[preguntaIdx].respuestas.length;
         // const destapadas = Object.keys(reveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length + 1; // +1 por la actual
         if (destapadas === totalRespuestas) {
            // El equipo activo suma el acumulado
            await ganaRonda(puntosAcumulados);
         }

         if (unoVsUno || muerteSubita) {
            if (enRobo) {
               if (puntos < puntosAcumulados - puntos) {
                  setEquipoActivo(equipoActivo === 1 ? 2 : 1);
               }
               setUnoVsUno(false);
               setMuerteSubita(false);
               setEnRobo(false);
               return;
            }
            // ¿Es la respuesta de mayor puntaje?
            const maxPuntos = Math.max(...PREGUNTAS[preguntaIdx].respuestas.map((r) => r.puntos || 0));
            if (puntos === maxPuntos) {
               setEquipoEsperandoError(equipoActivo);
               setUnoVsUno(false);
               setMuerteSubita(false);
            } else {
               if (unoVsUno || muerteSubita) {
                  // Permitir que el equipo contrario intente responder
                  activarRobo(equipoActivo === 1 ? 2 : 1);
                  setEquipoBloqueado(equipoActivo);
                  setEquipoEsperandoError(null);
                  setMuerteSubita(false);
               } else {
                  setEquipoBloqueado(null);
                  setEquipoEsperandoError(null);
               }
            }
         }

         // Si estamos en robo
         if (enRobo) {
            if (unoVsUno || muerteSubita) {
               return;
            }
            if (puntos > 0) {
               // El equipo que roba suma el acumulado + el puntaje de la respuesta que destapó
               // s.play("triunfo");
               // setShowCelebration(true);
               // await sleep(4000);
               // setPuntosEquipo((prev) => {
               //    const copy = { ...prev };
               //    if (equipoActivo === 1) copy.e1 += puntosAcumulados;
               //    else copy.e2 += puntosAcumulados;
               //    return copy;
               // });

               s.play("triunfo");
               setShowCelebration(true);
               await sleep(4000);

               setPuntosEquipo((prev) => {
                  const copy = { ...prev };
                  if (equipoActivo === 1) copy.e1 += puntosAcumulados;
                  else copy.e2 += puntosAcumulados;
                  return copy;
               });
               await sleep(1000);
               setAcumuladoRonda(0);
            } else {
               // si el equipo conrario se equivoca en el robo de puntos, el equipo original se queda con los puntos
               setEquipoActivo(equipoActivo === 1 ? 2 : 1);
               s.play("triunfo");
               setShowCelebration(true);
               await sleep(4000);
               setPuntosEquipo((prev) => {
                  const copy = { ...prev };
                  if (equipoActivo === 1) copy.e2 += puntosAcumulados;
                  else copy.e1 += puntosAcumulados;
                  return copy;
               });
            }
            setRondaActiva(false);
            setEnRobo(false);
            setAcumuladoRonda(0);
            setTimeout(() => {}, 600);
            return;
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

   async function marcarError(slot) {
      console.log("🚀 ~ marcarError ~ slot:", slot);
      if (slot === 0) {
         s.play("incorrecto");
         setAnimX((prev) => ({ ...prev, ind: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, ind: false })), 2000);
         if (!equipoActivo) return;
         // Si ambos equipos fallan, activar muerte súbita (Muerte subita se activara solo manual)
         if (unoVsUno || muerteSubita) {
            if (enRobo) {
               if (unoVsUno && Object.keys(reveladas).length > 0) {
                  setEquipoActivo(equipoActivo === 1 ? 2 : 1);
                  setUnoVsUno(false);
               } else setEquipoActivo(null);
               setEquipoBloqueado(null);
               setEquipoEsperandoError(null);
               setEnRobo(false);
               setMuerteSubita(false);
            } else {
               activarRobo(equipoActivo === 1 ? 2 : 1);
            }
            return;
         }

         if (enRobo) {
            const equipoGanador = equipoActivo === 1 ? 2 : 1;
            setEquipoActivo(equipoGanador);
            const { destapadas, puntosAcumulados } = await actualizarPuntaje();
            ganaRonda(puntosAcumulados, equipoGanador);
            setRondaActiva(false); // para destapar respuestas en caso de que falte destapar
         }
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
      setUnoVsUno(false);
      setMuerteSubita(false);
      setShowCelebration(false);
      setContadorActivo(false);
      setTeamNames({ e1: "", e2: "" });
      setRondaActiva(false);
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
            teamNames,
            setTeamNames,
            /* NUEVO */
            contadorActivo,
            setContadorActivo,
            tiempoRestante,
            setTiempoRestante,
            activarContador,
            desactivarContador,
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
            unoVsUno,
            setUnoVsUno,
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

// NOTAS:
// 0.- FALTA agregar un modal al iniciar el juego para explicar reglas y controles
// ✅ 0.1 .- asignar nombres a los equipos
// ✅ 1.- FALTA agregar animacion de mensaje anunciando para quien son los puntos de la ronda
// ✅ 2.- FALTA agregar animacion de mensaje cuando hay robo de puntos
// ✅ 3.- FALTA indicar con el boton error independiente, para cuando se estan enfrentando los equipos 1vs1 en la primer pregunta de cada ronda, que no se activan errores en el equipo que esta activo, pero si se puede marcar error con el boton independiente para darle oportunidad al equipo contrario de responder, si no respondio ninguno de los 2 bien, pasan los siguiente participantes a si que se vuelven a ahabilitar los botones para activar el equipoActivo
// 4.- FALTA agregar animacion de mensaje cuando un equipo llega a 300 puntos y gana el juego
// 5.- FALTA indicar que si en el robo de puntos, si el equipo que roba responde mal, se le suman los puntos acumulados a el equipo contrario y se pueden destapar las otras respuestas restantes pero ya no sumaran puntos para el acumulado solo para saber cuales eran las respuestas correctas.
// ✅ 6.- FALTA agregarun boton, para activar un contador de 5s para que el equipo activo responda,
// 6.1 .- si no responde en ese tiempo, se le acumulara un error
// 6.2.- si responde bien, hay que cancelar el contador
