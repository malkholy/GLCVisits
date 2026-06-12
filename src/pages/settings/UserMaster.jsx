import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar'
import DataGrid from '../../components/DataGrid'
import Toast from '../../components/Toast'
import { getUsers, addUser, editUser, deleteUser, getTeams } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import '../visits/Dashboard.css'

const mockTeams = [
  { TeamID: 1, TeamName: 'Sales Team A', IsActive: true },
  { TeamID: 2, TeamName: 'Sales Team B', IsActive: true },
  { TeamID: 3, TeamName: 'Marketing Team', IsActive: true },
]

const mockUsers = [
  { UserID: 1, Username: 'admin', FullName: 'Mohammad Admin', Role: 'Admin', TeamID: 1, IsActive: true },
  { UserID: 2, Username: 'o.samir', FullName: 'Omar Samir', Role: 'Salesperson', TeamID: 1, IsActive: true },
  { UserID: 3, Username: 'm.ali', FullName: 'Mohammad Ali', Role: 'Salesperson', TeamID: 2, IsActive: true },
  { UserID: 4, Username: 'a.hassan', FullName: 'Ahmad Hassan', Role: 'Salesperson', TeamID: 2, IsActive: true },
]

export default function UserMaster() {
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [modalForm, setModalForm] = useState({
    UserID: '',
    Username: '',
    FullName: '',
    Role: 'Salesperson',
    TeamID: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      // Load teams first
      let loadedTeams = mockTeams
      if (API_URL) {
        try {
          const res = await getTeams()
          if (res && res.isSuccess && res.list0) {
            loadedTeams = res.list0
          }
        } catch (err) {
          console.error('Failed to load teams:', err)
        }
      }
      setTeams(loadedTeams)

      // Load users
      if (!API_URL) {
        const mapped = mockUsers.map(u => {
          const t = loadedTeams.find(x => String(x.TeamID) === String(u.TeamID))
          return { ...u, TeamName: t ? t.TeamName : '' }
        })
        setUsers(mapped)
        return
      }

      const res = await getUsers()
      if (res && res.isSuccess) {
        const data = res.list0 && res.list0.length > 0 ? res.list0 : mockUsers
        const mapped = data.map(u => {
          const t = loadedTeams.find(x => String(x.TeamID) === String(u.TeamID))
          return { ...u, TeamName: t ? t.TeamName : '' }
        })
        setUsers(mapped)
      } else {
        const mapped = mockUsers.map(u => {
          const t = loadedTeams.find(x => String(x.TeamID) === String(u.TeamID))
          return { ...u, TeamName: t ? t.TeamName : '' }
        })
        setUsers(mapped)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      const mapped = mockUsers.map(u => {
        const t = mockTeams.find(x => String(x.TeamID) === String(u.TeamID))
        return { ...u, TeamName: t ? t.TeamName : '' }
      })
      setUsers(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const columns = [
    { key: 'UserID', label: 'User ID', render: (val) => <span className="mono">{val}</span> },
    { key: 'Username', label: 'Username', render: (val) => <strong>{val}</strong> },
    { key: 'FullName', label: 'Full Name' },
    { key: 'Role', label: 'Role', render: (val) => <span className="dg-badge good">{val}</span> },
    { key: 'TeamName', label: 'Team' },
  ]

  const handleAdd = () => {
    setModalMode('add')
    setModalForm({
      UserID: '',
      Username: '',
      FullName: '',
      Role: 'Salesperson',
      TeamID: teams.length > 0 ? String(teams[0].TeamID) : ''
    })
    setShowModal(true)
  }

  const handleEdit = (row) => {
    setModalMode('edit')
    setModalForm({
      UserID: row.UserID,
      Username: row.Username || '',
      FullName: row.FullName || '',
      Role: row.Role || 'Salesperson',
      TeamID: row.TeamID ? String(row.TeamID) : (teams.length > 0 ? String(teams[0].TeamID) : '')
    })
    setShowModal(true)
  }

  const handleDelete = (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) return
    const names = selectedRows.map(r => r.Username).join(', ')
    if (!window.confirm(`Are you sure you want to delete user(s): ${names}?`)) return

    if (!API_URL) {
      const ids = new Set(selectedRows.map(r => r.UserID))
      setUsers(prev => prev.filter(u => !ids.has(u.UserID)))
      setToast('User(s) deleted (mock)')
    } else {
      const deletePromises = selectedRows.map(row => deleteUser(row.UserID))
      Promise.all(deletePromises).then(results => {
        const failed = results.filter(res => !res.isSuccess)
        if (failed.length === 0) {
          setToast('User(s) deleted successfully')
          loadData()
        } else {
          setToast(`Error: ${failed[0].message}`)
        }
      }).catch(err => {
        setToast(`Delete failed: ${err.message}`)
      })
    }
  }

  const handleSave = () => {
    if (!modalForm.Username.trim()) {
      setToast('Please enter a username')
      return
    }
    if (!modalForm.FullName.trim()) {
      setToast('Please enter full name')
      return
    }

    const payload = {
      Username: modalForm.Username.trim(),
      FullName: modalForm.FullName.trim(),
      Role: modalForm.Role,
      TeamID: modalForm.TeamID ? Number(modalForm.TeamID) : null,
      IsActive: true
    }

    if (modalMode === 'add') {
      if (!API_URL) {
        const newId = Math.max(0, ...users.map(u => u.UserID)) + 1
        const t = teams.find(x => String(x.TeamID) === String(payload.TeamID))
        setUsers(prev => [...prev, { UserID: newId, ...payload, TeamName: t ? t.TeamName : '' }])
        setToast('User added (mock)')
        setShowModal(false)
      } else {
        addUser(payload).then(res => {
          if (res.isSuccess) {
            setToast('User created successfully')
            setShowModal(false)
            loadData()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => setToast(`Failed: ${err.message}`))
      }
    } else {
      const editPayload = { UserID: modalForm.UserID, ...payload }
      if (!API_URL) {
        const t = teams.find(x => String(x.TeamID) === String(payload.TeamID))
        setUsers(prev => prev.map(u => u.UserID === modalForm.UserID ? { ...u, ...editPayload, TeamName: t ? t.TeamName : '' } : u))
        setToast('User updated (mock)')
        setShowModal(false)
      } else {
        editUser(editPayload).then(res => {
          if (res.isSuccess) {
            setToast('User updated successfully')
            setShowModal(false)
            loadData()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => setToast(`Failed: ${err.message}`))
      }
    }
  }

  return (
    <>
      <Topbar title="User Master" subtitle="Manage system users and login credentials" />
      <div className="page-content">
        <DataGrid
          title="Users"
          hideHeader={true}
          columns={columns}
          rows={users}
          loading={loading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadData}
        />
      </div>

      {showModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '450px', width: '90%' }}>
            <div className="dg-modal-head">
              <h3>{modalMode === 'add' ? 'Create New User' : 'Edit User Profile'}</h3>
              <button className="dg-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Username <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                  placeholder="e.g. j.doe"
                  value={modalForm.Username} 
                  disabled={modalMode === 'edit'}
                  onChange={e => setModalForm(f => ({ ...f, Username: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                  placeholder="e.g. John Doe"
                  value={modalForm.FullName} 
                  onChange={e => setModalForm(f => ({ ...f, FullName: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Role <span style={{ color: 'var(--red)' }}>*</span></label>
                <select 
                  style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none', background: 'var(--card)' }}
                  value={modalForm.Role} 
                  onChange={e => setModalForm(f => ({ ...f, Role: e.target.value }))}
                >
                  <option value="Admin">Admin</option>
                  <option value="Salesperson">Salesperson</option>
                  <option value="Merchant">Merchant</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Team</label>
                <select 
                  style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none', background: 'var(--card)' }}
                  value={modalForm.TeamID} 
                  onChange={e => setModalForm(f => ({ ...f, TeamID: e.target.value }))}
                >
                  <option value="">No Team</option>
                  {teams.map(t => (
                    <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button className="dg-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleSave}>Save User</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
