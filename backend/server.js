
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KGMIS API running at http://localhost:${PORT}`);
});
