import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useJuegoContext } from "../contexts/JuegoContext";

export default function Control() {
   const { team } = useParams();
   const { ws, setWs } = useJuegoContext();
   // const [ws, setWs] = useState(null);
   const [animando, setAnimando] = useState(false);
   const equipo = {
      nombre: "Nombre del equipo",
      numero: team
   };

   useEffect(() => {
      const socket = new WebSocket("ws://localhost:8080");
      setWs(socket);
      return () => socket.close();
   }, []);

   const press = (team) => {
      if (animando) return; // Evita doble clic durante animación
      if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify({ action: "press", team }));
         setAnimando(true);
         transitionColors(() => setAnimando(false));
      }
   };

   const finalBg = team == 1 ? "bg-red-500 duration-700" : "bg-blue-500 duration-700";
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

   // Modifica transitionColors para aceptar un callback al finalizar
   function transitionColors(onEnd) {
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
         if (onEnd) onEnd();
      }, 1800);
      return () => {
         clearInterval(intervalId);
         clearTimeout(timeoutId);
      };
   }
   return (
      <div
         className={`absolute h-screen w-screen top-0 left-0 z-0 transition-colors ${bg} flex justify-center items-center`}
         onClick={() => press(equipo.numero)}
         style={{ cursor: animando ? "not-allowed" : "pointer" }}
      >
         <h2 className="card-title font-black flex flex-col text-4xl">
            {equipo.nombre.toUpperCase() ?? "Equipo"}
            <div className="-mt-3 text-sm font-medium">Equipo {equipo.numero}</div>
         </h2>
      </div>
   );
}
