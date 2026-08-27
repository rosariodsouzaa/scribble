import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import DragonBackground from "./DragonBackground.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  const isRoom = location.pathname.startsWith("/room/");

  return (
    <div className={`dragon-app-layout ${isRoom ? "in-game-room" : ""}`}>
      <DragonBackground />
      <Navbar />
      <div className="dragon-app-body">
        {!isRoom && <Sidebar />}
        <main className={`dragon-main-content ${isRoom ? "full-arena" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
