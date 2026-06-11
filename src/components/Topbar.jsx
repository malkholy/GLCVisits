import './Topbar.css'

export default function Topbar({ title, subtitle, actions }) {
  return (
    <header className="topbar">
      <div className="page-title">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="top-actions">{actions}</div>
    </header>
  )
}
