import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, Settings, CalendarCheck, BarChart3 } from 'lucide-react'
import { APP_NAME, APP_SHORT } from '../shared/constants'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const isSettingsActive = location.pathname.startsWith('/settings')
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive)

  // Auto-expand Settings group if currently navigating within Settings sub-routes
  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true)
    }
  }, [location.pathname, isSettingsActive])

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
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-left">
            <span className="nav-icon"><LayoutDashboard size={16}/></span>
            Dashboard
          </span>
        </NavLink>

        <NavLink to="/reports/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-left">
            <span className="nav-icon"><BarChart3 size={16}/></span>
            Survey Dashboard
          </span>
        </NavLink>


        <NavLink to="/visits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-left">
            <span className="nav-icon"><CalendarCheck size={16}/></span>
            Visits
          </span>
          <span className="nav-badge">3</span>
        </NavLink>

        <NavLink to="/targets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-left">
            <span className="nav-icon"><MapPin size={16}/></span>
            Targets
          </span>
        </NavLink>

        {/* Settings Group */}
        <div>
          <div 
            className={`nav-item ${isSettingsActive ? 'active' : ''}`} 
            onClick={() => setSettingsOpen(o => !o)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="nav-left">
              <span className="nav-icon"><Settings size={16}/></span>
              Settings
            </span>
            <span style={{ fontSize: '9px', opacity: 0.6 }}>{settingsOpen ? '▼' : '▶'}</span>
          </div>
          {settingsOpen && (
            <div className="sub-nav-list">
              <NavLink to="/settings/users" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                • User Master
              </NavLink>
              <NavLink to="/settings/teams" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                • Team Master
              </NavLink>
              <NavLink to="/settings/permissions" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                • User Permissions
              </NavLink>
              <NavLink to="/settings/surveys" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                • Survey Builder
              </NavLink>
            </div>
          )}
        </div>
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
