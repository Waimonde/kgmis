
import {
  Users,
  Shield,
  CalendarDays,
  Trophy,
  ArrowUpRight,
  Clock3,
  Activity,
  UserPlus,
  ClipboardCheck,
  MapPin,
  ChevronRight
} from "lucide-react";

import { Link } from "react-router-dom";

const stats = [
  {
    label: "Registered Players",
    value: "248",
    description: "Across all sports",
    icon: Users,
    color: "blue"
  },
  {
    label: "Active Teams",
    value: "16",
    description: "University sports teams",
    icon: Shield,
    color: "purple"
  },
  {
    label: "Upcoming Fixtures",
    value: "08",
    description: "Scheduled matches",
    icon: CalendarDays,
    color: "orange"
  },
  {
    label: "Sports Events",
    value: "12",
    description: "This academic year",
    icon: Trophy,
    color: "green"
  }
];

const fixtures = [
  {
    sport: "Football",
    home: "KeMU Lions",
    away: "JKUAT",
    date: "05 Nov 2026",
    venue: "KeMU Sports Ground",
    status: "Upcoming"
  },
  {
    sport: "Basketball",
    home: "KeMU Falcons",
    away: "KU",
    date: "07 Nov 2026",
    venue: "Indoor Court",
    status: "Upcoming"
  },
  {
    sport: "Volleyball",
    home: "KeMU Spikers",
    away: "USIU-A",
    date: "12 Nov 2026",
    venue: "Main Campus",
    status: "Upcoming"
  }
];

const activities = [
  {
    icon: UserPlus,
    color: "blue",
    title: "New player registered",
    description: "A new student joined the football team.",
    time: "Recently"
  },
  {
    icon: Shield,
    color: "purple",
    title: "Team updated",
    description: "Basketball team information was updated.",
    time: "Recently"
  },
  {
    icon: CalendarDays,
    color: "orange",
    title: "Fixture scheduled",
    description: "A new football fixture was added.",
    time: "Recently"
  },
  {
    icon: ClipboardCheck,
    color: "green",
    title: "Attendance recorded",
    description: "Sports event attendance was updated.",
    time: "Recently"
  }
];

const quickLinks = [
  {
    label: "Register Player",
    description: "Add a new student athlete",
    icon: UserPlus,
    path: "/players",
    color: "blue"
  },
  {
    label: "Manage Teams",
    description: "View teams and coaches",
    icon: Shield,
    path: "/teams",
    color: "purple"
  },
  {
    label: "Schedule Fixture",
    description: "Organize an upcoming match",
    icon: CalendarDays,
    path: "/fixtures",
    color: "orange"
  }
];

export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-label">
            KGMIS
          </span>

          <h2>
            Welcome to KGMIS
          </h2>

          <p>
            Manage university sports activities, players,
            teams, competitions and events from one central
            management system.
          </p>

          <Link to="/players" className="welcome-button">
            Manage Players
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="welcome-visual">
          <Trophy size={105} strokeWidth={1.2} />
        </div>
      </section>

      {/* Academic Year */}
      <div className="dashboard-section-heading">
        <div>
          <h2>Sports Overview</h2>
          <p>Summary of university sports activities</p>
        </div>

        <div className="date-chip">
          <CalendarDays size={16} />
          Academic Year 2026/2027
        </div>
      </div>

      {/* Statistics */}
      <section className="stats-grid">
        {stats.map(({ label, value, description, icon: Icon, color }) => (
          <article className="stat-card" key={label}>
            <div className="stat-card-top">
              <div className={`stat-icon ${color}`}>
                <Icon size={21} />
              </div>

              <span className="stat-indicator">
                <ArrowUpRight size={15} />
              </span>
            </div>

            <p>{label}</p>

            <h2>{value}</h2>

            <span className="stat-description">
              {description}
            </span>
          </article>
        ))}
      </section>

      {/* Quick Links */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Common sports management activities</p>
          </div>
        </div>

        <div className="quick-links-grid">
          {quickLinks.map(({ label, description, icon: Icon, path, color }) => (
            <Link to={path} className="quick-link-card" key={label}>
              <div className={`quick-link-icon ${color}`}>
                <Icon size={21} />
              </div>

              <div>
                <strong>{label}</strong>
                <p>{description}</p>
              </div>

              <ChevronRight size={18} className="quick-link-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="dashboard-content-grid">

        {/* Fixtures */}
        <article className="dashboard-panel fixtures-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming Fixtures</h3>
              <p>Scheduled university sports matches</p>
            </div>

            <Link to="/fixtures" className="view-all-link">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          <div className="fixture-list">
            {fixtures.map((fixture) => (
              <div className="fixture-item" key={fixture.sport}>
                <div className="fixture-sport-icon">
                  <Trophy size={19} />
                </div>

                <div className="fixture-details">
                  <strong>{fixture.sport}</strong>

                  <p>
                    {fixture.home}
                    <span> vs </span>
                    {fixture.away}
                  </p>

                  <div className="fixture-venue">
                    <MapPin size={12} />
                    {fixture.venue}
                  </div>
                </div>

                <div className="fixture-date">
                  <span>{fixture.date}</span>
                  <small>{fixture.status}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Recent Activities */}
        <article className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activities</h3>
              <p>Latest department updates</p>
            </div>

            <Activity size={20} />
          </div>

          <div className="activity-list">
            {activities.map(({ icon: Icon, color, title, description, time }) => (
              <div className="activity-item" key={title}>
                <div className={`activity-icon ${color}`}>
                  <Icon size={17} />
                </div>

                <div className="activity-details">
                  <strong>{title}</strong>
                  <p>{description}</p>
                  <span>{time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* System Information */}
      <section className="system-information">
        <div className="system-information-icon">
          <Clock3 size={19} />
        </div>

        <div>
          <strong>KGMIS (Games Management Information System)</strong>
          <p>
            Centralized management of sports,
            players, teams, fixtures and events.
          </p>
        </div>
      </section>

      <p className="demo-note">
                
      </p>

    </div>
  );
}
