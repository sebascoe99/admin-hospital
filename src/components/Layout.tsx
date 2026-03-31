import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/services', icon: Stethoscope, label: 'Servicios' },
  { to: '/appointments', icon: CalendarDays, label: 'Citas' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <button className="mobile-toggle" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">CS</div>
          <div>
            <div className="brand-name">Clinica Saguay</div>
            <div className="brand-sub">Panel Administrativo</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesion</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
