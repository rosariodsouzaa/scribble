import React from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import DragonBackground from "./DragonBackground.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="dragon-app-layout">
      <DragonBackground />
      <Navbar />
      <div className="dragon-app-body">
        <Sidebar />
        <main className="dragon-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
