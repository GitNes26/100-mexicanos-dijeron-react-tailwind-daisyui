import Tablero from "./pages/Tablero.jsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import Panel from "./pages/Panel.jsx";
import Control from "./pages/Control.jsx";
import { JuegoContextProvider } from "./contexts/JuegoContext.jsx";
import Lobby from "./pages/Lobby.jsx";
import { SnackbarProvider } from "notistack";
import { isMobile } from "react-device-detect";

export default function App() {
   return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
         <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{ horizontal: isMobile ? "center" : "right", vertical: "bottom" }}
            preventDuplicate
            // iconVariant={{
            //    success: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <TaskAltRounded fontSize="large" sx={{ p: 1 }} />
            //       </Paper>
            //    ),
            //    error: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Error fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            //    warning: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Warning fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            //    info: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Info fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            // }}
            style={{
               // color: "white",
               borderRadius: 15,
               fontWeight: "bold",
               zIndex: 11000
            }}
         >
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
         </SnackbarProvider>
      </div>
   );
}
