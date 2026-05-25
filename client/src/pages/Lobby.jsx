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

   // ─── ESTADO: esperando / error ───────────────────────────────────────────
   if ((modo === "crear" || modo === "unirse") && !roomCode && !wsError) {
      return (
         <div className="min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
            <Confetti />
            <div style={glassCard} className="text-center px-16 py-14">
               <div className="mb-6">
                  <span className="loading loading-spinner" style={{ width: 56, height: 56, color: "#FFD700" }}></span>
               </div>
               <p style={{ ...titleFont, fontSize: 22, color: "#FFD700", letterSpacing: "0.05em" }}>
                  {modo === "crear" ? "Creando tu sala…" : "Uniéndote a la sala…"}
               </p>
               <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>Un momento, por favor</p>
            </div>
         </div>
      );
   }

   // ─── ESTADO: error ───────────────────────────────────────────────────────
   if ((modo === "crear" || modo === "unirse") && wsError) {
      return (
         <div className="min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
            <Confetti />
            <div style={glassCard} className="text-center px-16 py-14">
               <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
               <p style={{ ...titleFont, fontSize: 20, color: "#FF6B6B", marginBottom: 24 }}>{wsError}</p>
               <button
                  style={btnSecondary}
                  onClick={() => setModo(null)}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnSecondaryHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnSecondary)}
               >
                  ← Volver al inicio
               </button>
            </div>
         </div>
      );
   }

   // ─── ESTADO: sala creada ─────────────────────────────────────────────────
   if (roomCode && modo === "crear") {
      return (
         <div className="min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
            <Confetti />
            <div style={{ ...glassCard, maxWidth: 560, width: "100%" }} className="px-10 py-12">
               <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 4 }}>🎉</div>
                  <h1 style={{ ...titleFont, fontSize: 32, color: "#FFD700" }}>¡Sala Lista!</h1>
                  <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 15 }}>Comparte este código con tus amigos</p>
               </div>

               {/* Código de sala */}
               <div style={codeBox}>
                  <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,215,0,0.6)", marginBottom: 6 }}>CÓDIGO DE SALA</p>
                  <div style={codeText}>{roomCode}</div>
               </div>

               {/* Separador */}
               <div style={divider}>
                  <span style={dividerLabel}>Elige tu pantalla</span>
               </div>

               {/* Botón admin */}
               <button
                  style={btnPrimary}
                  className="w-full"
                  onClick={() => irA("panel")}
                  onMouseEnter={(e) =>
                     Object.assign(e.currentTarget.style, { ...btnPrimary, transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(255,215,0,0.4)" })
                  }
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnPrimary)}
               >
                  🎮 Panel de Control <span style={{ opacity: 0.7, fontSize: 13, marginLeft: 6 }}>(Admin)</span>
               </button>

               {/* Botones secundarios */}
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                  {[
                     { emoji: "🖥️", label: "Tablero", ruta: "tablero", color: "#4FC3F7" },
                     { emoji: "🔴", label: "Control E1", ruta: "control/1", color: "#EF9A9A" },
                     { emoji: "🔵", label: "Control E2", ruta: "control/2", color: "#90CAF9" }
                  ].map(({ emoji, label, ruta, color }) => (
                     <button
                        key={ruta}
                        onClick={() => irA(ruta)}
                        style={{ ...btnOutline, borderColor: color, color }}
                        onMouseEnter={(e) =>
                           Object.assign(e.currentTarget.style, {
                              ...btnOutline,
                              borderColor: color,
                              color,
                              background: `${color}22`,
                              transform: "translateY(-2px)"
                           })
                        }
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...btnOutline, borderColor: color, color })}
                     >
                        <span style={{ display: "block", fontSize: 20, marginBottom: 2 }}>{emoji}</span>
                        <span style={{ fontSize: 12, display: "block" }}>{label}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   // ─── ESTADO: unido a sala ────────────────────────────────────────────────
   if (roomCode && modo === "unirse") {
      return (
         <div className="min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
            <Confetti />
            <div style={{ ...glassCard, maxWidth: 560, width: "100%" }} className="px-10 py-12">
               <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 4 }}>🙌</div>
                  <h1 style={{ ...titleFont, fontSize: 32, color: "#FFD700" }}>¡Estás dentro!</h1>
                  <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 15 }}>
                     Sala: <span style={{ color: "#FFD700", fontWeight: 900, letterSpacing: "0.25em", fontSize: 20 }}>{roomCode}</span>
                  </p>
               </div>

               <div style={divider}>
                  <span style={dividerLabel}>Elige tu pantalla</span>
               </div>

               <button
                  style={btnPrimary}
                  className="w-full"
                  onClick={() => irA("panel")}
                  onMouseEnter={(e) =>
                     Object.assign(e.currentTarget.style, { ...btnPrimary, transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(255,215,0,0.4)" })
                  }
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnPrimary)}
               >
                  🎮 Panel de Control <span style={{ opacity: 0.7, fontSize: 13, marginLeft: 6 }}>(Admin)</span>
               </button>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                  {[
                     { emoji: "🖥️", label: "Tablero", ruta: "tablero", color: "#4FC3F7" },
                     { emoji: "🔴", label: "Control E1", ruta: "control/1", color: "#EF9A9A" },
                     { emoji: "🔵", label: "Control E2", ruta: "control/2", color: "#90CAF9" }
                  ].map(({ emoji, label, ruta, color }) => (
                     <button
                        key={ruta}
                        onClick={() => irA(ruta)}
                        style={{ ...btnOutline, borderColor: color, color }}
                        onMouseEnter={(e) =>
                           Object.assign(e.currentTarget.style, {
                              ...btnOutline,
                              borderColor: color,
                              color,
                              background: `${color}22`,
                              transform: "translateY(-2px)"
                           })
                        }
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...btnOutline, borderColor: color, color })}
                     >
                        <span style={{ display: "block", fontSize: 20, marginBottom: 2 }}>{emoji}</span>
                        <span style={{ fontSize: 12, display: "block" }}>{label}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   // ─── PANTALLA PRINCIPAL ──────────────────────────────────────────────────
   return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
         <Confetti />
         <style>{cssAnimations}</style>

         <div style={{ ...glassCard, maxWidth: 460, width: "100%" }} className="px-10 py-12">
            {/* Logo / título */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
               <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
                  <span style={{ ...titleFont, fontSize: 88, color: "#FFD700", lineHeight: 1, animation: "popIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
                     100
                  </span>
               </div>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <span style={{ ...titleFont, fontSize: 30, color: "#FFFFFF", letterSpacing: "0.18em", animation: "fadeSlideUp 0.5s 0.2s both" }}>MEXICANOS</span>
                  <span style={{ ...titleFont, fontSize: 30, color: "#FFFFFF", letterSpacing: "0.18em", animation: "fadeSlideUp 0.5s 0.35s both" }}>DIJERON</span>
               </div>
               <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, animation: "fadeSlideUp 0.5s 0.5s both" }}>
                  {["🇲🇽", "🎶", "🎉"].map((e, i) => (
                     <span key={i} style={{ fontSize: 20 }}>
                        {e}
                     </span>
                  ))}
               </div>
               <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 10, letterSpacing: "0.06em", animation: "fadeSlideUp 0.5s 0.6s both" }}>
                  Juego multijugador en tiempo real
               </p>
            </div>

            {/* Botón crear sala */}
            <div style={{ animation: "fadeSlideUp 0.5s 0.7s both" }}>
               <button
                  style={{ ...btnPrimary, opacity: !wsReady ? 0.5 : 1, cursor: !wsReady ? "not-allowed" : "pointer" }}
                  className="w-full"
                  onClick={handleCrear}
                  disabled={!wsReady}
                  onMouseEnter={(e) =>
                     wsReady && Object.assign(e.currentTarget.style, { ...btnPrimary, transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(255,215,0,0.45)" })
                  }
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...btnPrimary, opacity: !wsReady ? 0.5 : 1 })}
               >
                  ✦ Crear Sala Nueva
               </button>
            </div>

            {/* Divider */}
            <div style={{ ...divider, margin: "24px 0", animation: "fadeSlideUp 0.5s 0.8s both" }}>
               <span style={dividerLabel}>o únete con un código</span>
            </div>

            {/* Input + botón unirse */}
            <div style={{ display: "flex", gap: 10, animation: "fadeSlideUp 0.5s 0.9s both" }}>
               <input
                  type="text"
                  maxLength={4}
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleUnirse()}
                  placeholder="XXXX"
                  style={codeInput}
               />
               <button
                  onClick={handleUnirse}
                  disabled={codigoInput.length < 4 || !wsReady}
                  style={{
                     ...btnJoin,
                     opacity: codigoInput.length < 4 || !wsReady ? 0.45 : 1,
                     cursor: codigoInput.length < 4 || !wsReady ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={(e) =>
                     codigoInput.length >= 4 && wsReady && Object.assign(e.currentTarget.style, { ...btnJoin, background: "#7C4DFF", transform: "translateY(-2px)" })
                  }
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...btnJoin, opacity: codigoInput.length < 4 || !wsReady ? 0.45 : 1 })}
               >
                  Unirse →
               </button>
            </div>

            {/* Indicador de conexión */}
            <div style={{ textAlign: "center", marginTop: 24, animation: "fadeSlideUp 0.5s 1s both" }}>
               <span
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     fontSize: 12,
                     color: wsReady ? "rgba(100,255,160,0.8)" : "rgba(255,140,100,0.8)"
                  }}
               >
                  <span
                     style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: wsReady ? "#64FFA0" : "#FF8C64",
                        display: "inline-block",
                        animation: wsReady ? "pulse 2s infinite" : "none"
                     }}
                  />
                  {wsReady ? "Servidor conectado" : "Conectando al servidor…"}
               </span>
            </div>
         </div>
      </div>
   );
}

// ─── Decoración de confeti / burbujas animadas ───────────────────────────────
function Confetti() {
   const items = [
      { top: "8%", left: "6%", size: 18, delay: "0s", color: "#FFD700", shape: "circle" },
      { top: "15%", left: "88%", size: 14, delay: "0.4s", color: "#FF6B9D", shape: "square" },
      { top: "72%", left: "5%", size: 12, delay: "0.8s", color: "#4FC3F7", shape: "circle" },
      { top: "80%", left: "92%", size: 16, delay: "0.2s", color: "#AED581", shape: "circle" },
      { top: "45%", left: "3%", size: 10, delay: "1.2s", color: "#FFD700", shape: "square" },
      { top: "30%", left: "95%", size: 11, delay: "0.6s", color: "#FF8A65", shape: "circle" },
      { top: "90%", left: "50%", size: 8, delay: "0.9s", color: "#CE93D8", shape: "square" },
      { top: "5%", left: "50%", size: 9, delay: "1.5s", color: "#80DEEA", shape: "circle" }
   ];
   return (
      <>
         {items.map((item, i) => (
            <div
               key={i}
               style={{
                  position: "fixed",
                  top: item.top,
                  left: item.left,
                  width: item.size,
                  height: item.size,
                  borderRadius: item.shape === "circle" ? "50%" : 3,
                  background: item.color,
                  opacity: 0.35,
                  animation: `float 4s ${item.delay} ease-in-out infinite`,
                  pointerEvents: "none"
               }}
            />
         ))}
      </>
   );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const bgStyle = {
   background: "linear-gradient(135deg, #0D0D1A 0%, #1A0533 40%, #0D1A33 100%)",
   position: "relative"
};

const glassCard = {
   background: "rgba(255,255,255,0.06)",
   backdropFilter: "blur(20px)",
   WebkitBackdropFilter: "blur(20px)",
   border: "1px solid rgba(255,255,255,0.12)",
   borderRadius: 28,
   boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
};

const titleFont = {
   fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
   fontWeight: 900,
   lineHeight: 1
};

const codeBox = {
   background: "rgba(0,0,0,0.35)",
   border: "2px dashed rgba(255,215,0,0.4)",
   borderRadius: 20,
   padding: "20px 0",
   textAlign: "center",
   marginBottom: 24
};

const codeText = {
   fontFamily: "'Bebas Neue', 'Courier New', monospace",
   fontSize: 72,
   fontWeight: 900,
   color: "#FFD700",
   letterSpacing: "0.3em",
   lineHeight: 1,
   textShadow: "0 0 30px rgba(255,215,0,0.4)"
};

const divider = {
   display: "flex",
   alignItems: "center",
   gap: 12,
   margin: "20px 0"
};

const dividerLabel = {
   color: "rgba(255,255,255,0.35)",
   fontSize: 12,
   letterSpacing: "0.08em",
   whiteSpace: "nowrap",
   flex: "0 0 auto",
   padding: "0 4px",
   textTransform: "uppercase",
   background: "transparent"
};

const btnPrimary = {
   display: "block",
   width: "100%",
   padding: "16px 24px",
   background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
   color: "#1A0533",
   fontWeight: 900,
   fontSize: 17,
   letterSpacing: "0.04em",
   border: "none",
   borderRadius: 16,
   cursor: "pointer",
   transition: "transform 0.2s, box-shadow 0.2s",
   boxShadow: "0 4px 20px rgba(255,215,0,0.25)"
};

const btnSecondary = {
   display: "inline-block",
   padding: "12px 28px",
   background: "rgba(255,255,255,0.1)",
   color: "rgba(255,255,255,0.85)",
   fontWeight: 700,
   fontSize: 15,
   border: "1px solid rgba(255,255,255,0.2)",
   borderRadius: 14,
   cursor: "pointer",
   transition: "transform 0.2s, background 0.2s"
};

const btnSecondaryHover = {
   ...btnSecondary,
   background: "rgba(255,255,255,0.18)",
   transform: "translateY(-2px)"
};

const btnOutline = {
   padding: "14px 8px",
   background: "rgba(255,255,255,0.04)",
   border: "1px solid",
   borderRadius: 14,
   cursor: "pointer",
   transition: "transform 0.2s, background 0.2s",
   textAlign: "center",
   fontWeight: 700,
   fontSize: 13
};

const codeInput = {
   flex: 1,
   background: "rgba(255,255,255,0.08)",
   border: "1.5px solid rgba(255,255,255,0.2)",
   borderRadius: 14,
   color: "#FFFFFF",
   fontSize: 28,
   fontWeight: 900,
   letterSpacing: "0.35em",
   textAlign: "center",
   padding: "14px 8px",
   outline: "none",
   transition: "border-color 0.2s",
   fontFamily: "'Bebas Neue', 'Courier New', monospace"
};

const btnJoin = {
   padding: "14px 20px",
   background: "#6200EA",
   color: "#FFFFFF",
   fontWeight: 800,
   fontSize: 15,
   border: "none",
   borderRadius: 14,
   cursor: "pointer",
   transition: "transform 0.2s, background 0.2s",
   whiteSpace: "nowrap",
   letterSpacing: "0.03em"
};

const cssAnimations = `
   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

   @keyframes popIn {
      from { transform: scale(0.5); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
   }
   @keyframes fadeSlideUp {
      from { transform: translateY(18px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
   }
   @keyframes float {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-14px) rotate(10deg); }
   }
   @keyframes pulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.5; transform: scale(1.4); }
   }
`;
