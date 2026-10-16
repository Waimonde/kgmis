
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Trophy,
  ClipboardList,
  Settings
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/players", label: "Players", icon: Users },
  { to: "/teams", label: "Teams & Coaches", icon: Shield },
  { to: "/fixtures", label: "Fixtures & Results", icon: Trophy },
  { to: "/events", label: "Events & Attendance", icon: CalendarDays },
  { to: "/administration", label: "Administration", icon: Settings },
];

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">K</div>
        <div>
          <h2>KeMU Games</h2>
          <span>Management System</span>
        </div>
      </div>

      <div className="nav-section-title">MAIN MENU</div>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ClipboardList size={18} />
        <span>KeMU Sports Department</span>
      </div>
    </aside>
  );
}
