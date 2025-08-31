import { useEffect, useState } from "react";
import { sleep } from "../utils/helpers";

const Letrero = ({ titulo, mensaje, onClose }) => {
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      console.log("🚀 ~ Letrero ~ useEffect:", onClose);

      setIsVisible(true);
      sleep(5000).then(() => {
         setIsVisible(false);
         setTimeout(onClose, 500);
      });
   }, [onClose]);

   return (
      <>
         {isVisible && (
            <div
               className={`fixed top-0 left-0 w-full h-full flex items-center justify-center z-[999] pointer-events-none transition-all duration-500 ${
                  isVisible ? "opacity-100" : "opacity-0"
               }`}
            >
               <div className="bg-red-700 bg-opacity-90 text-white text-6xl font-black text-center rounded-2xl px-16 py-10 shadow-2xl animate-pulse transi border-8 border-yellow-400 gap-5">
                  {titulo}
                  {mensaje && <div className="text-3xl font-normal mt-4">{mensaje}</div>}
               </div>
            </div>
         )}
      </>
   );
};

export default Letrero;
