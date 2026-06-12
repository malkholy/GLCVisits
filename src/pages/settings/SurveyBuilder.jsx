import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar'
import DataGrid from '../../components/DataGrid'
import Toast from '../../components/Toast'
import { 
  getSurveyTemplates, 
  getSurveyTemplateDetails, 
  saveSurveyTemplate, 
  deleteSurveyTemplate,
  getTargetTypes,
  getPurposes,
  getTeams
} from '../../shared/api'
import { API_URL } from '../../shared/constants'
import { Plus, Trash2, Save, FileText, ChevronLeft, Image, HelpCircle } from 'lucide-react'
import '../visits/Dashboard.css'

const builderCss = `
.sb-editor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
}

.sb-back-header {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  transition: opacity 0.2s;
  width: fit-content;
}

.sb-back-header:hover {
  opacity: 0.8;
}

.sb-section-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sb-grid-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.sb-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sb-field label {
  font-weight: 800;
  font-size: 13px;
  color: var(--muted);
}

.sb-input, .sb-select {
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  background: var(--card);
  color: var(--text);
  font-size: 13.5px;
  transition: border-color 0.2s;
}

.sb-input:focus, .sb-select:focus {
  border-color: var(--primary);
}

.sb-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--line);
  padding-bottom: 12px;
  margin-top: 10px;
}

.sb-groups-header h3 {
  margin: 0;
  font-weight: 900;
  font-size: 18px;
}

.sb-group-card {
  border: 2px dashed var(--line);
  border-radius: 18px;
  padding: 20px;
  background: var(--card);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  transition: all 0.2s;
}

.sb-group-card:hover {
  border-color: var(--primary);
}

.sb-group-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sb-questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.sb-question-card {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px;
  background: var(--soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sb-question-row1 {
  display: grid;
  grid-template-columns: 140px 1fr 140px 80px 40px;
  gap: 12px;
  align-items: center;
}

@media(max-width: 768px) {
  .sb-question-row1 {
    grid-template-columns: 1fr 1fr;
  }
}

.sb-options-box {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
}

.sb-options-title {
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sb-option-row {
  display: grid;
  grid-template-columns: 1fr 1fr 80px 40px;
  gap: 10px;
  align-items: center;
}

.sb-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--card);
  padding: 0 16px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.sb-btn:hover {
  background: var(--soft);
}

.sb-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
}

.sb-btn.primary:hover {
  opacity: 0.9;
}

.sb-btn.danger {
  background: rgba(220, 38, 38, 0.08);
  color: var(--red);
  border-color: rgba(220, 38, 38, 0.2);
}

.sb-btn.danger:hover {
  background: var(--red);
  color: white;
}

.sb-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.q-badge {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  width: fit-content;
}
`;

const mockTemplates = [
  { SurveyTemplateID: 1, SurveyCode: 'SHOWROOM_STANDARD', SurveyName: 'Showroom Standard Survey', TargetTypeID: 2, TargetTypeName: 'Showroom', PurposeID: null, PurposeName: '', UserTeam: '', IsActive: true }
]

const mockGroups = [
  { SurveyGroupID: 1, SurveyTemplateID: 1, GroupCode: 'DISPLAY', GroupName: 'Display', DisplayOrder: 1, IsActive: true },
  { SurveyGroupID: 2, SurveyTemplateID: 1, GroupCode: 'COMPETITOR', GroupName: 'Competitor', DisplayOrder: 2, IsActive: true }
]

const mockQuestions = [
  { QuestionID: 1, SurveyTemplateID: 1, SurveyGroupID: 1, GroupCode: 'DISPLAY', QuestionCode: 'DISPLAY_CLEAN', QuestionText: 'How would you rate the cleanliness of the product display?', QuestionType: 'SingleChoice', IsRequired: true, DisplayOrder: 1, IsActive: true },
  { QuestionID: 2, SurveyTemplateID: 1, SurveyGroupID: 1, GroupCode: 'DISPLAY', QuestionCode: 'COLOR_CARDS_AVAILABLE', QuestionText: 'Are all required color cards available?', QuestionType: 'SingleChoice', IsRequired: false, DisplayOrder: 2, IsActive: true },
  { QuestionID: 3, SurveyTemplateID: 1, SurveyGroupID: 2, GroupCode: 'COMPETITOR', QuestionCode: 'COMPETITOR_AVAILABLE', QuestionText: 'Are competitor products visible?', QuestionType: 'YesNo', IsRequired: true, DisplayOrder: 3, IsActive: true },
  { QuestionID: 4, SurveyTemplateID: 1, SurveyGroupID: 2, GroupCode: 'COMPETITOR', QuestionCode: 'COMPETITOR_PHOTO', QuestionText: 'Upload a photo of competitor shelf display', QuestionType: 'Photo', IsRequired: false, DisplayOrder: 4, IsActive: true }
]

const mockOptions = [
  { OptionID: 1, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Excellent', OptionValue: 'Excellent', DisplayOrder: 1, IsActive: true },
  { OptionID: 2, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Good', OptionValue: 'Good', DisplayOrder: 2, IsActive: true },
  { OptionID: 3, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Needs improvement', OptionValue: 'Needs improvement', DisplayOrder: 3, IsActive: true },
  { OptionID: 4, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'Yes', OptionValue: 'Yes', DisplayOrder: 1, IsActive: true },
  { OptionID: 5, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'No', OptionValue: 'No', DisplayOrder: 2, IsActive: true },
  { OptionID: 6, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'Partially', OptionValue: 'Partially', DisplayOrder: 3, IsActive: true }
]

export default function SurveyBuilder() {
  const [templates, setTemplates] = useState([])
  const [targetTypes, setTargetTypes] = useState([])
  const [purposes, setPurposes] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  
  // Navigation / Mode state: 'list' or 'edit'
  const [mode, setMode] = useState('list')
  const [saving, setSaving] = useState(false)

  // Builder Canvas states
  const [headerForm, setHeaderForm] = useState({
    SurveyTemplateID: '',
    SurveyCode: '',
    SurveyName: '',
    TargetTypeID: '',
    PurposeID: '',
    UserTeam: ''
  })
  const [groups, setGroups] = useState([])
  const [questions, setQuestions] = useState([])
  const [options, setOptions] = useState([])

  // Modal dialog states replacing prompt()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupForm, setGroupForm] = useState({ GroupCode: '', GroupName: '' })

  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [targetGroupForQ, setTargetGroupForQ] = useState('')
  const [questionCodeForm, setQuestionCodeForm] = useState('')

  const [showOptionModal, setShowOptionModal] = useState(false)
  const [targetQForOption, setTargetQForOption] = useState('')
  const [optionTextForm, setOptionTextForm] = useState('')

  // Inject CSS styles on mount
  useEffect(() => {
    if (!document.getElementById('survey-builder-css')) {
      const s = document.createElement('style')
      s.id = 'survey-builder-css'
      s.textContent = builderCss
      document.head.appendChild(s)
    }
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // Load dropdown items first
      let loadedTypes = []
      let loadedPurposes = []
      let loadedTeams = []

      if (API_URL) {
        try {
          const [tRes, pRes, mRes] = await Promise.all([getTargetTypes(), getPurposes(), getTeams()])
          if (tRes && tRes.isSuccess && tRes.list0) loadedTypes = tRes.list0
          if (pRes && pRes.isSuccess && pRes.list0) loadedPurposes = pRes.list0
          if (mRes && mRes.isSuccess && mRes.list0) loadedTeams = mRes.list0
        } catch (err) {
          console.error('Failed to load dynamic dropdown options:', err)
        }
      }
      setTargetTypes(loadedTypes)
      setPurposes(loadedPurposes)
      setTeams(loadedTeams)

      // Load templates
      if (!API_URL) {
        setTemplates(mockTemplates)
        return
      }

      const res = await getSurveyTemplates()
      if (res && res.isSuccess) {
        setTemplates(res.list0 && res.list0.length > 0 ? res.list0 : mockTemplates)
      } else {
        setTemplates(mockTemplates)
      }
    } catch (err) {
      console.error(err)
      setTemplates(mockTemplates)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const columns = [
    { key: 'SurveyCode', label: 'Survey Code', render: (val) => <strong>{val}</strong> },
    { key: 'SurveyName', label: 'Survey Name' },
    { key: 'TargetTypeName', label: 'Target Type', render: (val) => val || <span className="mono" style={{ opacity: 0.5 }}>Any</span> },
    { key: 'PurposeName', label: 'Visit Purpose', render: (val) => val || <span className="mono" style={{ opacity: 0.5 }}>Any</span> },
    { key: 'UserTeam', label: 'Sales Team', render: (val) => val || <span className="mono" style={{ opacity: 0.5 }}>Any</span> },
  ]

  const handleAdd = () => {
    setHeaderForm({
      SurveyTemplateID: '',
      SurveyCode: '',
      SurveyName: '',
      TargetTypeID: '',
      PurposeID: '',
      UserTeam: ''
    })
    setGroups([])
    setQuestions([])
    setOptions([])
    setMode('edit')
  }

  const handleEdit = async (row) => {
    setLoading(true)
    try {
      if (!API_URL) {
        // Mock load
        setHeaderForm({
          SurveyTemplateID: row.SurveyTemplateID,
          SurveyCode: row.SurveyCode,
          SurveyName: row.SurveyName,
          TargetTypeID: row.TargetTypeID ? String(row.TargetTypeID) : '',
          PurposeID: row.PurposeID ? String(row.PurposeID) : '',
          UserTeam: row.UserTeam || ''
        })
        setGroups(mockGroups.filter(g => g.SurveyTemplateID === row.SurveyTemplateID))
        setQuestions(mockQuestions.filter(q => q.SurveyTemplateID === row.SurveyTemplateID))
        setOptions(mockOptions.filter(o => mockQuestions.some(q => q.QuestionID === o.QuestionID && q.SurveyTemplateID === row.SurveyTemplateID)))
        setMode('edit')
        return
      }

      const res = await getSurveyTemplateDetails(row.SurveyTemplateID)
      if (res && res.isSuccess) {
        const header = res.list0 && res.list0[0] ? res.list0[0] : row
        setHeaderForm({
          SurveyTemplateID: header.SurveyTemplateID,
          SurveyCode: header.SurveyCode || '',
          SurveyName: header.SurveyName || '',
          TargetTypeID: header.TargetTypeID ? String(header.TargetTypeID) : '',
          PurposeID: header.PurposeID ? String(header.PurposeID) : '',
          UserTeam: header.UserTeam || ''
        })
        setGroups(res.list1 || [])
        setQuestions(res.list2 || [])
        setOptions(res.list3 || [])
        setMode('edit')
      } else {
        setToast(`Error: ${res.message}`)
      }
    } catch (err) {
      setToast(`Failed to load details: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) return
    const names = selectedRows.map(r => r.SurveyName).join(', ')
    if (!window.confirm(`Are you sure you want to delete survey template(s): ${names}?`)) return

    if (!API_URL) {
      const ids = new Set(selectedRows.map(r => r.SurveyTemplateID))
      setTemplates(prev => prev.filter(t => !ids.has(t.SurveyTemplateID)))
      setToast('Survey Template(s) deleted (mock)')
    } else {
      const deletePromises = selectedRows.map(row => deleteSurveyTemplate(row.SurveyTemplateID))
      Promise.all(deletePromises).then(results => {
        const failed = results.filter(res => !res.isSuccess)
        if (failed.length === 0) {
          setToast('Survey Template(s) deleted successfully')
          loadTemplates()
        } else {
          setToast(`Error: ${failed[0].message}`)
        }
      }).catch(err => {
        setToast(`Delete failed: ${err.message}`)
      })
    }
  }

  // --- Group Actions ---
  const openGroupModal = () => {
    setGroupForm({ GroupCode: '', GroupName: '' })
    setShowGroupModal(true)
  }

  const handleConfirmAddGroup = () => {
    const code = groupForm.GroupCode.trim().toUpperCase()
    const name = groupForm.GroupName.trim()
    if (!code) {
      alert('Group code is required')
      return
    }
    if (groups.some(g => g.GroupCode === code)) {
      alert('Group code must be unique!')
      return
    }
    if (!name) {
      alert('Group name is required')
      return
    }

    const newGroup = {
      SurveyGroupID: '',
      GroupCode: code,
      GroupName: name,
      DisplayOrder: groups.length + 1
    }
    setGroups(prev => [...prev, newGroup])
    setShowGroupModal(false)
  }

  const removeGroup = (groupCode) => {
    if (!window.confirm(`Are you sure you want to delete group: ${groupCode}? All questions inside this group will be deleted.`)) return
    setGroups(prev => prev.filter(g => g.GroupCode !== groupCode))
    setQuestions(prev => prev.filter(q => q.GroupCode !== groupCode))
  }

  // --- Question Actions ---
  const openQuestionModal = (groupCode) => {
    setTargetGroupForQ(groupCode)
    setQuestionCodeForm('')
    setShowQuestionModal(true)
  }

  const handleConfirmAddQuestion = () => {
    const code = questionCodeForm.trim().toUpperCase()
    if (!code) {
      alert('Question code is required')
      return
    }
    if (questions.some(q => q.QuestionCode === code)) {
      alert('Question code must be unique!')
      return
    }

    const newQ = {
      QuestionID: '',
      QuestionCode: code,
      GroupCode: targetGroupForQ,
      QuestionText: 'New Question Text',
      QuestionType: 'Text',
      IsRequired: false,
      DisplayOrder: questions.filter(q => q.GroupCode === targetGroupForQ).length + 1
    }
    setQuestions(prev => [...prev, newQ])
    setShowQuestionModal(false)
  }

  const removeQuestion = (qCode) => {
    setQuestions(prev => prev.filter(q => q.QuestionCode !== qCode))
    setOptions(prev => prev.filter(o => o.QuestionCode !== qCode))
  }

  const updateQuestionField = (qCode, key, val) => {
    setQuestions(prev => prev.map(q => q.QuestionCode === qCode ? { ...q, [key]: val } : q))
  }

  // --- Option Actions ---
  const openOptionModal = (qCode) => {
    setTargetQForOption(qCode)
    setOptionTextForm('')
    setShowOptionModal(true)
  }

  const handleConfirmAddOption = () => {
    const text = optionTextForm.trim()
    if (!text) {
      alert('Option text is required')
      return
    }

    const count = options.filter(o => o.QuestionCode === targetQForOption).length
    const newOpt = {
      OptionID: '',
      QuestionCode: targetQForOption,
      OptionText: text,
      OptionValue: text,
      DisplayOrder: count + 1
    }
    setOptions(prev => [...prev, newOpt])
    setShowOptionModal(false)
  }

  const removeOption = (qCode, text) => {
    setOptions(prev => prev.filter(o => !(o.QuestionCode === qCode && o.OptionText === text)))
  }

  const updateOptionText = (qCode, oldText, newText) => {
    setOptions(prev => prev.map(o => (o.QuestionCode === qCode && o.OptionText === oldText) ? { ...o, OptionText: newText, OptionValue: newText } : o))
  }

  // --- Save Survey ---
  const handleSave = () => {
    // Basic Validations
    if (!headerForm.SurveyCode.trim()) {
      setToast('Survey Code is required')
      return
    }
    if (!headerForm.SurveyName.trim()) {
      setToast('Survey Name is required')
      return
    }
    if (groups.length === 0) {
      setToast('Please add at least one group')
      return
    }

    // Question option validations
    for (let q of questions) {
      if (q.QuestionType === 'SingleChoice' || q.QuestionType === 'MultipleChoice') {
        const opts = options.filter(o => o.QuestionCode === q.QuestionCode)
        if (opts.length === 0) {
          setToast(`Please add at least one option for choice question: ${q.QuestionCode}`)
          return
        }
      }
    }

    const payload = {
      SurveyTemplateID: headerForm.SurveyTemplateID ? Number(headerForm.SurveyTemplateID) : null,
      SurveyCode: headerForm.SurveyCode.trim(),
      SurveyName: headerForm.SurveyName.trim(),
      TargetTypeID: headerForm.TargetTypeID ? Number(headerForm.TargetTypeID) : null,
      PurposeID: headerForm.PurposeID ? Number(headerForm.PurposeID) : null,
      UserTeam: headerForm.UserTeam || null,
      Groups: groups.map(g => ({
        GroupCode: g.GroupCode,
        GroupName: g.GroupName,
        DisplayOrder: Number(g.DisplayOrder)
      })),
      Questions: questions.map(q => ({
        QuestionCode: q.QuestionCode,
        GroupCode: q.GroupCode,
        QuestionText: q.QuestionText.trim(),
        QuestionType: q.QuestionType,
        IsRequired: Boolean(q.IsRequired),
        DisplayOrder: Number(q.DisplayOrder)
      })),
      Options: options.map(o => ({
        QuestionCode: o.QuestionCode,
        OptionText: o.OptionText,
        OptionValue: o.OptionValue,
        DisplayOrder: Number(o.DisplayOrder)
      }))
    }

    setSaving(true)
    if (!API_URL) {
      // Mock Save
      const templateId = headerForm.SurveyTemplateID || 1
      const mappedHeader = {
        ...payload,
        SurveyTemplateID: templateId,
        TargetTypeName: targetTypes.find(t => String(t.TargetTypeID) === String(payload.TargetTypeID))?.TargetTypeName || '',
        PurposeName: purposes.find(p => String(p.PurposeID) === String(payload.PurposeID))?.PurposeName || ''
      }
      
      if (headerForm.SurveyTemplateID) {
        setTemplates(prev => prev.map(t => t.SurveyTemplateID === templateId ? mappedHeader : t))
      } else {
        setTemplates(prev => [...prev, mappedHeader])
      }
      setToast('Survey Template saved successfully (mock)')
      setMode('list')
      setSaving(false)
    } else {
      saveSurveyTemplate(payload).then(res => {
        if (res.isSuccess) {
          setToast('Survey template created/saved successfully')
          setMode('list')
          loadTemplates()
        } else {
          setToast(`Error: ${res.message}`)
        }
      }).catch(err => {
        setToast(`Failed to save survey: ${err.message}`)
      }).finally(() => {
        setSaving(false)
      })
    }
  }

  return (
    <>
      <Topbar title="Survey Builder" subtitle="Create and modify visual inspection checklist templates" />
      
      <div className="page-content">
        {mode === 'list' ? (
          <DataGrid
            title="Survey Templates"
            hideHeader={true}
            columns={columns}
            rows={templates}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={loadTemplates}
          />
        ) : (
          <div className="sb-editor-container">
            <div className="sb-back-header" onClick={() => setMode('list')}>
              <ChevronLeft size={16} />
              Back to templates list
            </div>

            {/* Template Header Configurations */}
            <div className="sb-section-card">
              <h4 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                Template Header Configuration
              </h4>
              
              <div className="sb-grid-fields">
                <div className="sb-field">
                  <label>Survey Code <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input 
                    className="sb-input"
                    placeholder="e.g. SHOWROOM_AUDIT"
                    value={headerForm.SurveyCode}
                    onChange={e => setHeaderForm(f => ({ ...f, SurveyCode: e.target.value }))}
                  />
                </div>
                <div className="sb-field" style={{ flex: 2 }}>
                  <label>Survey Name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input 
                    className="sb-input"
                    placeholder="e.g. Showroom Audit & Standard Check"
                    value={headerForm.SurveyName}
                    onChange={e => setHeaderForm(f => ({ ...f, SurveyName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="sb-grid-fields">
                <div className="sb-field">
                  <label>Target Type Mapping</label>
                  <select 
                    className="sb-select"
                    value={headerForm.TargetTypeID}
                    onChange={e => setHeaderForm(f => ({ ...f, TargetTypeID: e.target.value }))}
                  >
                    <option value="">-- Apply to All Target Types --</option>
                    {targetTypes.map(t => (
                      <option key={t.TargetTypeID} value={t.TargetTypeID}>{t.TargetTypeName}</option>
                    ))}
                  </select>
                </div>
                <div className="sb-field">
                  <label>Visit Purpose Mapping</label>
                  <select 
                    className="sb-select"
                    value={headerForm.PurposeID}
                    onChange={e => setHeaderForm(f => ({ ...f, PurposeID: e.target.value }))}
                  >
                    <option value="">-- Apply to All Purposes --</option>
                    {purposes.map(p => (
                      <option key={p.PurposeID} value={p.PurposeID}>{p.PurposeName}</option>
                    ))}
                  </select>
                </div>
                <div className="sb-field">
                  <label>Sales Team Mapping</label>
                  <select 
                    className="sb-select"
                    value={headerForm.UserTeam}
                    onChange={e => setHeaderForm(f => ({ ...f, UserTeam: e.target.value }))}
                  >
                    <option value="">-- Apply to All Teams --</option>
                    {teams.map(t => (
                      <option key={t.TeamID} value={t.TeamName}>{t.TeamName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Template Groups and Questions */}
            <div className="sb-section-card">
              <div className="sb-groups-header">
                <h3>Survey Sections & Questions</h3>
                <button className="sb-btn primary" onClick={openGroupModal}>
                  <Plus size={16} />
                  Add Section Group
                </button>
              </div>

              {groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                  No sections defined yet. Add a section group to start creating questions!
                </div>
              ) : (
                groups
                  .sort((a,b) => a.DisplayOrder - b.DisplayOrder)
                  .map(g => (
                    <div key={g.GroupCode} className="sb-group-card">
                      <div className="sb-group-top">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span className="q-badge" style={{ background: 'var(--soft)', color: 'var(--text)' }}>
                            Code: {g.GroupCode}
                          </span>
                          <input 
                            className="sb-input" 
                            style={{ height: '34px', fontWeight: '800', fontSize: '14px', width: '220px' }}
                            value={g.GroupName} 
                            onChange={e => setGroups(prev => prev.map(x => x.GroupCode === g.GroupCode ? { ...x, GroupName: e.target.value } : x))}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '800' }}>Order:</label>
                            <input 
                              type="number"
                              className="sb-input"
                              style={{ width: '60px', height: '32px', padding: '0 6px' }}
                              value={g.DisplayOrder}
                              onChange={e => setGroups(prev => prev.map(x => x.GroupCode === g.GroupCode ? { ...x, DisplayOrder: Number(e.target.value) } : x))}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="sb-btn" onClick={() => openQuestionModal(g.GroupCode)}>
                            <Plus size={14} />
                            Add Question
                          </button>
                          <button className="sb-btn danger" onClick={() => removeGroup(g.GroupCode)}>
                            <Trash2 size={14} />
                            Delete Section
                          </button>
                        </div>
                      </div>

                      {/* Questions List Inside This Group */}
                      <div className="sb-questions-list">
                        {questions.filter(q => q.GroupCode === g.GroupCode).length === 0 ? (
                          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontStyle: 'italic', paddingLeft: '10px' }}>
                            No questions in this section yet. Click "Add Question" above.
                          </div>
                        ) : (
                          questions
                            .filter(q => q.GroupCode === g.GroupCode)
                            .sort((a,b) => a.DisplayOrder - b.DisplayOrder)
                            .map(q => {
                              const needsOptions = q.QuestionType === 'SingleChoice' || q.QuestionType === 'MultipleChoice'
                              return (
                                <div key={q.QuestionCode} className="sb-question-card">
                                  <div className="sb-question-row1">
                                    <div className="sb-field">
                                      <span className="q-badge">Code: {q.QuestionCode}</span>
                                    </div>
                                    <div className="sb-field">
                                      <input 
                                        className="sb-input" 
                                        style={{ height: '36px' }}
                                        value={q.QuestionText}
                                        onChange={e => updateQuestionField(q.QuestionCode, 'QuestionText', e.target.value)}
                                      />
                                    </div>
                                    <div className="sb-field">
                                      <select 
                                        className="sb-select"
                                        style={{ height: '36px' }}
                                        value={q.QuestionType}
                                        onChange={e => updateQuestionField(q.QuestionCode, 'QuestionType', e.target.value)}
                                      >
                                        <option value="Text">Open Text</option>
                                        <option value="Number">Number</option>
                                        <option value="YesNo">Yes / No</option>
                                        <option value="SingleChoice">Single Choice</option>
                                        <option value="MultipleChoice">Multiple Choice</option>
                                        <option value="Photo">Photo Upload</option>
                                      </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                      <label className="sb-checkbox-label">
                                        <input 
                                          type="checkbox" 
                                          checked={q.IsRequired}
                                          onChange={e => updateQuestionField(q.QuestionCode, 'IsRequired', e.target.checked)}
                                        />
                                        Required
                                      </label>
                                    </div>
                                    <button 
                                      className="sb-btn danger" 
                                      style={{ width: '36px', height: '36px', padding: 0 }}
                                      onClick={() => removeQuestion(q.QuestionCode)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  {/* Rendering Photo Visual indicator inside builder */}
                                  {q.QuestionType === 'Photo' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--line)', marginLeft: '20px', width: 'fit-content' }}>
                                      <Image size={15} style={{ color: 'var(--muted)' }} />
                                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                        Salesperson UI renders camera upload controls.
                                      </span>
                                    </div>
                                  )}

                                  {/* Options Configuration for Choices */}
                                  {needsOptions && (
                                    <div className="sb-options-box">
                                      <div className="sb-options-title">
                                        <span>Choice Options List</span>
                                        <button className="sb-btn" style={{ height: '24px', padding: '0 8px', fontSize: '11px' }} onClick={() => openOptionModal(q.QuestionCode)}>
                                          + Add Option
                                        </button>
                                      </div>
                                      
                                      {options.filter(o => o.QuestionCode === q.QuestionCode).length === 0 ? (
                                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                          No options created yet. Single choice questions require options.
                                        </span>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {options
                                            .filter(o => o.QuestionCode === q.QuestionCode)
                                            .sort((a,b) => a.DisplayOrder - b.DisplayOrder)
                                            .map((o, idx) => (
                                              <div key={idx} className="sb-option-row">
                                                <input 
                                                  className="sb-input"
                                                  style={{ height: '30px', fontSize: '12px' }}
                                                  value={o.OptionText}
                                                  onChange={e => updateOptionText(q.QuestionCode, o.OptionText, e.target.value)}
                                                />
                                                <input 
                                                  className="sb-input"
                                                  style={{ height: '30px', fontSize: '12px' }}
                                                  value={o.OptionValue}
                                                  disabled={true}
                                                  placeholder="Value matches option text"
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <label style={{ fontSize: '10px', color: 'var(--muted)' }}>Order:</label>
                                                  <input 
                                                    type="number"
                                                    className="sb-input"
                                                    style={{ width: '45px', height: '28px', padding: '0 4px', fontSize: '11px' }}
                                                    value={o.DisplayOrder}
                                                    onChange={e => setOptions(prev => prev.map(x => (x.QuestionCode === q.QuestionCode && x.OptionText === o.OptionText) ? { ...x, DisplayOrder: Number(e.target.value) } : x))}
                                                  />
                                                </div>
                                                <button 
                                                  className="sb-btn danger"
                                                  style={{ width: '28px', height: '28px', padding: 0 }}
                                                  onClick={() => removeOption(q.QuestionCode, o.OptionText)}
                                                >
                                                  <Trash2 size={11} />
                                                </button>
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', paddingBottom: '30px' }}>
              <button className="sb-btn" onClick={() => setMode('list')}>Cancel</button>
              <button className="sb-btn primary" disabled={saving} onClick={handleSave}>
                <Save size={16} />
                Save Survey Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Modal for Adding Group */}
      {showGroupModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="dg-modal-head">
              <h3>Add Section Group</h3>
              <button className="dg-btn" style={{ height: '32px', width: '32px', padding: 0 }} onClick={() => setShowGroupModal(false)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="sb-field">
                <label>Group Code <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  className="sb-input" 
                  placeholder="e.g. VISUAL_CHECK"
                  value={groupForm.GroupCode}
                  onChange={e => setGroupForm(f => ({ ...f, GroupCode: e.target.value }))}
                />
              </div>
              <div className="sb-field">
                <label>Group Name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  className="sb-input" 
                  placeholder="e.g. Visual Inspection"
                  value={groupForm.GroupName}
                  onChange={e => setGroupForm(f => ({ ...f, GroupName: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button className="sb-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
                <button className="sb-btn primary" onClick={handleConfirmAddGroup}>Add Group</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal for Adding Question */}
      {showQuestionModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="dg-modal-head">
              <h3>Add Question</h3>
              <button className="dg-btn" style={{ height: '32px', width: '32px', padding: 0 }} onClick={() => setShowQuestionModal(false)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="sb-field">
                <label>Question Code <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  className="sb-input" 
                  placeholder="e.g. DISPLAY_CLEAN"
                  value={questionCodeForm}
                  onChange={e => setQuestionCodeForm(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button className="sb-btn" onClick={() => setShowQuestionModal(false)}>Cancel</button>
                <button className="sb-btn primary" onClick={handleConfirmAddQuestion}>Add Question</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal for Adding Option */}
      {showOptionModal && (
        <div className="dg-modal show">
          <div className="dg-modal-box" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="dg-modal-head">
              <h3>Add Choice Option</h3>
              <button className="dg-btn" style={{ height: '32px', width: '32px', padding: 0 }} onClick={() => setShowOptionModal(false)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="sb-field">
                <label>Option Text <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  className="sb-input" 
                  placeholder="e.g. Excellent"
                  value={optionTextForm}
                  onChange={e => setOptionTextForm(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button className="sb-btn" onClick={() => setShowOptionModal(false)}>Cancel</button>
                <button className="sb-btn primary" onClick={handleConfirmAddOption}>Add Option</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
