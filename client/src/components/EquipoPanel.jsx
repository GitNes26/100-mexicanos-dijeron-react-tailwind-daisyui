import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import images from "../const/images";
import { b } from "framer-motion/client";

export default function EquipoPanel({ numero, nombre, puntos, errores, MAX_ERRORES, activo, bloqueado }) {
   const bg = numero == 1 ? `bg-neutral` : `bg-neutral-content text-neutral`;
   const posicionH = numero == 1 ? `left-25` : `right-25`;
   const textColor = numero == 1 ? `text-red-500` : `text-blue-500`;
   const roundedCard = numero == 1 ? "rounded-l-full" : "rounded-r-full";
   const borderedCard = numero == 1 ? "border-r-0" : "border-l-0";
   const disabled = bloqueado || !activo ? "opacity-100" : "";
   return (
      <div
         className={`absolute card w-96 h-5/12 transition-all bg-warning ${textColor} ${disabled} ${posicionH} top-5/12 z-20 border-8 border-warning-content rounded-2xl ${borderedCard}`}
         style={{ borderRadius: numero === 1 ? "30% 0 0 30% / 30% 0 0 30%" : "0 30% 30% 0 / 0 30% 30% 0" }}
      >
         <div className="card-body items-center text-center flex flex-col justify-between">
            <progress className={`progress ${numero === 1 ? "progress-error" : "progress-info"} w-50`}></progress>
            <h2 className="card-title font-black flex flex-col text-4xl">
               {nombre.toUpperCase()}
               <small className="-mt-3 text-sm font-medium">Equipo {numero}</small>
            </h2>
            <div className="card-actions justify-center bg-black rounded-full p-4 w-full">
               <div className="text-8xl font-black text-shadow-green-950">{puntos}</div>
            </div>
            <div className="mt-2">
               <div className="flex-1 flex justify-center gap-2">
                  {Array.from({ length: MAX_ERRORES }).map((_, i) =>
                     i < errores ? (
                        <img key={i} src={images.x} alt="X" className="w-[18px] h-[18px]" />
                     ) : (
                        <span key={i} className="inline-block w-[18px] h-[18px] rounded-full bg-accent-content border"></span>
                     )
                  )}
               </div>
            </div>
            <progress className={`progress ${numero === 1 ? "progress-error" : "progress-info"} w-50`}></progress>
         </div>
      </div>
   );
}

export function BgEquipo({ numero }) {
   // const finalBg = numero == 1 ? "skeleton bg-neutral duration-700" : "skeleton bg-neutral-content duration-700";
   const finalBg = numero == 1 ? "bg-red-500 duration-700" : "bg-blue-500 duration-700";
   const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-accent",
      "bg-warning",
      "bg-error",
      "bg-success",
      "bg-info",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-teal-500",
      "bg-green-500",
      "bg-lime-500",
      "bg-yellow-500",
      "bg-orange-500"
   ];
   const [bg, setBg] = useState(finalBg);
   useEffect(() => {
      let intervalId;
      let timeoutId;
      let idx = 0;
      setBg(colors[0]);
      intervalId = setInterval(() => {
         idx = (idx + 1) % colors.length;
         setBg(colors[idx]);
      }, 100);
      timeoutId = setTimeout(() => {
         clearInterval(intervalId);
         setBg(finalBg);
      }, 1800);
      return () => {
         clearInterval(intervalId);
         clearTimeout(timeoutId);
      };
   }, [numero]);
   return (
      <div className={`absolute h-full w-[50%] top-0 ${numero === 1 ? "left-0" : "right-0"} z-0`}>
         <div className={twMerge(`h-full w-full transition-colors ${bg} rounded-none`)}></div>
      </div>
   );
}
