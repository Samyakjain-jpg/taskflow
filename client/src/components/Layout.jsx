import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
    { to: '/projects', icon: '📁', label: 'Projects' },
    { to: '/tasks', icon: '✓', label: 'My Tasks' },
    ...(user?.role === 'admin' ? [{ to: '/team', icon: '👥', label: 'Team' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
                Task<span style={{ color: 'var(--accent)' }}>Flow</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '-2px' }}>Team Manager</div>
            </div>
          )}
          {collapsed && <span style={{ fontSize: '1.3rem' }}>⚡</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '1rem', padding: '0.25rem', marginLeft: 'auto' }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--text)' : 'var(--text2)',
                background: isActive ? 'var(--bg4)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: collapsed ? '1rem 0' : '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          gap: '0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.65rem', flexShrink: 0 }}>
            {user?.avatar || user?.name?.[0]}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '1rem', padding: '0.25rem' }} title="Logout">
              ⏏
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
