import "../../events.css";
import { useState } from "react";
import {
  CalendarDays,
  CalendarClock,
  Activity,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";

const sampleEvents = [
  {
    id: 1,
    name: "Inter-University Football Tournament",
    category: "Tournament",
    venue: "Main Sports Ground",
    date: "2026-11-12",
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Basketball Training Session",
    category: "Training",
    venue: "Indoor Court",
    date: "2026-11-06",
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Athletics Championship",
    category: "Competition",
    venue: "University Stadium",
    date: "2026-11-02",
    status: "Completed",
  },
  {
    id: 4,
    name: "Team Captains Meeting",
    category: "Meeting",
    venue: "Conference Room",
    date: "2026-11-04",
    status: "Ongoing",
  },
];

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = sampleEvents.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEvents = sampleEvents.length;
  const upcomingEvents = sampleEvents.filter(
    (event) => event.status === "Upcoming"
  ).length;
  const ongoingEvents = sampleEvents.filter(
    (event) => event.status === "Ongoing"
  ).length;
  const completedEvents = sampleEvents.filter(
    (event) => event.status === "Completed"
  ).length;

  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents,
      icon: CalendarClock,
    },
    {
      label: "Ongoing Events",
      value: ongoingEvents,
      icon: Activity,
    },
    {
      label: "Completed Events",
      value: completedEvents,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="events-page">
      <div className="events-heading">
        <div>
          <p className="events-eyebrow">KEMU GAMES MANAGEMENT</p>
          <h1>Events & Attendance</h1>
          <p>Manage sports events, activities and attendance.</p>
        </div>

        <button className="events-primary-btn">
          <Plus size={18} />
          Create Event
        </button>
      </div>

      <div className="events-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="events-stat-card" key={stat.label}>
              <div className="events-stat-icon">
                <Icon size={22} />
              </div>

              <div>
                <h2>{stat.value}</h2>
                <p>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="events-panel">
        <div className="events-panel-heading">
          <div>
            <h2>Recent Events</h2>
            <p>View and manage your sports activities.</p>
          </div>
        </div>

        <div className="events-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.category}</td>
                  <td>{event.venue}</td>
                  <td>{event.date}</td>
                  <td>
                    <span
                      className={`events-status events-${event.status.toLowerCase()}`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan="5" className="events-empty">
                    No matching events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}