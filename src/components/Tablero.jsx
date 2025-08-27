import React, { useEffect, useRef, useState } from "react";
import RespuestaCard from "./RespuestaCard";
import ControlPanel from "./ControlPanel";
import { PREGUNTAS } from "../data";
import useSound from "../hooks/useSound";
import sounds from "../const/sounds";
import images from "../const/images";
import EquipoPanel, { BgEquipo } from "./EquipoPanel";

const MAX_ERRORES = 3;
const BLOQUEO_MS = 5000;

export default function Tablero() {
   const [preguntaIdx, setPreguntaIdx] = useState(null);
   const [equipoActivo, setEquipoActivo] = useState(null);
   const [equipoBloqueado, setEquipoBloqueado] = useState(null);
   const [errores, setErrores] = useState({ e1: 0, e2: 0 });
   const [reveladas, setReveladas] = useState({}); // key: "q-i"
   const [puntosEquipo, setPuntosEquipo] = useState({ e1: 0, e2: 0 });
   const [enRobo, setEnRobo] = useState(false);
   const [animX, setAnimX] = useState({ e1: false, e2: false });
   const bloqueoTimer = useRef(null);

   // sounds
   const s = useSound();
   useEffect(() => {
      // load simple sounds (these are placeholders, include your own in public/)
      s.load("aJugar", sounds.aJugar);
      s.load("botonazo", sounds.botonazo);
      s.load("correcto", sounds.correcto);
      s.load("incorrecto", sounds.incorrecto);
      s.load("RE", sounds.RE);
      s.load("triunfo", sounds.triunfo);
   }, []);

   // keyboard optional: only activate if allowKeyboard true (toggle)
   const [allowKeyboard, setAllowKeyboard] = useState(true);

   useEffect(() => {
      function handler(e) {
         if (!allowKeyboard) return;
         if (e.key === "1" || e.code === "Numpad1") {
            s.play("botonazo");
            activarEquipo(1);
         }
         if (e.key === "2" || e.code === "Numpad2") {
            s.play("botonazo");
            activarEquipo(2);
         }
      }
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
   }, [allowKeyboard, equipoActivo, equipoBloqueado]);

   function activarEquipo(n) {
      if (equipoBloqueado === n) return;
      if (equipoActivo) return;
      setEquipoActivo(n);
      const contrario = n === 1 ? 2 : 1;
      setEquipoBloqueado(contrario);
      if (bloqueoTimer.current) clearTimeout(bloqueoTimer.current);
      bloqueoTimer.current = setTimeout(() => setEquipoBloqueado(null), BLOQUEO_MS);
   }

   function mostrarPregunta(i) {
      setPreguntaIdx(i);
      setEnRobo(false);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
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
   }

   function totalRonda(idx) {
      if (idx == null) return 0;
      return PREGUNTAS[idx].respuestas.reduce((s, r) => s + (r.puntos || 0), 0);
   }

   function destapar(i) {
      if (preguntaIdx == null) return;
      const key = `${preguntaIdx}-${i}`;
      if (reveladas[key]) return;
      setReveladas((prev) => ({ ...prev, [key]: true }));
      const puntos = PREGUNTAS[preguntaIdx].respuestas[i].puntos || 0;
      s.play("correcto");

      if (enRobo) {
         const t = totalRonda(preguntaIdx);
         if (puntos > 0) {
            setPuntosEquipo((prev) => {
               const copy = { ...prev };
               if (equipoActivo === 1) copy.e1 += t;
               else copy.e2 += t;
               return copy;
            });
         }
         setEnRobo(false);
         setTimeout(() => {}, 600);
         return;
      }

      if (equipoActivo) {
         setPuntosEquipo((prev) => {
            const copy = { ...prev };
            if (equipoActivo === 1) copy.e1 += puntos;
            else copy.e2 += puntos;
            return copy;
         });
      }
   }

   function marcarError(slot) {
      if (!equipoActivo) return;
      if (equipoActivo === 1) {
         setErrores((prev) => {
            const newV = { ...prev, e1: Math.min(MAX_ERRORES, slot) };
            s.play("incorrecto");
            if (newV.e1 >= MAX_ERRORES) activarRobo(2);
            return newV;
         });
         setAnimX((prev) => ({ ...prev, e1: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, e1: false })), 2000);
      } else {
         setErrores((prev) => {
            const newV = { ...prev, e2: Math.min(MAX_ERRORES, slot) };
            s.play("incorrecto");
            if (newV.e2 >= MAX_ERRORES) activarRobo(1);
            return newV;
         });
         setAnimX((prev) => ({ ...prev, e2: true }));
         setTimeout(() => setAnimX((prev) => ({ ...prev, e2: false })), 2000);
      }
   }

   function activarRobo(equipoQueRoba) {
      setEnRobo(true);
      setEquipoActivo(equipoQueRoba);
   }

   function resetJuego() {
      s.play("aJugar");
      setPreguntaIdx(null);
      setEquipoActivo(null);
      setEquipoBloqueado(null);
      setErrores({ e1: 0, e2: 0 });
      setReveladas({});
      setPuntosEquipo({ e1: 0, e2: 0 });
      setEnRobo(false);
   }

   return (
      <>
         <EquipoPanel
            numero={1}
            nombre={"Los pollitos"}
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
            nombre={"Los naranjos"}
            color={"orange"}
            puntos={puntosEquipo.e2}
            errores={errores.e2}
            MAX_ERRORES={MAX_ERRORES}
            activo={equipoActivo === 2}
            bloqueado={equipoBloqueado === 2}
         />
         {equipoActivo === 2 && <BgEquipo numero={2} />}

         {/* TABLERO */}
         <div className="w-full max-w-6xl bg-warning rounded-2xl p-6 shadow-lg mx-auto z-10">
            <div className="flex flex-col items-center justify-between w-full">
               <div className="text-center bg-black rounded-2xl w-3/9 mb-3 p-3">
                  <div className="text-success font-extrabold text-7xl">{totalRonda(preguntaIdx)}</div>
               </div>
               <div className="text-center bg-black rounded-2xl w-full mb-3">
                  <div className="text-5xl font-semibold mb-2 p-3">{preguntaIdx == null ? "!!! A JUGAAARRR !!!" : PREGUNTAS[preguntaIdx].texto}</div>
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
            <div className="flex absolute top-[50%] left-0 justify-center gap-16 -translate-y-1/2 z-50 w-full">
               {animX.e1 &&
                  Array.from({ length: errores.e1 }).map((_, i) => (
                     <img key={i} src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e1 ? 1 : 0 }} />
                  ))}
               {animX.e2 &&
                  Array.from({ length: errores.e2 }).map((_, i) => (
                     <img key={i} src={images.x} alt="X" className="w-[22%] h-[22%] animate-fade" style={{ transition: "opacity 0.5s", opacity: animX.e2 ? 1 : 0 }} />
                  ))}
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
            />
         </div>
      </>
   );
}
