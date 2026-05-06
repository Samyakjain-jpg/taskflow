/**
 * Seed script - creates demo accounts and sample data
 * Run: node server/seed.js
 */
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('🌱 Seeding database...');

// Clear existing data
db.exec('DELETE FROM comments; DELETE FROM tasks; DELETE FROM project_members; DELETE FROM projects; DELETE FROM users;');

// Create users
const password = bcrypt.hashSync('password123', 10);

const adminId = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(
  'Alex Chen', 'admin@demo.com', password, 'admin', 'AC'
).lastInsertRowid;

const member1Id = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(
  'Sam Rivera', 'member@demo.com', password, 'member', 'SR'
).lastInsertRowid;

const member2Id = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(
  'Jordan Kim', 'jordan@demo.com', password, 'member', 'JK'
).lastInsertRowid;

// Create projects
const p1 = db.prepare('INSERT INTO projects (name, description, color, owner_id, due_date) VALUES (?, ?, ?, ?, ?)').run(
  'Product Redesign', 'Complete overhaul of the main product UI/UX', '#6366f1', adminId, '2026-06-30'
).lastInsertRowid;

const p2 = db.prepare('INSERT INTO projects (name, description, color, owner_id, due_date) VALUES (?, ?, ?, ?, ?)').run(
  'API v2 Migration', 'Migrate all endpoints to the new REST API v2 spec', '#06b6d4', adminId, '2026-05-15'
).lastInsertRowid;

const p3 = db.prepare('INSERT INTO projects (name, description, color, owner_id) VALUES (?, ?, ?, ?)').run(
  'Marketing Website', 'Rebuild marketing site with new brand guidelines', '#10b981', member1Id
).lastInsertRowid;

// Add members to projects
const addMember = db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)');
addMember.run(p1, adminId, 'admin');
addMember.run(p1, member1Id, 'member');
addMember.run(p1, member2Id, 'member');
addMember.run(p2, adminId, 'admin');
addMember.run(p2, member2Id, 'member');
addMember.run(p3, member1Id, 'admin');
addMember.run(p3, adminId, 'member');

// Create tasks
const tasks = [
  { title: 'Define new design system tokens', status: 'done', priority: 'high', project_id: p1, assignee_id: member1Id, reporter_id: adminId, description: 'Document all color, spacing, and typography tokens for the new design system.' },
  { title: 'Create component library', status: 'in_progress', priority: 'high', project_id: p1, assignee_id: member2Id, reporter_id: adminId, due_date: '2026-05-20' },
  { title: 'User research interviews', status: 'done', priority: 'medium', project_id: p1, assignee_id: adminId, reporter_id: adminId },
  { title: 'Prototype new dashboard', status: 'in_progress', priority: 'urgent', project_id: p1, assignee_id: member1Id, reporter_id: adminId, due_date: '2026-05-10' },
  { title: 'Mobile responsive layouts', status: 'todo', priority: 'medium', project_id: p1, assignee_id: member2Id, reporter_id: adminId, due_date: '2026-06-01' },
  { title: 'Write API documentation', status: 'review', priority: 'high', project_id: p2, assignee_id: member2Id, reporter_id: adminId },
  { title: 'Migrate auth endpoints', status: 'done', priority: 'urgent', project_id: p2, assignee_id: adminId, reporter_id: adminId },
  { title: 'Update SDK clients', status: 'in_progress', priority: 'high', project_id: p2, assignee_id: member2Id, reporter_id: adminId, due_date: '2026-05-08' },
  { title: 'Performance benchmarking', status: 'todo', priority: 'medium', project_id: p2, assignee_id: adminId, reporter_id: adminId, due_date: '2026-05-25' },
  { title: 'Homepage redesign', status: 'in_progress', priority: 'high', project_id: p3, assignee_id: member1Id, reporter_id: member1Id },
  { title: 'SEO optimization', status: 'todo', priority: 'medium', project_id: p3, assignee_id: null, reporter_id: member1Id },
  { title: 'Blog section implementation', status: 'todo', priority: 'low', project_id: p3, assignee_id: member1Id, reporter_id: member1Id, due_date: '2026-06-15' },
];

const insertTask = db.prepare(
  'INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, reporter_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
tasks.forEach(t => insertTask.run(t.title, t.description || null, t.status, t.priority, t.project_id, t.assignee_id, t.reporter_id, t.due_date || null));

console.log('✅ Seed complete!');
console.log('');
console.log('Demo accounts:');
console.log('  Admin:  admin@demo.com  / password123');
console.log('  Member: member@demo.com / password123');
console.log('  Member: jordan@demo.com / password123');
