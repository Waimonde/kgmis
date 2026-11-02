
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
import Users from "./pages/Users";

import "./index.css";

// Check whether the user is logged in
function ProtectedRoute() {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// Check whether the logged-in user has the required role
function RoleProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    user = null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
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

// Placeholder for modules still under development
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

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* ALL AUTHENTICATED USERS */}
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

            {/* ADMINISTRATOR AND GAMES DEPARTMENT */}
            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Administrator",
                    "Games Department"
                  ]}
                />
              }
            >
              <Route
                path="/administration"
                element={<Placeholder title="Administration" />}
              />
            </Route>

            {/* ADMINISTRATOR ONLY */}
            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={["Administrator"]}
                />
              }
            >
              <Route path="/users" element={<Users />} />

              <Route
                path="/settings"
                element={<Placeholder title="System Settings" />}
              />
            </Route>

          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
