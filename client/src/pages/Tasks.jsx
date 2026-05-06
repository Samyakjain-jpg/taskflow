import { useState, useEffect } from 'react';
import { api } from '../api';
import TaskModal from '../components/TaskModal';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_COLORS = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--yellow)', urgent: 'var(--red)' };
const STATUS_COLORS = { todo: 'var(--text3)', in_progress: 'var(--blue)', review: 'var(--yellow)', done: 'var(--green)' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', assignee: '', project_id: '', overdue: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState(false);

  const load = async () => {
    setLoading(true);
    const q = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const [tasksData, projectsData, usersData] = await Promise.all([
      api.getTasks(q), api.getProjects(), api.getUsers()
    ]);
    setTasks(tasksData.tasks);
    setProjects(projectsData.projects);
    setUsers(usersData.users);
    setLoading(false);
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));
  const clearFilters = () => setFilters({ status: '', priority: '', assignee: '', project_id: '', overdue: '' });

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Tasks</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{tasks.length} tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewTask(true)}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        padding: '1rem', background: 'var(--bg2)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
        marginBottom: '1.5rem',
      }}>
        <select className="input select" value={filters.status} onChange={setFilter('status')} style={{ width: 'auto', minWidth: 120 }}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select className="input select" value={filters.priority} onChange={setFilter('priority')} style={{ width: 'auto', minWidth: 120 }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select className="input select" value={filters.project_id} onChange={setFilter('project_id')} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={filters.assignee === 'me'} onChange={e => setFilters(f => ({ ...f, assignee: e.target.checked ? 'me' : '' }))} />
          My tasks
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={filters.overdue === 'true'} onChange={e => setFilters(f => ({ ...f, overdue: e.target.checked ? 'true' : '' }))} />
          <span style={{ color: 'var(--red)' }}>⚠ Overdue</span>
        </label>
        {Object.values(filters).some(v => v) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {/* Task list */}
      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        : tasks.length === 0
          ? <div className="empty"><div className="empty-icon">✓</div><h3>No tasks found</h3></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tasks.map(task => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                return (
                  <div key={task.id}
                    onClick={() => setSelectedTask(task)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                      alignItems: 'center', gap: '1rem',
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
                      cursor: 'pointer', transition: 'border-color 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {/* Title + project */}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: task.project_color || 'var(--accent)', display: 'inline-block' }} />
                        {task.project_name}
                      </div>
                    </div>

                    {/* Assignee */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {task.assignee_name
                        ? <>
                          <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.6rem' }}>{task.assignee_avatar || task.assignee_name[0]}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{task.assignee_name.split(' ')[0]}</span>
                        </>
                        : <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>—</span>
                      }
                    </div>

                    {/* Due date */}
                    <span style={{ fontSize: '0.78rem', color: isOverdue ? 'var(--red)' : 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {task.due_date ? (isOverdue ? '⚠ ' : '') + new Date(task.due_date).toLocaleDateString() : '—'}
                    </span>

                    {/* Priority */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[task.priority] }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'capitalize' }}>{task.priority}</span>
                    </div>

                    {/* Status badge */}
                    <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                  </div>
                );
              })}
            </div>
          )
      }

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={users}
          onClose={() => setSelectedTask(null)}
          onSave={() => { setSelectedTask(null); load(); }}
          onDelete={() => { setSelectedTask(null); load(); }}
        />
      )}
      {newTask && (
        <TaskModal
          projectId={projects[0]?.id}
          members={users}
          onClose={() => setNewTask(false)}
          onSave={() => { setNewTask(false); load(); }}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}
