import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar'
import DataGrid from '../../components/DataGrid'
import Toast from '../../components/Toast'
import { getTeams, addTeam, editTeam, deleteTeam } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import '../visits/Dashboard.css'

const mockTeams = [
  { TeamID: 1, TeamName: 'Sales Team A', IsActive: true },
  { TeamID: 2, TeamName: 'Sales Team B', IsActive: true },
  { TeamID: 3, TeamName: 'Marketing Team', IsActive: true },
]

export default function TeamMaster() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [modalForm, setModalForm] = useState({ TeamID: '', TeamName: '' })

  const loadTeams = async () => {
    if (!API_URL) {
      setTeams(mockTeams)
      return
    }
    setLoading(true)
    try {
      const res = await getTeams()
      if (res && res.isSuccess) {
        setTeams(res.list0 && res.list0.length > 0 ? res.list0 : mockTeams)
      } else {
        setTeams(mockTeams)
      }
    } catch (err) {
      setTeams(mockTeams)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const columns = [
    { key: 'TeamID', label: 'Team ID', render: (val) => <span className="mono">{val}</span> },
    { key: 'TeamName', label: 'Team Name', render: (val) => <strong>{val}</strong> },
  ]

  const handleAdd = () => {
    setModalMode('add')
    setModalForm({ TeamID: '', TeamName: '' })
    setShowModal(true)
  }

  const handleEdit = (row) => {
    setModalMode('edit')
    setModalForm({ TeamID: row.TeamID, TeamName: row.TeamName })
    setShowModal(true)
  }

  const handleDelete = (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) return
    const names = selectedRows.map(r => r.TeamName).join(', ')
    if (!window.confirm(`Are you sure you want to delete: ${names}?`)) return

    if (!API_URL) {
      const ids = new Set(selectedRows.map(r => r.TeamID))
      setTeams(prev => prev.filter(t => !ids.has(t.TeamID)))
      setToast('Team(s) deleted (mock)')
    } else {
      const deletePromises = selectedRows.map(row => deleteTeam(row.TeamID))
      Promise.all(deletePromises).then(results => {
        const failed = results.filter(res => !res.isSuccess)
        if (failed.length === 0) {
          setToast('Team(s) deleted successfully')
          loadTeams()
        } else {
          setToast(`Error: ${failed[0].message}`)
        }
      }).catch(err => {
        setToast(`Delete failed: ${err.message}`)
      })
    }
  }

  const handleSave = () => {
    if (!modalForm.TeamName.trim()) {
      setToast('Please enter a team name')
      return
    }

    const payload = { TeamName: modalForm.TeamName.trim() }

    if (modalMode === 'add') {
      if (!API_URL) {
        const newId = Math.max(0, ...teams.map(t => t.TeamID)) + 1
        setTeams(prev => [...prev, { TeamID: newId, ...payload, IsActive: true }])
        setToast('Team added (mock)')
        setShowModal(false)
      } else {
        addTeam(payload).then(res => {
          if (res.isSuccess) {
            setToast('Team created successfully')
            setShowModal(false)
            loadTeams()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => setToast(`Failed: ${err.message}`))
      }
    } else {
      const editPayload = { TeamID: modalForm.TeamID, ...payload }
      if (!API_URL) {
        setTeams(prev => prev.map(t => t.TeamID === modalForm.TeamID ? { ...t, ...editPayload } : t))
        setToast('Team updated (mock)')
        setShowModal(false)
      } else {
        editTeam(editPayload).then(res => {
          if (res.isSuccess) {
            setToast('Team updated successfully')
            setShowModal(false)
            loadTeams()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => setToast(`Failed: ${err.message}`))
      }
    }
  }

  return (
    <>
      <Topbar title="Team Master" subtitle="Manage employee teams" />
      <div className="page-content">
        <DataGrid
          title="Teams"
          hideHeader={true}
          columns={columns}
          rows={teams}
          loading={loading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadTeams}
        />
      </div>

      {showModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '450px', width: '90%' }}>
            <div className="dg-modal-head">
              <h3>{modalMode === 'add' ? 'Create New Team' : 'Edit Team Name'}</h3>
              <button className="dg-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Team Name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                  placeholder="e.g. Sales Team C"
                  value={modalForm.TeamName} 
                  onChange={e => setModalForm(f => ({ ...f, TeamName: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button className="dg-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleSave}>Save Team</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
