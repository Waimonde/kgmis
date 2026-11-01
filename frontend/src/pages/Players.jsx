
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserRound,
  Pencil,
  X,
  Filter,
  CheckCircle2,
  Clock3,
  Trash2,
  Eye,
  RefreshCw,
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
  "Football",
  "Basketball",
  "Volleyball",
  "Athletics",
  "Rugby",
  "Netball",
  "Handball",
  "Hockey",
  "Swimming",
  "Other",
];

const positions = {
  Football: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Basketball: ["Guard", "Forward", "Center"],
  Volleyball: [
    "Setter",
    "Libero",
    "Outside Hitter",
    "Middle Blocker",
    "Opposite",
  ],
  Rugby: ["Forward", "Back"],
  Netball: [
    "Goal Shooter",
    "Goal Attack",
    "Wing Attack",
    "Center",
    "Wing Defence",
    "Goal Defence",
    "Goal Keeper",
  ],
  Handball: ["Goalkeeper", "Wing", "Backcourt", "Pivot"],
  Hockey: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Athletics: [
    "Sprinter",
    "Middle Distance",
    "Long Distance",
    "Jumps",
    "Throws",
  ],
  Swimming: [
    "Freestyle",
    "Backstroke",
    "Breaststroke",
    "Butterfly",
    "Individual Medley",
  ],
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
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // FETCH PLAYERS
  async function loadPlayers() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load player records.");
      }

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

  // SEARCH AND FILTER
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

  // STATISTICS
  const activeCount = players.filter(
    (player) => player.status === "Active"
  ).length;

  const inactiveCount = players.length - activeCount;

  const sportsCount = new Set(
    players.map((player) => player.sport)
  ).size;

  // OPEN REGISTRATION FORM
  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  // OPEN EDIT FORM
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

  // HANDLE FORM INPUTS
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "sport" ? { position: "" } : {}),
    }));

    setError("");
  }

  // REGISTER OR UPDATE PLAYER
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
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save player."
        );
      }

      if (isEditing) {
        setPlayers((previous) =>
          previous.map((player) =>
            player.id === editingId
              ? fromApi(result)
              : player
          )
        );
      } else {
        setPlayers((previous) => [
          fromApi(result),
          ...previous,
        ]);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(
        err.message || "Could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE PLAYER
  async function handleDelete(player) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${player.name} (${player.regNo})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(player.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${player.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete player."
        );
      }

      setPlayers((previous) =>
        previous.filter(
          (item) => item.id !== player.id
        )
      );

      if (selectedPlayer?.id === player.id) {
        setSelectedPlayer(null);
      }
    } catch (err) {
      setError(
        err.message || "Could not connect to the server."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // CLOSE FORM
  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  return (
    <div className="players-page">

      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPORTS DEPARTMENT</p>
          <h1>Player Management</h1>
          <p className="muted">
            Register students and manage sports player records.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={openNewForm}
        >
          <Plus size={18} />
          Register Player
        </button>
      </div>

      {/* PLAYER STATISTICS */}
      <section className="player-stats">

        <article className="player-stat-card">
          <div className="player-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <p>Total Players</p>
            <h2>{players.length}</h2>
          </div>
        </article>

        <article className="player-stat-card">
          <div className="player-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>Active Players</p>
            <h2>{activeCount}</h2>
          </div>
        </article>

        <article className="player-stat-card">
          <div className="player-stat-icon orange">
            <Clock3 size={22} />
          </div>
          <div>
            <p>Inactive Players</p>
            <h2>{inactiveCount}</h2>
          </div>
        </article>

        <article className="player-stat-card">
          <div className="player-stat-icon purple">
            <UserRound size={22} />
          </div>
          <div>
            <p>Sports Represented</p>
            <h2>{sportsCount}</h2>
          </div>
        </article>

      </section>

      {/* REGISTERED PLAYERS TABLE */}
      <section className="players-panel">

        <div className="players-panel-heading">
          <div>
            <h3>Registered Players</h3>
            <p>
              {filteredPlayers.length} player record(s) displayed
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={loadPlayers}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="player-toolbar">

          <div className="player-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search name, registration no. or sport..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="filter-control">
            <Filter size={16} />

            <select
              aria-label="Filter by sport"
              value={sportFilter}
              onChange={(event) =>
                setSportFilter(event.target.value)
              }
            >
              <option value="All">All sports</option>

              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <select
            className="status-filter"
            aria-label="Filter by player status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        {error && !showForm && (
          <p className="form-error">{error}</p>
        )}

        {/* PLAYERS TABLE */}
        <div className="table-scroll">
          <table className="players-table">

            <thead>
              <tr>
                <th>PLAYER</th>
                <th>REGISTRATION NO.</th>
                <th>SPORT / POSITION</th>
                <th>FACULTY / SCHOOL</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Loading players...
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id}>

                    <td>
                      <div className="player-name-cell">
                        <div className="player-avatar">
                          {player.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{player.name}</strong>
                          <span>
                            {player.gender} · {player.phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{player.regNo}</td>

                    <td>
                      <strong>{player.sport}</strong>
                      <span className="table-subtext">
                        {player.position}
                      </span>
                    </td>

                    <td>{player.faculty}</td>

                    <td>
                      <span
                        className={`player-status ${
                          player.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {player.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="icon-btn"
                        title={`View ${player.name}`}
                        aria-label={`View ${player.name}`}
                        onClick={() =>
                          setSelectedPlayer(player)
                        }
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        className="icon-btn"
                        title={`Edit ${player.name}`}
                        aria-label={`Edit ${player.name}`}
                        onClick={() =>
                          openEditForm(player)
                        }
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        className="icon-btn delete-btn"
                        title={`Delete ${player.name}`}
                        aria-label={`Delete ${player.name}`}
                        onClick={() =>
                          handleDelete(player)
                        }
                        disabled={deletingId === player.id}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>

                  </tr>
                ))
              )}

              {!loading && filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No players found. Register a player to get started.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        <div className="players-panel-footer">
          <span>
            Showing {filteredPlayers.length} of {players.length} records
          </span>
          <span>KeMU Games Management</span>
        </div>

      </section>

      {/* REGISTER / EDIT PLAYER MODAL */}
      {showForm && (
        <div
          className="player-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="player-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-form-title"
          >

            <div className="player-modal-header">
              <div>
                <p className="eyebrow">PLAYER RECORDS</p>

                <h2 id="player-form-title">
                  {editingId !== null
                    ? "Edit Player"
                    : "Register New Player"}
                </h2>

                <p className="muted">
                  Enter the student's details below.
                </p>
              </div>

              <button
                className="icon-btn"
                aria-label="Close form"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="player-form-grid">

                <label>
                  Student Registration Number *
                  <input
                    name="regNo"
                    value={form.regNo}
                    onChange={handleChange}
                    placeholder="e.g. SCT212-005"
                    required
                    maxLength={40}
                  />
                </label>

                <label>
                  Full Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter student's full name"
                    required
                    maxLength={120}
                  />
                </label>

                <label>
                  Gender *
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0712345678"
                    maxLength={20}
                  />
                </label>

                <label>
                  Faculty / School *
                  <input
                    name="faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    placeholder="Enter faculty or school"
                    required
                    maxLength={120}
                  />
                </label>

                <label>
                  Sport *
                  <select
                    name="sport"
                    value={form.sport}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select sport</option>

                    {sports.map((sport) => (
                      <option key={sport}>{sport}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Playing Position *
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    required
                    disabled={!form.sport}
                  >
                    <option value="">Select position</option>

                    {(positions[form.sport] || ["Player"]).map(
                      (position) => (
                        <option key={position}>
                          {position}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Player Status *
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>

              </div>

              {error && (
                <p className="form-error">{error}</p>
              )}

              <div className="player-form-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Register Player"}
                </button>

              </div>

            </form>
          </section>
        </div>
      )}

      {/* PLAYER PROFILE MODAL */}
      {selectedPlayer && (
        <div
          className="player-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPlayer(null);
            }
          }}
        >
          <section
            className="player-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-profile-title"
          >

            <div className="player-modal-header">
              <div>
                <p className="eyebrow">PLAYER PROFILE</p>
                <h2 id="player-profile-title">
                  {selectedPlayer.name}
                </h2>
                <p className="muted">
                  {selectedPlayer.regNo}
                </p>
              </div>

              <button
                className="icon-btn"
                aria-label="Close profile"
                onClick={() => setSelectedPlayer(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="player-profile-details">

              <p>
                <strong>Full Name:</strong>
                {selectedPlayer.name}
              </p>

              <p>
                <strong>Registration Number:</strong>
                {selectedPlayer.regNo}
              </p>

              <p>
                <strong>Gender:</strong>
                {selectedPlayer.gender}
              </p>

              <p>
                <strong>Phone:</strong>
                {selectedPlayer.phone || "Not provided"}
              </p>

              <p>
                <strong>Faculty / School:</strong>
                {selectedPlayer.faculty}
              </p>

              <p>
                <strong>Sport:</strong>
                {selectedPlayer.sport}
              </p>

              <p>
                <strong>Playing Position:</strong>
                {selectedPlayer.position}
              </p>

              <p>
                <strong>Status:</strong>
                {selectedPlayer.status}
              </p>

            </div>

            <div className="player-form-actions">
              <button
                className="secondary-btn"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  openEditForm(selectedPlayer);
                  setSelectedPlayer(null);
                }}
              >
                <Pencil size={16} />
                Edit Player
              </button>
            </div>

          </section>
        </div>
      )}

    </div>
  );
}
