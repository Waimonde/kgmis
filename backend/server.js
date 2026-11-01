
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// HOME
app.get("/", (req, res) => {
  res.json({
    message: "KeMU Games Management API is running",
  });
});

// DATABASE HEALTH CHECK
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

// =====================================================
// USER AUTHENTICATION
// =====================================================

// USER LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // FIND USER IN DATABASE
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_active
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // CHECK ACCOUNT STATUS
    if (!user.is_active) {
      return res.status(403).json({
        error: "Your account is inactive. Contact the administrator.",
      });
    }

    // VERIFY PASSWORD
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // CHECK JWT SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      }
    );

    // SEND RESPONSE
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      error: "Login failed. Please try again.",
    });
  }
});

// =====================================================
// PLAYERS MANAGEMENT
// =====================================================

// GET ALL PLAYERS
app.get("/api/players", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM players ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching players:", error.message);

    res.status(500).json({
      error: "Failed to fetch players",
    });
  }
});

// REGISTER A PLAYER
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
      status,
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
        error: "Please provide all required player details",
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
        status || "Active",
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This registration number already exists",
      });
    }

    console.error("Error registering player:", error.message);

    res.status(500).json({
      error: "Failed to register player",
    });
  }
});

// UPDATE A PLAYER
app.put("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      registration_number,
      full_name,
      gender,
      phone,
      faculty,
      sport,
      position,
      status,
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
        error: "Please provide all required player details",
      });
    }

    const result = await pool.query(
      `UPDATE players
       SET registration_number = $1,
           full_name = $2,
           gender = $3,
           phone = $4,
           faculty = $5,
           sport = $6,
           position = $7,
           status = $8
       WHERE id = $9
       RETURNING *`,
      [
        registration_number,
        full_name,
        gender,
        phone || null,
        faculty,
        sport,
        position,
        status || "Active",
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Player not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "This registration number already exists",
      });
    }

    console.error("Error updating player:", error.message);

    res.status(500).json({
      error: "Failed to update player",
    });
  }
});

// DELETE A PLAYER
app.delete("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM players WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Player not found",
      });
    }

    res.json({
      message: "Player deleted successfully",
      player: result.rows[0],
    });

  } catch (error) {
    console.error("Error deleting player:", error.message);

    res.status(500).json({
      error: "Failed to delete player",
    });
  }
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KGMIS API running at http://localhost:${PORT}`);
});
