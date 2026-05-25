import Tablero from "./pages/Tablero.jsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import Panel from "./pages/Panel.jsx";
import Control from "./pages/Control.jsx";
import { JuegoContextProvider } from "./contexts/JuegoContext.jsx";
import Lobby from "./pages/Lobby.jsx";

export default function App() {
   return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
         <HashRouter>
            <JuegoContextProvider>
               <Routes>
                  <Route index element={<Lobby />} />
                  {/* <Route path="/" element={<Tablero />} /> */}
                  <Route path="/tablero" element={<Tablero />} />
                  <Route path="/panel" element={<Panel />} />
                  <Route path="/control/:team" element={<Control />} />
               </Routes>
            </JuegoContextProvider>
         </HashRouter>
      </div>
   );
}
