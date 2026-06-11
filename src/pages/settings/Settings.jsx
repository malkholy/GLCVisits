import Topbar from '../../components/Topbar'
import '../visits/Dashboard.css'

export default function Settings() {
  return (
    <>
      <Topbar title="Settings" subtitle="System configuration"/>
      <div className="page-content">
        <div className="card" style={{padding:'48px', textAlign:'center', color:'var(--muted)'}}>
          Settings — coming soon
        </div>
      </div>
    </>
  )
}
