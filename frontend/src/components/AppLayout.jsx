import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import DragonBackground from "./DragonBackground.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  const isRoom = location.pathname.startsWith("/room/");
  const isAuth = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className={`dragon-app-layout ${isRoom ? "in-game-room" : ""} ${isAuth ? "auth-mode" : ""}`}>
      <DragonBackground />
      <Navbar />
      <div className="dragon-app-body">
        {!isRoom && !isAuth && <Sidebar />}
        <main className={`dragon-main-content ${isRoom ? "full-arena" : ""} ${isAuth ? "auth-arena" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
