import { WebSocketServer } from "ws";
const WS_PORT = 3001;
const wss = new WebSocketServer({ port: WS_PORT });

const rooms = new Map();

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
         rooms.set(code, { clients: new Set([ws]), state: null });
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
            room.state = { teamNames: data.teamNames, puntosEquipo: data.puntosEquipo };
         }
      }

      if (ws.roomCode) {
         const room = rooms.get(ws.roomCode);
         if (room) {
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
            if (room.clients.size === 0) rooms.delete(ws.roomCode);
         }
      }
      ws.removeAllListeners();
   });
});

console.log(`Servidor WebSocket en ws://localhost:${WS_PORT} 🚀`);
