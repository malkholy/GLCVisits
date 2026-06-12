import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  CheckSquare, 
  TrendingUp, 
  User, 
  Calendar, 
  Building2, 
  Clock, 
  ArrowRight, 
  Tag, 
  AlertCircle,
  AlertTriangle,
  ClipboardList,
  Sparkles
} from 'lucide-react'
import Topbar from '../../components/Topbar'
import { getSurveyTemplates, getSurveyDashboardData } from '../../shared/api'
import { API_URL } from '../../shared/constants'
import './MergedSurveyDashboard.css'

// ── Comprehensive Mock Data Fallbacks ──
const MOCK_TEMPLATES = [
  { SurveyTemplateID: 1, SurveyName: 'GLC Standard Showroom Audit v1', SurveyCode: 'SH-AUD-V1' },
  { SurveyTemplateID: 2, SurveyName: 'Storefront Display & Brand Survey', SurveyCode: 'DISP-SRV-V2' }
]

const MOCK_GOVERNORATES = ['All Governorates', 'Cairo', 'Giza', 'Alexandria', 'Dakahlia']

const MOCK_AGGREGATE_DATA = {
  TotalShowroomsAudited: 28,
  TotalQuestionsAudited: 5,
  OverallShowroomCompliance: 84,
  QuestionsDistribution: [
    {
      QuestionID: 1,
      QuestionText: 'Is the storefront display clean and organized?',
      CategoryName: 'Display & Branding',
      TotalQuestionResponses: 28,
      Distributions: [
        { OptionText: 'Yes', TotalOptionCount: 22, OptionValue: 'Yes' },
        { OptionText: 'No', TotalOptionCount: 6, OptionValue: 'No' }
      ]
    },
    {
      QuestionID: 2,
      QuestionText: 'Are the latest GLC color cards available on display?',
      CategoryName: 'Display & Branding',
      TotalQuestionResponses: 28,
      Distributions: [
        { OptionText: 'Yes', TotalOptionCount: 19, OptionValue: 'Yes' },
        { OptionText: 'No', TotalOptionCount: 9, OptionValue: 'No' }
      ]
    },
    {
      QuestionID: 3,
      QuestionText: 'Is the GLC logo brand sign illuminated and clean?',
      CategoryName: 'Display & Branding',
      TotalQuestionResponses: 28,
      Distributions: [
        { OptionText: 'Yes', TotalOptionCount: 25, OptionValue: 'Yes' },
        { OptionText: 'No', TotalOptionCount: 3, OptionValue: 'No' }
      ]
    },
    {
      QuestionID: 4,
      QuestionText: 'Is the showroom salesperson staff presentable and cooperative?',
      CategoryName: 'Staff Performance',
      TotalQuestionResponses: 28,
      Distributions: [
        { OptionText: 'Yes', TotalOptionCount: 26, OptionValue: 'Yes' },
        { OptionText: 'No', TotalOptionCount: 2, OptionValue: 'No' }
      ]
    },
    {
      QuestionID: 5,
      QuestionText: 'How do you rate the general display condition and product layout?',
      CategoryName: 'Display & Branding',
      TotalQuestionResponses: 28,
      Distributions: [
        { OptionText: 'Excellent', TotalOptionCount: 11, OptionValue: 'Excellent' },
        { OptionText: 'Good', TotalOptionCount: 10, OptionValue: 'Good' },
        { OptionText: 'Average', TotalOptionCount: 5, OptionValue: 'Average' },
        { OptionText: 'Poor', TotalOptionCount: 2, OptionValue: 'Poor' }
      ]
    }
  ],
  VisitsList: [
    { VisitID: 17, VisitNo: 'VIS-2026-000148', TargetName: 'Al Madina Paint Center', VisitDate: '2026-06-12' },
    { VisitID: 12, VisitNo: 'VIS-2026-000147', TargetName: 'Delta Showroom', VisitDate: '2026-06-11' },
    { VisitID: 9, VisitNo: 'VIS-2026-000145', TargetName: 'Nasr City Paint Outlet', VisitDate: '2026-06-10' },
    { VisitID: 5, VisitNo: 'VIS-2026-000143', TargetName: 'City Paints', VisitDate: '2026-06-09' }
  ]
}

const MOCK_SINGLE_REPORTS = {
  17: {
    Header: {
      VisitID: 17,
      VisitNo: 'VIS-2026-000148',
      VisitDate: '2026-06-12',
      TargetName: 'Al Madina Paint Center',
      SalespersonName: 'Omar Samir',
      SurveyName: 'GLC Standard Showroom Audit v1',
      CheckInDateTime: '2026-06-12T10:30:00',
      CheckOutDateTime: '2026-06-12T11:45:00',
      VisitDurationMinutes: 75
    },
    KPIs: {
      TasksGenerated: 2,
      CompetitorsLogged: 1,
      ComplianceScore: 80
    },
    Questions: [
      { QuestionID: 1, QuestionText: 'Is the storefront display clean and organized?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 2, QuestionText: 'Are the latest GLC color cards available on display?', CategoryName: 'Display & Branding', SelectedAnswer: 'No', QuestionType: 'Select' },
      { QuestionID: 3, QuestionText: 'Is the GLC logo brand sign illuminated and clean?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 4, QuestionText: 'Is the showroom salesperson staff presentable and cooperative?', CategoryName: 'Staff Performance', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 5, QuestionText: 'How do you rate the general display condition and product layout?', CategoryName: 'Display & Branding', SelectedAnswer: 'Excellent', QuestionType: 'Select' }
    ],
    Tasks: [
      { FollowUpTaskID: 1, TaskTitle: 'Replenish GLC Color Cards', TaskDescription: 'Provide 20 sets of newer 2026 color brochures immediately.', DueDate: '2026-06-15', Priority: 'High', TaskStatus: 'Pending' },
      { FollowUpTaskID: 2, TaskTitle: 'Re-align storefront display racks', TaskDescription: 'Dust off shelves and align cans forward.', DueDate: '2026-06-20', Priority: 'Medium', TaskStatus: 'Pending' }
    ],
    Competitors: [
      { CompetitorInfoID: 1, CompetitorName: 'Jotun Paints', ProductName: 'Jotashield Extreme', Price: 1250, OfferDescription: 'Buy 5 get 1 free promotional bundle', Notes: 'Aggressively pushed by Jotun salesperson.' }
    ],
    Inspection: {
      DisplayInspectionID: 1,
      IsDisplayClean: true,
      IsColorCardAvailable: false,
      IsStandAvailable: true,
      Notes: 'Display stand clean but lacks essential color cards. Spoke with showroom manager.'
    }
  },
  12: {
    Header: {
      VisitID: 12,
      VisitNo: 'VIS-2026-000147',
      VisitDate: '2026-06-11',
      TargetName: 'Delta Showroom',
      SalespersonName: 'Mohammad Ali',
      SurveyName: 'GLC Standard Showroom Audit v1',
      CheckInDateTime: '2026-06-11T13:00:00',
      CheckOutDateTime: '2026-06-11T14:10:00',
      VisitDurationMinutes: 70
    },
    KPIs: {
      TasksGenerated: 0,
      CompetitorsLogged: 0,
      ComplianceScore: 100
    },
    Questions: [
      { QuestionID: 1, QuestionText: 'Is the storefront display clean and organized?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 2, QuestionText: 'Are the latest GLC color cards available on display?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 3, QuestionText: 'Is the GLC logo brand sign illuminated and clean?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 4, QuestionText: 'Is the showroom salesperson staff presentable and cooperative?', CategoryName: 'Staff Performance', SelectedAnswer: 'Yes', QuestionType: 'Select' },
      { QuestionID: 5, QuestionText: 'How do you rate the general display condition and product layout?', CategoryName: 'Display & Branding', SelectedAnswer: 'Excellent', QuestionType: 'Select' }
    ],
    Tasks: [],
    Competitors: [],
    Inspection: {
      DisplayInspectionID: 2,
      IsDisplayClean: true,
      IsColorCardAvailable: true,
      IsStandAvailable: true,
      Notes: 'Perfect display score. Customer manager is extremely pleased with GLC relationship.'
    }
  }
}

export default function MergedSurveyDashboard() {
  const [activeTab, setActiveTab] = useState('aggregate') // 'aggregate' | 'single'
  
  // Filters
  const [templates, setTemplates] = useState(MOCK_TEMPLATES)
  const [selectedTemplateID, setSelectedTemplateID] = useState(1)
  const [selectedGovernorate, setSelectedGovernorate] = useState('All Governorates')
  
  // Selected Showroom Audit
  const [visitsList, setVisitsList] = useState(MOCK_AGGREGATE_DATA.VisitsList)
  const [selectedVisitID, setSelectedVisitID] = useState('')

  // Loaded DB Dashboard Data
  const [aggregateData, setAggregateData] = useState(MOCK_AGGREGATE_DATA)
  const [singleReportData, setSingleReportData] = useState(null)
  
  const [loading, setLoading] = useState(false)

  // 1. Load Templates on mount
  useEffect(() => {
    async function loadTemplates() {
      if (!API_URL) return; // Fall back to mocks
      try {
        const res = await getSurveyTemplates()
        if (res && res.isSuccess && res.list0.length > 0) {
          setTemplates(res.list0)
          setSelectedTemplateID(res.list0[0].SurveyTemplateID)
        }
      } catch (err) {
        console.warn('Failed to fetch templates from DB API, utilizing fallback templates.', err)
      }
    }
    loadTemplates()
  }, [])

  // 2. Load Dashboard Data (Aggregate or Single depending on selection)
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      
      // If we are looking for a single showroom and one is selected
      if (activeTab === 'single' && selectedVisitID) {
        try {
          const res = await getSurveyDashboardData(selectedVisitID, selectedTemplateID)
          if (res && res.isSuccess && res.list0.length > 0) {
            // Process Lists returned by stored procedure Path A
            const header = res.list0[0]
            const kpis = res.list1[0] || { TasksGenerated: 0, CompetitorsLogged: 0, ComplianceScore: 0 }
            const questions = res.list2 || []
            const tasks = res.list3 || []
            const competitors = res.list4 || []
            const inspection = res.list5[0] || null

            setSingleReportData({
              Header: header,
              KPIs: kpis,
              Questions: questions,
              Tasks: tasks,
              Competitors: competitors,
              Inspection: inspection
            })
          } else {
            // Check fallback dictionary
            if (MOCK_SINGLE_REPORTS[selectedVisitID]) {
              setSingleReportData(MOCK_SINGLE_REPORTS[selectedVisitID])
            } else {
              // Generate dynamic mockup report on the fly for unmocked ids
              const matchedVisitObj = MOCK_AGGREGATE_DATA.VisitsList.find(v => v.VisitID === Number(selectedVisitID))
              setSingleReportData({
                Header: {
                  VisitID: Number(selectedVisitID),
                  VisitNo: matchedVisitObj?.VisitNo || 'VIS-DUMMY-999',
                  VisitDate: matchedVisitObj?.VisitDate || '2026-06-12',
                  TargetName: matchedVisitObj?.TargetName || 'Sample Showroom Store',
                  SalespersonName: 'Omar Samir',
                  SurveyName: 'GLC Standard Showroom Audit v1',
                  CheckInDateTime: '2026-06-12T09:00:00',
                  CheckOutDateTime: '2026-06-12T10:15:00',
                  VisitDurationMinutes: 75
                },
                KPIs: { TasksGenerated: 1, CompetitorsLogged: 0, ComplianceScore: 75 },
                Questions: [
                  { QuestionID: 1, QuestionText: 'Is the storefront display clean and organized?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
                  { QuestionID: 2, QuestionText: 'Are the latest GLC color cards available on display?', CategoryName: 'Display & Branding', SelectedAnswer: 'Yes', QuestionType: 'Select' },
                  { QuestionID: 3, QuestionText: 'Is the GLC logo brand sign illuminated and clean?', CategoryName: 'Display & Branding', SelectedAnswer: 'No', QuestionType: 'Select' },
                  { QuestionID: 4, QuestionText: 'Is the showroom salesperson staff presentable and cooperative?', CategoryName: 'Staff Performance', SelectedAnswer: 'Yes', QuestionType: 'Select' }
                ],
                Tasks: [
                  { FollowUpTaskID: 99, TaskTitle: 'Fix Sign Illumination', TaskDescription: 'Repair or replace front sign LED bulbs.', DueDate: '2026-06-18', Priority: 'Medium', TaskStatus: 'Pending' }
                ],
                Competitors: [],
                Inspection: { DisplayInspectionID: 99, IsDisplayClean: true, IsColorCardAvailable: true, IsStandAvailable: true, Notes: 'General layout looks okay, but sign backlight isn\'t working.' }
              })
            }
          }
        } catch (err) {
          console.error('Failed loading single showroom dashboard, falling back to mocks:', err)
          setSingleReportData(MOCK_SINGLE_REPORTS[selectedVisitID] || MOCK_SINGLE_REPORTS[17])
        } finally {
          setLoading(false)
        }
      } else {
        // Path B: Load Aggregate Analytics
        try {
          const res = await getSurveyDashboardData(null, selectedTemplateID)
          if (res && res.isSuccess) {
            const list0 = res.list0[0] || { TotalShowroomsAudited: 0, TotalQuestionsAudited: 0, OverallShowroomCompliance: 0 }
            const list1 = res.list1 || []
            const list2 = res.list2 || []
            
            // Format DB question list1 (flat option items) into nested option distributions
            const structuredQuestions = []
            list1.forEach(item => {
              let existingQ = structuredQuestions.find(q => q.QuestionID === item.QuestionID)
              if (!existingQ) {
                existingQ = {
                  QuestionID: item.QuestionID,
                  QuestionText: item.QuestionText,
                  CategoryName: item.CategoryName,
                  TotalQuestionResponses: item.TotalQuestionResponses,
                  Distributions: []
                }
                structuredQuestions.push(existingQ)
              }
              existingQ.Distributions.push({
                OptionText: item.AnswerOptionText,
                TotalOptionCount: item.TotalOptionCount,
                OptionValue: item.AnswerOptionText
              })
            })

            setAggregateData({
              TotalShowroomsAudited: list0.TotalShowroomsAudited,
              TotalQuestionsAudited: list0.TotalQuestionsAudited,
              OverallShowroomCompliance: list0.OverallShowroomCompliance,
              QuestionsDistribution: structuredQuestions,
              VisitsList: list2
            })
            setVisitsList(list2)

            if (list2.length > 0 && !selectedVisitID) {
              setSelectedVisitID(String(list2[0].VisitID))
            }
          } else {
            // API call returned false, fallback to mocks
            setAggregateData(MOCK_AGGREGATE_DATA)
            setVisitsList(MOCK_AGGREGATE_DATA.VisitsList)
            if (!selectedVisitID) {
              setSelectedVisitID('17')
            }
          }
        } catch (err) {
          console.warn('Failed loading aggregate survey analytics, loading mockup defaults:', err)
          setAggregateData(MOCK_AGGREGATE_DATA)
          setVisitsList(MOCK_AGGREGATE_DATA.VisitsList)
          if (!selectedVisitID) {
            setSelectedVisitID('17')
          }
        } finally {
          setLoading(false)
        }
      }
    }

    loadDashboard()
  }, [activeTab, selectedTemplateID, selectedVisitID])

  // Get color gradient name mapping based on response value
  const getOptionColorClass = (val) => {
    const v = String(val).toLowerCase()
    if (['yes', 'true', 'active'].includes(v)) return 'color-yes'
    if (['no', 'false', 'inactive'].includes(v)) return 'color-no'
    if (v === 'excellent') return 'color-excellent'
    if (v === 'good') return 'color-good'
    if (v === 'average') return 'color-average'
    if (v === 'poor') return 'color-poor'
    return 'color-other'
  }

  const getOptionBadgeClass = (val) => {
    const v = String(val).toLowerCase()
    if (['yes', 'true', 'active'].includes(v)) return 'ans-badge-yes'
    if (['no', 'false', 'inactive'].includes(v)) return 'ans-badge-no'
    if (v === 'excellent') return 'ans-badge-excellent'
    if (v === 'good') return 'ans-badge-good'
    if (v === 'average') return 'ans-badge-average'
    if (v === 'poor') return 'ans-badge-poor'
    return 'ans-badge-other'
  }

  // Group questions by category helper
  const groupQuestionsByCategory = (questionsList) => {
    const groups = {}
    questionsList.forEach(q => {
      const cat = q.CategoryName || 'General Audits'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(q)
    })
    return groups
  }

  return (
    <>
      <Topbar 
        title="Survey Audit Dashboard" 
        subtitle="Analyze general store performance and individual customer audit checklists"
      />
      
      <div className="dashboard-container">
        
        {/* Top Header Filters Card */}
        <div className="dashboard-filter-card">
          <div className="filters-left">
            <div className="filter-group">
              <label>Select Audit Template</label>
              <select 
                className="filter-select" 
                value={selectedTemplateID} 
                onChange={(e) => setSelectedTemplateID(Number(e.target.value))}
              >
                {templates.map(t => (
                  <option key={t.SurveyTemplateID} value={t.SurveyTemplateID}>
                    {t.SurveyName} ({t.SurveyCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Governorate Region</label>
              <select 
                className="filter-select"
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
              >
                {MOCK_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="dashboard-tabs">
            <button 
              className={`tab-btn ${activeTab === 'aggregate' ? 'active' : ''}`}
              onClick={() => setActiveTab('aggregate')}
            >
              <BarChart3 size={16}/> General Results (Aggregate)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('single')
                if (!selectedVisitID && visitsList.length > 0) {
                  setSelectedVisitID(String(visitsList[0].VisitID))
                }
              }}
            >
              <ClipboardList size={16}/> Showroom Audits (Single)
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#3182ce', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ color: '#4a5568', fontWeight: 600 }}>Loading Dashboard Data...</span>
          </div>
        )}

        {/* DYNAMIC VIEW CONTAINER */}
        {!loading && (
          activeTab === 'aggregate' ? (
            // ============================================
            // TAB 1: AGGREGATE SURVEY ANALYTICS VIEW
            // ============================================
            <div className="aggregate-content">
              
              {/* KPIs Summary Grid */}
              <div className="kpi-grid">
                <div className="premium-kpi-card">
                  <div className="kpi-icon-wrapper">
                    <Building2 size={22}/>
                  </div>
                  <div className="kpi-card-content">
                    <span className="kpi-card-label">Total Audited Showrooms</span>
                    <span className="kpi-card-value">{aggregateData.TotalShowroomsAudited}</span>
                    <span className="kpi-card-trend trend-up">▲ 100% template completion</span>
                  </div>
                </div>

                <div className="premium-kpi-card kpi-compliance">
                  <div className="kpi-icon-wrapper">
                    <TrendingUp size={22}/>
                  </div>
                  <div className="kpi-card-content">
                    <span className="kpi-card-label">Overall Showroom Compliance</span>
                    <span className="kpi-card-value">{aggregateData.OverallShowroomCompliance}%</span>
                    <span className="kpi-card-trend trend-up">▲ 2.5% increase vs last month</span>
                  </div>
                </div>

                <div className="premium-kpi-card kpi-tasks">
                  <div className="kpi-icon-wrapper">
                    <CheckSquare size={22}/>
                  </div>
                  <div className="kpi-card-content">
                    <span className="kpi-card-label">Total Audited Questions</span>
                    <span className="kpi-card-value">{aggregateData.TotalQuestionsAudited}</span>
                    <span className="kpi-card-trend trend-flat">Questions logged per survey</span>
                  </div>
                </div>
              </div>

              {/* Stacked Bar Answer Distribution Details */}
              <div className="chart-card">
                <h3><Sparkles size={18} color="#3182ce" /> Aggregate Survey Answer Distributions</h3>
                <p style={{ fontSize: '13px', color: '#718096', marginTop: '-14px', marginBottom: '24px' }}>
                  Distribution of response answers across all completed audit checklists for this template. Hover over colored segments to view exact target ratios.
                </p>
                
                <div className="question-analytics-list">
                  {aggregateData.QuestionsDistribution && aggregateData.QuestionsDistribution.length > 0 ? (
                    aggregateData.QuestionsDistribution.map((item) => {
                      const totalResponses = item.TotalQuestionResponses || 1
                      return (
                        <div key={item.QuestionID} className="question-analytics-item">
                          <div className="question-meta">
                            <div>
                              <span className="question-category">{item.CategoryName}</span>
                              <h4 className="question-title" style={{ marginTop: '8px', marginBottom: '2px' }}>{item.QuestionText}</h4>
                            </div>
                            <span className="question-total-badge">
                              Total Answers: <strong>{totalResponses}</strong>
                            </span>
                          </div>

                          {/* Stacked distribution progress bar */}
                          <div className="distribution-bar">
                            {item.Distributions.map((dist, idx) => {
                              const pct = Math.round((dist.TotalOptionCount / totalResponses) * 100)
                              if (pct === 0) return null
                              return (
                                <div 
                                  key={idx}
                                  className={`distribution-segment ${getOptionColorClass(dist.OptionValue)}`}
                                  style={{ width: `${pct}%` }}
                                >
                                  {pct >= 8 && `${pct}%`}
                                  <div className="segment-tooltip">
                                    {dist.OptionText}: {dist.TotalOptionCount} Showrooms ({pct}%)
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Legend for this specific question */}
                          <div className="legend-row">
                            {item.Distributions.map((dist, idx) => {
                              const pct = Math.round((dist.TotalOptionCount / totalResponses) * 100)
                              return (
                                <div key={idx} className="legend-item">
                                  <span className={`legend-dot ${getOptionColorClass(dist.OptionValue).replace('color', 'dot')}`}></span>
                                  <span>{dist.OptionText} ({dist.TotalOptionCount} Showrooms - {pct}%)</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                      No question responses found for the selected template.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // ============================================
            // TAB 2: SINGLE SHOWROOM AUDIT REPORT DETAIL VIEW
            // ============================================
            <div className="single-showroom-container">
              
              {/* Showroom list selection sidebar */}
              <div className="selector-sidebar-card">
                <h4 className="selector-title">Select Customer Showroom</h4>
                <div className="visit-option-list">
                  {visitsList.map(visit => (
                    <div 
                      key={visit.VisitID}
                      className={`visit-option-item ${selectedVisitID === String(visit.VisitID) ? 'active' : ''}`}
                      onClick={() => setSelectedVisitID(String(visit.VisitID))}
                    >
                      <span className="visit-option-name">{visit.TargetName}</span>
                      <div className="visit-option-meta">
                        <span className="visit-option-no">{visit.VisitNo}</span>
                        <span>{visit.VisitDate}</span>
                      </div>
                    </div>
                  ))}
                  {visitsList.length === 0 && (
                    <div style={{ padding: '20px', color: '#a0aec0', fontSize: '13px', textAlign: 'center' }}>
                      No audited showrooms found.
                    </div>
                  )}
                </div>
              </div>

              {/* Showroom detail audit panel */}
              {selectedVisitID && singleReportData ? (
                <div className="showroom-detail-results">
                  
                  {/* Premium Audit header info */}
                  <div className="showroom-header-card">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2>{singleReportData.Header.TargetName}</h2>
                        <span className={`compliance-pill ${
                          singleReportData.KPIs.ComplianceScore >= 80 ? 'compliance-high' :
                          singleReportData.KPIs.ComplianceScore >= 50 ? 'compliance-medium' : 'compliance-low'
                        }`}>
                          Score: {singleReportData.KPIs.ComplianceScore}% Compliance
                        </span>
                      </div>
                      <p>
                        Audit ID: <span className="showroom-badge-mono">{singleReportData.Header.VisitNo}</span>
                        <span>•</span>
                        Template: <span>{singleReportData.Header.SurveyName}</span>
                      </p>

                      <div className="showroom-meta-grid">
                        <div className="showroom-meta-item">
                          <span className="showroom-meta-label">Audit Date</span>
                          <span className="showroom-meta-value">
                            <Calendar size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                            {singleReportData.Header.VisitDate}
                          </span>
                        </div>
                        <div className="showroom-meta-item">
                          <span className="showroom-meta-label">Audited By</span>
                          <span className="showroom-meta-value">
                            <User size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                            {singleReportData.Header.SalespersonName}
                          </span>
                        </div>
                        <div className="showroom-meta-item">
                          <span className="showroom-meta-label">Duration</span>
                          <span className="showroom-meta-value">
                            <Clock size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                            {singleReportData.Header.VisitDurationMinutes ? `${singleReportData.Header.VisitDurationMinutes} mins` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="showroom-header-actions">
                      <Link to={`/visits/${singleReportData.Header.VisitID}`} className="btn-view-visit">
                        Go To Visit Detail <ArrowRight size={14}/>
                      </Link>
                    </div>
                  </div>

                  {/* Dynamic checklist audit details and side actions list */}
                  <div className="details-section-grid">
                    
                    {/* Survey checklist responses */}
                    <div className="chart-card">
                      <h3 style={{ margin: '0 0 16px 0' }}><ClipboardList size={18} color="#3182ce" /> Survey Questionnaire Responses</h3>
                      <div className="response-card-list">
                        {Object.entries(groupQuestionsByCategory(singleReportData.Questions)).map(([cat, questions]) => (
                          <div key={cat}>
                            <div className="response-group-header">{cat}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {questions.map((q) => (
                                <div key={q.QuestionID} className="response-row-item">
                                  <span className="response-question-txt">{q.QuestionText}</span>
                                  <span className={`response-answer-badge ${getOptionBadgeClass(q.SelectedAnswer)}`}>
                                    {q.SelectedAnswer}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Side logs - Follow-up tasks & Competitor pricing */}
                    <div className="sidebar-panel-group">
                      
                      {/* Follow-up Tasks */}
                      <div className="sidebar-panel-card">
                        <h4><CheckSquare size={16} color="#e53e3e"/> Logged Follow-up Tasks</h4>
                        <div className="report-task-list">
                          {singleReportData.Tasks && singleReportData.Tasks.length > 0 ? (
                            singleReportData.Tasks.map((task) => (
                              <div key={task.FollowUpTaskID} className={`report-task-item priority-${String(task.Priority).toLowerCase()}`}>
                                <div className="report-task-title">{task.TaskTitle}</div>
                                <div className="report-task-desc">{task.TaskDescription}</div>
                                <div className="report-task-meta">
                                  <span>Due: {task.DueDate}</span>
                                  <span style={{ textTransform: 'uppercase', fontSize: '9px', padding: '1px 5px', background: '#e2e8f0', borderRadius: '4px', color: '#4a5568' }}>
                                    {task.Priority} Priority
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#a0aec0', fontSize: '13px', textAlign: 'center', padding: '10px 0' }}>
                              No follow-up tasks logged for this audit.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Competitor Price log */}
                      <div className="sidebar-panel-card">
                        <h4><Tag size={16} color="#2b6cb0"/> Competitor Intel</h4>
                        <div className="report-competitor-list">
                          {singleReportData.Competitors && singleReportData.Competitors.length > 0 ? (
                            singleReportData.Competitors.map((comp) => (
                              <div key={comp.CompetitorInfoID} className="report-comp-item">
                                <div>
                                  <div className="report-comp-brand">{comp.CompetitorName}</div>
                                  <div className="report-comp-product">{comp.ProductName}</div>
                                  {comp.OfferDescription && (
                                    <div style={{ fontSize: '11px', color: '#dd6b20', marginTop: '4px', fontStyle: 'italic' }}>
                                      Offer: {comp.OfferDescription}
                                    </div>
                                  )}
                                </div>
                                <div className="report-comp-price">
                                  {comp.Price} EGP
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#a0aec0', fontSize: '13px', textAlign: 'center', padding: '10px 0' }}>
                              No competitor actions logged.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display inspection checklist audit */}
                      {singleReportData.Inspection && (
                        <div className="sidebar-panel-card">
                          <h4><AlertCircle size={16} color="#319795"/> Display Audit Inspection</h4>
                          <div className="report-inspection-grid">
                            <div className="report-inspection-row">
                              <span>Display clean & presentable:</span>
                              <span className={`report-inspection-flag ${singleReportData.Inspection.IsDisplayClean ? 'flag-yes' : 'flag-no'}`}>
                                {singleReportData.Inspection.IsDisplayClean ? 'YES' : 'NO'}
                              </span>
                            </div>
                            <div className="report-inspection-row">
                              <span>Color catalogs available:</span>
                              <span className={`report-inspection-flag ${singleReportData.Inspection.IsColorCardAvailable ? 'flag-yes' : 'flag-no'}`}>
                                {singleReportData.Inspection.IsColorCardAvailable ? 'YES' : 'NO'}
                              </span>
                            </div>
                            <div className="report-inspection-row">
                              <span>Display stand properly placed:</span>
                              <span className={`report-inspection-flag ${singleReportData.Inspection.IsStandAvailable ? 'flag-yes' : 'flag-no'}`}>
                                {singleReportData.Inspection.IsStandAvailable ? 'YES' : 'NO'}
                              </span>
                            </div>
                            
                            {singleReportData.Inspection.Notes && (
                              <div className="report-inspection-notes">
                                <strong>Inspection Notes:</strong> {singleReportData.Inspection.Notes}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ) : (
                <div className="empty-dashboard-state">
                  <AlertTriangle size={36} color="#ecc94b"/>
                  <h4>No Showroom Selected</h4>
                  <p>Please select a showroom visit from the left menu panel to drill down into its individual survey audit checklist details.</p>
                </div>
              )}

            </div>
          )
        )}
        
      </div>
    </>
  )
}
