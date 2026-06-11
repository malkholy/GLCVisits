import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockTargetTypes, mockGovernorates } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import Toast from '../../components/Toast'
import '../../components/Buttons.css'
import './VisitForm.css'

const PURPOSES = [
  'Sales Follow-up','Collection Follow-up','Display Inspection',
  'Competitor Information','Merchant Survey','Project Follow-up',
  'Event Visit','New Prospect',
]

export default function VisitNew() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    VisitDate: '', TargetID: '', TargetTypeID: '',
    PurposeID: '', SalespersonID: '', Governorate: '', PlannedNotes: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.VisitDate || !form.TargetTypeID || !form.PurposeID) {
      setToast('Please fill required fields'); return
    }
    setToast('Visit saved (mock)')
    setTimeout(() => navigate('/visits'), 800)
  }

  return (
    <>
      <Topbar
        title="New Visit"
        subtitle="Plan a new field visit"
        actions={<>
          <button className="btn btn-ghost" onClick={() => navigate('/visits')}>← Back</button>
          <button className="btn btn-primary" onClick={save}>Save Planned Visit</button>
        </>}
      />
      <div className="page-content">
        <div className="card form-card">
          <div className="card-head"><h3>Visit Information</h3></div>
          <div className="form-grid">
            <div className="field">
              <label>Visit Date <span className="req">*</span></label>
              <input type="date" value={form.VisitDate} onChange={e => set('VisitDate', e.target.value)}/>
            </div>
            <div className="field">
              <label>Target Type <span className="req">*</span></label>
              <select value={form.TargetTypeID} onChange={e => set('TargetTypeID', e.target.value)}>
                <option value="">Select...</option>
                {mockTargetTypes.map(t => <option key={t.TargetTypeID} value={t.TargetTypeID}>{t.TargetTypeName}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Purpose <span className="req">*</span></label>
              <select value={form.PurposeID} onChange={e => set('PurposeID', e.target.value)}>
                <option value="">Select...</option>
                {PURPOSES.map((p, i) => <option key={i} value={i+1}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Governorate</label>
              <select value={form.Governorate} onChange={e => set('Governorate', e.target.value)}>
                <option value="">Select...</option>
                {mockGovernorates.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field full">
              <label>Planned Notes</label>
              <textarea rows={3} placeholder="Notes for this visit..." value={form.PlannedNotes} onChange={e => set('PlannedNotes', e.target.value)}/>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} onHide={() => setToast('')}/>
    </>
  )
}
