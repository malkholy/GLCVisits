import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockTargetTypes, mockGovernorates } from '../../mock/mockData'
import { getTargetTypes, getPurposes, getTargets, getSalespersons, addVisit } from '../../shared/api'
import Topbar from '../../components/Topbar'
import Toast from '../../components/Toast'
import SearchDropdown from '../../components/SearchDropdown'
import '../../components/Buttons.css'
import './VisitForm.css'

const PURPOSES = [
  'Sales Follow-up','Collection Follow-up','Display Inspection',
  'Competitor Information','Merchant Survey','Project Follow-up',
  'Event Visit','New Prospect',
]

const fallbackTargets = {
  1: [ // ERP Customers
    { TargetID: 10, TargetName: 'Al Madina Paint Center (Mock)', Governorate: 'Cairo', Area: 'Nasr City' },
    { TargetID: 11, TargetName: 'City Paints (Mock)', Governorate: 'Giza', Area: 'Dokki' },
  ],
  2: [ // Showrooms
    { TargetID: 20, TargetName: 'Delta Showroom (Mock)', Governorate: 'Cairo', Area: 'Heliopolis' },
    { TargetID: 21, TargetName: 'Elite Showroom (Mock)', Governorate: 'Alexandria', Area: 'Smouha' },
  ],
  3: [ // Prospects
    { TargetID: 30, TargetName: 'Future Paint Prospect (Mock)', Governorate: 'Cairo', Area: 'Maadi' },
  ],
  4: [ // Projects
    { TargetID: 40, TargetName: 'New Capital Project (Mock)', Governorate: 'Cairo', Area: 'New Cairo' },
  ],
  5: [ // Events
    { TargetID: 50, TargetName: 'Annual Painter Event (Mock)', Governorate: 'Giza', Area: '6th of October' },
  ]
}

export default function VisitNew() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [targetTypes, setTargetTypes] = useState([])
  const [purposes, setPurposes] = useState([])
  const [targets, setTargets] = useState([])
  const [salespersons, setSalespersons] = useState([])
  const [loadingTargets, setLoadingTargets] = useState(false)
  const [form, setForm] = useState({
    VisitDate: '', TargetID: '', TargetTypeID: '',
    PurposeID: '', SalespersonID: '', Governorate: '', PlannedNotes: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Load target types, purposes, salespersons on mount
  useEffect(() => {
    getTargetTypes().then(res => {
      if (res.isSuccess && res.list0 && res.list0.length > 0) {
        setTargetTypes(res.list0)
      } else {
        setTargetTypes(mockTargetTypes)
      }
    }).catch(() => {
      setTargetTypes(mockTargetTypes)
    })

    getPurposes().then(res => {
      if (res.isSuccess && res.list0 && res.list0.length > 0) {
        setPurposes(res.list0)
      } else {
        setPurposes(PURPOSES.map((p, i) => ({ PurposeID: i + 1, PurposeName: p })))
      }
    }).catch(() => {
      setPurposes(PURPOSES.map((p, i) => ({ PurposeID: i + 1, PurposeName: p })))
    })

    getSalespersons().then(res => {
      if (res.isSuccess && res.list0 && res.list0.length > 0) {
        setSalespersons(res.list0)
      } else {
        setSalespersons([
          { SalespersonID: 1, SalespersonName: 'Omar Samir', UserTeam: 'Sales Team A' },
          { SalespersonID: 2, SalespersonName: 'Mohammad Ali', UserTeam: 'Sales Team B' },
          { SalespersonID: 3, SalespersonName: 'Ahmad Hassan', UserTeam: 'Sales Team B' }
        ])
      }
    }).catch(() => {
      setSalespersons([
        { SalespersonID: 1, SalespersonName: 'Omar Samir', UserTeam: 'Sales Team A' },
        { SalespersonID: 2, SalespersonName: 'Mohammad Ali', UserTeam: 'Sales Team B' },
        { SalespersonID: 3, SalespersonName: 'Ahmad Hassan', UserTeam: 'Sales Team B' }
      ])
    })
  }, [])

  // Load targets dynamically when TargetTypeID changes
  useEffect(() => {
    if (!form.TargetTypeID) {
      queueMicrotask(() => {
        setTargets([])
        set('TargetID', '')
      })
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingTargets(true)
    getTargets(form.TargetTypeID).then(res => {
      if (res.isSuccess && res.list0 && res.list0.length > 0) {
        setTargets(res.list0)
      } else {
        setTargets(fallbackTargets[form.TargetTypeID] || [])
      }
    }).catch(() => {
      setTargets(fallbackTargets[form.TargetTypeID] || [])
    }).finally(() => {
      setLoadingTargets(false)
    })
  }, [form.TargetTypeID])

  const handleTargetChange = (targetId) => {
    set('TargetID', targetId)
  }

  const save = () => {
    if (!form.VisitDate || !form.TargetTypeID || !form.TargetID || !form.PurposeID || !form.SalespersonID) {
      setToast('Please fill all required fields'); return
    }

    const sp = salespersons.find(s => String(s.SalespersonID) === String(form.SalespersonID))
    const payload = {
      VisitDate: form.VisitDate,
      TargetID: Number(form.TargetID),
      TargetTypeID: Number(form.TargetTypeID),
      PurposeID: Number(form.PurposeID),
      SalespersonID: Number(form.SalespersonID),
      ManagerID: null,
      UserTeam: sp ? sp.UserTeam : 'Sales Team A',
      PlannedNotes: form.PlannedNotes,
    }

    addVisit(payload).then(res => {
      if (res.isSuccess) {
        setToast(`Visit created successfully: ${res.message || 'Success'}`)
        setTimeout(() => navigate('/visits'), 1000)
      } else {
        setToast(`Error: ${res.message}`)
      }
    }).catch(err => {
      setToast(`Failed to connect to API: ${err.message}`)
    })
  }

  // Filter targets based on selected Target Type AND Governorate
  const filteredTargets = targets.filter(t => 
    String(t.TargetTypeID) === String(form.TargetTypeID) &&
    (!form.Governorate || String(t.Governorate).trim().toLowerCase() === String(form.Governorate).trim().toLowerCase())
  )

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
              <SearchDropdown
                value={form.TargetTypeID}
                onChange={val => set('TargetTypeID', val)}
                options={targetTypes.map(t => ({ value: String(t.TargetTypeID), label: t.TargetTypeName }))}
                placeholder="Select Target Type..."
              />
            </div>
            <div className="field">
              <label>Governorate <span className="req">*</span></label>
              <SearchDropdown
                value={form.Governorate}
                onChange={val => set('Governorate', val)}
                options={mockGovernorates.map(g => ({ value: g, label: g }))}
                placeholder="Select Governorate..."
              />
            </div>
            <div className="field">
              <label>Target <span className="req">*</span></label>
              <SearchDropdown
                value={form.TargetID}
                onChange={val => handleTargetChange(val)}
                options={filteredTargets.map(t => ({ value: String(t.TargetID), label: t.TargetName }))}
                placeholder={
                  !form.TargetTypeID 
                    ? 'Select Target Type first...' 
                    : !form.Governorate 
                      ? 'Select Governorate first...' 
                      : loadingTargets 
                        ? 'Loading targets...' 
                        : filteredTargets.length === 0 
                          ? 'No targets found in this Governorate' 
                          : 'Select Target...'
                }
                disabled={!form.TargetTypeID || !form.Governorate || filteredTargets.length === 0}
              />
            </div>
            <div className="field">
              <label>Purpose <span className="req">*</span></label>
              <SearchDropdown
                value={form.PurposeID}
                onChange={val => set('PurposeID', val)}
                options={purposes.map(p => ({ value: String(p.PurposeID), label: p.PurposeName }))}
                placeholder="Select Purpose..."
              />
            </div>
            <div className="field">
              <label>Salesperson <span className="req">*</span></label>
              <SearchDropdown
                value={form.SalespersonID}
                onChange={val => set('SalespersonID', val)}
                options={salespersons.map(s => ({ value: String(s.SalespersonID), label: s.SalespersonName }))}
                placeholder="Select Salesperson..."
              />
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
