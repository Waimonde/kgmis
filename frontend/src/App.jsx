
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import Players from "./pages/Players";
import Administration from "./pages/Administration";

function Placeholder({ title }) {
  return (
    <div className="page-placeholder">
      <p className="eyebrow">KEMU GAMES MANAGEMENT</p>
      <h1>{title}</h1>
      <p className="muted">
        This module will be developed next.
      </p>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/teams" element={<Placeholder title="Teams & Coaches" />} />
          <Route path="/fixtures" element={<Placeholder title="Fixtures & Results" />} />
          <Route path="/events" element={<Placeholder title="Events & Attendance" />} />
          <Route path="/administration" element={<Administration />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
