
import { NavLink, useNavigate } from "react-router-dom";
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
  GraduationCap,
  LogOut,
  UserCircle
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
      {
        to: "/administration",
        label: "Administration",
        icon: UserCog,
        allowedRoles: ["Administrator", "Games Department"]
      },
      {
        to: "/users",
        label: "User Management",
        icon: GraduationCap,
        allowedRoles: ["Administrator"]
      },
      {
        to: "/settings",
        label: "System Settings",
        icon: Settings,
        allowedRoles: ["Administrator"]
      },
    ],
  },
];

export default function Navbar() {
  const navigate = useNavigate();

  // Retrieve the logged-in user's details
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    user = null;
  }

  const userRole = user?.role;

  // Filter navigation links according to user role
  const visibleMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => {
        // Links without role restrictions are available to all users
        if (!link.allowedRoles) return true;

        return link.allowedRoles.includes(userRole);
      }),
    }))
    // Hide menu groups with no visible links
    .filter((group) => group.links.length > 0);

  // Handle logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">

      {/* SYSTEM BRANDING */}
      <div className="brand">
        <div className="brand-logo">K</div>

        <div>
          <h2>KGMIS Games</h2>
          <span>Management System</span>
        </div>
      </div>

      {/* ROLE-BASED NAVIGATION MENU */}
      {visibleMenuGroups.map((group) => (
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

      {/* SIDEBAR FOOTER */}
      <div className="sidebar-footer">
        <ClipboardList size={18} />
        <span>KGMIS Sports Department</span>
      </div>

      {/* LOGGED-IN USER DETAILS */}
      <div className="sidebar-user">

        <UserCircle size={30} />

        <div className="sidebar-user-info">
          <strong>
            {user?.name || "KGMIS User"}
          </strong>

          <small>
            {user?.role || "User"}
          </small>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
          type="button"
        >
          <LogOut size={18} />
        </button>

      </div>

    </aside>
  );
}
