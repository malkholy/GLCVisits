import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Users, Settings, CalendarCheck } from 'lucide-react'
import { APP_NAME, APP_SHORT } from '../shared/constants'
import './Sidebar.css'

const NAV = [
  { to: '/',        icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
  { to: '/visits',  icon: <CalendarCheck   size={16}/>, label: 'Visits',  badge: 3 },
  { to: '/targets', icon: <MapPin          size={16}/>, label: 'Targets' },
  { to: '/settings',icon: <Settings        size={16}/>, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">{APP_SHORT}</div>
        <div>
          <strong>{APP_NAME}</strong>
          <span>Sales & Marketing</span>
        </div>
      </div>

      <p className="nav-section-title">Main Menu</p>
      <nav className="nav-list">
        {NAV.map(({ to, icon, label, badge }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-left">
              <span className="nav-icon">{icon}</span>
              {label}
            </span>
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">M</div>
        <div>
          <strong>Mohammad</strong>
          <span>Admin</span>
        </div>
      </div>
    </aside>
  )
}
