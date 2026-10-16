
import {
  Users,
  Shield,
  CalendarDays,
  Trophy,
  ArrowUpRight,
  Clock3
} from "lucide-react";

const stats = [
  { label: "Registered Players", value: "248", icon: Users, color: "blue" },
  { label: "Active Teams", value: "16", icon: Shield, color: "purple" },
  { label: "Upcoming Fixtures", value: "08", icon: CalendarDays, color: "orange" },
  { label: "Events This Semester", value: "12", icon: Trophy, color: "green" },
];

const fixtures = [
  { sport: "Football", home: "KeMU Lions", away: "JKUAT", date: "20 Oct 2026", status: "Upcoming" },
  { sport: "Basketball", home: "KeMU Falcons", away: "KU", date: "22 Oct 2026", status: "Upcoming" },
  { sport: "Volleyball", home: "KeMU Spikers", away: "USIU-A", date: "24 Oct 2026", status: "Upcoming" },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPORTS DEPARTMENT</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Overview of sports activities and player management.
          </p>
        </div>
        <div className="date-chip">
          <CalendarDays size={17} />
          Academic Year 2026/2027
        </div>
      </div>

      <section className="welcome-banner">
        <div>
          <p className="welcome-label">WELCOME TO KEMU GAMES</p>
          <h2>Manage your sports activities in one place.</h2>
          <p>
            Track players, coordinate teams, schedule fixtures
            and monitor participation.
          </p>
        </div>
        <Trophy className="welcome-trophy" size={100} />
      </section>

      <section className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}>
              <Icon size={22} />
            </div>
            <p>{label}</p>
            <div className="stat-bottom">
              <h2>{value}</h2>
              <ArrowUpRight size={19} />
            </div>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel fixtures-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming Fixtures</h3>
              <p>Scheduled sports matches</p>
            </div>
            <CalendarDays size={21} />
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Sport / Match</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((fixture) => (
                  <tr key={fixture.sport}>
                    <td>
                      <strong>{fixture.sport}</strong>
                      <span className="match-teams">
                        {fixture.home} vs {fixture.away}
                      </span>
                    </td>
                    <td>{fixture.date}</td>
                    <td>
                      <span className="status-badge">
                        {fixture.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Overview</h3>
              <p>Department activity</p>
            </div>
            <Clock3 size={21} />
          </div>

          <div className="overview-item">
            <div className="overview-dot blue-dot" />
            <div>
              <strong>Player Management</strong>
              <p>Register and update student profiles.</p>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-dot purple-dot" />
            <div>
              <strong>Teams & Coaches</strong>
              <p>Organize squads and coaching assignments.</p>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-dot orange-dot" />
            <div>
              <strong>Events & Attendance</strong>
              <p>Monitor participation in sports activities.</p>
            </div>
          </div>
        </article>
      </section>

      <p className="demo-note">
        Demonstration data only. Live statistics will be connected
        to the backend and PostgreSQL database later.
      </p>
    </div>
  );
}
