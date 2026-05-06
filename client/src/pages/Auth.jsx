import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(124,111,247,0.08) 0%, transparent 60%), var(--bg)',
    }}>
      {/* Decorative grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.3s ease' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '2.5rem',
            letterSpacing: '-0.04em',
            marginBottom: '0.25rem',
          }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Team Task Management</p>
        </div>

        <div className="card" style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{title}</h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your workspace">
      <form onSubmit={handle} className="form-grid">
        {error && <div className="error-msg">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@company.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>

        {/* Demo credentials */}
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.8rem' }}>
          <div style={{ color: 'var(--text3)', marginBottom: '0.4rem', fontWeight: 600 }}>DEMO ACCOUNTS</div>
          <div style={{ color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span>🔑 admin@demo.com / password123 (Admin)</span>
            <span>🔑 member@demo.com / password123 (Member)</span>
          </div>
        </div>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text3)', fontSize: '0.875rem' }}>
        No account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Create one →</Link>
      </p>
    </AuthLayout>
  );
}

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout title="Create account" subtitle="Start managing your team's work">
      <form onSubmit={handle} className="form-grid">
        {error && <div className="error-msg">{error}</div>}
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="Alex Johnson" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input select" value={form.role} onChange={set('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text3)', fontSize: '0.875rem' }}>
        Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in →</Link>
      </p>
    </AuthLayout>
  );
}
