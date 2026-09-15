import { WebSocketServer } from "ws";
const WS_PORT = 3001;
const wss = new WebSocketServer({ port: WS_PORT });

const rooms = new Map();

function initialRoomState() {
   return { teamNames: { e1: "", e2: "" }, puntosEquipo: { e1: 0, e2: 0 }, preguntas: null, gameStarted: false, roundActive: false, activeTeam: null, instructionsVisible: false };
}

function generarCodigo() {
   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
   let code;
   do {
      code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
   } while (rooms.has(code));
   return code;
}

wss.on("connection", (ws) => {
   console.log("🟢 Cliente conectado");

   ws.on("error", (err) => console.error("🔴 WS error:", err.message));

   ws.on("message", (msg) => {
      let data;
      try {
         data = JSON.parse(msg.toString());
      } catch {
         return ws.send(JSON.stringify({ action: "error", message: "Formato inválido" }));
      }

      if (data.action === "createRoom") {
         if (ws.roomCode) {
            const oldRoom = rooms.get(ws.roomCode);
            if (oldRoom) {
               oldRoom.clients.delete(ws);
               if (oldRoom.clients.size === 0) rooms.delete(ws.roomCode);
            }
         }
         const code = generarCodigo();
         rooms.set(code, { clients: new Set([ws]), state: initialRoomState() });
         ws.roomCode = code;
         ws.send(JSON.stringify({ action: "roomCreated", code }));
         return;
      }

      if (data.action === "joinRoom") {
         const room = rooms.get(data.code);
         if (room) {
            room.clients.add(ws);
            ws.roomCode = data.code;
            ws.send(JSON.stringify({ action: "roomJoined", code: data.code }));
            // Enviar estado actual de la sala al nuevo cliente
            if (room.state) {
               ws.send(JSON.stringify({ action: "syncAll", ...room.state }));
            }
            room.clients.forEach((client) => {
               if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({ action: "playerJoined" }));
               }
            });
         } else {
            ws.send(JSON.stringify({ action: "error", message: "Sala no encontrada" }));
         }
         return;
      }

      if (data.action === "closeRoom") {
         const room = rooms.get(ws.roomCode);
         if (room) {
            const payload = JSON.stringify({ action: "goToLobby" });
            room.clients.forEach((client) => {
               if (client.readyState === 1) client.send(payload);
            });
            rooms.delete(ws.roomCode);
         }
         return;
      }

      if (data.action === "updateAllState") {
         const room = rooms.get(ws.roomCode);
         if (room) {
            room.state = { ...room.state, teamNames: data.teamNames || room.state.teamNames, puntosEquipo: data.puntosEquipo || room.state.puntosEquipo, preguntas: data.preguntas || room.state.preguntas };
         }
      }

      if (data.action === "startGame") {
         const room = rooms.get(ws.roomCode);
         if (room) room.state = { ...room.state, gameStarted: true, roundActive: false, activeTeam: null };
      }

      if (data.action === "setQuestion") {
         const room = rooms.get(ws.roomCode);
         if (room) room.state = { ...room.state, gameStarted: true, roundActive: true, activeTeam: null, questionIdx: data.questionIdx };
      }

      if (data.action === "activateTeam") {
         const room = rooms.get(ws.roomCode);
         const team = Number(data.team);
         if (room && room.state.roundActive && [1, 2].includes(team)) room.state.activeTeam = team;
      }

      if (data.action === "roundEnded") {
         const room = rooms.get(ws.roomCode);
         if (room) room.state = { ...room.state, roundActive: false, activeTeam: null };
      }

      if (data.action === "showInstructions") {
         const room = rooms.get(ws.roomCode);
         if (room) room.state = { ...room.state, instructionsVisible: Boolean(data.visible) };
      }

      if (data.action === "markError" && data.releaseBuzzers) {
         const room = rooms.get(ws.roomCode);
         if (room && room.state.roundActive) room.state = { ...room.state, activeTeam: null };
      }

      if (data.action === "reset") {
         const room = rooms.get(ws.roomCode);
         if (room) room.state = { ...initialRoomState(), preguntas: room.state.preguntas };
      }

      if (data.action === "updateQuestions") {
         const room = rooms.get(ws.roomCode);
         const preguntas = data.preguntas;
         const validas = Array.isArray(preguntas) && preguntas.length > 0 && preguntas.length <= 1000 && preguntas.every((p) => typeof p?.texto === "string" && Array.isArray(p.respuestas) && p.respuestas.length > 0 && p.respuestas.length <= 10 && p.respuestas.every((r) => typeof r?.texto === "string" && Number.isFinite(Number(r.puntos))));
         if (!(room && validas)) {
            if (ws.readyState === 1) ws.send(JSON.stringify({ action: "error", message: "Banco de preguntas inválido" }));
            return;
         }
         room.state = { ...room.state, preguntas };
      }

      if (ws.roomCode) {
         const room = rooms.get(ws.roomCode);
         if (room) {
            if (data.action === "press") {
               const team = Number(data.team);
               if (!room.state.roundActive || room.state.activeTeam || ![1, 2].includes(team)) return;
               room.state.activeTeam = team;
            }
            const payload = msg.toString();
            room.clients.forEach((client) => {
               if (client.readyState === 1) {
                  client.send(payload);
               }
            });
         }
      }
   });

   ws.on("close", () => {
      if (ws.roomCode) {
         const room = rooms.get(ws.roomCode);
         if (room) {
            room.clients.delete(ws);
            // La sala permanece en memoria para permitir que móviles bloqueados o recargados vuelvan a entrar.
         }
      }
      ws.removeAllListeners();
   });
});

console.log(`Servidor WebSocket en ws://localhost:${WS_PORT} 🚀`);
