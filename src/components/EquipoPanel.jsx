import React from "react";
import { twMerge } from "tailwind-merge";
import images from "../const/images";
export default function EquipoPanel({ numero, nombre, puntos, errores, MAX_ERRORES, activo, bloqueado }) {
   const bg = numero == 1 ? `bg-neutral` : `bg-neutral-content text-neutral`;
   const disabled = bloqueado || !activo ? "opacity-65" : "";
   return (
      <div className={`card w-96 transition-all ${bg} ${disabled}`}>
         <div className="card-body items-center text-center">
            <h2 className="card-title font-black flex flex-col text-2xl">
               {nombre.toUpperCase()}
               <small className="-mt-4 text-xs font-light">Equipo {numero}</small>
            </h2>
            <div className="card-actions justify-center">
               <div className="text-7xl font-black">{puntos}</div>
            </div>
            <div className="mt-2">
               {/* Errores: {errores} / {MAX_ERRORES} */}
               <div className="flex-1 flex justify-center gap-2">
                  {Array.from({ length: MAX_ERRORES }).map((_, i) =>
                     i < errores ? (
                        <img key={i} src={images.x} alt="X" className="w-[18px] h-[18px]" />
                     ) : (
                        <span key={i} className="inline-block w-[18px] h-[18px] rounded-full bg-gray-300 border border-gray-500"></span>
                     )
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

export function BgEquipo({ numero }) {
   const bg = numero == 1 ? `bg-neutral` : `bg-neutral-content`;
   console.log("🚀 ~ BgEquipo ~ bg:", bg);
   return (
      <div className={`absolute card h-full w-[50%] top-0 ${numero === 1 ? "left-0" : "right-0"} z-0`}>
         <div className={twMerge(`skeleton h-full w-full ${bg}`)}></div>
      </div>
   );
}
