import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/TaskModal';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const STATUS_COLORS = { todo: 'var(--text3)', in_progress: 'var(--blue)', review: 'var(--yellow)', done: 'var(--green)' };
const PRIORITY_COLORS = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--yellow)', urgent: 'var(--red)' };

function TaskCard({ task, onClick, onStatusChange }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  return (
    <div
      onClick={() => onClick(task)}
      style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.85rem',
        cursor: 'pointer', transition: 'border-color 0.12s, transform 0.12s',
        marginBottom: '0.5rem',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{task.title}</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0, marginLeft: '0.5rem', marginTop: 4 }} />
      </div>
      {task.description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        {task.assignee_name ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div className="avatar" style={{ width: 20, height: 20, fontSize: '0.6rem' }}>{task.assignee_avatar || task.assignee_name[0]}</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{task.assignee_name.split(' ')[0]}</span>
          </div>
        ) : <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Unassigned</span>}
        {task.due_date && (
          <span style={{ fontSize: '0.7rem', color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
            {isOverdue ? '⚠ ' : '📅 '}{new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState(null);
  const [tab, setTab] = useState('board');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  const load = () => api.getProject(id).then(setData).catch(() => navigate('/projects')).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const handleStatusDrop = async (taskId, status) => {
    await api.updateTask(taskId, { status });
    load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); setMemberError('');
    try { await api.addMember(id, { email: addMemberEmail }); setAddMemberEmail(''); load(); }
    catch (err) { setMemberError(err.message); }
  };

  const handleRemoveMember = async (uid) => {
    if (!confirm('Remove this member?')) return;
    await api.removeMember(id, uid); load();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await api.deleteProject(id); navigate('/projects');
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!data) return null;

  const { project, members, tasks } = data;
  const isOwner = project.owner_id === user.id || user.role === 'admin';
  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: project.color || 'var(--accent)' }} />
            <h1 style={{ fontSize: '1.75rem' }}>{project.name}</h1>
            <span className="badge" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--green)' }}>{project.status}</span>
          </div>
          {project.description && <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => setNewTaskStatus('todo')}>+ Add Task</button>
          {isOwner && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['board', '📋 Board'], ['members', `👥 Members (${members.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              background: 'none', border: 'none', padding: '0.6rem 1.25rem',
              color: tab === key ? 'var(--text)' : 'var(--text3)',
              borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: tab === key ? 600 : 400, fontSize: '0.875rem',
              transition: 'color 0.12s', cursor: 'pointer',
            }}>{label}</button>
        ))}
      </div>

      {/* Board View */}
      {tab === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'start' }}>
          {STATUSES.map(status => (
            <div key={status}
              style={{
                background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
                padding: '1rem', border: '1px solid var(--border)',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const taskId = e.dataTransfer.getData('taskId');
                if (taskId) handleStatusDrop(parseInt(taskId), status);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <span style={{
                  background: 'var(--bg4)', borderRadius: 10,
                  padding: '0.1rem 0.5rem', fontSize: '0.75rem', color: 'var(--text3)',
                }}>{tasksByStatus[status].length}</span>
              </div>

              {tasksByStatus[status].map(task => (
                <div key={task.id} draggable
                  onDragStart={e => e.dataTransfer.setData('taskId', task.id)}>
                  <TaskCard task={task} onClick={setSelectedTask} onStatusChange={handleStatusDrop} />
                </div>
              ))}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setNewTaskStatus(status)}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', borderStyle: 'dashed' }}
              >+ Add task</button>
            </div>
          ))}
        </div>
      )}

      {/* Members View */}
      {tab === 'members' && (
        <div style={{ maxWidth: 600 }}>
          {isOwner && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add Team Member</h3>
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="input" placeholder="member@company.com" value={addMemberEmail}
                  onChange={e => setAddMemberEmail(e.target.value)} type="email" required />
                <button className="btn btn-primary" type="submit">Add</button>
              </form>
              {memberError && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{memberError}</div>}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {members.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
              }}>
                <div className="avatar" style={{ width: 36, height: 36 }}>{m.avatar || m.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{m.email}</div>
                </div>
                <span className={`badge badge-${m.project_role}`}>{m.project_role}</span>
                {isOwner && m.id !== user.id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {(selectedTask || newTaskStatus) && (
        <TaskModal
          task={selectedTask}
          defaultStatus={newTaskStatus}
          projectId={id}
          members={members}
          onClose={() => { setSelectedTask(null); setNewTaskStatus(null); }}
          onSave={() => { setSelectedTask(null); setNewTaskStatus(null); load(); }}
          onDelete={() => { setSelectedTask(null); load(); }}
        />
      )}
    </div>
  );
}
