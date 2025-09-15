import express from "express";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan"; // logging middleware
dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // logs all requests

// --- CONFIG ---
const SCHEMA = process.env.DB_SCHEMA || "exc_to_exc_schema"; // schema configurable via env

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// --- HEALTH CHECK ---
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("DB Health check failed:", err);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// --- API ROUTES ---

// 1. Fetch leads for stakeholder
app.get("/api/leads", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    const result = await pool.query(
      `SELECT * FROM ${SCHEMA}.leads_with_status 
       WHERE LOWER(leadership_contact_email) LIKE $1`,
      [`%${email.toLowerCase()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch responses for stakeholder
app.get("/api/responses", async (req, res) => {
  const { email, leadIds } = req.query;
  if (!email || !leadIds)
    return res.status(400).json({ error: "Missing parameters" });

  const ids = leadIds.split(",").map((id) => parseInt(id, 10));

  try {
    const result = await pool.query(
      `SELECT * FROM ${SCHEMA}.stakeholder_responses 
       WHERE stakeholder_email = $1 AND lead_id = ANY($2::int[])`,
      [email, ids]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Insert or update a response
app.post("/api/responses", async (req, res) => {
  const { stakeholder_email, lead_id, relationship_score, comment } = req.body;

  if (!stakeholder_email || !lead_id || !relationship_score) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ${SCHEMA}.stakeholder_responses 
        (stakeholder_email, lead_id, relationship_score, comment, submitted_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (stakeholder_email, lead_id)
       DO UPDATE SET relationship_score = EXCLUDED.relationship_score,
                     comment = EXCLUDED.comment,
                     submitted_at = NOW()
       RETURNING *`,
      [stakeholder_email, lead_id, relationship_score, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting/updating response:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Update lead status
app.patch("/api/leads/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Missing status" });

  try {
    const result = await pool.query(
      `UPDATE ${SCHEMA}.leads_with_status 
       SET status = $1 
       WHERE lead_id = $2 RETURNING *`,
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating lead status:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. ✅ Fetch combined stakeholder + lead responses (new route)
app.get("/api/final-responses", async (req, res) => {
  const { email } = req.query;

  try {
    let query = `SELECT * FROM ${SCHEMA}.final_combined_stakeholder_responses`;
    const params = [];

    if (email) {
      query += " WHERE LOWER(stakeholder_email) = $1";
      params.push(email.toLowerCase());
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching final responses:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Serve frontend build ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

// Express 5-safe catch-all route
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start server ---
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
