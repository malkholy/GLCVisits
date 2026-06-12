import { useState, useEffect } from 'react'
import { mockVisits } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import { fmtDate } from '../../shared/utils'
import { getVisitList } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import './Dashboard.css'

export default function Dashboard() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDashboardData = async () => {
    if (!API_URL) {
      setVisits(mockVisits)
      return
    }
    setLoading(true)
    try {
      const res = await getVisitList()
      if (res && res.isSuccess) {
        setVisits(res.list0 || [])
      } else {
        console.warn('API success state was false, falling back to mock data.')
        setVisits(mockVisits)
      }
    } catch (err) {
      console.error('Failed to load dashboard visits from API:', err)
      setVisits(mockVisits)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Calculate KPIs dynamically based on current visits list
  const todayStr = new Date().toISOString().split('T')[0]
  const todayCount = visits.filter(v => v.VisitDate === todayStr).length
  const completedCount = visits.filter(v => v.StatusCode === 'COMPLETED').length
  const plannedCount = visits.filter(v => v.StatusCode === 'PLANNED').length
  const missedCount = visits.filter(v => v.StatusCode === 'MISSED').length

  const kpis = [
    { label: 'Today Visits',  value: todayCount,  color: 'blue' },
    { label: 'Completed',     value: completedCount, color: 'green' },
    { label: 'Planned',       value: plannedCount,  color: 'yellow' },
    { label: 'Missed',        value: missedCount,   color: 'red' },
  ]

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of today's visit activity" />
      <div className="page-content">
        <div className="kpi-row">
          {kpis.map(k => (
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
              {visits.slice(0, 5).map(v => (
                <tr key={v.VisitID}>
                  <td className="mono">{v.VisitNo}</td>
                  <td>{v.TargetName}</td>
                  <td>{v.Area}</td>
                  <td>{v.PurposeName}</td>
                  <td>{fmtDate(v.VisitDate)}</td>
                  <td><StatusBadge code={v.StatusCode} name={v.StatusName}/></td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                    No visits found in database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
