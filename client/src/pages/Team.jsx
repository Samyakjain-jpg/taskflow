import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Team() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.getUsers().then(d => setUsers(d.users)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    await api.updateUserRole(u.id, newRole);
    load();
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Team</h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{users.length} members</p>
      </div>

      {/* Admin notice */}
      <div style={{
        background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)',
        borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
        fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span>🔑</span>
        <span>As an admin, you can promote or demote team members. Admins can manage all projects and tasks.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {users.map(u => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1rem',
          }}>
            <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>{u.avatar || u.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {u.name}
                {u.id === me.id && <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>(you)</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                {u.email} · Joined {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
            <span className={`badge badge-${u.role}`}>{u.role}</span>
            {u.id !== me.id && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => toggleRole(u)}
              >
                {u.role === 'admin' ? '↓ Demote' : '↑ Promote'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
