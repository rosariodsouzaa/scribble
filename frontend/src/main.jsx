import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./socket/SocketContext.jsx";
import { GameProvider } from "./state/GameProvider.jsx";
import App from "./App.jsx";
import "./styles/index.css";

// NOTE: intentionally no <React.StrictMode> — its dev double-invoke of effects
// would tear down and recreate the single shared socket. Fine for this slice.
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <SocketProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </SocketProvider>
  </BrowserRouter>
);
