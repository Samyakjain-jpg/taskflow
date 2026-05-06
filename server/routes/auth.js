const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

router.post('/signup', (req, res) => {
  const { name, email, password, role = 'member' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });
  const validRole = ['admin','member'].includes(role) ? role : 'member';
  const hash = bcrypt.hashSync(password, 10);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  try {
    const result = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(name.trim(), email.toLowerCase(), hash, validRole, initials);
    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;