const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('🌱 Seeding database...');

db.exec('DELETE FROM comments; DELETE FROM tasks; DELETE FROM project_members; DELETE FROM projects; DELETE FROM users;');

const password = bcrypt.hashSync('password123', 10);

const adminId = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(
  'Alex Chen', 'admin@demo.com', password, 'admin', 'AC'
).lastInsertRowid;

const member1Id = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(
  'Sam Rivera', 'member@demo.com', password, 'member', 'SR'
).lastInsertRowid;

const p1 = db.prepare('INSERT INTO projects (name, description, color, owner_id, due_date) VALUES (?, ?, ?, ?, ?)').run(
  'Product Redesign', 'Complete overhaul of the main product UI/UX', '#6366f1', adminId, '2026-06-30'
).lastInsertRowid;

db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(p1, adminId, 'admin');
db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(p1, member1Id, 'member');

const tasks = [
  { title: 'Design new dashboard', status: 'in_progress', priority: 'high', project_id: p1, assignee_id: member1Id, reporter_id: adminId },
  { title: 'Write API docs', status: 'todo', priority: 'medium', project_id: p1, assignee_id: adminId, reporter_id: adminId },
  { title: 'Setup CI/CD pipeline', status: 'done', priority: 'urgent', project_id: p1, assignee_id: adminId, reporter_id: adminId },
];

const ins = db.prepare('INSERT INTO tasks (title, status, priority, project_id, assignee_id, reporter_id) VALUES (?, ?, ?, ?, ?, ?)');
tasks.forEach(t => ins.run(t.title, t.status, t.priority, t.project_id, t.assignee_id, t.reporter_id));

console.log('✅ Seed complete!');
console.log('  admin@demo.com   / password123  (Admin)');
console.log('  member@demo.com  / password123  (Member)');
