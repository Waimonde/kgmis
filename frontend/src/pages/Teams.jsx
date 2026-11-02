import { useState, useEffect } from "react";

const initialTeams = [
  {
    id: 1,
    name: "Lions",
    sport: "Football",
    category: "Men",
    coach: "John Doe",
    players: 18,
    status: "Active",
  },
  {
    id: 2,
    name: "Eagles",
    sport: "Basketball",
    category: "Women",
    coach: "Mary Doe",
    players: 12,
    status: "Active",
  },
  {
    id: 3,
    name: "Tigers",
    sport: "Volleyball",
    category: "Men",
    coach: "Peter Smith",
    players: 14,
    status: "Active",
  },
];

const initialCoaches = [
  {
    id: 1,
    name: "John Doe",
    phone: "0712345678",
    email: "john@example.com",
    specialization: "Football",
  },
  {
    id: 2,
    name: "Mary Doe",
    phone: "0723456789",
    email: "mary@example.com",
    specialization: "Basketball",
  },
  {
    id: 3,
    name: "Peter Smith",
    phone: "0734567890",
    email: "peter@example.com",
    specialization: "Volleyball",
  },
];

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [players, setPlayers] = useState([]);
  useEffect(() => {
  const fetchCoaches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/coaches");

      if (!response.ok) {
        throw new Error("Failed to fetch coaches");
      }

      const data = await response.json();

      setCoaches(
        data.map((coach) => ({
          id: coach.id,
          name: coach.full_name,
          phone: coach.phone,
          email: coach.email,
          specialization: coach.specialization,
        }))
      );
    } catch (error) {
      console.error("Error fetching coaches:", error);
    }
  };

  fetchCoaches();
}, []);

useEffect(() => {
  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams");

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();

      setTeams(
        data.map((team) => ({
          id: team.id,
          name: team.name,
          sport: team.sport,
          category: team.category,
          coach: team.coach_name,
coach_id: team.coach_id,
          status: "Active",
          players: 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  fetchTeams();
}, []);
useEffect(() => {
  const fetchPlayers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/players");

      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }

      const data = await response.json();

      setPlayers(
        data.map((player) => ({
          id: player.id,
          name: player.full_name,
          team_id: player.team_id,
        }))
      );
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  fetchPlayers();
}, []);
  const [editingTeamId, setEditingTeamId] = useState(null);
const [showCoachForm, setShowCoachForm] = useState(false);
const [editingCoachId, setEditingCoachId] = useState(null);
const [selectedTeam, setSelectedTeam] = useState(null);
const [coachSearch, setCoachSearch] = useState("");

const [coachData, setCoachData] = useState({
  name: "",
  phone: "",
  email: "",
  specialization: "",
});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    category: "",
    coach: "",
  });

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e) {
  e.preventDefault();
  const duplicateTeam = teams.some(
  (team) =>
    team.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
    team.id !== editingTeamId
);

if (duplicateTeam) {
  alert("A team with this name already exists.");
  return;
}
 if (
  !formData.name.trim() ||
  !formData.sport.trim() ||
  !formData.category.trim() ||
  !formData.coach
) {
  alert("Please fill in all required team details and select a coach.");
  return;
}

try {
  const response = await fetch(
  editingTeamId
    ? `http://localhost:5000/api/teams/${editingTeamId}`
    : "http://localhost:5000/api/teams",
  {
    method: editingTeamId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name.trim(),
      sport: formData.sport,
      category: formData.category,
      coach_id: Number(formData.coach),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to register team");
  }

  const newTeam = {
    id: data.id,
    name: data.name,
    sport: data.sport,
    category: data.category,
    coach: coaches.find(
      (coach) => coach.id === data.coach_id
    )?.name || "",
    status: "Active",
    players: 0,
  };

  setTeams([...teams, newTeam]);
} catch (error) {
  alert(error.message);
  return;
}

  setFormData({
    name: "",
    sport: "",
    category: "",
    coach: "",
  });

  setShowForm(false);
  setEditingTeamId(null);
}
function handleEditCoach(coach) {
  setCoachData({
    name: coach.name,
    phone: coach.phone,
    email: coach.email,
    specialization: coach.specialization,
  });

  setEditingCoachId(coach.id);
  setShowCoachForm(true);
}
function handleEditTeam(team) {
  setFormData({
    name: team.name,
    sport: team.sport,
    category: team.category,
    coach: String(team.coach_id),
  });

  setEditingTeamId(team.id);
  setShowForm(true);
}
async function handleCoachSubmit(e) {
  e.preventDefault();
  const duplicateEmail = coaches.some(
  (coach) =>
    coach.email.toLowerCase() === coachData.email.trim().toLowerCase() &&
    coach.id !== editingCoachId
);

if (duplicateEmail) {
  alert("A coach with this email address already exists.");
  return;
}
  if (
    !coachData.name.trim() ||
    !coachData.phone.trim() ||
    !coachData.email.trim() ||
    !coachData.specialization.trim()
  ) {
    alert("Please fill in all coach details.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coachData.email)) {
    alert("Please enter a valid email address.");
    return;
  }
  if (!/^0[17]\d{8}$/.test(coachData.phone.trim())) {
  alert("Please enter a valid Kenyan phone number, e.g. 0712345678.");
  return;
}

 let savedCoach;
 if (!editingCoachId) {

try {
  const response = await fetch("http://localhost:5000/api/coaches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: coachData.name.trim(),
      phone: coachData.phone.trim(),
      email: coachData.email.trim(),
      specialization: coachData.specialization,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to register coach");
  }

  savedCoach = {
    id: data.id,
    name: data.full_name,
    phone: data.phone,
    email: data.email,
    specialization: data.specialization,
  };
} catch (error) {
  alert(error.message);
  return;
}
 }
  if (editingCoachId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/coaches/${editingCoachId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: coachData.name.trim(),
          phone: coachData.phone.trim(),
          email: coachData.email.trim(),
          specialization: coachData.specialization,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update coach");
    }

    const updatedCoach = {
      id: data.id,
      name: data.full_name,
      phone: data.phone,
      email: data.email,
      specialization: data.specialization,
    };

    setCoaches(
      coaches.map((coach) =>
        coach.id === editingCoachId ? updatedCoach : coach
      )
    );
  } catch (error) {
    alert(error.message);
    return;
  }
} else {
  setCoaches([...coaches, savedCoach]);
}

  setCoachData({
    name: "",
    phone: "",
    email: "",
    specialization: "",
  });

  setShowCoachForm(false);
  setEditingCoachId(null);
}

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div>
          <p className="eyebrow">KEMU GAMES MANAGEMENT</p>
          <h1>Teams & Coaches</h1>
          <p>Manage sports teams, coaches and player assignments.</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#172554",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Add Team
        </button>
      </div>

      <div className="teams-stats">
        <div className="team-stat-card">
          <h3>Total Teams</h3>
          <h2>{teams.length}</h2>
        </div>

        <div className="team-stat-card">
          <h3>Total Coaches</h3>
          <h2>{coaches.length}</h2>
        </div>

        <div className="team-stat-card">
          <h3>Assigned Players</h3>
          <h2>
            {teams.reduce((total, team) => total + team.players, 0)}
          </h2>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2>Add New Team</h2>
          <p>Enter the details of the new sports team.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "16px", maxWidth: "500px" }}>
              <label>
                Team Name
                <input
                  required
                  type="text"
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>

              <label>
                Sport
                <select
                  required
                  value={formData.sport}
                  onChange={(e) =>
                    setFormData({ ...formData, sport: e.target.value })
                  }
                >
                  <option value="">Select sport</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Netball">Netball</option>
                </select>
              </label>

              <label>
                Category
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </label>

              <label>
                Assign Coach
                <select
                  value={formData.coach}
                  onChange={(e) =>
                    setFormData({ ...formData, coach: e.target.value })
                  }
                >
                 <option value="">Select coach</option>
{coaches.map((coach) => (
  <option key={coach.id} value={coach.id}>
    {coach.name}
  </option>
))}
                </select>
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="submit"
                style={{
                  background: "#172554",
                  color: "white",
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Save Team
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "11px 20px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

<div className="teams-table-card" style={{ marginBottom: "24px" }}>
  <div className="teams-table-header">
    <div>
      <h2>Manage Coaches</h2>
      <p>Register and manage sports coaches.</p>
    </div>

    <button onClick={() => setShowCoachForm(true)}>
      + Add Coach
    </button>
  </div>

  {showCoachForm && (
    <form onSubmit={handleCoachSubmit} style={{ padding: "20px" }}>
      <h3>Register New Coach</h3>

      <input
        required
        placeholder="Full Name"
        value={coachData.name}
        onChange={(e) =>
          setCoachData({ ...coachData, name: e.target.value })
        }
      />

      <input
        required
        type="tel"
        placeholder="Phone Number"
        value={coachData.phone}
        onChange={(e) =>
          setCoachData({ ...coachData, phone: e.target.value })
        }
      />

      <input
        required
        type="email"
        placeholder="Email Address"
        value={coachData.email}
        onChange={(e) =>
          setCoachData({ ...coachData, email: e.target.value })
        }
      />

      <select
        required
        value={coachData.specialization}
        onChange={(e) =>
          setCoachData({
            ...coachData,
            specialization: e.target.value,
          })
        }
      >
        <option value="">Select Specialization</option>
        <option value="Football">Football</option>
        <option value="Basketball">Basketball</option>
        <option value="Volleyball">Volleyball</option>
        <option value="Rugby">Rugby</option>
        <option value="Athletics">Athletics</option>
        <option value="Netball">Netball</option>
      </select>

      <button type="submit">Save Coach</button>

      <button
        type="button"
        onClick={() => setShowCoachForm(false)}
      >
        Cancel
      </button>
    </form>
  )}

  <div className="table-responsive">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Specialization</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {coaches.map((coach) => (
          <tr key={coach.id}>
            <td>{coach.name}</td>
            <td>{coach.phone}</td>
            <td>{coach.email}</td>
            <td>{coach.specialization}</td>
            <td>
  <button onClick={() => handleEditCoach(coach)}>
    Edit
  </button>

  <button
  onClick={async () => {
    const assigned = teams.some(
      (team) => team.coach === coach.name
    );

    if (assigned) {
      alert("This coach is assigned to a team. Reassign the team before deleting.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this coach?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/coaches/${coach.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete coach");
      }

      setCoaches(coaches.filter((c) => c.id !== coach.id));

      alert("Coach deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  }}
>
  Delete
</button>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      <div className="teams-table-card">
        <div className="teams-table-header">
          <div>
            <h2>Registered Teams</h2>
            <p>View and manage your sports teams.</p>
          </div>

          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Sport</th>
                <th>Category</th>
                <th>Coach</th>
                <th>Players</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td>{team.name}</td>
                  <td>{team.sport}</td>
                  <td>{team.category}</td>
                  <td>{team.coach || "Not assigned"}</td>
                  <td>{players.filter((player) => Number(player.team_id) === team.id).length}</td>
                  <td>
                    <span className="team-status">{team.status}</span>
                  </td>
                  <td>
  <button onClick={() => handleEditTeam(team)}>
    Edit
  </button>

 <button
  onClick={async () => {
   const assignedPlayers = players.filter(
  (player) => Number(player.team_id) === team.id
);

    if (assignedPlayers.length > 0) {
      alert("This team has assigned players. Reassign or remove the players before deleting the team.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${team.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete team");
      }

      setTeams(teams.filter((t) => t.id !== team.id));

      alert("Team deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  }}
>
  Delete
</button>
  <button onClick={() => setSelectedTeam(team)}>
  Assign Players
</button>
</td>
                </tr>
              ))}

              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan="6">No teams found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {selectedTeam && (
  <div>
    <h3>Assign Players to {selectedTeam.name}</h3>

    <p>Selected team: {selectedTeam.name}</p>
    <div>
  <h4>Available Players</h4>

  {players
  .filter((player) => {
    return !player.team_id || Number(player.team_id) === selectedTeam.id;
  })
  .map((player) => (
    <div key={player.id}>
      <label>
      <input
  type="checkbox"
  checked={Number(player.team_id) === selectedTeam.id}
  onChange={async () => {
    const newTeamId =
      Number(player.team_id) === selectedTeam.id
        ? null
        : selectedTeam.id;

    try {
      const response = await fetch(
        `http://localhost:5000/api/players/${player.id}/team`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ team_id: newTeamId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update assignment");
      }

      setPlayers(
        players.map((p) =>
          p.id === player.id ? { ...p, team_id: data.team_id } : p
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }}
/>
        {player.name}
      </label>
    </div>
  ))}
</div>
<button onClick={() => setSelectedTeam(null)}>
  Save Assignments
</button>
    <button onClick={() => setSelectedTeam(null)}>
      Close
    </button>
  </div>
)}
        </div>
      </div>
    </div>
  );
}