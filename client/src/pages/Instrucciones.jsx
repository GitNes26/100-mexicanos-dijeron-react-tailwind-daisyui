import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaBolt, FaCheck, FaGamepad, FaMobileScreenButton, FaPeopleGroup, FaScaleBalanced, FaTrophy, FaXmark } from "react-icons/fa6";

const sections = [
   {
      title: "Preparen la sala",
      icon: FaPeopleGroup,
      summary: "Un conductor controla la partida; el tablero va en la TV y cada equipo abre su pulsador en un celular.",
      points: ["Crea una sala y comparte el código de 4 caracteres.", "Asigna un nombre al equipo rojo y al equipo azul.", "Elige el banco de preguntas antes de iniciar."]
   },
   {
      title: "Comienza una ronda",
      icon: FaGamepad,
      summary: "El conductor envía una pregunta al tablero. En ese momento los dos pulsadores se iluminan y quedan habilitados.",
      points: ["Solo se acepta el primer pulsador.", "El equipo más rápido gana el turno inicial.", "Si el celular se bloquea, vuelve a abrirlo: la sala recupera el estado."]
   },
   {
      title: "Respondan",
      icon: FaCheck,
      summary: "El conductor escucha la respuesta y revela la coincidencia en el tablero.",
      points: ["Cada respuesta revelada suma al acumulado de la ronda.", "Una respuesta que no aparece cuenta como error.", "Tres errores abren la oportunidad de robo."]
   },
   {
      title: "Robo y muerte súbita",
      icon: FaBolt,
      summary: "El otro equipo puede quedarse con lo acumulado si acierta durante el robo.",
      points: ["En robo se permite una respuesta decisiva.", "Si falla, los puntos permanecen con el equipo original.", "Muerte súbita puede activarse para definir rápidamente un turno."]
   },
   {
      title: "Puntos y victoria",
      icon: FaTrophy,
      summary: "El equipo que gana la ronda recibe los puntos acumulados.",
      points: ["La meta tradicional es llegar a 300 puntos.", "El conductor también puede declarar un ganador manualmente.", "La duración y el número de rondas pueden adaptarse al evento."]
   },
   {
      title: "Reglas del juego",
      icon: FaScaleBalanced,
      summary: "Estas reglas mantienen la partida clara, justa y divertida para todos.",
      points: [
         "El conductor lee la pregunta y tiene la decisión final sobre respuestas y puntajes.",
         "Los pulsadores solo se presionan cuando aparecen iluminados y disponibles.",
         "En el enfrentamiento inicial cuenta únicamente el primer equipo registrado por el sistema.",
         "La respuesta debe decirse en voz alta; no se permite buscarla en internet ni recibir ayuda del público.",
         "Durante un turno normal, tres respuestas incorrectas conceden una oportunidad de robo al rival.",
         "Si ambos equipos fallan el enfrentamiento, pasan nuevos participantes y los pulsadores vuelven a habilitarse.",
         "Cualquier empate o situación no prevista se resuelve con muerte súbita o con la decisión del conductor."
      ]
   }
];

export default function Instrucciones({ overlay = false, onClose }) {
   const navigate = useNavigate();
   const [step, setStep] = useState(0);
   const [demoWinner, setDemoWinner] = useState(null);
   const current = sections[step];
   const Icon = current.icon;
   const close = () => overlay ? onClose?.() : navigate("/");

   useEffect(() => {
      if (!overlay) return undefined;
      const handleKey = (event) => { if (event.key === "Escape") onClose?.(); };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
   }, [onClose, overlay]);

   return (
      <main className={`instructions ${overlay ? "instructions--overlay" : "instructions--page"}`}>
         <section className="instructions__shell" role={overlay ? "dialog" : undefined} aria-modal={overlay || undefined} aria-labelledby="instructions-title">
            <header className="instructions__header">
               <div><h1 id="instructions-title">Cómo jugar</h1><p>100 Mexicanos Dijeron · guía rápida</p></div>
               <button type="button" className="instructions__close" onClick={close} autoFocus={overlay} aria-label={overlay ? "Cerrar instrucciones y continuar la partida" : "Volver"}>{overlay ? <FaXmark /> : <FaArrowLeft />}</button>
            </header>

            <div className="instructions__progress" aria-label={`Paso ${step + 1} de ${sections.length}`}>
               {sections.map((section, index) => <button key={section.title} type="button" className={index === step ? "is-active" : ""} onClick={() => setStep(index)} aria-label={`Ver: ${section.title}`}><span>{index + 1}</span></button>)}
            </div>

            <div className="instructions__content">
               <article className="instructions__lesson">
                  <Icon className="instructions__icon" aria-hidden="true" />
                  <p className="instructions__step">Paso {step + 1} de {sections.length}</p>
                  <h2>{current.title}</h2>
                  <p className="instructions__summary">{current.summary}</p>
                  <ul>{current.points.map((point) => <li key={point}><FaCheck aria-hidden="true" /><span>{point}</span></li>)}</ul>
               </article>

               <aside className="instructions__demo" aria-label="Demostración interactiva del pulsador">
                  <h3>Prueba el botonazo</h3>
                  <p>{demoWinner ? `¡Equipo ${demoWinner} ganó el turno!` : "Toca uno: solamente el primero gana."}</p>
                  <div className="instructions__buzzers">
                     {[1, 2].map((team) => <button key={team} type="button" className={`instructions__buzzer instructions__buzzer--${team} ${demoWinner && demoWinner !== team ? "is-loser" : ""}`} onClick={() => setDemoWinner((winner) => winner || team)} disabled={Boolean(demoWinner)}><FaMobileScreenButton aria-hidden="true" /><span>Equipo {team}</span></button>)}
                  </div>
                  <button type="button" className="instructions__retry" onClick={() => setDemoWinner(null)} disabled={!demoWinner}>Repetir demostración</button>
               </aside>
            </div>

            <footer className="instructions__footer">
               <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}><FaArrowLeft /> Anterior</button>
               {step < sections.length - 1 ? <button type="button" className="is-primary" onClick={() => setStep((value) => value + 1)}>Siguiente <FaArrowRight /></button> : <button type="button" className="is-primary" onClick={close}>{overlay ? "Continuar la partida" : "Entendido"} <FaCheck /></button>}
            </footer>
         </section>
      </main>
   );
}
