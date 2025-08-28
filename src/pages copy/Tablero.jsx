import React, { useEffect, useRef, useState } from "react";
import RespuestaCard from "../components/RespuestaCard";
import ControlPanel from "../components/ControlPanel";
import { PREGUNTAS } from "../data";
import useSound from "../hooks/useSound";
import sounds from "../const/sounds";
import images from "../const/images";
import EquipoPanel, { BgEquipo } from "../components/EquipoPanel";
import { sleep } from "../utils/helpers";
import useSocket from "../hooks/useSocket";
import { useJuegoContext } from "../contexts/JuegoContext";

export default function Tablero() {
   const {
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
      handleConfirmarPregunta,
      mostrarPregunta,
      activarEquipo,
      destapar,
      marcarError,
      reproducirRepetida,
      activarRobo,
      resetJuego,
      log,
      setLog,
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
   } = useJuegoContext();
   // const [preguntaIdx, setPreguntaIdx] = useState(null);
   // const [allowKeyboard, setAllowKeyboard] = useState(true); // keyboard optional: only activate if allowKeyboard true (toggle)
   // const [equipoActivo, setEquipoActivo] = useState(null);
   // const [equipoBloqueado, setEquipoBloqueado] = useState(null);
   // const [errores, setErrores] = useState({ e1: 0, e2: 0 });
   // const [reveladas, setReveladas] = useState({}); // key: "q-i"
   // const [puntosEquipo, setPuntosEquipo] = useState({ e1: 0, e2: 0 });
   // const [acumuladoRonda, setAcumuladoRonda] = useState(0);
   // const [enRobo, setEnRobo] = useState(false);
   // const [animX, setAnimX] = useState({ e1: false, e2: false });
   // const [equipoEsperandoError, setEquipoEsperandoError] = useState(null); // 1 o 2
   // const bloqueoTimer = useRef(null);

   // const [log, setLog] = useState([]);

   // // sounds
   // const s = useSound();
   // useEffect(() => {
   //    // load simple sounds (these are placeholders, include your own in public/)
   //    s.load("aJugar", sounds.aJugar);
   //    s.load("botonazo", sounds.botonazo);
   //    s.load("correcto", sounds.correcto);
   //    s.load("incorrecto", sounds.incorrecto);
   //    s.load("RE", sounds.RE);
   //    s.load("triunfo", sounds.triunfo);
   // }, []);

   useEffect(() => {
      function handler(e) {
         if (!allowKeyboard) return;
         if (e.key === "1" || e.code === "Numpad1") {
            if (!equipoActivo) s.play("botonazo");
            activarEquipo(1);
         }
         if (e.key === "2" || e.code === "Numpad2") {
            if (!equipoActivo) s.play("botonazo");
            activarEquipo(2);
         }
      }
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
   }, [allowKeyboard, equipoActivo, equipoBloqueado]);

   // WebSocket control
   // function handleWSMessage(data) {
   //    console.log("🚀 ~ handleWSMessage ~ data:", data);
   //    switch (data.action) {
   //       case "press":
   //          console.log("🚀 ~ handleWSMessage ~ equipoActivo:", equipoActivo);
   //          if (!equipoActivo) activarEquipo(data.team);
   //          break;
   //       case "activateTeam":
   //          activarEquipo(data.team);
   //          break;
   //       case "setQuestion":
   //          mostrarPregunta(data.questionIdx);
   //          break;
   //       case "markError":
   //          marcarError(data.slot);
   //          break;
   //       case "reset":
   //          resetJuego();
   //          break;
   //       case "repetida":
   //          reproducirRepetida();
   //          break;
   //       // Agrega más casos según tus acciones
   //       default:
   //          console.log("Acción WS desconocida:", data);
   //    }
   // }

   // // useSocket(handleWSMessage)

   // useEffect(() => {
   //    console.log("Tablero ~ preguntaPreview:", preguntaPreview);
   //    const ws = new WebSocket("ws://localhost:8080");
   //    console.log("🚀 ~ Tablero ~ ws:", ws);
   //    ws.onmessage = (msg) => {
   //       console.log("🚀 ~ Tablero ~ msg:", msg);
   //       const data = JSON.parse(msg.data);
   //       setLog((prev) => [...prev, JSON.stringify(data)]);
   //       handleWSMessage(data);
   //    };
   //    return () => ws.close();
   // }, []);

   // function activarEquipo(n) {
   //    // Solo permite activar si no hay equipo activo
   //    if (equipoActivo) return;
   //    setEquipoActivo(n);
   //    const contrario = n === 1 ? 2 : 1;
   //    setEquipoBloqueado(contrario);
   //    if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
   //    bloqueoTimer.current = setTimeout(() => setEquipoBloqueado(null), BLOQUEO_MS);
   // }

   // function mostrarPregunta(i) {
   //    console.log("🚀 ~ mostrarPregunta ~ mostrarPregunta ~ i:", i);
   //    s.play("aJugar");
   //    setPreguntaIdx(i);
   //    setEnRobo(false);
   //    setEquipoActivo(null);
   //    setEquipoBloqueado(null);
   //    setAcumuladoRonda(0);
   //    if (bloqueoTimer.current) {
   //       clearTimeout(bloqueoTimer.current);
   //       bloqueoTimer.current = null;
   //    }
   //    // limpiar reveladas de esta pregunta
   //    setReveladas((prev) => {
   //       const copy = { ...prev };
   //       Object.keys(copy).forEach((k) => {
   //          if (k.startsWith(i + "-")) delete copy[k];
   //       });
   //       return copy;
   //    });
   //    setErrores({ e1: 0, e2: 0 });
   // }

   function totalRonda(idx) {
      if (idx == null) return 0;
      return PREGUNTAS[idx].respuestas.reduce((s, r) => s + (r.puntos || 0), 0);
   }

   // async function destapar(i) {
   //    if (preguntaIdx == null) return;
   //    const key = `${preguntaIdx}-${i}`;
   //    if (reveladas[key]) return;
   //    setReveladas((prev) => ({ ...prev, [key]: true }));
   //    const puntos = PREGUNTAS[preguntaIdx].respuestas[i].puntos || 0;
   //    s.play("correcto");
   //    await sleep(2000);
   //    setAcumuladoRonda((prev) => prev + puntos);

   //    // Si estamos en robo
   //    if (enRobo) {
   //       if (puntos > 0) {
   //          // El equipo que roba suma el acumulado + el puntaje de la respuesta que destapó
   //          setPuntosEquipo((prev) => {
   //             const copy = { ...prev };
   //             if (equipoActivo === 1) copy.e1 += acumuladoRonda + puntos;
   //             else copy.e2 += acumuladoRonda + puntos;
   //             return copy;
   //          });
   //       }
   //       setEnRobo(false);
   //       setAcumuladoRonda(0);
   //       setTimeout(() => {}, 600);
   //       return;
   //    }

   //    // Si hay equipo activo, aplicar lógica de escenario 1
   //    if (equipoActivo) {
   //       // ¿Ya se destaparon todas las respuestas?
   //       const totalRespuestas = PREGUNTAS[preguntaIdx].respuestas.length;
   //       const destapadas = Object.keys(reveladas).filter((k) => k.startsWith(`${preguntaIdx}-`)).length + 1; // +1 por la actual
   //       if (destapadas === totalRespuestas) {
   //          // El equipo activo suma el acumulado
   //          s.play("triunfo");
   //          await sleep(4000);
   //          setPuntosEquipo((prev) => {
   //             const copy = { ...prev };
   //             if (equipoActivo === 1) copy.e1 += acumuladoRonda + puntos;
   //             else copy.e2 += acumuladoRonda + puntos;
   //             return copy;
   //          });
   //          setAcumuladoRonda(0);
   //       }

   //       // ¿Es la respuesta de mayor puntaje?
   //       const maxPuntos = Math.max(...PREGUNTAS[preguntaIdx].respuestas.map((r) => r.puntos || 0));
   //       if (puntos === maxPuntos) {
   //          // Sigue el equipo activo respondiendo
   //          setEquipoEsperandoError(equipoActivo); // solo el equipo activo puede marcar error
   //       } else {
   //          // Permitir que el equipo contrario intente responder
   //          setEquipoBloqueado(null); // ambos pueden responder
   //          // setEquipoActivo(null); // nadie activo hasta que el contrario responda
   //          setEquipoEsperandoError(null); // nadie esperando error
   //       }
   //    }
   // }

   // function reproducirRepetida() {
   //    s.play("RE");
   // }
   // NOTAS:
   // 0.- FALTA agregar un modal al iniciar el juego para explicar reglas y controles y asignar nombres a los equipos
   // 1.- FALTA agregar animacion de mensaje anunciando para quien son los puntos de la ronda
   // 2.- FALTA agregar animacion de mensaje cuando hay robo de puntos
   // 3.- FALTA indicar con el boton error independiente, para cuando se estan enfrentando los equipos 1vs1 en la primer pregunta de cada ronda, que no se activan errores en el equipo que esta activo, pero si se puede marcar error con el boton independiente para darle oportunidad al equipo contrario de responder, si no respondio ninguno de los 2 bien, pasan los siguiente participantes a si que se vuelven a ahabilitar los botones para activar el equipoActivo
   // 4.- FALTA agregar animacion de mensaje cuando un equipo llega a 300 puntos y gana el juego
   // 5.- FALTA indicar que si en el robo de puntos, si el equipo que roba responde mal, se le suman los puntos acumulados a el equipo contrario y se pueden destapar las otras respuestas restantes pero ya no sumaran puntos para el acumulado solo para saber cuales eran las respuestas correctas.
   // 6.- FALTA agregarun boton, para activar un contador de 5s para que el equipo activo responda, si no responde en ese tiempo, se le acumulara un error

   // function marcarError(slot) {
   //    console.log("🚀 ~ marcarError ~ slot:", slot)
   //    console.log("🚀 ~ marcarError ~ equipoEsperandoError:", equipoEsperandoError)
   //    // if (!equipoEsperandoError) return;
   //    // Solo marca error al equipo que está esperando error
   //    // if (equipoEsperandoError === 1) {
   //       setErrores((prev) => {
   //          s.play("incorrecto");
   //          const newV = { ...prev, e1: Math.min(MAX_ERRORES, slot) };
   //          if (newV.e1 >= MAX_ERRORES) activarRobo(2);
   //          return newV;
   //       });
   //       setAnimX((prev) => ({ ...prev, e1: true }));
   //       setTimeout(() => setAnimX((prev) => ({ ...prev, e1: false })), 2000);
   //       // Si no es el tercer error, pasa el turno al contrario
   //       if (slot < MAX_ERRORES) {
   //          setEquipoActivo(2);
   //          setEquipoBloqueado(1);
   //          setEquipoEsperandoError(2);
   //       } else {
   //          setEquipoEsperandoError(null);
   //       }
   //    // } else if (equipoEsperandoError === 2) {
   //       setErrores((prev) => {
   //          s.play("incorrecto");
   //          const newV = { ...prev, e2: Math.min(MAX_ERRORES, slot) };
   //          if (newV.e2 >= MAX_ERRORES) activarRobo(1);
   //          return newV;
   //       });
   //       setAnimX((prev) => ({ ...prev, e2: true }));
   //       setTimeout(() => setAnimX((prev) => ({ ...prev, e2: false })), 2000);
   //       if (slot < MAX_ERRORES) {
   //          setEquipoActivo(1);
   //          setEquipoBloqueado(2);
   //          setEquipoEsperandoError(1);
   //       } else {
   //          setEquipoEsperandoError(null);
   //       }
   //    // }
   // }

   // function marcarError(slot) {
   //    if (slot === 0) {
   //       s.play("incorrecto");
   //       setAnimX((prev) => ({ ...prev, ind: true }));
   //       setTimeout(() => setAnimX((prev) => ({ ...prev, ind: false })), 2000);
   //       setEquipoActivo(null);
   //       return;
   //    }
   //    if (!equipoActivo) return;
   //    if (equipoActivo === 1) {
   //       // Solo permite marcar el siguiente error en orden
   //       if (slot !== errores.e1 + 1) return;
   //       setErrores((prev) => {
   //          s.play("incorrecto");
   //          const newV = { ...prev, e1: Math.min(MAX_ERRORES, slot) };
   //          if (newV.e1 >= MAX_ERRORES) activarRobo(2);
   //          return newV;
   //       });
   //       setAnimX((prev) => ({ ...prev, e1: true }));
   //       setTimeout(() => setAnimX((prev) => ({ ...prev, e1: false })), 2000);
   //    } else {
   //       if (slot !== errores.e2 + 1) return;
   //       setErrores((prev) => {
   //          s.play("incorrecto");
   //          const newV = { ...prev, e2: Math.min(MAX_ERRORES, slot) };
   //          if (newV.e2 >= MAX_ERRORES) activarRobo(1);
   //          return newV;
   //       });
   //       setAnimX((prev) => ({ ...prev, e2: true }));
   //       setTimeout(() => setAnimX((prev) => ({ ...prev, e2: false })), 2000);
   //    }
   // }

   // function activarRobo(equipoQueRoba) {
   //    setEnRobo(true);
   //    setEquipoActivo(equipoQueRoba);
   // }

   // function resetJuego() {
   //    setPreguntaIdx(null);
   //    setEquipoActivo(null);
   //    setEquipoBloqueado(null);
   //    setErrores({ e1: 0, e2: 0 });
   //    setReveladas({});
   //    setPuntosEquipo({ e1: 0, e2: 0 });
   //    setEnRobo(false);
   //    setAcumuladoRonda(0);
   // }

   return (
      <>
         {/* TABLERO */}
         <div className="w-full max-w-6xl rounded-2xl p-6 shadow-lg mx-auto z-20">
            <div className="flex flex-col items-center justify-between w-full">
               <div className="text-center bg-black rounded-2xl w-3/9 mb-3 p-3 rounded-t-full">
                  <div className="text-success font-extrabold text-7xl">{acumuladoRonda}</div>
               </div>
               <div className="text-center bg-black rounded-2xl w-full mb-3">
                  <div className="text-5xl text-success font-semibold mb-2 p-3">{preguntaIdx == null ? "!!! A JUGAAARRR !!!" : PREGUNTAS[preguntaIdx].texto}</div>
               </div>
            </div>

            {/* ZONA DE RESPUESTAS */}
            <div className="card bg-black rounded-2xl shadow-lg mx-25 p-5">
               <div className="grid gap-5">
                  {Array.from({ length: 5 }).map((_, i) => {
                     const key = `${preguntaIdx}-${i}`;
                     const revel = !!reveladas[key];
                     const respuesta = preguntaIdx != null ? PREGUNTAS[preguntaIdx].respuestas[i] : null;
                     return <RespuestaCard key={i} index={i} preguntaIdx={preguntaIdx} revelada={revel} respuesta={respuesta} onReveal={(idx) => destapar(idx)} />;
                  })}
               </div>
            </div>

            {/* ZONA DE ERRORES "X" ANIMADAS */}
            <div className="flex absolute top-[50%] left-0 justify-center gap-16 -translate-y-1/2 w-full" style={{ zIndex: 100 }}>
               {animX.e1 &&
                  Array.from({ length: errores.e1 }).map((_, i) => (
                     <img key={i} src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e1 ? 1 : 0 }} />
                  ))}
               {animX.e2 &&
                  Array.from({ length: errores.e2 }).map((_, i) => (
                     <img key={i} src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e2 ? 1 : 0 }} />
                  ))}
               {animX.ind && (
                  <img src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.ind ? 1 : 0 }} />
               )}
            </div>

            <ControlPanel
               onSelectQuestion={mostrarPregunta}
               preguntaIdx={preguntaIdx}
               onActivateTeam={activarEquipo}
               equipoBloqueado={equipoBloqueado}
               equipoActivo={equipoActivo}
               onReset={resetJuego}
               errores={errores}
               marcarError={marcarError}
               enRobo={enRobo}
               reproducirRepetida={reproducirRepetida}
            />
         </div>

         <EquipoPanel
            numero={1}
            nombre={"Los Rojos"}
            color={"green"}
            puntos={puntosEquipo.e1}
            errores={errores.e1}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 1}
            bloqueado={equipoBloqueado === 1}
         />
         {equipoActivo === 1 && <BgEquipo numero={1} />}

         <EquipoPanel
            numero={2}
            nombre={"Los Azules"}
            color={"orange"}
            puntos={puntosEquipo.e2}
            errores={errores.e2}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 2}
            bloqueado={equipoBloqueado === 2}
         />
         {equipoActivo === 2 && <BgEquipo numero={2} />}

         {/* <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
            <h1 className="text-4xl mb-6">🎮 Tablero</h1>
            <div className="w-2/3 bg-gray-800 p-4 rounded">
               <h2 className="font-bold">Eventos recibidos:</h2>
               <ul className="text-sm">
                  {log.map((line, i) => (
                     <li key={i}>{line}</li>
                  ))}
               </ul>
            </div>
         </div> */}
      </>
   );
}
