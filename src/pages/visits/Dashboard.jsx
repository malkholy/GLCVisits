import { mockVisits } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import { fmtDate } from '../../shared/utils'
import './Dashboard.css'

const KPI = [
  { label: 'Today Visits',  value: 4,  color: 'blue' },
  { label: 'Completed',     value: 12, color: 'green' },
  { label: 'Planned',       value: 3,  color: 'yellow' },
  { label: 'Missed',        value: 1,  color: 'red' },
]

export default function Dashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of today's visit activity" />
      <div className="page-content">
        <div className="kpi-row">
          {KPI.map(k => (
            <div key={k.label} className={`kpi-card kpi-${k.color}`}>
              <span className="kpi-value">{k.value}</span>
              <span className="kpi-label">{k.label}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head"><h3>Recent Visits</h3></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Visit No</th><th>Target</th><th>Area</th>
                <th>Purpose</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockVisits.slice(0, 5).map(v => (
                <tr key={v.VisitID}>
                  <td className="mono">{v.VisitNo}</td>
                  <td>{v.TargetName}</td>
                  <td>{v.Area}</td>
                  <td>{v.PurposeName}</td>
                  <td>{fmtDate(v.VisitDate)}</td>
                  <td><StatusBadge code={v.StatusCode} name={v.StatusName}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
