
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
  res.json({
    message: "KeMU Games Management API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");

    res.json({
      status: "OK",
      database: "Connected",
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});


/* GET all players */
app.get("/api/players", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM players ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching players:", error.message);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

/* REGISTER a player */
app.post("/api/players", async (req, res) => {
  try {
    const {
      registration_number,
      full_name,
      gender,
      phone,
      faculty,
      sport,
      position,
      status
    } = req.body;

    if (
      !registration_number ||
      !full_name ||
      !gender ||
      !faculty ||
      !sport ||
      !position
    ) {
      return res.status(400).json({
        error: "Please provide all required player details"
      });
    }

    const result = await pool.query(
      `INSERT INTO players
       (registration_number, full_name, gender, phone,
        faculty, sport, position, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        registration_number,
        full_name,
        gender,
        phone || null,
        faculty,
        sport,
        position,
        status || "Active"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This registration number already exists"
      });
    }

    console.error("Error registering player:", error.message);
    res.status(500).json({ error: "Failed to register player" });
  }
});
/* ASSIGN a player to a team */
app.put("/api/players/:id/team", async (req, res) => {
  try {
    const { id } = req.params;
    const { team_id } = req.body;

    const selectedTeam = team_id === null || team_id === ""
      ? null
      : Number(team_id);

    if (selectedTeam !== null && !Number.isInteger(selectedTeam)) {
      return res.status(400).json({
        error: "Please provide a valid team ID"
      });
    }

    const result = await pool.query(
      `UPDATE players
       SET team_id = $1
       WHERE id = $2
       RETURNING *`,
      [selectedTeam, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Player not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        error: "The selected team does not exist"
      });
    }

    console.error("Error assigning player:", error.message);
    res.status(500).json({
      error: "Failed to assign player"
    });
  }
});
/* GET all coaches */
app.get("/api/coaches", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM coaches ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching coaches:", error.message);
    res.status(500).json({ error: "Failed to fetch coaches" });
  }
});
/* GET all teams */
app.get("/api/teams", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        teams.*,
        coaches.full_name AS coach_name
      FROM teams
      JOIN coaches ON teams.coach_id = coaches.id
      ORDER BY teams.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching teams:", error.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});
/* REGISTER a team */
app.post("/api/teams", async (req, res) => {
  try {
    const { name, sport, category, coach_id } = req.body;

    if (!name || !sport || !category || !coach_id) {
      return res.status(400).json({
        error: "Please provide all required team details"
      });
    }

    const result = await pool.query(
      `INSERT INTO teams (name, sport, category, coach_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, sport, category, coach_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A team with this name already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "The selected coach does not exist"
      });
    }

    console.error("Error registering team:", error.message);
    res.status(500).json({ error: "Failed to register team" });
  }
});
/* UPDATE a team */
app.put("/api/teams/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sport, category, coach_id } = req.body;

    if (!name || !sport || !category || !coach_id) {
      return res.status(400).json({
        error: "Please provide all required team details"
      });
    }

    const result = await pool.query(
      `UPDATE teams
       SET name = $1,
           sport = $2,
           category = $3,
           coach_id = $4
       WHERE id = $5
       RETURNING *`,
      [name, sport, category, coach_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Team not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A team with this name already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "The selected coach does not exist"
      });
    }

    console.error("Error updating team:", error.message);
    res.status(500).json({ error: "Failed to update team" });
  }
});
/* DELETE a team */
app.delete("/api/teams/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM teams WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Team not found"
      });
    }

    res.json({
      message: "Team deleted successfully"
    });

  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        error: "This team has assigned players. Remove or reassign them first."
      });
    }

    console.error("Error deleting team:", error.message);
    res.status(500).json({
      error: "Failed to delete team"
    });
  }
});
/* REGISTER a coach */
app.post("/api/coaches", async (req, res) => {
  try {
    const { full_name, phone, email, specialization } = req.body;

    if (!full_name || !phone || !email || !specialization) {
      return res.status(400).json({
        error: "Please provide all required coach details"
      });
    }

    const result = await pool.query(
      `INSERT INTO coaches
       (full_name, phone, email, specialization)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [full_name, phone, email, specialization]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This coach email already exists"
      });
    }

    console.error("Error registering coach:", error.message);
    res.status(500).json({ error: "Failed to register coach" });
  }
});
    /* UPDATE a coach */
app.put("/api/coaches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, specialization } = req.body;

    if (!full_name || !phone || !email || !specialization) {
      return res.status(400).json({
        error: "Please provide all required coach details"
      });
    }

    const result = await pool.query(
      `UPDATE coaches
       SET full_name = $1,
           phone = $2,
           email = $3,
           specialization = $4
       WHERE id = $5
       RETURNING *`,
      [full_name, phone, email, specialization, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Coach not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This coach email already exists"
      });
    }

    console.error("Error updating coach:", error.message);
    res.status(500).json({ error: "Failed to update coach" });
  }
});

/* DELETE a coach */
app.delete("/api/coaches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM coaches WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Coach not found"
      });
    }

    res.json({
      message: "Coach deleted successfully",
      coach: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        error: "Cannot delete coach because they are assigned to a team"
      });
    }

    console.error("Error deleting coach:", error.message);
    res.status(500).json({ error: "Failed to delete coach" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KGMIS API running at http://localhost:${PORT}`);
});