
import "./Administration.css";
import { useState } from "react";
export default function Administration() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="admin-page">
      <p className="eyebrow">KEMU GAMES MANAGEMENT</p>

      <h1>Administration & Reporting</h1>

      <p className="muted">
        Manage users, oversee system activities, and view reports.
      </p>

      <div className="admin-stats">
        <div className="admin-card">
          <h3>Total Users</h3>
          <p>24</p>
        </div>

        <div className="admin-card">
          <h3>Active Users</h3>
          <p>18</p>
        </div>

        <div className="admin-card">
          <h3>Reports</h3>
          <p>12</p>
        </div>

        <div className="admin-card">
          <h3>System Status</h3>
          <p>Operational</p>
        </div>
      </div>

      <section className="admin-section">
        <h2>User Management</h2>
        <p>View and manage users of the KEMU Games Management System.</p>
<input
          type="text"
          placeholder="Search users by name or role..."
          className="user-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
           {[
  { name: "System Administrator", role: "Admin", status: "Active" },
  { name: "Sports Officer", role: "Staff", status: "Active" },
  { name: "Report Viewer", role: "Staff", status: "Inactive" },
]
  .filter((user) =>
    `${user.name} ${user.role} ${user.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .map((user) => (
    <tr key={user.name}>
      <td>{user.name}</td>
      <td>{user.role}</td>
      <td>{user.status}</td>
    </tr>
  ))} 
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>System Oversight</h2>
        <p>Monitor the status of the application and its modules.</p>
        <ul>
          <li>Dashboard: Available</li>
          <li>Player Management: Available</li>
          <li>Teams & Coaches: Available</li>
          <li>Fixtures & Results: Available</li>
          <li>Events & Attendance: Available</li>
        </ul>
      </section>

      <section className="admin-section">
        <h2>Reports</h2>
        <p>Summary of sports department activities using demonstration data.</p>
        <ul>
          <li>Registered players: 248</li>
          <li>Active teams: 16</li>
          <li>Upcoming fixtures: 8</li>
          <li>Events this semester: 12</li>
        </ul>
      </section>

      <p className="muted">
        Demonstration data only. Live data will be connected to the backend later.
      </p>
    </div>
  );
}
