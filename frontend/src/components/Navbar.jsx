
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Trophy,
  ClipboardList,
  Settings,
  ChartNoAxesCombined,
  UserCog,
  GraduationCap
} from "lucide-react";

const menuGroups = [
  {
    title: "GENERAL",
    links: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/players", label: "Students & Players", icon: Users },
      { to: "/teams", label: "Teams & Coaches", icon: Shield },
      { to: "/fixtures", label: "Fixtures & Results", icon: Trophy },
      { to: "/events", label: "Events & Attendance", icon: CalendarDays },
      { to: "/reports", label: "Performance & Reports", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "ADMINISTRATION",
    links: [
      { to: "/administration", label: "Administration", icon: UserCog },
      { to: "/users", label: "User Management", icon: GraduationCap },
      { to: "/settings", label: "System Settings", icon: Settings },
    ],
  },
];

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">K</div>
        <div>
          <h2>KGMIS Games</h2>
          <span>Management System</span>
        </div>
      </div>

      {menuGroups.map((group) => (
        <div className="nav-group" key={group.title}>
          <div className="nav-section-title">
            {group.title}
          </div>

          <nav className="nav-links">
            {group.links.map(({ to, label, icon: Icon }) => (
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
        </div>
      ))}

      <div className="sidebar-footer">
        <ClipboardList size={18} />
        <span>KGMIS Sports Department</span>
      </div>
    </aside>
  );
}
