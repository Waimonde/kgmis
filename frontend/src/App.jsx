
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Login from "./pages/Login";

import "./index.css";

// Protect pages that require authentication
function ProtectedRoute() {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// Main application layout
function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

// Temporary placeholder for modules under development
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            <Route path="/" element={<Dashboard />} />

            <Route path="/players" element={<Players />} />

            <Route
              path="/teams"
              element={<Placeholder title="Teams & Coaches" />}
            />

            <Route
              path="/fixtures"
              element={<Placeholder title="Fixtures & Results" />}
            />

            <Route
              path="/events"
              element={<Placeholder title="Events & Attendance" />}
            />

            <Route
              path="/reports"
              element={<Placeholder title="Performance & Reports" />}
            />

            <Route
              path="/administration"
              element={<Placeholder title="Administration" />}
            />

            <Route
              path="/users"
              element={<Placeholder title="User Management" />}
            />

            <Route
              path="/settings"
              element={<Placeholder title="System Settings" />}
            />

          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
