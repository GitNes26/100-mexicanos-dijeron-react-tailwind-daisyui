import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
   console.log("Cliente conectado");

   ws.on("message", (msg) => {
      console.log("Mensaje recibido:", msg.toString());

      // reenvía a todos los clientes conectados (tablero, panel, controladores)
      wss.clients.forEach((client) => {
         if (client.readyState === 1) {
            client.send(msg.toString());
         }
      });
   });
});

console.log("Servidor WebSocket en ws://localhost:8080 🚀");
