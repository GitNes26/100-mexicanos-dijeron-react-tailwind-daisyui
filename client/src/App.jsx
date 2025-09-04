import React from "react";
import Tablero from "./pages/Tablero.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Panel from "./pages/Panel.jsx";
import Control from "./pages/Control.jsx";
import { JuegoContextProvider } from "./contexts/JuegoContext.jsx";

export default function App() {
   return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
         <JuegoContextProvider>
            <BrowserRouter>
               <Routes>
                  <Route index path="/" element={<Tablero />} />
                  <Route index path="/tablero" element={<Tablero />} />
                  <Route path="/panel" element={<Panel />} />
                  <Route path="/control/:team" element={<Control />} />
               </Routes>
            </BrowserRouter>
         </JuegoContextProvider>
      </div>
   );
}
