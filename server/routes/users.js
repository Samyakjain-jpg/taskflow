const router = require('express').Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/users - list all users (admin) or all for member search
router.get('/', authenticate, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY name').all();
  res.json({ users });
});

// GET /api/users/stats - dashboard stats
router.get('/stats', authenticate, (req, res) => {
  const totalTasks = db.prepare(`
    SELECT COUNT(*) as count FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
  `).get(req.user.id, req.user.id);

  const tasksByStatus = db.prepare(`
    SELECT t.status, COUNT(*) as count FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE (p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
    GROUP BY t.status
  `).all(req.user.id, req.user.id);

  const overdueTasks = db.prepare(`
    SELECT COUNT(*) as count FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE (p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
    AND t.due_date < date('now') AND t.status != 'done'
  `).get(req.user.id, req.user.id);

  const myTasks = db.prepare(`
    SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status != 'done'
  `).get(req.user.id);

  const recentTasks = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color,
      u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE (p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
    ORDER BY t.updated_at DESC LIMIT 10
  `).all(req.user.id, req.user.id);

  const projects = db.prepare(`
    SELECT p.*, u.name as owner_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count
    FROM projects p JOIN users u ON p.owner_id = u.id
    WHERE p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
    ORDER BY p.created_at DESC LIMIT 5
  `).all(req.user.id, req.user.id);

  res.json({
    stats: {
      totalTasks: totalTasks.count,
      tasksByStatus,
      overdueTasks: overdueTasks.count,
      myTasks: myTasks.count
    },
    recentTasks,
    projects
  });
});

// PUT /api/users/:id/role (admin only)
router.put('/:id/role', authenticate, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['admin', 'member'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

module.exports = router;
