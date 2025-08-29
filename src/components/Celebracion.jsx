"use client";

import { useState, useEffect } from "react";
import { useJuegoContext } from "../contexts/JuegoContext";

// interface CelebrationProps {
//   teamName: string
//   teamNumber: 1 | 2
//   onClose: () => void
// }

export default function Celebration({ teamName, teamNumber, onClose }) {
   // const { s } = useJuegoContext();
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      setIsVisible(true);
      // s.play("triunfo");

      // Confetti effect
      const createConfetti = () => {
         const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

         for (let i = 0; i < 100; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}vw;
          animation: confetti-fall ${2 + Math.random() * 3}s linear forwards infinite;
          z-index: 1000;
          border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
        `;
            document.body.appendChild(confetti);

            setTimeout(() => {
               confetti.remove();
            }, 5000);
         }
      };

      // Create balloons
      const createBalloons = () => {
         const balloonColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

         for (let i = 0; i < 15; i++) {
            const balloon = document.createElement("div");
            balloon.className = "balloon";
            balloon.style.cssText = `
          position: fixed;
          width: 40px;
          height: 50px;
          background: ${balloonColors[Math.floor(Math.random() * balloonColors.length)]};
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          left: ${Math.random() * 100}vw;
          bottom: -60px;
          animation: balloon-float ${3 + Math.random() * 2}s ease-out forwards;
          z-index: 999;
        `;

            // Add balloon string
            const string = document.createElement("div");
            string.style.cssText = `
          position: absolute;
          width: 1px;
          height: 30px;
          background: #333;
          left: 50%;
          top: 100%;
          transform: translateX(-50%);
        `;
            balloon.appendChild(string);

            document.body.appendChild(balloon);

            setTimeout(() => {
               balloon.remove();
            }, 5000);
         }
      };

      // Create sparkles/lights
      const createSparkles = () => {
         for (let i = 0; i < 50; i++) {
            const sparkle = document.createElement("div");
            sparkle.className = "sparkle";
            sparkle.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: #FFD700;
          left: ${Math.random() * 100}vw;
          top: ${Math.random() * 100}vh;
          animation: sparkle-twinkle ${1 + Math.random() * 2}s ease-in-out infinite;
          z-index: 998;
          border-radius: 50%;
          box-shadow: 0 0 6px #FFD700;
        `;
            document.body.appendChild(sparkle);

            setTimeout(() => {
               sparkle.remove();
            }, 4000);
         }
      };

      // Trigger all effects
      createConfetti();
      createBalloons();
      createSparkles();

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
         setIsVisible(false);
         setTimeout(onClose, 500);
      }, 5000);

      return () => clearTimeout(timer);
   }, [onClose]);

   const teamColor = teamNumber === 1 ? "from-red-400 to-red-600" : "from-blue-400 to-blue-600";

   return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
         {/* Background overlay with team colors */}
         <div className={`absolute inset-0 bg-gradient-to-br ${teamColor} opacity-90 animate-pulse`} />

         {/* Main celebration message */}
         <div className={`relative z-10 text-center transform transition-all duration-1000 ${isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"}`}>
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 border-4 border-yellow-400 shadow-2xl">
               <div className="animate-bounce">
                  <h1 className="text-8xl font-black text-yellow-300 mb-4 drop-shadow-2xl animate-pulse">🎉 PUNTOS 🎉</h1>
               </div>

               <div className="animate-pulse">
                  <h2 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">PARA EL</h2>
               </div>

               <div className="animate-bounce delay-300">
                  <h3 className="text-7xl font-black text-yellow-300 mb-8 drop-shadow-2xl">EQUIPO {teamNumber}</h3>
               </div>

               <div className="animate-pulse delay-500">
                  <p className="text-4xl font-bold text-white drop-shadow-lg">{teamName}</p>
               </div>

               <div className="mt-8 animate-bounce delay-700">
                  <div className="text-6xl">🏆✨🎊</div>
               </div>
            </div>
         </div>

         {/* Close button */}
         {/* <button
            onClick={() => {
               setIsVisible(false);
               setTimeout(onClose, 500);
            }}
            className="absolute top-8 right-8 z-20 bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-md"
         >
            ✕ Cerrar
         </button> */}
      </div>
   );
}
