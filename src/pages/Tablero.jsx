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
import Celebration from "../components/Celebracion";

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
   const [showCelebration, setShowCelebration] = useState(false);

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

   return (
      <>
         <Celebration teamNumber={1} teamName={"LOS ALELUYA"} onClose={showCelebration} />
         {/* TABLERO */}
         <div className="flex flex-col z-20 items-center justify-between relative">
            <div className="flex flex-col items-center justify-between w-full bg-warning-content">
               <div className="text-center bg-black rounded-2xl w-5/9 mb-3 p-3 rounded-t-full">
                  <div className="text-success font-extrabold text-9xl">{acumuladoRonda}</div>
               </div>
               <div className="text-center bg-black rounded-2xl w-full mb-3">
                  <div className="text-5xl text-success font-semibold mb-2 p-3">{preguntaIdx == null ? "!!! A JUGAAARRR !!!" : PREGUNTAS[preguntaIdx].texto}</div>
               </div>
            </div>
            <div className="w-full bg-warning max-w-6xl rounded-2xl p-6 shadow-lg mx-auto">
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
               <div className="flex absolute top-[50%] left-0 justify-center gap-16 -translate-y-1/2 w-full z-40" style={{ zIndex: 100 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                     <img key={i} src={images.x} alt="X" className="w-[22%] h-[22%]  z-40" style={{ transition: "opacity 0.5s", opacity: animX.e1 ? 1 : 1 }} />
                  ))}
                  {animX.e2 &&
                     Array.from({ length: errores.e2 }).map((_, i) => (
                        <img
                           key={i}
                           src={images.x}
                           alt="X"
                           className="w-[22%] h-[22%] animate-fade"
                           style={{ transition: "opacity 0.5s", opacity: animX.e2 ? 1 : 0 }}
                        />
                     ))}
                  {animX.ind && (
                     <img src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.ind ? 1 : 0 }} />
                  )}
               </div>
            </div>
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
      </>
   );
}
