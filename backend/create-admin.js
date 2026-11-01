
require("dotenv").config();

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const readlineSync = require("readline-sync");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    console.log("\nKGMIS - Create Administrator Account\n");

    const fullName = readlineSync.question("Administrator full name: ").trim();
    const email = readlineSync.question("Administrator email: ").trim().toLowerCase();

    const password = readlineSync.question(
      "Administrator password: ",
      { hideEchoBack: true }
    );

    const confirmPassword = readlineSync.question(
      "Confirm password: ",
      { hideEchoBack: true }
    );

    if (!fullName || !email || !password) {
      console.log("All fields are required.");
      return;
    }

    if (password.length < 8) {
      console.log("Password must have at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match.");
      return;
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0) {
      console.log("An account with this email already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [fullName, email, passwordHash, "Administrator"]
    );

    console.log("\nAdministrator account created successfully!");
    console.table(result.rows);

  } catch (error) {
    console.error("Could not create administrator:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
