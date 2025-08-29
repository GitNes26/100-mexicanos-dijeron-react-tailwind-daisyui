import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function RespuestaCard({ index, preguntaIdx, revelada, respuesta, onReveal }) {
   const [showPoints, setShowPoints] = useState(false);

   // Cuando se revela la respuesta, esperar 2s para mostrar puntaje
   useEffect(() => {
      if (revelada) {
         const timer = setTimeout(() => setShowPoints(true), 2000);
         return () => clearTimeout(timer);
      } else {
         setShowPoints(false);
      }
   }, [revelada]);

   return (
      <motion.div
         layout
         className={`relative w-full p-3 rounded-md bg-black text-success overflow-hidden ${!revelada ? "hover:cursor-pointer placeholder-box" : ""}`}
         // onClick={() => onReveal(index)}
      >
         <AnimatePresence mode="popLayout">
            {!revelada ? (
               <motion.div
                  key={`placeholder-preguntaIdx-${preguntaIdx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center"
               >
                  <div className="text-3xl font-semibold">
                     {index + 1}. .....................................................................................
                  </div>
                  <div className="text-3xl font-semibold">....</div>
               </motion.div>
            ) : (
               <motion.div
                  key={`respuesta-${preguntaIdx}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center"
               >
                  <div className="text-3xl font-bold">
                     {index + 1}. {respuesta?.texto}
                  </div>
                  {showPoints ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: 0.6 }} className="text-3xl font-bold">
                        {respuesta?.puntos}
                     </motion.div>
                  ) : (
                     <div className="text-3xl font-semibold">....</div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}
