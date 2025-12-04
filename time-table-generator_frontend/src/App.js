// src/App.js
// src/App.js (top)
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DataEntry from "./pages/DataEntry.jsx";   // <- explicit .jsx
import Schedule from "./pages/Schedule.jsx";     // <- explicit .jsx
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="topbar" style={{ background: "#064680", color: "white", padding: 12 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>College Scheduler</div>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link to="/" style={linkStyle}>Data Entry</Link>
            <Link to="/schedule" style={linkStyle}>Today's Schedule</Link>
          </nav>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: "20px auto", padding: "0 16px" }}>
        <Routes>
          <Route path="/" element={<DataEntry />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "6px 10px",
  borderRadius: 4,
  background: "transparent",
  fontWeight: 600
};
