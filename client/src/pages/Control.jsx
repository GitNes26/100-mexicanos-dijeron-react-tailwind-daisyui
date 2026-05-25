import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useJuegoContext } from "../contexts/JuegoContext";

export default function Control() {
   const { team } = useParams();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const roomCode = searchParams.get("room");
   const { send, equipos, unirseaSala, wsReady } = useJuegoContext();
   const [animando, setAnimando] = useState(false);
   const animRef = useRef({ interval: null, timeout: null });
   const teamNum = Number(team);

   useEffect(() => {
      if (!roomCode || (teamNum !== 1 && teamNum !== 2)) navigate("/", { replace: true });
      else if (wsReady) unirseaSala(roomCode);
   }, [roomCode, wsReady]);

   useEffect(() => {
      return () => {
         if (animRef.current.interval) clearInterval(animRef.current.interval);
         if (animRef.current.timeout) clearTimeout(animRef.current.timeout);
      };
   }, []);

   const nombreEquipo = equipos[teamNum]?.nombre || "";

   const press = (n) => {
      if (animando) return;
      send({ action: "press", team: n });
      setAnimando(true);
      transitionColors(() => setAnimando(false));
   };

   const finalBg = teamNum === 1 ? "bg-red-500 duration-700" : "bg-blue-500 duration-700";
   const colors = [
      "bg-primary", "bg-secondary", "bg-accent", "bg-warning", "bg-error",
      "bg-success", "bg-info", "bg-purple-500", "bg-pink-500", "bg-indigo-500",
      "bg-blue-500", "bg-cyan-500", "bg-teal-500", "bg-green-500", "bg-lime-500",
      "bg-yellow-500", "bg-orange-500"
   ];
   const [bg, setBg] = useState(finalBg);

   function transitionColors(onEnd) {
      let idx = 0;
      setBg(colors[0]);
      animRef.current.interval = setInterval(() => {
         idx = (idx + 1) % colors.length;
         setBg(colors[idx]);
      }, 100);
      animRef.current.timeout = setTimeout(() => {
         clearInterval(animRef.current.interval);
         setBg(finalBg);
         if (onEnd) onEnd();
      }, 1800);
   }

   return (
      <div
         className={`absolute h-screen w-screen top-0 left-0 z-0 transition-colors ${bg} flex justify-center items-center`}
         onClick={() => press(teamNum)}
         style={{ cursor: animando ? "not-allowed" : "pointer" }}
      >
         <h2 className="card-title font-black flex flex-col text-4xl">
            {(nombreEquipo || `Equipo ${teamNum}`).toUpperCase()}
            <div className="-mt-3 text-sm font-medium">Equipo {teamNum}</div>
         </h2>
      </div>
   );
}
