import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FolderGit2, ShieldAlert, ClipboardSignature, ArrowRight } from 'lucide-react'
import Topbar from '../../components/Topbar'
import '../visits/Dashboard.css'

const settingsCss = `
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 10px;
}

.settings-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.settings-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  opacity: 0;
  transition: opacity 0.3s;
}

.settings-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: 0 20px 35px rgba(245, 130, 32, 0.08);
}

.settings-card:hover::before {
  opacity: 1;
}

.settings-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.settings-card:hover .settings-icon-wrap {
  background: var(--primary);
  color: white;
}

.settings-card-body h3 {
  font-size: 17px;
  font-weight: 900;
  margin-bottom: 8px;
  color: var(--text);
}

.settings-card-body p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.settings-card-footer {
  display: flex;
  justify-content: flex-end;
}

.settings-card-btn {
  padding: 8px 16px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 800;
  font-size: 12px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.settings-card:hover .settings-card-btn {
  background: var(--primary);
  color: white;
}
`

export default function Settings() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!document.getElementById('settings-dashboard-css')) {
      const s = document.createElement('style')
      s.id = 'settings-dashboard-css'
      s.textContent = settingsCss
      document.head.appendChild(s)
    }
  }, [])

  const modules = [
    {
      title: 'User Master',
      desc: 'Configure system user accounts, login usernames, security access roles (Admin, Salesperson, Merchant), and team assignments.',
      path: '/settings/users',
      icon: <Users size={20} />,
      actionText: 'Manage Users'
    },
    {
      title: 'Team Master',
      desc: 'Define and manage company employee and sales team structures to organize reporting hierarchies and visitation plans.',
      path: '/settings/teams',
      icon: <FolderGit2 size={20} />,
      actionText: 'Manage Teams'
    },
    {
      title: 'User Permissions',
      desc: 'Map dynamic SQL database filter rules for specific system components to control data visibility per user account.',
      path: '/settings/permissions',
      icon: <ShieldAlert size={20} />,
      actionText: 'Configure Access'
    },
    {
      title: 'Survey Builder',
      desc: 'Build, organize, and publish custom visual inspection checklists and questionnaires for salesperson showroom visits.',
      path: '/settings/surveys',
      icon: <ClipboardSignature size={20} />,
      actionText: 'Launch Builder'
    }
  ]

  return (
    <>
      <Topbar title="Settings" subtitle="Configure system parameters, user details, permissions, and survey forms" />
      <div className="page-content">
        <div className="settings-grid">
          {modules.map((m, idx) => (
            <div key={idx} className="settings-card" onClick={() => navigate(m.path)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="settings-card-header">
                  <div className="settings-icon-wrap">
                    {m.icon}
                  </div>
                </div>
                <div className="settings-card-body">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
              <div className="settings-card-footer">
                <button className="settings-card-btn">
                  {m.actionText}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
