const router = require("express").Router();
const db = require("../db");
const { authenticate, requireProjectAdmin } = require("../middleware/auth");

router.get("/", authenticate, (req, res) => {
  const projects = db
    .prepare(
      `SELECT p.*, u.name as owner_name, (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count, (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count, (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) as member_count FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?) ORDER BY p.created_at DESC`,
    )
    .all(req.user.id, req.user.id);
  res.json({ projects });
});

router.post("/", authenticate, (req, res) => {
  const { name, description, color, due_date } = req.body;
  if (!name) return res.status(400).json({ error: "Project name required" });
  const result = db
    .prepare(
      "INSERT INTO projects (name, description, color, due_date, owner_id) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      name.trim(),
      description || null,
      color || "#6366f1",
      due_date || null,
      req.user.id,
    );
  db.prepare(
    "INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
  ).run(result.lastInsertRowid, req.user.id, "admin");
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json({ project });
});

router.get("/:id", authenticate, (req, res) => {
  const project = db
    .prepare(
      "SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?",
    )
    .get(req.params.id);
  if (!project) return res.status(404).json({ error: "Not found" });
  const isMember = db
    .prepare(
      "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
    )
    .get(req.params.id, req.user.id);
  if (
    !isMember &&
    project.owner_id !== req.user.id &&
    req.user.role !== "admin"
  )
    return res.status(403).json({ error: "Access denied" });
  const members = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role as system_role, u.avatar, pm.role as project_role, pm.joined_at FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ?`,
    )
    .all(req.params.id);
  const tasks = db
    .prepare(
      `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, r.name as reporter_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN users r ON t.reporter_id = r.id WHERE t.project_id = ? ORDER BY t.created_at DESC`,
    )
    .all(req.params.id);
  res.json({ project, members, tasks });
});

router.put("/:id", authenticate, requireProjectAdmin, (req, res) => {
  const { name, description, status, color, due_date } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  db.prepare(
    "UPDATE projects SET name=?, description=?, status=?, color=?, due_date=? WHERE id=?",
  ).run(
    name,
    description || null,
    status || "active",
    color || "#6366f1",
    due_date || null,
    req.params.id,
  );
  res.json({
    project: db.prepare("SELECT * FROM projects WHERE id=?").get(req.params.id),
  });
});

router.delete("/:id", authenticate, requireProjectAdmin, (req, res) => {
  db.prepare("DELETE FROM projects WHERE id=?").run(req.params.id);
  res.json({ message: "Deleted" });
});

router.post("/:id/members", authenticate, requireProjectAdmin, (req, res) => {
  const { email, role = "member" } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found" });
  try {
    db.prepare(
      "INSERT INTO project_members (project_id, user_id, role) VALUES (?,?,?)",
    ).run(req.params.id, user.id, role);
    res.json({ message: "Member added" });
  } catch {
    res.status(409).json({ error: "Already a member" });
  }
});

router.delete(
  "/:id/members/:userId",
  authenticate,
  requireProjectAdmin,
  (req, res) => {
    db.prepare(
      "DELETE FROM project_members WHERE project_id=? AND user_id=?",
    ).run(req.params.id, req.params.userId);
    res.json({ message: "Removed" });
  },
);

module.exports = router;
