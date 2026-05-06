const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ credentials: true }));
app.use(express.json());

// Auto-seed on first run
const db = require("./db");
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  console.log("🌱 Auto-seeding...");
  const pw = bcrypt.hashSync("password123", 10);
  const a = db
    .prepare(
      "INSERT INTO users (name,email,password,role,avatar) VALUES (?,?,?,?,?)",
    )
    .run("Alex Chen", "admin@demo.com", pw, "admin", "AC").lastInsertRowid;
  const m = db
    .prepare(
      "INSERT INTO users (name,email,password,role,avatar) VALUES (?,?,?,?,?)",
    )
    .run("Sam Rivera", "member@demo.com", pw, "member", "SR").lastInsertRowid;
  const p = db
    .prepare(
      "INSERT INTO projects (name,description,color,owner_id) VALUES (?,?,?,?)",
    )
    .run("Demo Project", "Sample project", "#6366f1", a).lastInsertRowid;
  db.prepare(
    "INSERT INTO project_members (project_id,user_id,role) VALUES (?,?,?)",
  ).run(p, a, "admin");
  db.prepare(
    "INSERT INTO project_members (project_id,user_id,role) VALUES (?,?,?)",
  ).run(p, m, "member");
  db.prepare(
    "INSERT INTO tasks (title,status,priority,project_id,assignee_id,reporter_id) VALUES (?,?,?,?,?,?)",
  ).run("Design dashboard", "in_progress", "high", p, m, a);
  db.prepare(
    "INSERT INTO tasks (title,status,priority,project_id,assignee_id,reporter_id) VALUES (?,?,?,?,?,?)",
  ).run("Write API docs", "todo", "medium", p, a, a);
  db.prepare(
    "INSERT INTO tasks (title,status,priority,project_id,assignee_id,reporter_id) VALUES (?,?,?,?,?,?)",
  ).run("Setup CI/CD", "done", "urgent", p, a, a);
  console.log("✅ Seeded! Login: admin@demo.com / password123");
}

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const distPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));

app.listen(PORT, () => console.log(`🚀 TaskFlow on port ${PORT}`));
