const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-super-secret-key-change-in-production';

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireProjectAdmin = (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.owner_id === req.user.id || req.user.role === 'admin') {
    req.project = project;
    return next();
  }

  const membership = db.prepare(
    'SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND role = ?'
  ).get(projectId, req.user.id, 'admin');

  if (!membership) return res.status(403).json({ error: 'Project admin access required' });
  req.project = project;
  next();
};

module.exports = { authenticate, requireAdmin, requireProjectAdmin, JWT_SECRET };
