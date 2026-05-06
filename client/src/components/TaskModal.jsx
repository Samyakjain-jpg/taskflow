import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ task, defaultStatus, projectId, members = [], onClose, onSave, onDelete }) {
  const { user } = useAuth();
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus || 'todo',
    priority: task?.priority || 'medium',
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date || '',
    project_id: task?.project_id || projectId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null };
      if (isEdit) await api.updateTask(task.id, payload);
      else await api.createTask(payload);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(task.id); onDelete();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handle} className="form-grid">
          {error && <div className="error-msg">{error}</div>}
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Task title" value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Optional details..." value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div>
              <label className="label">Status</label>
              <select className="input select" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input select" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">Assignee</label>
              <select className="input select" value={form.assignee_id} onChange={set('assignee_id')}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.due_date} onChange={set('due_date')} />
            </div>
          </div>
          <div className="form-actions">
            {isEdit && (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} style={{ marginRight: 'auto' }}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (isEdit ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
