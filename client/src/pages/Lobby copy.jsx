import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJuegoContext } from "../contexts/JuegoContext";

export default function Lobby() {
   const { wsReady, crearSala, unirseaSala, roomCode, wsError } = useJuegoContext();
   const navigate = useNavigate();
   const [codigoInput, setCodigoInput] = useState("");
   const [modo, setModo] = useState(null); // "crear" | "unirse" | "elegir"

   const handleCrear = () => {
      crearSala();
      setModo("crear");
   };

   const handleUnirse = () => {
      if (codigoInput.length < 4) return;
      unirseaSala(codigoInput.toUpperCase());
      setModo("unirse");
   };

   const irA = (ruta) => {
      navigate(`/${ruta}?room=${roomCode}`);
   };

   if (modo === "crear" || modo === "unirse") {
      return (
         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-3xl shadow-2xl text-center">
               {!roomCode && !wsError && (
                  <div className="flex flex-col items-center gap-4">
                     <span className="loading loading-spinner loading-lg text-warning"></span>
                     <p className="text-white text-xl font-semibold">{modo === "crear" ? "Creando sala..." : "Uniéndose a la sala..."}</p>
                  </div>
               )}
               {wsError && (
                  <div className="text-center">
                     <p className="text-red-400 text-xl font-bold mb-4">{wsError}</p>
                     <button className="btn btn-warning" onClick={() => setModo(null)}>Volver</button>
                  </div>
               )}
               {roomCode && modo === "crear" && (
                  <>
                     <h1 className="text-white text-3xl font-black mb-2">¡Sala Creada!</h1>
                     <p className="text-gray-300 mb-6">Comparte este código con tus amigos:</p>
                     <div className="text-7xl font-black tracking-[0.3em] text-warning mb-8 bg-black/30 py-4 px-8 rounded-2xl">{roomCode}</div>
                     <p className="text-gray-400 mb-8 text-lg">Selecciona a dónde quieres ir:</p>
                     <div className="flex flex-col gap-4">
                        <button className="btn btn-warning btn-xl text-2xl font-black py-6" onClick={() => irA("panel")}>
                           🎮 Panel de Control (Admin)
                        </button>
                        <div className="flex gap-4">
                           <button className="btn btn-outline btn-info btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("tablero")}>
                              🖥️ Tablero
                           </button>
                           <button className="btn btn-outline btn-accent btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("control/1")}>
                              🔴 Control E1
                           </button>
                           <button className="btn btn-outline btn-accent btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("control/2")}>
                              🔵 Control E2
                           </button>
                        </div>
                     </div>
                  </>
               )}
               {roomCode && modo === "unirse" && (
                  <>
                     <h1 className="text-white text-3xl font-black mb-2">¡Te has unido a la sala!</h1>
                     <p className="text-gray-300 mb-8 text-lg">Código: <span className="text-warning font-black text-2xl tracking-widest">{roomCode}</span></p>
                     <p className="text-gray-400 mb-6 text-lg">Elige tu pantalla:</p>
                     <div className="flex flex-col gap-4">
                        <button className="btn btn-warning btn-xl text-2xl font-black py-6" onClick={() => irA("panel")}>
                           🎮 Panel de Control (Admin)
                        </button>
                        <div className="flex gap-4">
                           <button className="btn btn-outline btn-info btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("tablero")}>
                              🖥️ Tablero
                           </button>
                           <button className="btn btn-outline btn-accent btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("control/1")}>
                              🔴 Control E1
                           </button>
                           <button className="btn btn-outline btn-accent btn-xl text-xl flex-1 font-bold py-6" onClick={() => irA("control/2")}>
                              🔵 Control E2
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
         <div className="card bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full">
            <h1 className="text-6xl font-black text-warning mb-2">100</h1>
            <h2 className="text-3xl font-bold text-white mb-1">MEXICANOS</h2>
            <h2 className="text-3xl font-bold text-white mb-8">DIJERON</h2>
            <p className="text-gray-400 mb-10 text-lg">Juego de salas multijugador</p>

            <div className="flex flex-col gap-6">
               <button className="btn btn-warning btn-xl text-xl font-bold py-4" onClick={handleCrear} disabled={!wsReady}>
                  Crear Sala
               </button>

               <div className="divider text-gray-400">O</div>

               <div className="flex gap-3">
                  <input
                     type="text"
                     className="input input-bordered flex-1 text-center text-2xl font-bold tracking-[0.3em] uppercase"
                     placeholder="CÓDIGO"
                     maxLength={4}
                     value={codigoInput}
                     onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                     onKeyDown={(e) => e.key === "Enter" && handleUnirse()}
                  />
                  <button className="btn btn-accent btn-xl font-bold" onClick={handleUnirse} disabled={codigoInput.length < 4 || !wsReady}>
                     Unirse
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
