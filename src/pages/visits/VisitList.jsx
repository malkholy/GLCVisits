import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockVisits, mockStatuses, mockTargetTypes } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import { fmtDate } from '../../shared/utils'
import '../../components/Buttons.css'
import '../visits/Dashboard.css'

export default function VisitList() {
  const navigate = useNavigate()
  const [status, setStatus]   = useState('')
  const [type,   setType]     = useState('')
  const [search, setSearch]   = useState('')

  const filtered = mockVisits.filter(v =>
    (!status || v.StatusCode === status) &&
    (!type   || v.TargetTypeName === type) &&
    (!search || v.TargetName.toLowerCase().includes(search.toLowerCase()) ||
                v.VisitNo.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <Topbar
        title="Visits"
        subtitle={`${filtered.length} visits`}
        actions={<>
          <button className="btn btn-ghost btn-sm" onClick={() => {}}>↻ Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate('/visits/new')}>+ New Visit</button>
        </>}
      />
      <div className="page-content">
        <div className="filter-row">
          <input
            className="filter-input" placeholder="Search visit no, target..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {mockStatuses.map(s => <option key={s.StatusCode} value={s.StatusCode}>{s.StatusName}</option>)}
          </select>
          <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="">All Types</option>
            {mockTargetTypes.map(t => <option key={t.TargetTypeCode} value={t.TargetTypeName}>{t.TargetTypeName}</option>)}
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Visit No</th><th>Target</th><th>Governorate / Area</th>
                <th>Type</th><th>Purpose</th><th>Date</th>
                <th>Salesperson</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.VisitID} onClick={() => navigate(`/visits/${v.VisitID}`)}>
                  <td className="mono">{v.VisitNo}</td>
                  <td><strong>{v.TargetName}</strong></td>
                  <td>{v.Governorate} / {v.Area}</td>
                  <td>{v.TargetTypeName}</td>
                  <td>{v.PurposeName}</td>
                  <td>{fmtDate(v.VisitDate)}</td>
                  <td>{v.SalespersonName}</td>
                  <td><StatusBadge code={v.StatusCode} name={v.StatusName}/></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', padding:'32px', color:'var(--muted)'}}>No visits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
