const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Middleware: verify user has access to a project
const checkProjectAccess = (req, res, next) => {
  const projectId = req.body.project_id || req.params.projectId;
  if (!projectId) return next();
  const member = db.prepare(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(projectId, req.user.id);
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (!member && project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });
  next();
};

// GET /api/tasks - all tasks visible to user
router.get('/', authenticate, (req, res) => {
  const { status, priority, assignee, project_id, overdue } = req.query;
  let query = `
    SELECT t.*, p.name as project_name, p.color as project_color,
      u.name as assignee_name, u.avatar as assignee_avatar, r.name as reporter_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users r ON t.reporter_id = r.id
    WHERE (p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
  `;
  const params = [req.user.id, req.user.id];

  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
  if (assignee === 'me') { query += ' AND t.assignee_id = ?'; params.push(req.user.id); }
  if (project_id) { query += ' AND t.project_id = ?'; params.push(project_id); }
  if (overdue === 'true') { query += " AND t.due_date < date('now') AND t.status != 'done'"; }

  query += ' ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json({ tasks });
});

// POST /api/tasks
router.post('/', authenticate, checkProjectAccess, (req, res) => {
  const { title, description, status, priority, project_id, assignee_id, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });
  if (!project_id) return res.status(400).json({ error: 'Project ID is required' });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, reporter_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(), description || null, status || 'todo', priority || 'medium',
    project_id, assignee_id || null, req.user.id, due_date || null
  );

  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, r.name as reporter_name,
      p.name as project_name, p.color as project_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users r ON t.reporter_id = r.id
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ task });
});

// GET /api/tasks/:id
router.get('/:id', authenticate, (req, res) => {
  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, r.name as reporter_name,
      p.name as project_name, p.color as project_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users r ON t.reporter_id = r.id
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ? ORDER BY c.created_at ASC
  `).all(req.params.id);

  res.json({ task, comments });
});

// PUT /api/tasks/:id
router.put('/:id', authenticate, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, assignee_id, due_date } = req.body;

  db.prepare(`
    UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?,
    assignee_id = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || task.title, description !== undefined ? description : task.description,
    status || task.status, priority || task.priority,
    assignee_id !== undefined ? assignee_id : task.assignee_id,
    due_date !== undefined ? due_date : task.due_date, req.params.id
  );

  const updated = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, r.name as reporter_name,
      p.name as project_name, p.color as project_color
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users r ON t.reporter_id = r.id
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(req.params.id);

  res.json({ task: updated });
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(task.project_id);
  if (task.reporter_id !== req.user.id && project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content is required' });

  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)'
  ).run(req.params.id, req.user.id, content.trim());

  const comment = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ comment });
});

module.exports = router;
