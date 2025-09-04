import { WebSocketServer } from "ws";
const WS_PORT = 3001;
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws) => {
   console.log("🟢 Cliente conectado");

   ws.on("message", (msg) => {
      console.log("📩 Mensaje recibido:", msg.toString());

      // reenvía a todos los clientes conectados (tablero, panel, controladores)
      wss.clients.forEach((client) => {
         if (client.readyState === 1) {
            client.send(msg.toString());
         }
      });
   });

   ws.on("close", () => console.log("🔴 Cliente desconectado"));
});

console.log(`Servidor WebSocket en ws://localhost:${WS_PORT} 🚀`);
