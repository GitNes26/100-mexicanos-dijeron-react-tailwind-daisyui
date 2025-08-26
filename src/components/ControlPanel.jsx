import React from "react";
export default function ControlPanel({ onSelectQuestion, onActivateTeam, equipoBloqueado, equipoActivo, onReset }) {
   return (
      <div className="flex items-center justify-between mt-6">
         <div className="flex gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
               <button key={i} onClick={() => onSelectQuestion(i)} className="px-3 py-2 bg-slate-800 text-white rounded shadow">
                  {i + 1}
               </button>
            ))}
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
            <button onClick={onReset} className="btn btn-accent">
               Reset Juego
            </button>
         </div>
      </div>
   );
}
