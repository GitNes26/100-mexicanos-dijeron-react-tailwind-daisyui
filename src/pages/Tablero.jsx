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
import FormEquipos from "../components/FormEquipos";

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
      showCelebration,
      setShowCelebration,
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
   const [showNameModal, setShowNameModal] = useState(true);
   const [teamNames, setTeamNames] = useState({ e1: "", e2: "" });

   useEffect(() => {
      setShowNameModal(true);
   }, [teamNames.e1 === "" || teamNames.e2 === ""]); // Se muestra cada vez que inicia o se resetea

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
         {showNameModal && <FormEquipos teamNames={teamNames} setTeamNames={setTeamNames} setShowNameModal={setShowNameModal} />}

         {showCelebration && <Celebration teamNumber={2} teamName={"LOS ALELUYA"} onClose={showCelebration} />}

         {/* ZONA DE ERRORES "X" ANIMADAS */}
         <div className="flex absolute top-[65%] left-0 justify-center gap-10 -translate-y-1/2 w-full z-40" style={{ zIndex: 100 }}>
            {animX.e1 &&
               Array.from({ length: errores.e1 }).map((_, i) => (
                  <img key={i} src={images.x} alt="X" className="animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e1 ? 1 : 0 }} />
               ))}

            {animX.e2 &&
               Array.from({ length: errores.e2 }).map((_, i) => (
                  <img key={i} src={images.x} alt="X" className="animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e2 ? 1 : 0 }} />
               ))}
            {animX.ind && <img src={images.x} alt="X" className="animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.ind ? 1 : 0 }} />}
         </div>

         {/* TABLERO */}
         <div className="tablero h-screen max-h-screen flex flex-col items-center w-full py-5 z-20">
            {/* MARCADOR */}
            <div className="flex items-center justify-between w-4/12 p-8 pb-0 bg-warning rounded-t-full">
               <div className="text-center bg-black rounded-2xl w-full p-3 rounded-t-full">
                  <div className="text-success font-extrabold text-9xl">{acumuladoRonda}</div>
               </div>
            </div>

            {/* PREGUNTA */}
            <div className="flex items-center justify-between w-8/12 p-8 pb-2 bg-warning rounded-2xl">
               <div className="text-center bg-black rounded-2xl w-full mb-3">
                  <div className="text-5xl text-success font-semibold mb-2 p-3">{preguntaIdx == null ? "!!! A JUGAAARRR !!!" : PREGUNTAS[preguntaIdx].texto}</div>
               </div>
            </div>

            {/* ZONA DE RESPUESTAS  max-w-6xl*/}
            <div className="flex items-center justify-between w-7/12 flex-1 p-8 bg-warning rounded-b-2xl shadow-lg">
               <div className="card w-full h-full bg-black rounded-2xl shadow-lg mx-20 p-5">
                  <div className="grid h-full" style={{ alignContent: "space-around" }}>
                     {Array.from({ length: 5 }).map((_, i) => {
                        const key = `${preguntaIdx}-${i}`;
                        const revel = !!reveladas[key];
                        const respuesta = preguntaIdx != null ? PREGUNTAS[preguntaIdx].respuestas[i] : null;
                        return <RespuestaCard key={i} index={i} preguntaIdx={preguntaIdx} revelada={revel} respuesta={respuesta} onReveal={(idx) => destapar(idx)} />;
                     })}
                  </div>
               </div>
            </div>

            {/* DECORACION DEL FINAL */}
            <div className="flex items-center justify-between w-5/12 h-8 p-2 px-5 bg-warning rounded-b-xl">
               {Array.from({ length: 12 }).map((_, i) => (
                  <div className="flex flex-col items-center justify-between h-4 w-4 bg-black rounded-full"></div>
               ))}
            </div>
         </div>

         <EquipoPanel
            numero={1}
            nombre={teamNames.e1 || "Equipo 1"}
            color={"red"}
            puntos={puntosEquipo.e1}
            errores={errores.e1}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 1}
            bloqueado={equipoBloqueado === 1}
         />
         {equipoActivo === 1 && <BgEquipo numero={1} />}

         <EquipoPanel
            numero={2}
            nombre={teamNames.e2 || "Equipo 2"}
            color={"blue"}
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
