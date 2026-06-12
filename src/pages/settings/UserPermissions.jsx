import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar'
import Toast from '../../components/Toast'
import { getPermissions, addPermission, editPermission, deletePermission, getUsers } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import { ChevronDown, ChevronRight, Save, Database, ShieldAlert, Sparkles } from 'lucide-react'
import '../visits/Dashboard.css'

const cssStyles = `
.permissions-layout {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  height: calc(100vh - 170px);
  min-height: 550px;
  align-items: stretch;
}

.users-panel {
  width: 320px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}

.panel-header {
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
  font-weight: 800;
  font-size: 15px;
  background: var(--soft);
  color: var(--text);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.users-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.role-group-wrap {
  margin-bottom: 16px;
}

.role-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  border-radius: 10px;
  background: var(--soft);
  transition: all 0.2s;
}

.role-group-header:hover {
  background: var(--line);
  color: var(--text);
}

.role-users-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.user-list-item {
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-list-item:hover {
  background: var(--soft);
}

.user-list-item.selected {
  background: var(--primary-soft);
  color: var(--primary-dark);
  border-color: rgba(249, 115, 22, 0.25);
}

.user-list-item .user-name {
  font-weight: 800;
  font-size: 13.5px;
}

.user-list-item .user-username {
  font-size: 11px;
  color: var(--muted);
  font-family: Consolas, monospace;
}

.user-list-item.selected .user-username {
  color: var(--primary-dark);
  opacity: 0.8;
}

.details-panel {
  flex: 1;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}

.details-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  gap: 12px;
  text-align: center;
  padding: 48px;
}

.details-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.component-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px;
  background: var(--card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: all 0.2s;
}

.component-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.04);
}

.component-card.modified {
  border-color: #eab308;
  background: rgba(254, 243, 199, 0.1);
}

.component-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-card-title h4 {
  margin: 0;
  font-weight: 800;
  font-size: 14.5px;
  color: var(--text);
}

.component-badge {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
}

.component-badge.modified {
  background: #fef3c7;
  color: #d97706;
}

.sql-textarea {
  min-height: 80px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 14px;
  outline: none;
  font-family: Consolas, monospace;
  font-size: 12.5px;
  resize: vertical;
  background: var(--soft);
  color: var(--text);
  transition: all 0.2s;
  line-height: 1.4;
}

.sql-textarea:focus {
  border-color: var(--primary);
  background: var(--card);
}

.component-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.sql-helper-text {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}

.save-btn {
  height: 36px;
  padding: 0 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 900;
  font-size: 12.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.panel-footer-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--line);
  background: var(--soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
`;

const mockUsers = [
  { UserID: 1, Username: 'admin', FullName: 'Mohammad Admin', Role: 'Admin', TeamID: 1, IsActive: true },
  { UserID: 2, Username: 'o.samir', FullName: 'Omar Samir', Role: 'Salesperson', TeamID: 1, IsActive: true },
  { UserID: 3, Username: 'm.ali', FullName: 'Mohammad Ali', Role: 'Salesperson', TeamID: 2, IsActive: true },
  { UserID: 4, Username: 'a.hassan', FullName: 'Ahmad Hassan', Role: 'Salesperson', TeamID: 2, IsActive: true },
]

const mockPermissions = [
  { PermissionID: 1, Username: 'o.samir', Component: 'Visit List', SqlCondition: "UserTeam = 'Sales Team A'", IsActive: true },
  { PermissionID: 2, Username: 'o.samir', Component: 'Target List', SqlCondition: "Governorate = 'Cairo'", IsActive: true },
  { PermissionID: 3, Username: 'o.samir', Component: 'Gov List', SqlCondition: "Governorate IN ('Cairo', 'Giza')", IsActive: true },
]

const componentsList = [
  'Visit List',
  'Target List',
  'Gov List',
  'Purpose List'
]

const sqlHelpers = {
  'Visit List': "e.g. UserTeam = 'Sales Team A' OR SalespersonID = 2",
  'Target List': "e.g. Governorate = 'Cairo' AND TargetStatus = 'Active'",
  'Gov List': "e.g. Governorate IN ('Cairo', 'Alexandria', 'Giza')",
  'Purpose List': "e.g. PurposeCode = 'VISIT_PROMO' OR RequiresSurvey = 1"
}

export default function UserPermissions() {
  const [users, setUsers] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  
  const [selectedUser, setSelectedUser] = useState(null)
  const [collapsedGroups, setCollapsedGroups] = useState({
    Admin: false,
    Salesperson: false,
    Merchant: false
  })
  const [localConditions, setLocalConditions] = useState({})

  // Inject Styles on Mount
  useEffect(() => {
    if (!document.getElementById('permissions-css')) {
      const s = document.createElement('style')
      s.id = 'permissions-css'
      s.textContent = cssStyles
      document.head.appendChild(s)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Users
      let loadedUsers = mockUsers
      if (API_URL) {
        try {
          const uRes = await getUsers()
          if (uRes && uRes.isSuccess && uRes.list0) {
            loadedUsers = uRes.list0
          }
        } catch (err) {
          console.error('Failed to load users:', err)
        }
      }
      setUsers(loadedUsers)

      // 2. Fetch Permissions
      let loadedPerms = mockPermissions
      if (API_URL) {
        try {
          const pRes = await getPermissions()
          if (pRes && pRes.isSuccess && pRes.list0) {
            loadedPerms = pRes.list0
          }
        } catch (err) {
          console.error('Failed to load permissions:', err)
        }
      }
      setPermissions(loadedPerms)
    } catch (err) {
      console.error('Failed in loading system data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync details inputs when user selection changes
  useEffect(() => {
    if (selectedUser) {
      const initial = {}
      componentsList.forEach(comp => {
        const match = permissions.find(p => p.Username === selectedUser.Username && p.Component === comp)
        initial[comp] = match ? match.SqlCondition : ''
      })
      setLocalConditions(initial)
    } else {
      setLocalConditions({})
    }
  }, [selectedUser, permissions])

  const toggleGroup = (role) => {
    setCollapsedGroups(prev => ({ ...prev, [role]: !prev[role] }))
  }

  // Check if a specific component has changes compared to database permissions
  const isComponentModified = (comp) => {
    if (!selectedUser) return false
    const match = permissions.find(p => p.Username === selectedUser.Username && p.Component === comp)
    const dbValue = match ? match.SqlCondition : ''
    const localValue = localConditions[comp] || ''
    return dbValue !== localValue
  }

  // Overall check if anything is modified for the selected user
  const isAnyComponentModified = () => {
    return componentsList.some(comp => isComponentModified(comp))
  }

  // Handle single component save action
  const handleSaveComponent = async (comp) => {
    if (!selectedUser) return
    const value = (localConditions[comp] || '').trim()
    const match = permissions.find(p => p.Username === selectedUser.Username && p.Component === comp)

    setSaving(true)
    try {
      if (match) {
        // Condition already exists in DB
        if (value === '') {
          // Empty input means deleting the rule
          if (API_URL) {
            const res = await deletePermission(match.PermissionID)
            if (!res.isSuccess) throw new Error(res.message)
          } else {
            setPermissions(prev => prev.filter(p => p.PermissionID !== match.PermissionID))
          }
          setToast(`Removed ${comp} permissions filter`)
        } else {
          // Edit rule
          const payload = { PermissionID: match.PermissionID, Username: selectedUser.Username, Component: comp, SqlCondition: value }
          if (API_URL) {
            const res = await editPermission(payload)
            if (!res.isSuccess) throw new Error(res.message)
          } else {
            setPermissions(prev => prev.map(p => p.PermissionID === match.PermissionID ? { ...p, SqlCondition: value } : p))
          }
          setToast(`Updated ${comp} permissions filter`)
        }
      } else {
        // Doesn't exist, create new
        if (value !== '') {
          const payload = { Username: selectedUser.Username, Component: comp, SqlCondition: value, IsActive: true }
          if (API_URL) {
            const res = await addPermission(payload)
            if (!res.isSuccess) throw new Error(res.message)
          } else {
            const newId = Math.max(0, ...permissions.map(p => p.PermissionID)) + 1
            setPermissions(prev => [...prev, { PermissionID: newId, ...payload }])
          }
          setToast(`Created ${comp} permissions filter`)
        }
      }
      if (API_URL) await loadData()
    } catch (err) {
      setToast(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Save all modified components at once
  const handleSaveAll = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const promises = []
      
      componentsList.forEach(comp => {
        if (isComponentModified(comp)) {
          const value = (localConditions[comp] || '').trim()
          const match = permissions.find(p => p.Username === selectedUser.Username && p.Component === comp)
          
          if (match) {
            if (value === '') {
              promises.push(API_URL ? deletePermission(match.PermissionID) : Promise.resolve({ isSuccess: true, mockDelete: match.PermissionID }))
            } else {
              promises.push(API_URL ? editPermission({ PermissionID: match.PermissionID, Username: selectedUser.Username, Component: comp, SqlCondition: value }) : Promise.resolve({ isSuccess: true, mockEdit: match.PermissionID, val: value }))
            }
          } else {
            if (value !== '') {
              promises.push(API_URL ? addPermission({ Username: selectedUser.Username, Component: comp, SqlCondition: value, IsActive: true }) : Promise.resolve({ isSuccess: true, mockAdd: true, comp, val: value }))
            }
          }
        }
      })

      if (promises.length === 0) return

      if (API_URL) {
        const results = await Promise.all(promises)
        const failed = results.filter(r => !r.isSuccess)
        if (failed.length > 0) {
          throw new Error(failed[0].message)
        }
        await loadData()
      } else {
        // Run mock modifications
        let localPerms = [...permissions]
        componentsList.forEach(comp => {
          if (isComponentModified(comp)) {
            const value = (localConditions[comp] || '').trim()
            const match = localPerms.find(p => p.Username === selectedUser.Username && p.Component === comp)
            if (match) {
              if (value === '') {
                localPerms = localPerms.filter(p => p.PermissionID !== match.PermissionID)
              } else {
                localPerms = localPerms.map(p => p.PermissionID === match.PermissionID ? { ...p, SqlCondition: value } : p)
              }
            } else if (value !== '') {
              const newId = Math.max(0, ...localPerms.map(p => p.PermissionID)) + 1
              localPerms.push({ PermissionID: newId, Username: selectedUser.Username, Component: comp, SqlCondition: value, IsActive: true })
            }
          }
        })
        setPermissions(localPerms)
      }
      
      setToast('Permissions saved successfully!')
    } catch (err) {
      setToast(`Error saving permissions: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Reset local inputs to match DB
  const handleDiscardChanges = () => {
    if (!selectedUser) return
    const initial = {}
    componentsList.forEach(comp => {
      const match = permissions.find(p => p.Username === selectedUser.Username && p.Component === comp)
      initial[comp] = match ? match.SqlCondition : ''
    })
    setLocalConditions(initial)
    setToast('Discarded unsaved modifications')
  }

  // Group users by their Role
  const groupedUsers = {
    Admin: users.filter(u => u.Role === 'Admin'),
    Salesperson: users.filter(u => u.Role === 'Salesperson'),
    Merchant: users.filter(u => u.Role === 'Merchant')
  }

  return (
    <>
      <Topbar title="User Permissions" subtitle="Direct configuration panel for dynamic SQL access conditions" />
      
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        <div className="permissions-layout">
          
          {/* List One: All Users Grouped by Role (Collapsible) */}
          <div className="users-panel">
            <div className="panel-header">
              <span>Users Directory</span>
              <span className="dg-badge" style={{ background: 'var(--soft)', color: 'var(--muted)', fontSize: '11px' }}>
                {users.length} users
              </span>
            </div>
            
            <div className="users-list-scroll">
              {Object.keys(groupedUsers).map(role => (
                <div key={role} className="role-group-wrap">
                  <div className="role-group-header" onClick={() => toggleGroup(role)}>
                    <span>{role} ({groupedUsers[role].length})</span>
                    {collapsedGroups[role] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </div>
                  
                  {!collapsedGroups[role] && (
                    <div className="role-users-list">
                      {groupedUsers[role].length === 0 ? (
                        <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
                          No users in this role
                        </div>
                      ) : (
                        groupedUsers[role].map(u => (
                          <div 
                            key={u.UserID}
                            className={`user-list-item ${selectedUser?.UserID === u.UserID ? 'selected' : ''}`}
                            onClick={() => setSelectedUser(u)}
                          >
                            <span className="user-name">{u.FullName}</span>
                            <span className="user-username">@{u.Username}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Side by Side List Two: SQL Configuration Cards for components */}
          <div className="details-panel">
            {!selectedUser ? (
              <div className="details-placeholder">
                <Database size={48} style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <h3>Select a User</h3>
                <p style={{ maxWidth: '320px', margin: 0, fontSize: '13px' }}>
                  Choose a user from the directory to review and edit their SQL database permission conditions.
                </p>
              </div>
            ) : (
              <>
                <div className="panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                      <strong>Configure Rules for {selectedUser.FullName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 'normal', marginTop: '2px' }}>
                        Active Role: {selectedUser.Role} | User Account: @{selectedUser.Username}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-content">
                  {componentsList.map(comp => {
                    const modified = isComponentModified(comp)
                    return (
                      <div key={comp} className={`component-card ${modified ? 'modified' : ''}`}>
                        <div className="component-card-title">
                          <h4>{comp} Permission</h4>
                          {modified ? (
                            <span className="component-badge modified">● Unsaved Changes</span>
                          ) : (
                            <span className="component-badge" style={{ background: 'var(--soft)', color: 'var(--muted)' }}>
                              Synced
                            </span>
                          )}
                        </div>

                        <textarea 
                          className="sql-textarea"
                          placeholder="No SQL condition set (user sees all records by default)"
                          value={localConditions[comp] || ''}
                          onChange={e => setLocalConditions(prev => ({ ...prev, [comp]: e.target.value }))}
                        />

                        <div className="component-footer">
                          <span className="sql-helper-text">
                            <strong>Query helper:</strong> {sqlHelpers[comp]}
                          </span>
                          <button 
                            className="save-btn" 
                            disabled={saving || !modified}
                            onClick={() => handleSaveComponent(comp)}
                          >
                            <Save size={13} />
                            Save
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="panel-footer-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                    <Sparkles size={14} style={{ color: '#d97706' }} />
                    <span>Any cleared input deletes its permission rule in database</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="dg-btn" 
                      disabled={saving || !isAnyComponentModified()}
                      onClick={handleDiscardChanges}
                    >
                      Discard Changes
                    </button>
                    <button 
                      className="save-btn" 
                      style={{ padding: '0 20px', height: '40px' }}
                      disabled={saving || !isAnyComponentModified()}
                      onClick={handleSaveAll}
                    >
                      <Save size={15} />
                      Save All Permissions
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
        </div>

      </div>

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
