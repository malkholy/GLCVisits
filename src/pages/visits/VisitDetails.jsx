import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { mockVisits } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import Toast from '../../components/Toast'
import { fmtDate, fmtDateTime, fmtDuration } from '../../shared/utils'
import '../../components/Buttons.css'
import './VisitDetails.css'

const TABS = ['Notes','Survey','Follow-up','Competitor','Inspection']

export default function VisitDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab]     = useState('Notes')
  const [toast, setToast] = useState('')

  const visit = mockVisits.find(v => v.VisitID === Number(id))
  if (!visit) return <div className="page-content">Visit not found.</div>

  const action = (label) => setToast(`${label} — (mock)`)

  return (
    <>
      <Topbar
        title={visit.VisitNo}
        subtitle={`${visit.TargetName} · ${visit.Area}`}
        actions={<>
          <button className="btn btn-ghost" onClick={() => navigate('/visits')}>← Back</button>
          {visit.StatusCode === 'PLANNED'     && <button className="btn btn-primary" onClick={() => action('Check In')}>📍 Check In</button>}
          {visit.StatusCode === 'CHECKED_IN'  && <button className="btn btn-success" onClick={() => action('Check Out')}>✓ Check Out</button>}
          {visit.StatusCode === 'CHECKED_OUT' && <button className="btn btn-success" onClick={() => action('Complete')}>✓ Complete</button>}
          {!['COMPLETED','CANCELLED','MISSED'].includes(visit.StatusCode) &&
            <button className="btn btn-danger" onClick={() => action('Cancel')}>✕ Cancel</button>}
        </>}
      />
      <div className="page-content">
        {/* Summary Header */}
        <div className="summary-header">
          <div className="summary-grid">
            <div className="summary-item">
              <span>Target</span><strong>{visit.TargetName}</strong>
            </div>
            <div className="summary-item">
              <span>Type</span><strong>{visit.TargetTypeName}</strong>
            </div>
            <div className="summary-item">
              <span>Purpose</span><strong>{visit.PurposeName}</strong>
            </div>
            <div className="summary-item">
              <span>Area</span><strong>{visit.Area}, {visit.Governorate}</strong>
            </div>
            <div className="summary-item">
              <span>Date</span><strong>{fmtDate(visit.VisitDate)}</strong>
            </div>
            <div className="summary-item">
              <span>Salesperson</span><strong>{visit.SalespersonName}</strong>
            </div>
            <div className="summary-item">
              <span>Check In</span><strong>{fmtDateTime(visit.CheckInDateTime)}</strong>
            </div>
            <div className="summary-item">
              <span>Duration</span><strong>{fmtDuration(visit.VisitDurationMinutes)}</strong>
            </div>
            <div className="summary-item">
              <span>Status</span>
              <StatusBadge code={visit.StatusCode} name={visit.StatusName}/>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="card">
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="tab-body">
            {tab === 'Notes' && (
              <div className="form-grid" style={{padding:'20px'}}>
                <div className="field full" style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label style={{fontSize:12,fontWeight:700,color:'var(--muted)'}}>VISIT NOTES</label>
                  <textarea rows={3} placeholder="Notes during visit..." defaultValue={visit.VisitNotes || ''}/>
                </div>
                <div className="field full" style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label style={{fontSize:12,fontWeight:700,color:'var(--muted)'}}>FINAL NOTES</label>
                  <textarea rows={3} placeholder="Final closing notes..." defaultValue={visit.FinalNotes || ''}/>
                </div>
                <div style={{paddingTop:4}}>
                  <button className="btn btn-primary" onClick={() => action('Notes saved')}>Save Notes</button>
                </div>
              </div>
            )}
            {tab === 'Survey' && (
              <div className="empty-tab">Survey builder — coming soon</div>
            )}
            {tab === 'Follow-up' && (
              <div className="empty-tab">Follow-up tasks — coming soon</div>
            )}
            {tab === 'Competitor' && (
              <div className="empty-tab">Competitor info — coming soon</div>
            )}
            {tab === 'Inspection' && (
              <div className="empty-tab">Display inspection — coming soon</div>
            )}
          </div>
        </div>
      </div>
      <Toast message={toast} onHide={() => setToast('')}/>
    </>
  )
}
