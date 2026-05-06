const bcrypt = require("bcryptjs");
const { wrapper, initDb } = require("./db");

initDb().then((database) => {
  wrapper._db = database;
  const db = wrapper;

  db.exec(
    "DELETE FROM comments; DELETE FROM tasks; DELETE FROM project_members; DELETE FROM projects; DELETE FROM users;",
  );

  const password = bcrypt.hashSync("password123", 10);
  const adminId = db
    .prepare(
      "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      "Alex Chen",
      "admin@demo.com",
      password,
      "admin",
      "AC",
    ).lastInsertRowid;
  const member1Id = db
    .prepare(
      "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      "Sam Rivera",
      "member@demo.com",
      password,
      "member",
      "SR",
    ).lastInsertRowid;

  const p1 = db
    .prepare(
      "INSERT INTO projects (name, description, color, owner_id, due_date) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      "Product Redesign",
      "UI/UX overhaul",
      "#6366f1",
      adminId,
      "2026-06-30",
    ).lastInsertRowid;
  db.prepare(
    "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
  ).run(p1, adminId, "admin");
  db.prepare(
    "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
  ).run(p1, member1Id, "member");

  const ins = db.prepare(
    "INSERT INTO tasks (title, status, priority, project_id, assignee_id, reporter_id) VALUES (?, ?, ?, ?, ?, ?)",
  );
  ins.run("Design dashboard", "in_progress", "high", p1, member1Id, adminId);
  ins.run("Write API docs", "todo", "medium", p1, adminId, adminId);
  ins.run("Setup CI/CD", "done", "urgent", p1, adminId, adminId);

  console.log("✅ Seed complete!");
  console.log("  admin@demo.com  / password123");
  console.log("  member@demo.com / password123");
  process.exit(0);
});
