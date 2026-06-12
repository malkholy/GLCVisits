import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar'
import DataGrid from '../../components/DataGrid'
import Toast from '../../components/Toast'
import { getTargets, getTargetTypes, addTarget, editTarget, deleteTarget } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import { mockTargetTypes, mockGovernorates } from '../../mock/mockData'
import '../visits/Dashboard.css'

const mockTargets = [
  { TargetID: 1, TargetCode: 'T-001', TargetName: 'Al Madina Paint Center', TargetTypeID: 1, TargetTypeName: 'ERP Customer', Governorate: 'Cairo', Area: 'Nasr City', ContactPerson: 'Ahmad Ibrahim', MobileNumber: '01001234567', TargetStatus: 'Active', RelatedCustomerID: 1245 },
  { TargetID: 2, TargetCode: 'T-002', TargetName: 'Delta Showroom', TargetTypeID: 2, TargetTypeName: 'Showroom', Governorate: 'Cairo', Area: 'Heliopolis', ContactPerson: 'Mohammad Ali', MobileNumber: '01119876543', TargetStatus: 'Active', RelatedCustomerID: 9942 },
  { TargetID: 3, TargetCode: 'T-003', TargetName: 'New Capital Project', TargetTypeID: 4, TargetTypeName: 'Project', Governorate: 'Cairo', Area: 'New Cairo', ContactPerson: 'Sherif Samir', MobileNumber: '01224567890', TargetStatus: 'Active', RelatedProjectID: 8011 },
  { TargetID: 4, TargetCode: 'T-004', TargetName: 'City Paints Dealer', TargetTypeID: 1, TargetTypeName: 'ERP Customer', Governorate: 'Giza', Area: 'Dokki', ContactPerson: 'Hassan Nasr', MobileNumber: '01556781234', TargetStatus: 'Active', RelatedCustomerID: 3014 },
  { TargetID: 5, TargetCode: 'T-005', TargetName: 'Alex Paint Center', TargetTypeID: 1, TargetTypeName: 'ERP Customer', Governorate: 'Alexandria', Area: 'Smouha', ContactPerson: 'Mahmoud Saeed', MobileNumber: '01004567891', TargetStatus: 'Active', RelatedCustomerID: 5560 },
]

export default function Targets() {
  const [targets, setTargets] = useState([])
  const [targetTypes, setTargetTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [modalForm, setModalForm] = useState({
    TargetID: '',
    TargetCode: '',
    TargetName: '',
    TargetTypeID: '',
    Governorate: '',
    Area: '',
    ContactPerson: '',
    MobileNumber: '',
    RelatedCustomerID: '',
    RelatedProjectID: '',
  })

  const loadTargetsData = async () => {
    if (!API_URL) {
      setTargets(mockTargets)
      return
    }
    setLoading(true)
    try {
      const res = await getTargets()
      if (res && res.isSuccess) {
        if (res.list0 && res.list0.length > 0) {
          setTargets(res.list0)
        } else {
          setTargets(mockTargets)
        }
      } else {
        console.warn('API returned success false, falling back to mock targets.')
        setTargets(mockTargets)
      }
    } catch (err) {
      console.error('Failed to load targets from API:', err)
      setTargets(mockTargets)
    } finally {
      setLoading(false)
    }
  }

  // Load target types on mount
  useEffect(() => {
    loadTargetsData()
    getTargetTypes().then(res => {
      if (res.isSuccess && res.list0 && res.list0.length > 0) {
        setTargetTypes(res.list0)
      } else {
        setTargetTypes(mockTargetTypes)
      }
    }).catch(() => {
      setTargetTypes(mockTargetTypes)
    })
  }, [])

  const columns = [
    { key: 'TargetCode', label: 'Code', render: (val) => <span className="mono">{val}</span> },
    { key: 'TargetName', label: 'Name', render: (val) => <strong>{val}</strong> },
    { key: 'TargetTypeName', label: 'Type' },
    { key: 'Governorate', label: 'Governorate' },
    { key: 'Area', label: 'Area' },
    { key: 'ContactPerson', label: 'Contact Person' },
    { key: 'MobileNumber', label: 'Mobile Number' },
    { 
      key: 'ExtraInfo', 
      label: 'Extra Info', 
      render: (_, row) => {
        if (String(row.TargetTypeID) === '1' || row.TargetTypeName?.toLowerCase() === 'erp customer') {
          return `ERP Cust No: ${row.RelatedCustomerID || '-'}`
        }
        if (String(row.TargetTypeID) === '2' || row.TargetTypeName?.toLowerCase() === 'showroom') {
          return `Showroom ID: ${row.RelatedCustomerID || '-'}`
        }
        if (String(row.TargetTypeID) === '4' || row.TargetTypeName?.toLowerCase() === 'project') {
          return `Project ID: ${row.RelatedProjectID || '-'}`
        }
        return '-'
      }
    }
  ]

  const [filterType, setFilterType] = useState('')
  const [filterGov, setFilterGov] = useState('')

  // Dynamic KPI calculations (always based on the total list)
  const erpCount = targets.filter(t => t.TargetTypeID === 1 || t.TargetTypeName?.toLowerCase() === 'erp customer').length
  const showroomCount = targets.filter(t => t.TargetTypeID === 2 || t.TargetTypeName?.toLowerCase() === 'showroom').length
  const projectCount = targets.filter(t => t.TargetTypeID === 4 || t.TargetTypeName?.toLowerCase() === 'project').length

  const kpis = [
    { label: 'Total Targets', value: targets.length, color: 'blue' },
    { label: 'ERP Customers', value: erpCount, color: 'green' },
    { label: 'Showrooms', value: showroomCount, color: 'yellow' },
    { label: 'Projects', value: projectCount, color: 'red' },
  ]

  const handleRefresh = () => {
    loadTargetsData()
  }

  // Filter targets list for the DataGrid
  const filteredTargetsForGrid = targets.filter(t => {
    const matchType = !filterType || String(t.TargetTypeID) === String(filterType)
    const matchGov = !filterGov || String(t.Governorate).trim().toLowerCase() === String(filterGov).trim().toLowerCase()
    return matchType && matchGov
  })

  // Add / Edit / Delete Handlers
  const handleAdd = () => {
    setModalMode('add')
    setModalForm({
      TargetID: '',
      TargetCode: '',
      TargetName: '',
      TargetTypeID: '',
      Governorate: '',
      Area: '',
      ContactPerson: '',
      MobileNumber: '',
      RelatedCustomerID: '',
      RelatedProjectID: '',
    })
    setShowModal(true)
  }

  const handleEdit = (row) => {
    setModalMode('edit')
    setModalForm({
      TargetID: row.TargetID,
      TargetCode: row.TargetCode || '',
      TargetName: row.TargetName || '',
      TargetTypeID: String(row.TargetTypeID || ''),
      Governorate: row.Governorate || '',
      Area: row.Area || '',
      ContactPerson: row.ContactPerson || '',
      MobileNumber: row.MobileNumber || '',
      RelatedCustomerID: row.RelatedCustomerID || '',
      RelatedProjectID: row.RelatedProjectID || '',
    })
    setShowModal(true)
  }

  const handleDelete = (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) return
    const names = selectedRows.map(r => r.TargetName).join(', ')
    if (!window.confirm(`Are you sure you want to delete: ${names}?`)) return

    if (!API_URL) {
      const idsToDelete = new Set(selectedRows.map(r => r.TargetID))
      setTargets(prev => prev.filter(t => !idsToDelete.has(t.TargetID)))
      setToast('Target(s) deleted (mock)')
    } else {
      // Process sequential deletion of selected rows
      const deletePromises = selectedRows.map(row => deleteTarget(row.TargetID))
      Promise.all(deletePromises).then(results => {
        const failed = results.filter(res => !res.isSuccess)
        if (failed.length === 0) {
          setToast('Target(s) deleted successfully')
          loadTargetsData()
        } else {
          setToast(`Failed to delete some targets: ${failed[0].message}`)
        }
      }).catch(err => {
        setToast(`Delete failed: ${err.message}`)
      })
    }
  }

  const handleFormChange = (key, val) => {
    setModalForm(f => {
      const next = { ...f, [key]: val }
      // Reset conditional fields when target type is changed
      if (key === 'TargetTypeID') {
        next.RelatedCustomerID = ''
        next.RelatedProjectID = ''
      }
      return next
    })
  }

  const handleSave = () => {
    if (!modalForm.TargetName || !modalForm.TargetTypeID || !modalForm.Governorate || !modalForm.Area) {
      setToast('Please fill all required fields')
      return
    }

    if (String(modalForm.TargetTypeID) === '1' && !modalForm.RelatedCustomerID) {
      setToast('Please enter ERP Customer No')
      return
    }
    if (String(modalForm.TargetTypeID) === '2' && !modalForm.RelatedCustomerID) {
      setToast('Please enter Showroom ID')
      return
    }
    if (String(modalForm.TargetTypeID) === '4' && !modalForm.RelatedProjectID) {
      setToast('Please enter Project ID')
      return
    }

    const typeObj = targetTypes.find(t => String(t.TargetTypeID) === String(modalForm.TargetTypeID))
    const typeName = typeObj ? typeObj.TargetTypeName : 'Other'

    const payload = {
      TargetCode: modalForm.TargetCode,
      TargetName: modalForm.TargetName,
      TargetTypeID: Number(modalForm.TargetTypeID),
      TargetTypeName: typeName,
      Governorate: modalForm.Governorate,
      Area: modalForm.Area,
      ContactPerson: modalForm.ContactPerson,
      MobileNumber: modalForm.MobileNumber,
      RelatedCustomerID: modalForm.RelatedCustomerID ? Number(modalForm.RelatedCustomerID) : null,
      RelatedProjectID: modalForm.RelatedProjectID ? Number(modalForm.RelatedProjectID) : null,
    }

    if (modalMode === 'add') {
      if (!API_URL) {
        const newId = Math.max(0, ...targets.map(t => t.TargetID)) + 1
        const newCode = `T-${String(newId).padStart(3, '0')}`
        const newItem = { TargetID: newId, ...payload, TargetCode: newCode, TargetStatus: 'Active' }
        setTargets(prev => [...prev, newItem])
        setToast('Target added (mock)')
        setShowModal(false)
      } else {
        addTarget(payload).then(res => {
          if (res.isSuccess) {
            setToast('Target created successfully')
            setShowModal(false)
            loadTargetsData()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => {
          setToast(`Failed: ${err.message}`)
        })
      }
    } else {
      const editPayload = { ...payload, TargetID: modalForm.TargetID }
      if (!API_URL) {
        setTargets(prev => prev.map(t => t.TargetID === modalForm.TargetID ? { ...t, ...editPayload } : t))
        setToast('Target updated (mock)')
        setShowModal(false)
      } else {
        editTarget(editPayload).then(res => {
          if (res.isSuccess) {
            setToast('Target updated successfully')
            setShowModal(false)
            loadTargetsData()
          } else {
            setToast(`Error: ${res.message}`)
          }
        }).catch(err => {
          setToast(`Failed: ${err.message}`)
        })
      }
    }
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <>
      <Topbar title="Targets" subtitle="Manage visit targets across Egypt" />
      <div className="page-content">
        <div className="kpi-row">
          {kpis.map(k => (
            <div key={k.label} className={`kpi-card kpi-${k.color}`}>
              <span className="kpi-value">{k.value}</span>
              <span className="kpi-label">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '14px', 
          background: 'var(--card)', 
          border: '1px solid var(--line)', 
          borderRadius: '16px', 
          padding: '16px', 
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Filter by Target Type</label>
            <select 
              style={{ height: '38px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 10px', outline: 'none', background: 'var(--bg)', fontWeight: '700', cursor: 'pointer' }}
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {targetTypes.map(t => <option key={t.TargetTypeID} value={t.TargetTypeID}>{t.TargetTypeName}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Filter by Governorate</label>
            <select 
              style={{ height: '38px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 10px', outline: 'none', background: 'var(--bg)', fontWeight: '700', cursor: 'pointer' }}
              value={filterGov} 
              onChange={e => setFilterGov(e.target.value)}
            >
              <option value="">All Governorates</option>
              {mockGovernorates.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          {(filterType || filterGov) && (
            <button 
              className="btn btn-ghost" 
              style={{ height: '38px', marginTop: '18px', padding: '0 16px', fontSize: '13px', fontWeight: '800' }} 
              onClick={() => { setFilterType(''); setFilterGov(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <DataGrid
          title="Targets"
          hideHeader={true}
          columns={columns}
          rows={filteredTargetsForGrid}
          loading={loading}
          hideToolbarButtons={false}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Target Modal Dialog */}
      {showModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="dg-modal-head">
              <h3>{modalMode === 'add' ? 'Create New Target' : 'Edit Target Details'}</h3>
              <button className="dg-btn" onClick={handleCancel}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Target Name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                    placeholder="Enter name"
                    value={modalForm.TargetName} 
                    onChange={e => handleFormChange('TargetName', e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Target Type <span style={{ color: 'var(--red)' }}>*</span></label>
                  <select 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none', background: 'var(--card)' }}
                    value={modalForm.TargetTypeID} 
                    onChange={e => handleFormChange('TargetTypeID', e.target.value)}
                  >
                    <option value="">Select type...</option>
                    {targetTypes.map(t => <option key={t.TargetTypeID} value={t.TargetTypeID}>{t.TargetTypeName}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Governorate <span style={{ color: 'var(--red)' }}>*</span></label>
                  <select 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none', background: 'var(--card)' }}
                    value={modalForm.Governorate} 
                    onChange={e => handleFormChange('Governorate', e.target.value)}
                  >
                    <option value="">Select governorate...</option>
                    {mockGovernorates.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Area <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                    placeholder="Enter area"
                    value={modalForm.Area} 
                    onChange={e => handleFormChange('Area', e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Contact Person</label>
                  <input 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                    placeholder="Contact name"
                    value={modalForm.ContactPerson} 
                    onChange={e => handleFormChange('ContactPerson', e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Mobile Number</label>
                  <input 
                    style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                    placeholder="Mobile number"
                    value={modalForm.MobileNumber} 
                    onChange={e => handleFormChange('MobileNumber', e.target.value)} 
                  />
                </div>

                {/* Conditional Fields */}
                {String(modalForm.TargetTypeID) === '1' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>ERP Customer No <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input 
                      style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                      type="number"
                      placeholder="ERP Number"
                      value={modalForm.RelatedCustomerID} 
                      onChange={e => handleFormChange('RelatedCustomerID', e.target.value)} 
                    />
                  </div>
                )}

                {String(modalForm.TargetTypeID) === '2' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Showroom ID <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input 
                      style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                      type="number"
                      placeholder="Showroom Number"
                      value={modalForm.RelatedCustomerID} 
                      onChange={e => handleFormChange('RelatedCustomerID', e.target.value)} 
                    />
                  </div>
                )}

                {String(modalForm.TargetTypeID) === '4' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '800', fontSize: '13px', color: 'var(--muted)' }}>Project ID <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input 
                      style={{ height: '40px', border: '1px solid var(--line)', borderRadius: '10px', padding: '0 12px', outline: 'none' }}
                      type="number"
                      placeholder="Project Number"
                      value={modalForm.RelatedProjectID} 
                      onChange={e => handleFormChange('RelatedProjectID', e.target.value)} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button className="dg-btn" onClick={handleCancel}>Cancel</button>
                <button className="dg-btn primary" onClick={handleSave}>Save Target</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
