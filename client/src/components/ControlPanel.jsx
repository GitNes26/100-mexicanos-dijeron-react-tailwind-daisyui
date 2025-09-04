import React from "react";
export default function ControlPanel({
   onSelectQuestion,
   preguntaIdx,
   onActivateTeam,
   equipoBloqueado,
   equipoActivo,
   onReset,
   errores,
   marcarError,
   enRobo,
   reproducirRepetida
}) {
   return (
      <div className="flex flex-col items-center justify-between mt-6  w-full bg-amber-500">
         {/* ZONA DE RONDAS */}
         <div className="flex gap-2 justify-around w-full">
            {Array.from({ length: 10 }).map((_, i) => (
               <button
                  key={i}
                  onClick={() => onSelectQuestion(i)}
                  className={`btn btn-neutral rounded-full shadow text-5xl font-black p-5 w-25 h-25 ${preguntaIdx === i ? "animate-pulse" : ""}`}
                  disabled={i < preguntaIdx}
               >
                  {i + 1}
               </button>
            ))}
         </div>

         <div className="flex w-full justify-between items-center">
            <div className="mt-4 flex gap-2">
               <div className="flex gap-1">
                  <button onClick={() => marcarError(1)} className={`btn btn-error`} disabled={errores.e1 >= 1 || errores.e2 >= 1}>
                     Err 1
                  </button>
                  <button onClick={() => marcarError(2)} className={`btn btn-error`} disabled={errores.e1 >= 2 || errores.e2 >= 2}>
                     Err 2
                  </button>
                  <button onClick={() => marcarError(3)} className={`btn btn-error`} disabled={errores.e1 >= 3 || errores.e2 >= 3}>
                     Err 3
                  </button>
               </div>

               <div className="flex ml-4 text-sm font-medium text-gray-600">
                  <p>Equipo activo: {equipoActivo ?? "-"}</p>
                  <p>En robo: {enRobo ? "SI" : "NO"}</p>
                  <p className="mt-2">
                     <label className="mr-2">Permitir teclado</label>
                     <input type="checkbox" checked={true} onChange={() => {}} readOnly />
                  </p>
               </div>
            </div>
            <div className="flex gap-2 items-center">
               <button
                  onClick={() => onActivateTeam(1)}
                  disabled={equipoBloqueado === 1 || equipoActivo !== null}
                  className={`btn btn-soft bg-neutral font-bold disabled:${equipoBloqueado === 1 ? "opacity-10" : equipoActivo === 1 ? "opacity-50" : "opacity-100"}`}
               >
                  Seleccionar E1 (<kbd className="kbd">1</kbd>)
               </button>
               <button
                  onClick={() => onActivateTeam(2)}
                  disabled={equipoBloqueado === 2 || equipoActivo !== null}
                  className={`btn btn-soft bg-neutral-content font-bold text-neutral disabled:${
                     equipoBloqueado === 2 ? "opacity-10" : equipoActivo === 2 ? "opacity-50" : "opacity-100"
                  }`}
               >
                  Seleccionar E2 (<kbd className="kbd text-neutral-content">2</kbd>)
               </button>
               {/* BOTONES INDEPENDIENTES DE ERROR Y REPETIDA */}
               <div className="flex justify-center gap-6 mt-6">
                  <button className="btn btn-error text-white text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={() => marcarError(0)}>
                     X
                  </button>
                  <button className="btn btn-warning text-lg font-bold px-6 py-2 rounded-xl shadow" onClick={reproducirRepetida}>
                     R/E
                  </button>
               </div>
               <button onClick={onReset} className="btn btn-accent">
                  Reset Juego
               </button>
            </div>
         </div>
      </div>
   );
}
