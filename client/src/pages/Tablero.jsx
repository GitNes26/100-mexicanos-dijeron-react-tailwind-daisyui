import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import RespuestaCard from "../components/RespuestaCard";
import images from "../const/images";
import EquipoPanel, { BgEquipo } from "../components/EquipoPanel";
import { useJuegoContext } from "../contexts/JuegoContext";
import Celebration from "../components/Celebracion";
import FormEquipos from "../components/FormEquipos";
import Letrero from "../components/Letrero";
import LoadingScreen from "../components/LoadingScreen";

export default function Tablero() {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const roomCode = searchParams.get("room");

   const {
      PREGUNTAS,
      MAX_ERRORES,
      wsReady,
      send,
      unirseaSala,
      setEquipos,
      equipos,
      ronda,
      equipoActivo,
      equipoBloqueado,
      animX,
      showCelebration,
      setShowCelebration,
      showLetrero,
      setShowLetrero,
      contadorActivo,
      tiempoRestante,
      s,
      allowKeyboard,
      mostrarPregunta,
      activarEquipo,
      destapar,
      marcarError
   } = useJuegoContext();

   const [showNameModal, setShowNameModal] = useState(true);

   useEffect(() => {
      if (!roomCode) navigate("/", { replace: true });
      else if (wsReady) unirseaSala(roomCode);
   }, [roomCode, wsReady]);

   useEffect(() => {
      if (equipos[1].nombre === "" && equipos[2].nombre === "") setShowNameModal(true);
   }, [equipos[1].nombre, equipos[2].nombre]);

   useEffect(() => {
      function handler(e) {
         if (!allowKeyboard) return;
         if (e.key === "1" || e.code === "Numpad1") {
            if (!equipoActivo) s.play("botonazo");
            send({ action: "press", team: 1 });
         }
         if (e.key === "2" || e.code === "Numpad2") {
            if (!equipoActivo) s.play("botonazo");
            send({ action: "press", team: 2 });
         }
      }
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
   }, [allowKeyboard, equipoActivo, send]);

   const onCloseCelebration = () => setShowCelebration(false);

   if (!wsReady) {
      return <LoadingScreen title="Encendiendo el tablero…" detail={`Preparando la sala ${roomCode || "—"}`} />;
   }

   return (
      <>
         {showNameModal && (
            <FormEquipos
               equipos={equipos}
               setEquipos={setEquipos}
               sendSync={(names, scores) => send({ action: "updateAllState", teamNames: names, puntosEquipo: scores })}
               setShowNameModal={setShowNameModal}
            />
         )}

         {showCelebration && (
            <Celebration teamNumber={equipoActivo} teamName={equipoActivo === 1 ? equipos[1].nombre : equipos[2].nombre} onClose={onCloseCelebration} />
         )}

         {contadorActivo && (
            <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">
               <div className="bg-red-700 text-white text-6xl font-bold p-6 rounded-full shadow-xl border-4 border-yellow-400 animate-pulse">{tiempoRestante}s</div>
            </div>
         )}

         {showLetrero && ronda.muerteSubita && (
            <Letrero titulo={"¡MUERTE SÚBITA!"} mensaje={"El que conteste primero la más popular gana el turno"} onClose={setShowLetrero} />
         )}

         {showLetrero && ronda.enRobo && <Letrero titulo={"¡ROBO DE PUNTOS!"} mensaje={"El equipo que robó responde"} onClose={setShowLetrero} />}

         <div className="flex absolute top-[65%] left-0 justify-center gap-10 -translate-y-1/2 w-full z-40" style={{ zIndex: 100 }}>
            {animX.e1 && Array.from({ length: equipos[1].errores }).map((_, i) => <img key={i} src={images.x} alt="X" className="animate-fade" />)}
            {animX.e2 && Array.from({ length: equipos[2].errores }).map((_, i) => <img key={i} src={images.x} alt="X" className="animate-fade" />)}
            {animX.ind && <img src={images.x} alt="X" className="animate-fade" />}
         </div>

         <div className="tablero h-screen max-h-screen flex flex-col items-center w-full py-5 z-20">
            <div className="flex items-center justify-between w-4/12 p-8 pb-0 bg-warning border-8 border-warning-content border-b-warning rounded-t-full z-10">
               <div className="text-center bg-black rounded-2xl w-full p-3 rounded-t-full">
                  <div className="text-success font-extrabold text-9xl">{ronda.acumulado}</div>
               </div>
            </div>

            <div className="flex flex-col items-center justify-between w-8/12 p-8 pb-2 bg-warning border-8 border-warning-content rounded-2xl -mt-2">
               <div className="text-center bg-black rounded-2xl w-full mb-3">
                  <div className="text-5xl text-success font-semibold mb-2 p-3">
                     {ronda.preguntaIdx == null ? "!!! A JUGAAARRR !!!" : PREGUNTAS[ronda.preguntaIdx].texto}
                  </div>
               </div>
               {(ronda.enRobo || ronda.muerteSubita) && (
                  <div className="absolute mt-21 card p-3 skeleton bg-red-700 text-center text-lg text-white font-semibold">
                     {ronda.enRobo ? (ronda.unoVsUno ? "ROBO DE TURNO" : "ROBO DE PUNTOS") : ""}
                     {ronda.muerteSubita ? "MUERTE SUBITA ACTIVADA" : ""}
                  </div>
               )}
            </div>

            <div className="flex items-center justify-between w-7/12 flex-1 p-8 bg-warning border-8 border-warning-content border-t-warning rounded-b-2xl -mt-2">
               <div className="card w-full h-full bg-black rounded-2xl shadow-lg mx-20 p-5">
                  <div className="grid h-full" style={{ alignContent: "space-around" }}>
                     {Array.from({ length: 5 }).map((_, i) => {
                        const revel = !!ronda.reveladas[`${ronda.preguntaIdx}-${i}`];
                        const respuesta = ronda.preguntaIdx != null ? PREGUNTAS[ronda.preguntaIdx].respuestas[i] : null;
                        return <RespuestaCard key={i} index={i} preguntaIdx={ronda.preguntaIdx} revelada={revel} respuesta={respuesta} />;
                     })}
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between w-6/12 h-8 p-2 px-5 bg-warning border-8 border-warning-content border-t-warning rounded-b-xl -mt-2">
               {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-between h-4 w-4 bg-black rounded-full -mt-2"></div>
               ))}
            </div>
         </div>

         <EquipoPanel
            numero={1}
            nombre={equipos[1].nombre || "Equipo 1"}
            puntos={equipos[1].puntos}
            errores={equipos[1].errores}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 1}
            bloqueado={equipoBloqueado === 1}
         />
         {equipoActivo === 1 && <BgEquipo numero={1} />}

         <EquipoPanel
            numero={2}
            nombre={equipos[2].nombre || "Equipo 2"}
            puntos={equipos[2].puntos}
            errores={equipos[2].errores}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 2}
            bloqueado={equipoBloqueado === 2}
         />
         {equipoActivo === 2 && <BgEquipo numero={2} />}
      </>
   );
}
