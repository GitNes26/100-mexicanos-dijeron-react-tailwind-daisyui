import { useRef } from "react";
export default function useSound() {
   const audioRef = useRef({});
   const load = (name, src) => {
      if (!audioRef.current[name]) audioRef.current[name] = new Audio(src);
   };
   const play = (name) => {
      try {
         console.log("🚀 ~ JuegoContextProvider ~ window:", window.location.pathname);
         if (!["/", "/tablero"].includes(window.location.pathname)) return;
         audioRef.current[name] && audioRef.current[name].play();
      } catch (e) {}
   };
   const stop = (name) => {
      try {
         if (audioRef.current[name]) {
            audioRef.current[name].pause();
            audioRef.current[name].currentTime = 0; // Reinicia al inicio
         }
      } catch (e) {
         console.error("Error deteniendo sonido:", e);
      }
   };
   return { load, play, stop };
}
