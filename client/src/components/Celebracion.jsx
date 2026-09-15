import { useEffect, useMemo, useState } from "react";
import { useJuegoContext } from "../contexts/JuegoContext";

export default function Celebration({ teamNumber, teamName, onClose }) {
   const [isVisible, setIsVisible] = useState(false);
   const { equipos, teamVictoria } = useJuegoContext();
   const winnerNumber = Number(teamVictoria || teamNumber) || null;
   const winnerName = (winnerNumber ? equipos[winnerNumber]?.nombre : teamName) || "EQUIPO";
   const isFinalVictory = Boolean(teamVictoria);
   const particles = useMemo(() => Array.from({ length: 54 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: `${(index % 12) * 0.06}s`,
      duration: `${2.4 + (index % 7) * 0.18}s`,
      color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#FFFFFF", "#A78BFA"][index % 5]
   })), []);

   useEffect(() => {
      const enterTimer = requestAnimationFrame(() => setIsVisible(true));
      const closeTimer = setTimeout(() => {
         setIsVisible(false);
         setTimeout(onClose, 350);
      }, isFinalVictory ? 9000 : 4200);
      return () => {
         cancelAnimationFrame(enterTimer);
         clearTimeout(closeTimer);
      };
   }, [isFinalVictory, onClose]);

   return (
      <div className={`celebration celebration--team-${winnerNumber || 1} ${isVisible ? "is-visible" : ""}`} role="dialog" aria-modal="true" aria-label={`${isFinalVictory ? "Victoria" : "Ronda"} para el equipo ${winnerNumber || "ganador"}, ${winnerName}`}>
         <div className="celebration__rays" aria-hidden="true" />
         <div className="celebration__particles" aria-hidden="true">
            {particles.map((particle) => <i key={particle.id} style={{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration, background: particle.color }} />)}
         </div>
         <section className="celebration__stage">
            <div className="celebration__crown" aria-hidden="true">♛</div>
            <p className="celebration__result">{isFinalVictory ? "¡EQUIPO GANADOR!" : "¡RONDA GANADA!"}</p>
            <div className="celebration__team-number">EQUIPO <strong>{winnerNumber || "—"}</strong></div>
            <h2>{winnerName}</h2>
            {isFinalVictory && winnerNumber && <p className="celebration__score">CON {equipos[winnerNumber]?.puntos ?? 0} PUNTOS</p>}
            <div className="celebration__trophy" aria-hidden="true">🏆</div>
         </section>
      </div>
   );
}
