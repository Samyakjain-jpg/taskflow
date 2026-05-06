import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#0ea5e9'];

function ProjectModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', description: '', color: COLORS[0], due_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{initial ? 'Edit Project' : 'New Project'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handle} className="form-grid">
          {error && <div className="error-msg">{error}</div>}
          <div>
            <label className="label">Project Name *</label>
            <input className="input" placeholder="Design System v2" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="What's this project about?" value={form.description} onChange={set('description')}
              style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.due_date} onChange={set('due_date')} />
            </div>
            <div>
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', background: c, border: 'none',
                      outline: form.color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: 2, cursor: 'pointer', transition: 'outline 0.1s',
                    }} />
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (initial ? 'Update' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = () => api.getProjects().then(d => setProjects(d.projects)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = (form) => api.createProject(form).then(load);

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Projects</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{projects.length} projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0
        ? (
          <div className="empty" style={{ padding: '5rem' }}>
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p style={{ marginBottom: '1rem' }}>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setModal(true)}>Create Project</button>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {projects.map(p => {
              const progress = p.task_count ? Math.round(p.done_count / p.task_count * 100) : 0;
              const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed';
              return (
                <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                    borderTop: `3px solid ${p.color || 'var(--accent)'}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                      <span className={`badge badge-${p.status}`} style={{
                        background: p.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(144,144,168,0.1)',
                        color: p.status === 'active' ? 'var(--green)' : 'var(--text2)',
                        fontSize: '0.7rem',
                      }}>{p.status}</span>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                        <div style={{ height: '100%', borderRadius: 2, background: p.color || 'var(--accent)', width: `${progress}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text3)' }}>
                      <span>👤 {p.owner_name}</span>
                      <span>{p.done_count}/{p.task_count} tasks</span>
                      {p.due_date && (
                        <span style={{ color: isOverdue ? 'var(--red)' : 'inherit' }}>
                          {isOverdue ? '⚠ ' : ''}
                          {new Date(p.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      }

      {modal && <ProjectModal onClose={() => setModal(false)} onSave={handleCreate} />}
    </div>
  );
}
