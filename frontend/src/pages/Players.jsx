
import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Users, UserRound, Pencil, X,
  Filter, CheckCircle2, Clock3,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/players";

const emptyForm = {
  regNo: "",
  name: "",
  gender: "",
  phone: "",
  faculty: "",
  sport: "",
  position: "",
  status: "Active",
};

const sports = [
  "Football", "Basketball", "Volleyball", "Athletics",
  "Rugby", "Netball", "Handball", "Hockey",
  "Swimming", "Other",
];

const positions = {
  Football: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Basketball: ["Guard", "Forward", "Center"],
  Volleyball: ["Setter", "Libero", "Outside Hitter", "Middle Blocker", "Opposite"],
  Rugby: ["Forward", "Back"],
  Netball: ["Goal Shooter", "Goal Attack", "Wing Attack", "Center", "Wing Defence", "Goal Defence", "Goal Keeper"],
  Handball: ["Goalkeeper", "Wing", "Backcourt", "Pivot"],
  Hockey: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Athletics: ["Sprinter", "Middle Distance", "Long Distance", "Jumps", "Throws"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Individual Medley"],
  Other: ["Player"],
};

function fromApi(row) {
  return {
    id: row.id,
    regNo: row.registration_number,
    name: row.full_name,
    gender: row.gender,
    phone: row.phone || "",
    faculty: row.faculty,
    sport: row.sport,
    position: row.position,
    status: row.status,
  };
}

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadPlayers() {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load player records.");
      const data = await response.json();
      setPlayers(data.map(fromApi));
      setError("");
    } catch (err) {
      setError(`${err.message} Check that the backend is running.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const term = search.toLowerCase();
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(term) ||
        player.regNo.toLowerCase().includes(term) ||
        player.sport.toLowerCase().includes(term);
      const matchesSport =
        sportFilter === "All" || player.sport === sportFilter;
      const matchesStatus =
        statusFilter === "All" || player.status === statusFilter;
      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [players, search, sportFilter, statusFilter]);

  const activeCount = players.filter(
    (player) => player.status === "Active"
  ).length;

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(player) {
    setForm({
      regNo: player.regNo,
      name: player.name,
      gender: player.gender,
      phone: player.phone,
      faculty: player.faculty,
      sport: player.sport,
      position: player.position,
      status: player.status,
    });
    setEditingId(player.id);
    setError("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "sport" ? { position: "" } : {}),
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      registration_number: form.regNo.trim(),
      full_name: form.name.trim(),
      gender: form.gender,
      phone: form.phone.trim() || null,
      faculty: form.faculty.trim(),
      sport: form.sport,
      position: form.position,
      status: form.status,
    };

    try {
      if (editingId !== null) {
        setError("Editing saved players will be enabled after we add the update API.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register player.");
      }

      setPlayers((previous) => [fromApi(result), ...previous]);
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="players-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPORTS DEPARTMENT</p>
          <h1>Player Management</h1>
          <p className="muted">Register students and manage sports player records.</p>
        </div>
        <button className="primary-btn" onClick={openNewForm}>
          <Plus size={18} /> Register Player
        </button>
      </div>

      <section className="player-stats">
        <article className="player-stat-card">
          <div className="player-stat-icon blue"><Users size={22} /></div>
          <div><p>Total Players</p><h2>{players.length}</h2></div>
        </article>
        <article className="player-stat-card">
          <div className="player-stat-icon green"><CheckCircle2 size={22} /></div>
          <div><p>Active Players</p><h2>{activeCount}</h2></div>
        </article>
        <article className="player-stat-card">
          <div className="player-stat-icon orange"><Clock3 size={22} /></div>
          <div><p>Inactive Players</p><h2>{players.length - activeCount}</h2></div>
        </article>
        <article className="player-stat-card">
          <div className="player-stat-icon purple"><UserRound size={22} /></div>
          <div><p>Sports Represented</p><h2>{new Set(players.map((p) => p.sport)).size}</h2></div>
        </article>
      </section>

      <section className="players-panel">
        <div className="players-panel-heading">
          <div>
            <h3>Registered Players</h3>
            <p>{filteredPlayers.length} player record(s) displayed</p>
          </div>
          <button className="secondary-btn" onClick={loadPlayers} disabled={loading}>
            Refresh
          </button>
        </div>

        <div className="player-toolbar">
          <div className="player-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name, registration no. or sport..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="filter-control">
            <Filter size={16} />
            <select aria-label="Filter by sport" value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}>
              <option value="All">All sports</option>
              {sports.map((sport) => <option key={sport}>{sport}</option>)}
            </select>
          </div>
          <select className="status-filter" aria-label="Filter by player status"
            value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {error && !showForm && <p className="form-error">{error}</p>}

        <div className="table-scroll">
          <table className="players-table">
            <thead>
              <tr>
                <th>PLAYER</th><th>REGISTRATION NO.</th>
                <th>SPORT / POSITION</th><th>FACULTY / SCHOOL</th>
                <th>STATUS</th><th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="empty-table">Loading players...</td></tr>
              ) : filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    <div className="player-name-cell">
                      <div className="player-avatar">
                        {player.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div><strong>{player.name}</strong><span>{player.gender} · {player.phone}</span></div>
                    </div>
                  </td>
                  <td>{player.regNo}</td>
                  <td><strong>{player.sport}</strong><span className="table-subtext">{player.position}</span></td>
                  <td>{player.faculty}</td>
                  <td>
                    <span className={`player-status ${player.status === "Active" ? "status-active" : "status-inactive"}`}>
                      {player.status}
                    </span>
                  </td>
                  <td>
                    <button className="icon-btn" title={`Edit ${player.name}`}
                      aria-label={`Edit ${player.name}`} onClick={() => openEditForm(player)}>
                      <Pencil size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredPlayers.length === 0 && (
                <tr><td colSpan="6" className="empty-table">No players found. Register a player to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="players-panel-footer">
          <span>Showing {filteredPlayers.length} of {players.length} records</span>
          <span>KeMU Games Management</span>
        </div>
      </section>

      {showForm && (
        <div className="player-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForm(false);
        }}>
          <section className="player-modal" role="dialog" aria-modal="true" aria-labelledby="player-form-title">
            <div className="player-modal-header">
              <div>
                <p className="eyebrow">PLAYER RECORDS</p>
                <h2 id="player-form-title">{editingId !== null ? "Edit Player" : "Register New Player"}</h2>
                <p className="muted">Enter the student's details below.</p>
              </div>
              <button className="icon-btn" aria-label="Close form" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="player-form-grid">
                <label>Student Registration Number *
                  <input name="regNo" value={form.regNo} onChange={handleChange}
                    placeholder="e.g. SCT212-005" required maxLength={40} />
                </label>
                <label>Full Name *
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Enter student's full name" required maxLength={120} />
                </label>
                <label>Gender *
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
                <label>Phone Number
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="e.g. 0712345678" maxLength={20} />
                </label>
                <label>Faculty / School *
                  <input name="faculty" value={form.faculty} onChange={handleChange}
                    placeholder="Enter faculty or school" required maxLength={120} />
                </label>
                <label>Sport *
                  <select name="sport" value={form.sport} onChange={handleChange} required>
                    <option value="">Select sport</option>
                    {sports.map((sport) => <option key={sport}>{sport}</option>)}
                  </select>
                </label>
                <label>Playing Position *
                  <select name="position" value={form.position} onChange={handleChange}
                    required disabled={!form.sport}>
                    <option value="">Select position</option>
                    {(positions[form.sport] || ["Player"]).map((position) =>
                      <option key={position}>{position}</option>)}
                  </select>
                </label>
                <label>Player Status *
                  <select name="status" value={form.status} onChange={handleChange} required>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="player-form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Register Player"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
