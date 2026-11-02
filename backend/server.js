const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// DATABASE CONNECTION
// =====================================================

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// =====================================================
// USER ROLES
// =====================================================

const ALLOWED_ROLES = [
  "Administrator",
  "Games Department",
  "Coach",
  "Viewer",
];

// =====================================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================================

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. Please log in.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm that the account still exists and is active
    const result = await pool.query(
      `SELECT id, full_name, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (
      result.rowCount === 0 ||
      result.rows[0].is_active !== true
    ) {
      return res.status(401).json({
        error: "Account is inactive or no longer exists.",
      });
    }

    req.user = result.rows[0];

    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired authentication token.",
      });
    }

    return res.status(500).json({
      error: "Authentication failed.",
    });
  }
}

// =====================================================
// AUTHORIZATION MIDDLEWARE
// =====================================================

function requireAdministrator(req, res, next) {
  if (req.user.role !== "Administrator") {
    return res.status(403).json({
      error: "Access denied. Administrator privileges required.",
    });
  }

  next();
}

// Check whether the logged-in user has an allowed role
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. You do not have permission to perform this action.",
      });
    }

    next();
  };
}

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "KeMU Games Management API is running",
  });
});

// =====================================================
// DATABASE HEALTH CHECK
// =====================================================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS server_time"
    );

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

// -----------------------------------------------------
// USER LOGIN
// -----------------------------------------------------

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
    if (user.is_active !== true) {
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
// USER MANAGEMENT
// All endpoints require an active Administrator.
// =====================================================

// -----------------------------------------------------
// REGISTER A SYSTEM USER
// -----------------------------------------------------

app.post(
  "/api/auth/register",
  authenticateToken,
  requireAdministrator,
  async (req, res) => {
    try {
      const { full_name, email, password, role } = req.body;

      if (!full_name || !email || !password || !role) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      if (
        typeof full_name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof role !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid input format",
        });
      }

      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
          error: "Invalid user role",
        });
      }

      if (full_name.trim().length === 0) {
        return res.status(400).json({
          error: "Full name is required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          error: "Please provide a valid email address",
        });
      }

      // CHECK WHETHER EMAIL ALREADY EXISTS
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
      );

      if (existingUser.rowCount > 0) {
        return res.status(409).json({
          error: "A user with this email already exists",
        });
      }

      // HASH PASSWORD
      const passwordHash = await bcrypt.hash(password, 12);

      // INSERT USER INTO DATABASE
      const result = await pool.query(
        `INSERT INTO users
         (full_name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, role, is_active, created_at`,
        [
          full_name.trim(),
          normalizedEmail,
          passwordHash,
          role,
          true,
        ]
      );

      res.status(201).json({
        message: "User registered successfully",
        user: result.rows[0],
      });

    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          error: "A user with this email already exists",
        });
      }

      console.error("User registration error:", error.message);

      res.status(500).json({
        error: "Failed to register user",
      });
    }
  }
);

// -----------------------------------------------------
// GET ALL SYSTEM USERS
// -----------------------------------------------------

app.get(
  "/api/users",
  authenticateToken,
  requireAdministrator,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, is_active,
                created_at, updated_at
         FROM users
         ORDER BY id DESC`
      );

      res.json(result.rows);

    } catch (error) {
      console.error("Error fetching users:", error.message);

      res.status(500).json({
        error: "Failed to fetch users",
      });
    }
  }
);

// -----------------------------------------------------
// CHANGE USER ROLE
// -----------------------------------------------------

app.patch(
  "/api/users/:id/role",
  authenticateToken,
  requireAdministrator,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: "Invalid user ID",
        });
      }

      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
          error: "Invalid user role",
        });
      }

      // Prevent an administrator from changing their own role
      if (userId === req.user.id) {
        return res.status(400).json({
          error: "You cannot change your own role",
        });
      }

      const existingUser = await pool.query(
        "SELECT id, role FROM users WHERE id = $1",
        [userId]
      );

      if (existingUser.rowCount === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Prevent removal of the last active administrator
      if (
        existingUser.rows[0].role === "Administrator" &&
        role !== "Administrator"
      ) {
        const adminCount = await pool.query(
          `SELECT COUNT(*)::integer AS total
           FROM users
           WHERE role = 'Administrator'
           AND is_active = true`
        );

        if (adminCount.rows[0].total <= 1) {
          return res.status(400).json({
            error: "You cannot remove the last active Administrator",
          });
        }
      }

      const result = await pool.query(
        `UPDATE users
         SET role = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, full_name, email, role, is_active`,
        [role, userId]
      );

      res.json({
        message: "User role updated successfully",
        user: result.rows[0],
      });

    } catch (error) {
      console.error("Error updating user role:", error.message);

      res.status(500).json({
        error: "Failed to update user role",
      });
    }
  }
);

// -----------------------------------------------------
// ACTIVATE OR DEACTIVATE A USER
// -----------------------------------------------------

app.patch(
  "/api/users/:id/status",
  authenticateToken,
  requireAdministrator,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { is_active } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: "Invalid user ID",
        });
      }

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          error: "is_active must be true or false",
        });
      }

      // Prevent administrator from deactivating their own account
      if (userId === req.user.id && is_active === false) {
        return res.status(400).json({
          error: "You cannot deactivate your own account",
        });
      }

      const existingUser = await pool.query(
        "SELECT id, role FROM users WHERE id = $1",
        [userId]
      );

      if (existingUser.rowCount === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Prevent deactivation of the last active administrator
      if (
        existingUser.rows[0].role === "Administrator" &&
        is_active === false
      ) {
        const adminCount = await pool.query(
          `SELECT COUNT(*)::integer AS total
           FROM users
           WHERE role = 'Administrator'
           AND is_active = true`
        );

        if (adminCount.rows[0].total <= 1) {
          return res.status(400).json({
            error: "You cannot deactivate the last active Administrator",
          });
        }
      }

      const result = await pool.query(
        `UPDATE users
         SET is_active = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, full_name, email, role, is_active`,
        [is_active, userId]
      );

      res.json({
        message: is_active
          ? "User activated successfully"
          : "User deactivated successfully",
        user: result.rows[0],
      });

    } catch (error) {
      console.error("Error updating user status:", error.message);

      res.status(500).json({
        error: "Failed to update user status",
      });
    }
  }
);

// =====================================================
// PLAYERS MANAGEMENT
// =====================================================

// -----------------------------------------------------
// GET ALL PLAYERS
// All authenticated users can view players.
// -----------------------------------------------------

app.get(
  "/api/players",
  authenticateToken,
  async (req, res) => {
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
  }
);

// -----------------------------------------------------
// REGISTER A PLAYER
// Administrator and Games Department only.
// -----------------------------------------------------

app.post(
  "/api/players",
  authenticateToken,
  requireRoles("Administrator", "Games Department"),
  async (req, res) => {
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
  }
);

// -----------------------------------------------------
// UPDATE A PLAYER
// Administrator and Games Department only.
// -----------------------------------------------------

app.put(
  "/api/players/:id",
  authenticateToken,
  requireRoles("Administrator", "Games Department"),
  async (req, res) => {
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
  }
);

// -----------------------------------------------------
// DELETE A PLAYER
// Administrator only.
// -----------------------------------------------------

app.delete(
  "/api/players/:id",
  authenticateToken,
  requireAdministrator,
  async (req, res) => {
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
  }
);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KGMIS API running at http://localhost:${PORT}`);
});