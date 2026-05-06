import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{sub}</div>}
    </div>
  );
}

function TaskRow({ task }) {
  const statusColors = { todo: 'var(--text3)', in_progress: 'var(--blue)', review: 'var(--yellow)', done: 'var(--green)' };
  const priorityColors = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--yellow)', urgent: 'var(--red)' };
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <Link to={`/tasks?id=${task.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.85rem 1rem', borderRadius: 'var(--radius)',
        background: 'var(--bg3)', marginBottom: '0.5rem',
        border: '1px solid var(--border)',
        transition: 'border-color 0.12s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[task.status], flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text3)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '2px' }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: 2,
              background: task.project_color || 'var(--accent)', marginRight: 2,
            }} />
            {task.project_name}
            {task.due_date && (
              <span style={{ color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
                · {isOverdue ? '⚠ Overdue' : new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: priorityColors[task.priority], flexShrink: 0,
        }} title={`Priority: ${task.priority}`} />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const { stats, recentTasks, projects } = data;
  const statusMap = Object.fromEntries((stats.tasksByStatus || []).map(s => [s.status, s.count]));

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
          {' '}<span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> ⚡
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Tasks" value={stats.totalTasks} icon="📋" color="var(--text)" />
        <StatCard label="My Tasks" value={stats.myTasks} icon="🎯" color="var(--accent)" sub="assigned to me" />
        <StatCard label="In Progress" value={statusMap.in_progress || 0} icon="⚙️" color="var(--blue)" />
        <StatCard label="Completed" value={statusMap.done || 0} icon="✅" color="var(--green)" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon="⚠️" color={stats.overdueTasks > 0 ? 'var(--red)' : 'var(--text3)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Tasks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>Recent Activity</h2>
            <Link to="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentTasks.length === 0
            ? <div className="empty"><div className="empty-icon">📝</div><h3>No tasks yet</h3></div>
            : recentTasks.slice(0, 7).map(t => <TaskRow key={t.id} task={t} />)
          }
        </div>

        {/* Projects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>Active Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {projects.length === 0
            ? <div className="empty"><div className="empty-icon">📁</div><h3>No projects yet</h3><Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Create project</Link></div>
            : projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '1rem',
                  marginBottom: '0.5rem', cursor: 'pointer',
                  transition: 'border-color 0.12s', borderLeft: `3px solid ${p.color || 'var(--accent)'}`,
                }}
                  onMouseEnter={e => e.currentTarget.style.borderLeftColor = p.color || 'var(--accent)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{p.member_count || 0} members</span>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        background: p.color || 'var(--accent)',
                        width: `${p.task_count ? Math.round(p.done_count / p.task_count * 100) : 0}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.3rem' }}>
                      {p.done_count}/{p.task_count} tasks · {p.task_count ? Math.round(p.done_count / p.task_count * 100) : 0}%
                    </div>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}
