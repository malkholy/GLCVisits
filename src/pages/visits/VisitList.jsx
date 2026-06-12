import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockVisits } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import DataGrid from '../../components/DataGrid'
import { fmtDate } from '../../shared/utils'
import { getVisitList } from '../../shared/api'
import { API_URL } from '../../shared/constants'

export default function VisitList() {
  const navigate = useNavigate()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(false)

  const loadVisits = async () => {
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
      console.error('Failed to fetch visits from API, falling back to mock data:', err)
      setVisits(mockVisits)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisits()
  }, [])

  const columns = [
    { key: 'VisitNo', label: 'Visit No', render: (val) => <span className="mono">{val}</span> },
    { key: 'TargetName', label: 'Target', render: (val) => <strong>{val}</strong> },
    { key: 'Area', label: 'Governorate / Area', render: (_, row) => `${row.Governorate} / ${row.Area}` },
    { key: 'TargetTypeName', label: 'Type' },
    { key: 'PurposeName', label: 'Purpose' },
    { key: 'VisitDate', label: 'Date', render: (val) => fmtDate(val) },
    { key: 'SalespersonName', label: 'Salesperson' },
    { key: 'StatusCode', label: 'Status', render: (_, row) => <StatusBadge code={row.StatusCode} name={row.StatusName} /> }
  ]

  const handleView = (row) => {
    navigate(`/visits/${row.VisitID}`)
  }

  const handleRefresh = () => {
    loadVisits()
  }

  return (
    <>
      <Topbar
        title="Visits"
        subtitle={`${visits.length} visits total`}
        actions={<>
          <button className="btn btn-primary" onClick={() => navigate('/visits/new')}>+ Plan New Visit</button>
        </>}
      />
      <div className="page-content">
        <DataGrid
          title="Visits"
          hideHeader={true}
          columns={columns}
          rows={visits}
          onView={handleView}
          hideToolbarButtons={true}
          onRefresh={handleRefresh}
        />
      </div>
    </>
  )
}



