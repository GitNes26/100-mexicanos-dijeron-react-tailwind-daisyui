import { useEffect } from "react";

export default function useSocket(onMessage) {
   useEffect(() => {
      const ws = new WebSocket("ws://localhost:8080");
      ws.onmessage = (msg) => {
         const data = JSON.parse(msg.data);
         onMessage(data);
      };
      return () => ws.close();
   }, [onMessage]);
}
