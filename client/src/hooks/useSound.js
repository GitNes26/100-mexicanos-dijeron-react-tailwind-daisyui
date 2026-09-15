import { useCallback, useRef } from "react";
export default function useSound() {
   const audioRef = useRef({});
   const load = useCallback((name, src) => {
      if (!audioRef.current[name]) {
         const audio = new Audio(src);
         audio.preload = "auto";
         audioRef.current[name] = audio;
      }
   }, []);
   const play = useCallback((name) => {
      try {
         const route = (window.location.hash.replace(/^#/, "").split("?")[0] || "/");
         if (route !== "/tablero") return;
         const audio = audioRef.current[name];
         if (!audio) return;
         audio.currentTime = 0;
         const playback = audio.play();
         if (playback?.catch) playback.catch(() => {});
      } catch (e) {
         console.warn("Error reproduciendo sonido:", e);
      }
   }, []);
   const stop = useCallback((name) => {
      try {
         if (audioRef.current[name]) {
            audioRef.current[name].pause();
            audioRef.current[name].currentTime = 0; // Reinicia al inicio
         }
      } catch (e) {
         console.error("Error deteniendo sonido:", e);
      }
   }, []);
   return { load, play, stop };
}
