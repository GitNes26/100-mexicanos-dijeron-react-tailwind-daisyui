import { useEffect } from "react";
import env from "../const/env";

export default function useSocket(onMessage) {
   useEffect(() => {
      const WS_URL = env.VITE_WS_URL || "ws://localhost:3001"; //"ws://localhost:8080"
      const ws = new WebSocket(WS_URL);

      ws.onmessage = (msg) => {
         const data = JSON.parse(msg.data);
         onMessage(data);
      };

      return () => ws.close();
   }, [onMessage]);
}
