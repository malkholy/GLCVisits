import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { mockVisits } from '../../mock/mockData'
import Topbar from '../../components/Topbar'
import StatusBadge from '../../components/StatusBadge'
import Toast from '../../components/Toast'
import { 
  getVisitDetails,
  startVisit,
  checkOutVisit,
  completeVisit,
  cancelVisit,
  missVisit,
  getSurveyTemplates,
  getSurveyTemplateDetails,
  submitSurvey,
  getSurveyAnswers,
  saveVisitAttachment,
  deleteVisitAttachment,
  saveVisitFollowUpTask,
  deleteVisitFollowUpTask,
  saveVisitCompetitorInfo,
  deleteVisitCompetitorInfo,
  saveVisitDisplayInspection
} from '../../shared/api'
import { API_URL } from '../../shared/constants'
import { fmtDate, fmtDateTime, fmtDuration } from '../../shared/utils'
import { 
  ArrowLeft, Plus, MapPin, Calendar, User, Phone, Map, Check, Clock, X, 
  ChevronDown, Paperclip, ClipboardList, AlertCircle, Sparkles, PlusCircle 
} from 'lucide-react'
import './VisitDetails.css'

// Survey Questions will be dynamically loaded from database templates

const CANCELLATION_REASONS = [
  { id: 1, label: 'Customer unavailable' },
  { id: 2, label: 'Wrong location' },
  { id: 3, label: 'Schedule conflict' },
  { id: 4, label: 'Emergency' }
]

const MISSED_REASONS = [
  { id: 1, label: 'Could not reach target' },
  { id: 2, label: 'Delayed by previous visits' },
  { id: 3, label: 'Permission issue' },
  { id: 4, label: 'User did not visit' }
]

export default function VisitDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // State
  const [loading, setLoading] = useState(false)
  const [visit, setVisit] = useState(null)
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState('')
  
  // Accordion UI State
  const [notesCollapsed, setNotesCollapsed] = useState(false)
  const [activitiesCollapsed, setActivitiesCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Survey')
  const [surveyGroup, setSurveyGroup] = useState('Display')
  
  // Form State
  const [visitNotes, setVisitNotes] = useState('')
  const [finalNotes, setFinalNotes] = useState('')
  const [surveyAnswers, setSurveyAnswers] = useState({})
  
  // Tab Lists and Details State
  const [attachments, setAttachments] = useState([])
  const [followUpTasks, setFollowUpTasks] = useState([])
  const [competitorInfos, setCompetitorInfos] = useState([])
  const [displayInspection, setDisplayInspection] = useState(null)

  // Dynamic Survey Template States
  const [surveyTemplate, setSurveyTemplate] = useState(null)
  const [surveyGroups, setSurveyGroups] = useState([])
  const [surveyQuestions, setSurveyQuestions] = useState([])
  const [surveyOptions, setSurveyOptions] = useState([])
  const [isSurveyRequired, setIsSurveyRequired] = useState(false)
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false)
  
  // Sidebar actions modal states
  const [activeModal, setActiveModal] = useState(null) // 'cancel' | 'miss' | 'checkout' | 'complete'
  const [modalReasonId, setModalReasonId] = useState('')
  const [modalNotes, setModalNotes] = useState('')

  // Modals specific form states
  const [attachmentForm, setAttachmentForm] = useState({ type: 'Photo', name: '', url: '', notes: '' })
  const [taskForm, setTaskForm] = useState({ title: '', desc: '', date: '', priority: 'Normal', status: 'Open' })
  const [competitorForm, setCompetitorForm] = useState({ name: '', product: '', price: '', offer: '', notes: '' })
  const [inspectionForm, setInspectionForm] = useState({ clean: false, cards: false, stand: false, missing: '', action: '', notes: '' })

  // Geolocation lookup
  const getGeolocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 30.0612, longitude: 31.3301, isMocked: true, error: 'Geolocation not supported' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            isMocked: false
          });
        },
        (error) => {
          console.warn('Geolocation failed, falling back to Cairo:', error);
          resolve({
            latitude: 30.0612,
            longitude: 31.3301,
            isMocked: true,
            error: error.message
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  // Load Visit Details and Match Survey Templates
  const loadData = async () => {
    setLoading(true)
    let mainRec = null
    let histRecs = []

    if (!API_URL) {
      // Mock Fallback
      mainRec = mockVisits.find(x => x.VisitID === Number(id))
      if (mainRec) {
        histRecs = [
          { HistoryID: 1, ActionName: 'New Visit', FromStatus: null, ToStatus: 'Planned', ActionDateTime: mainRec.VisitDate + 'T09:00:00', CreatedBy: mainRec.SalespersonName || 'admin' }
        ]
        if (mainRec.StatusCode !== 'PLANNED' && mainRec.CheckInDateTime) {
          histRecs.push({ HistoryID: 2, ActionName: 'Check In', FromStatus: 'Planned', ToStatus: 'Checked-In', ActionDateTime: mainRec.CheckInDateTime, CreatedBy: mainRec.SalespersonName || 'admin' })
        }
        if (mainRec.StatusCode === 'CHECKED_OUT' || mainRec.StatusCode === 'COMPLETED') {
          histRecs.push({ HistoryID: 3, ActionName: 'Check Out', FromStatus: 'Checked-In', ToStatus: 'Checked-Out', ActionDateTime: mainRec.CheckInDateTime, CreatedBy: mainRec.SalespersonName || 'admin' })
        }
        if (mainRec.StatusCode === 'COMPLETED') {
          histRecs.push({ HistoryID: 4, ActionName: 'Complete Visit', FromStatus: 'Checked-Out', ToStatus: 'Completed', ActionDateTime: mainRec.CheckInDateTime, CreatedBy: mainRec.SalespersonName || 'admin' })
        }
        if (mainRec.StatusCode === 'CANCELLED') {
          histRecs.push({ HistoryID: 5, ActionName: 'Cancel Visit', FromStatus: 'Planned', ToStatus: 'Cancelled', ActionDateTime: mainRec.VisitDate + 'T11:00:00', CreatedBy: mainRec.SalespersonName || 'admin', Notes: 'Client cancelled appointment' })
        }
        if (mainRec.StatusCode === 'MISSED') {
          histRecs.push({ HistoryID: 6, ActionName: 'Miss Visit', FromStatus: 'Planned', ToStatus: 'Missed', ActionDateTime: mainRec.VisitDate + 'T17:00:00', CreatedBy: 'system', Notes: 'No show' })
        }
      }
      // Populate Tab Mocks
      setAttachments([
        { AttachmentID: 1, VisitID: Number(id), AttachmentType: 'Photo', FileName: 'store_front.jpg', FilePath: '/uploads/store_front.jpg', FileExtension: 'jpg', FileSizeKB: 245.5, FileURL: 'https://souq.glcpaints.com/uploads/store_front.jpg', CreatedDate: '2026-06-12T10:00:00', CreatedBy: 'Omar Samir' }
      ])
      setFollowUpTasks([
        { FollowUpTaskID: 1, VisitID: Number(id), TaskTitle: 'Deliver custom color catalogs', TaskDescription: 'Deliver outdoor latexs and Jotun catalogs to customer.', AssignedToUser: 'omar.samir', DueDate: '2026-06-14', Priority: 'High', TaskStatus: 'Open', CreatedDate: '2026-06-12T10:15:00', CreatedBy: 'Omar Samir' },
        { FollowUpTaskID: 2, VisitID: Number(id), TaskTitle: 'Verify collection billing receipt', TaskDescription: 'Customer needs printout of their receipt.', AssignedToUser: 'omar.samir', DueDate: '2026-06-18', Priority: 'Normal', TaskStatus: 'Open', CreatedDate: '2026-06-12T10:17:00', CreatedBy: 'Omar Samir' }
      ])
      setCompetitorInfos([
        { CompetitorInfoID: 1, VisitID: Number(id), CompetitorName: 'Sipes Paints', ProductName: 'Sipes Outdoor Latex', Price: 450, OfferDescription: 'Buy 10 tins, get 1 free coupon', Notes: 'Competitor visibility high', CreatedDate: '2026-06-12T10:20:00', CreatedBy: 'Omar Samir' },
        { CompetitorInfoID: 2, VisitID: Number(id), CompetitorName: 'Jotun', ProductName: 'Jotashield Silk', Price: 720, OfferDescription: 'Volume discount 5% over 50 tins', Notes: 'High end competitor', CreatedDate: '2026-06-12T10:22:00', CreatedBy: 'Omar Samir' }
      ])
      const mockInsp = {
        InspectionID: 1,
        VisitID: Number(id),
        DisplayStatus: 'Inspected',
        IsDisplayClean: true,
        IsColorCardAvailable: true,
        IsStandAvailable: false,
        MissingMaterials: 'Stand catalogs missing',
        RequiredAction: 'Order new catalogs',
        Notes: 'Stand is in good shape, but requires catalog replenishments.'
      }
      setDisplayInspection(mockInsp)
      setInspectionForm({
        clean: true,
        cards: true,
        stand: false,
        missing: 'Stand catalogs missing',
        action: 'Order new catalogs',
        notes: 'Stand is in good shape, but requires catalog replenishments.'
      })
    } else {
      try {
        const res = await getVisitDetails(id)
        if (res && res.isSuccess) {
          mainRec = res.list0?.[0] || res.list0
          histRecs = res.list1 || []
          setAttachments(res.list2 || [])
          setFollowUpTasks(res.list3 || [])
          setCompetitorInfos(res.list4 || [])
          
          const insp = res.list5?.[0] || null
          setDisplayInspection(insp)
          if (insp) {
            setInspectionForm({
              clean: insp.IsDisplayClean === 1 || insp.IsDisplayClean === true,
              cards: insp.IsColorCardAvailable === 1 || insp.IsColorCardAvailable === true,
              stand: insp.IsStandAvailable === 1 || insp.IsStandAvailable === true,
              missing: insp.MissingMaterials || '',
              action: insp.RequiredAction || '',
              notes: insp.Notes || ''
            })
          } else {
            setInspectionForm({ clean: false, cards: false, stand: false, missing: '', action: '', notes: '' })
          }
        }
      } catch (err) {
        showToast(`Error loading visit: ${err.message}`)
      }
    }

    if (mainRec) {
      setVisit(mainRec)
      setVisitNotes(mainRec.VisitNotes || '')
      setFinalNotes(mainRec.FinalNotes || '')
      setHistory(histRecs)

      // Load templates
      let templates = []
      if (!API_URL) {
        templates = [
          { SurveyTemplateID: 1, SurveyCode: 'SRV01', SurveyName: 'Customer & Competitor Survey', TargetTypeID: 1, PurposeID: 1, IsActive: 1 }
        ]
      } else {
        try {
          const tRes = await getSurveyTemplates()
          if (tRes && tRes.isSuccess) {
            templates = tRes.list0 || []
          }
        } catch (err) {
          console.error('Error fetching survey templates:', err)
        }
      }

      // Find matched template
      let matched = null
      if (templates.length > 0) {
        matched = templates.find(t => 
          t.TargetTypeID && Number(t.TargetTypeID) === Number(mainRec.TargetTypeID) && 
          t.PurposeID && Number(t.PurposeID) === Number(mainRec.PurposeID)
        )
        if (!matched) {
          matched = templates.find(t => t.PurposeID && Number(t.PurposeID) === Number(mainRec.PurposeID))
        }
        if (!matched) {
          matched = templates.find(t => t.TargetTypeID && Number(t.TargetTypeID) === Number(mainRec.TargetTypeID))
        }
      }

      if (matched) {
        setSurveyTemplate(matched)
        setIsSurveyRequired(true)

        let groups = []
        let questions = []
        let options = []

        if (!API_URL) {
          groups = [
            { SurveyGroupID: 1, SurveyTemplateID: matched.SurveyTemplateID, GroupCode: 'Display', GroupName: 'Display', DisplayOrder: 1, IsActive: 1 },
            { SurveyGroupID: 2, SurveyTemplateID: matched.SurveyTemplateID, GroupCode: 'Competitor', GroupName: 'Competitor', DisplayOrder: 2, IsActive: 1 },
            { SurveyGroupID: 3, SurveyTemplateID: matched.SurveyTemplateID, GroupCode: 'Customer', GroupName: 'Customer', DisplayOrder: 3, IsActive: 1 },
            { SurveyGroupID: 4, SurveyTemplateID: matched.SurveyTemplateID, GroupCode: 'Notes', GroupName: 'Notes', DisplayOrder: 4, IsActive: 1 }
          ]
          questions = [
            { QuestionID: 1, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 1, GroupCode: 'Display', QuestionCode: 'DISPLAY_CLEAN', QuestionText: 'How would you rate the cleanliness of the GLC display stand?', QuestionType: 'SingleChoice', IsRequired: 1, DisplayOrder: 1, IsActive: 1 },
            { QuestionID: 2, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 1, GroupCode: 'Display', QuestionCode: 'COLOR_CARDS_AVAILABLE', QuestionText: 'Are all required color cards available?', QuestionType: 'SingleChoice', IsRequired: 0, DisplayOrder: 2, IsActive: 1 },
            { QuestionID: 3, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 1, GroupCode: 'Display', QuestionCode: 'DISPLAY_STAND_STATUS', QuestionText: 'Is the GLC display stand in good condition?', QuestionType: 'SingleChoice', IsRequired: 0, DisplayOrder: 3, IsActive: 1 },
            { QuestionID: 4, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 1, GroupCode: 'Display', QuestionCode: 'DISPLAY_CLEAN_YN', QuestionText: 'Is the display stand clean and presentable?', QuestionType: 'SingleChoice', IsRequired: 1, DisplayOrder: 4, IsActive: 1 },
            { QuestionID: 5, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 2, GroupCode: 'Competitor', QuestionCode: 'COMPETITOR_AVAILABLE', QuestionText: 'Are competitor products available and visible in the store?', QuestionType: 'SingleChoice', IsRequired: 1, DisplayOrder: 5, IsActive: 1 },
            { QuestionID: 6, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 2, GroupCode: 'Competitor', QuestionCode: 'COMPETITOR_BRAND', QuestionText: 'Main competitor brand observed', QuestionType: 'Text', IsRequired: 0, DisplayOrder: 6, IsActive: 1 },
            { QuestionID: 7, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 2, GroupCode: 'Competitor', QuestionCode: 'COMPETITOR_OFFER', QuestionText: 'Competitor offer or price notes', QuestionType: 'Text', IsRequired: 0, DisplayOrder: 7, IsActive: 1 },
            { QuestionID: 8, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 3, GroupCode: 'Customer', QuestionCode: 'CUSTOMER_SATISFACTION', QuestionText: 'How would you rate customer satisfaction level?', QuestionType: 'SingleChoice', IsRequired: 1, DisplayOrder: 8, IsActive: 1 },
            { QuestionID: 9, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 3, GroupCode: 'Customer', QuestionCode: 'CUSTOMER_COMPLAINTS', QuestionText: 'Customer complaints / feedback issues', QuestionType: 'Text', IsRequired: 0, DisplayOrder: 9, IsActive: 1 },
            { QuestionID: 10, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 3, GroupCode: 'Customer', QuestionCode: 'CUSTOMER_DEMANDS', QuestionText: 'Customer primary product demands', QuestionType: 'Text', IsRequired: 0, DisplayOrder: 10, IsActive: 1 },
            { QuestionID: 11, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 4, GroupCode: 'Notes', QuestionCode: 'FOLLOWUP_REQUIRED', QuestionText: 'Is follow-up required?', QuestionType: 'SingleChoice', IsRequired: 1, DisplayOrder: 11, IsActive: 1 },
            { QuestionID: 12, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 4, GroupCode: 'Notes', QuestionCode: 'GENERAL_NOTES', QuestionText: 'General feedback notes / recommendations', QuestionType: 'Text', IsRequired: 0, DisplayOrder: 12, IsActive: 1 },
            { QuestionID: 13, SurveyTemplateID: matched.SurveyTemplateID, SurveyGroupID: 4, GroupCode: 'Notes', QuestionCode: 'STORE_PHOTO', QuestionText: 'Upload Store Photo', QuestionType: 'Photo', IsRequired: 0, DisplayOrder: 13, IsActive: 1 }
          ]
          options = [
            { OptionID: 1, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Excellent', OptionValue: 'Excellent', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 2, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Good', OptionValue: 'Good', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 3, QuestionID: 1, QuestionCode: 'DISPLAY_CLEAN', OptionText: 'Needs improvement', OptionValue: 'Needs improvement', DisplayOrder: 3, IsActive: 1 },
            { OptionID: 4, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'Yes', OptionValue: 'Yes', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 5, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'No', OptionValue: 'No', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 6, QuestionID: 2, QuestionCode: 'COLOR_CARDS_AVAILABLE', OptionText: 'Partially', OptionValue: 'Partially', DisplayOrder: 3, IsActive: 1 },
            { OptionID: 7, QuestionID: 3, QuestionCode: 'DISPLAY_STAND_STATUS', OptionText: 'Good', OptionValue: 'Good', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 8, QuestionID: 3, QuestionCode: 'DISPLAY_STAND_STATUS', OptionText: 'Average', OptionValue: 'Average', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 9, QuestionID: 3, QuestionCode: 'DISPLAY_STAND_STATUS', OptionText: 'Damaged', OptionValue: 'Damaged', DisplayOrder: 3, IsActive: 1 },
            { OptionID: 10, QuestionID: 4, QuestionCode: 'DISPLAY_CLEAN_YN', OptionText: 'Yes', OptionValue: 'Yes', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 11, QuestionID: 4, QuestionCode: 'DISPLAY_CLEAN_YN', OptionText: 'No', OptionValue: 'No', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 12, QuestionID: 5, QuestionCode: 'COMPETITOR_AVAILABLE', OptionText: 'Yes', OptionValue: 'Yes', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 13, QuestionID: 5, QuestionCode: 'COMPETITOR_AVAILABLE', OptionText: 'No', OptionValue: 'No', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 14, QuestionID: 8, QuestionCode: 'CUSTOMER_SATISFACTION', OptionText: 'Excellent', OptionValue: 'Excellent', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 15, QuestionID: 8, QuestionCode: 'CUSTOMER_SATISFACTION', OptionText: 'Good', OptionValue: 'Good', DisplayOrder: 2, IsActive: 1 },
            { OptionID: 16, QuestionID: 8, QuestionCode: 'CUSTOMER_SATISFACTION', OptionText: 'Average', OptionValue: 'Average', DisplayOrder: 3, IsActive: 1 },
            { OptionID: 17, QuestionID: 8, QuestionCode: 'CUSTOMER_SATISFACTION', OptionText: 'Poor', OptionValue: 'Poor', DisplayOrder: 4, IsActive: 1 },
            { OptionID: 18, QuestionID: 11, QuestionCode: 'FOLLOWUP_REQUIRED', OptionText: 'Yes', OptionValue: 'Yes', DisplayOrder: 1, IsActive: 1 },
            { OptionID: 19, QuestionID: 11, QuestionCode: 'FOLLOWUP_REQUIRED', OptionText: 'No', OptionValue: 'No', DisplayOrder: 2, IsActive: 1 }
          ]
        } else {
          try {
            const detailRes = await getSurveyTemplateDetails(matched.SurveyTemplateID)
            if (detailRes && detailRes.isSuccess) {
              groups = detailRes.list1 || []
              questions = detailRes.list2 || []
              options = detailRes.list3 || []
            }
          } catch (err) {
            console.error('Error fetching template details:', err)
          }
        }

        setSurveyGroups(groups)
        setSurveyQuestions(questions)
        setSurveyOptions(options)

        if (groups.length > 0) {
          setSurveyGroup(prev => groups.some(g => g.GroupCode === prev) ? prev : groups[0].GroupCode)
        }

        let answerMap = {}
        const isSurveySub = !!mainRec.IsSurveySubmitted
        setIsSurveySubmitted(isSurveySub)

        if (mainRec.StatusCode !== 'PLANNED') {
          if (!API_URL) {
            answerMap = {
              DISPLAY_CLEAN: 'Good',
              COLOR_CARDS_AVAILABLE: 'Yes',
              DISPLAY_STAND_STATUS: 'Good',
              DISPLAY_CLEAN_YN: 'Yes',
              COMPETITOR_AVAILABLE: 'No'
            }
          } else {
            try {
              const ansRes = await getSurveyAnswers({ VisitID: Number(id) })
              if (ansRes && ansRes.isSuccess) {
                const dbAnswers = ansRes.list1 || []
                dbAnswers.forEach(ans => {
                  let val = ans.AnswerText || '';
                  if (ans.AnswerNumber !== null && ans.AnswerNumber !== undefined) {
                    val = String(ans.AnswerNumber);
                  } else if (ans.OptionID) {
                    val = ans.OptionText || ans.AnswerText || '';
                  }
                  answerMap[ans.QuestionCode] = val
                })
              }
            } catch (err) {
              console.error('Error loading survey answers:', err)
            }
          }
        }
        setSurveyAnswers(answerMap)
      } else {
        setSurveyTemplate(null)
        setIsSurveyRequired(false)
        setSurveyGroups([])
        setSurveyQuestions([])
        setSurveyOptions([])
        setIsSurveySubmitted(false)
        setSurveyAnswers({})
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const showToast = (msg) => {
    setToast(msg)
  }

  // Operation Actions
  const handleCheckIn = async () => {
    setLoading(true)
    const geo = await getGeolocation();
    if (geo.isMocked) {
      showToast(`Using Cairo coordinates (fallback): ${geo.error || 'Blocked'}`);
    }

    const lat = geo.latitude;
    const lng = geo.longitude;
    const dist = 15.5; // distance in meters

    if (!API_URL) {
      // Mock operation
      setVisit(prev => ({
        ...prev,
        StatusCode: 'CHECKED_IN',
        StatusName: 'Checked-In',
        CheckInDateTime: new Date().toISOString(),
        CheckInLatitude: lat,
        CheckInLongitude: lng,
        CheckInDistanceMeter: dist
      }))
      showToast('Checked-In successfully (mock)')
      setHistory(h => [
        ...h,
        { HistoryID: Date.now(), ActionName: 'Check In', FromStatus: 'Planned', ToStatus: 'Checked-In', ActionDateTime: new Date().toISOString(), CreatedBy: 'Omar Samir' }
      ])
      setLoading(false)
      return
    }

    try {
      const res = await startVisit({
        VisitID: id,
        Latitude: lat,
        Longitude: lng,
        Distance: dist
      })
      if (!res.isSuccess) {
        showToast(res.message || 'Check-in failed')
      } else {
        showToast('Checked-In successfully!')
        loadData()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOutSubmit = async () => {
    setLoading(true)
    const geo = await getGeolocation();
    if (geo.isMocked) {
      showToast(`Using Cairo coordinates (fallback) for checkout: ${geo.error || 'Blocked'}`);
    }

    const lat = geo.latitude;
    const lng = geo.longitude;
    const dist = 12.3;

    if (!API_URL) {
      setVisit(prev => ({
        ...prev,
        StatusCode: 'CHECKED_OUT',
        StatusName: 'Checked-Out',
        CheckOutDateTime: new Date().toISOString(),
        VisitDurationMinutes: 15,
        VisitNotes: modalNotes,
        CheckOutLatitude: lat,
        CheckOutLongitude: lng
      }))
      setVisitNotes(modalNotes)
      showToast('Checked-Out successfully (mock)')
      setHistory(h => [
        ...h,
        { HistoryID: Date.now(), ActionName: 'Check Out', FromStatus: 'Checked-In', ToStatus: 'Checked-Out', ActionDateTime: new Date().toISOString(), CreatedBy: 'Omar Samir', Notes: modalNotes }
      ])
      setActiveModal(null)
      setModalNotes('')
      setLoading(false)
      return
    }

    try {
      const res = await checkOutVisit({
        VisitID: id,
        Latitude: lat,
        Longitude: lng,
        Distance: dist,
        VisitNotes: modalNotes
      })
      if (!res.isSuccess) {
        showToast(res.message || 'Check-out failed')
      } else {
        showToast('Checked-Out successfully!')
        setActiveModal(null)
        setModalNotes('')
        loadData()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSubmit = async () => {
    if (!modalNotes.trim()) {
      showToast('Final notes are required to complete visit.')
      return
    }

    if (!API_URL) {
      setVisit(prev => ({
        ...prev,
        StatusCode: 'COMPLETED',
        StatusName: 'Completed',
        FinalNotes: modalNotes
      }))
      setFinalNotes(modalNotes)
      showToast('Visit Completed! (mock)')
      setHistory(h => [
        ...h,
        { HistoryID: Date.now(), ActionName: 'Complete Visit', FromStatus: 'Checked-Out', ToStatus: 'Completed', ActionDateTime: new Date().toISOString(), CreatedBy: 'Omar Samir', Notes: modalNotes }
      ])
      setActiveModal(null)
      setModalNotes('')
      return
    }

    try {
      const res = await completeVisit({
        VisitID: id,
        FinalNotes: modalNotes
      })
      if (!res.isSuccess) {
        showToast(res.message || 'Completion failed')
      } else {
        showToast('Visit Completed successfully!')
        setActiveModal(null)
        setModalNotes('')
        loadData()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const handleCancelSubmit = async () => {
    if (!modalReasonId) {
      showToast('Cancellation reason is required.')
      return
    }

    const reasonLabel = CANCELLATION_REASONS.find(r => r.id === Number(modalReasonId))?.label || ''

    if (!API_URL) {
      setVisit(prev => ({
        ...prev,
        StatusCode: 'CANCELLED',
        StatusName: 'Cancelled',
        CancellationReasonID: Number(modalReasonId),
        CancellationNotes: modalNotes
      }))
      showToast('Visit Cancelled (mock)')
      setHistory(h => [
        ...h,
        { HistoryID: Date.now(), ActionName: 'Cancel Visit', FromStatus: visit.StatusCode, ToStatus: 'Cancelled', ActionDateTime: new Date().toISOString(), CreatedBy: 'Omar Samir', Notes: `${reasonLabel}: ${modalNotes}` }
      ])
      setActiveModal(null)
      setModalReasonId('')
      setModalNotes('')
      return
    }

    try {
      const res = await cancelVisit({
        VisitID: id,
        CancellationReasonID: Number(modalReasonId),
        CancellationNotes: modalNotes
      })
      if (!res.isSuccess) {
        showToast(res.message || 'Cancellation failed')
      } else {
        showToast('Visit Cancelled successfully!')
        setActiveModal(null)
        setModalReasonId('')
        setModalNotes('')
        loadData()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const handleMissSubmit = async () => {
    if (!modalReasonId) {
      showToast('Missed reason is required.')
      return
    }

    const reasonLabel = MISSED_REASONS.find(r => r.id === Number(modalReasonId))?.label || ''

    if (!API_URL) {
      setVisit(prev => ({
        ...prev,
        StatusCode: 'MISSED',
        StatusName: 'Missed',
        MissedReasonID: Number(modalReasonId),
        MissedNotes: modalNotes
      }))
      showToast('Visit marked Missed (mock)')
      setHistory(h => [
        ...h,
        { HistoryID: Date.now(), ActionName: 'Miss Visit', FromStatus: 'Planned', ToStatus: 'Missed', ActionDateTime: new Date().toISOString(), CreatedBy: 'Omar Samir', Notes: `${reasonLabel}: ${modalNotes}` }
      ])
      setActiveModal(null)
      setModalReasonId('')
      setModalNotes('')
      return
    }

    try {
      const res = await missVisit({
        VisitID: id,
        MissedReasonID: Number(modalReasonId),
        MissedNotes: modalNotes
      })
      if (!res.isSuccess) {
        showToast(res.message || 'Operation failed')
      } else {
        showToast('Visit marked Missed successfully!')
        setActiveModal(null)
        setModalReasonId('')
        setModalNotes('')
        loadData()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  // Save drafts of notes
  const saveVisitNotesLocally = () => {
    showToast('Draft notes saved locally.')
  }

  // ── Attachment handlers ──
  const handleAddAttachment = async () => {
    if (!attachmentForm.name.trim()) {
      showToast('File name is required.')
      return
    }

    const payload = {
      VisitID: Number(id),
      AttachmentType: attachmentForm.type,
      FileName: attachmentForm.name.trim(),
      FilePath: attachmentForm.url.trim() || `/uploads/visit_${id}/${attachmentForm.name}`,
      FileExtension: attachmentForm.name.split('.').pop() || 'dat',
      FileSizeKB: 120.0,
      Latitude: 30.0612,
      Longitude: 31.3301,
      AttachmentNotes: attachmentForm.notes.trim(),
      FileURL: attachmentForm.url.trim()
    }

    if (!API_URL) {
      setAttachments(prev => [
        ...prev,
        {
          AttachmentID: Date.now(),
          ...payload,
          CreatedDate: new Date().toISOString(),
          CreatedBy: 'Omar Samir'
        }
      ])
      showToast('Attachment saved successfully (mock)')
      setActiveModal(null)
      setAttachmentForm({ type: 'Photo', name: '', url: '', notes: '' })
      return
    }

    try {
      setLoading(true)
      const res = await saveVisitAttachment(payload)
      if (res && res.isSuccess) {
        showToast('Attachment saved successfully!')
        setActiveModal(null)
        setAttachmentForm({ type: 'Photo', name: '', url: '', notes: '' })
        loadData()
      } else {
        showToast(res.message || 'Save failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return

    if (!API_URL) {
      setAttachments(prev => prev.filter(a => a.AttachmentID !== attachmentId))
      showToast('Attachment deleted successfully (mock)')
      return
    }

    try {
      setLoading(true)
      const res = await deleteVisitAttachment(attachmentId)
      if (res && res.isSuccess) {
        showToast('Attachment deleted successfully!')
        loadData()
      } else {
        showToast(res.message || 'Delete failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Follow-up Task handlers ──
  const handleAddFollowUpTask = async () => {
    if (!taskForm.title.trim()) {
      showToast('Task title is required.')
      return
    }

    const payload = {
      VisitID: Number(id),
      TaskTitle: taskForm.title.trim(),
      TaskDescription: taskForm.desc.trim(),
      AssignedToUser: 'omar.samir',
      DueDate: taskForm.date || null,
      Priority: taskForm.priority,
      TaskStatus: taskForm.status
    }

    if (!API_URL) {
      setFollowUpTasks(prev => [
        ...prev,
        {
          FollowUpTaskID: Date.now(),
          ...payload,
          CreatedDate: new Date().toISOString(),
          CreatedBy: 'Omar Samir'
        }
      ])
      showToast('Task saved successfully (mock)')
      setActiveModal(null)
      setTaskForm({ title: '', desc: '', date: '', priority: 'Normal', status: 'Open' })
      return
    }

    try {
      setLoading(true)
      const res = await saveVisitFollowUpTask(payload)
      if (res && res.isSuccess) {
        showToast('Task saved successfully!')
        setActiveModal(null)
        setTaskForm({ title: '', desc: '', date: '', priority: 'Normal', status: 'Open' })
        loadData()
      } else {
        showToast(res.message || 'Save failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFollowUpTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    if (!API_URL) {
      setFollowUpTasks(prev => prev.filter(t => t.FollowUpTaskID !== taskId))
      showToast('Task deleted successfully (mock)')
      return
    }

    try {
      setLoading(true)
      const res = await deleteVisitFollowUpTask(taskId)
      if (res && res.isSuccess) {
        showToast('Task deleted successfully!')
        loadData()
      } else {
        showToast(res.message || 'Delete failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Competitor brand handlers ──
  const handleAddCompetitorInfo = async () => {
    if (!competitorForm.name.trim() || !competitorForm.product.trim()) {
      showToast('Brand name and Product name are required.')
      return
    }

    const payload = {
      VisitID: Number(id),
      CompetitorName: competitorForm.name.trim(),
      ProductName: competitorForm.product.trim(),
      OfferDescription: competitorForm.offer.trim(),
      Price: competitorForm.price ? Number(competitorForm.price) : null,
      Notes: competitorForm.notes.trim()
    }

    if (!API_URL) {
      setCompetitorInfos(prev => [
        ...prev,
        {
          CompetitorInfoID: Date.now(),
          ...payload,
          CreatedDate: new Date().toISOString(),
          CreatedBy: 'Omar Samir'
        }
      ])
      showToast('Competitor information saved successfully (mock)')
      setActiveModal(null)
      setCompetitorForm({ name: '', product: '', price: '', offer: '', notes: '' })
      return
    }

    try {
      setLoading(true)
      const res = await saveVisitCompetitorInfo(payload)
      if (res && res.isSuccess) {
        showToast('Competitor information saved successfully!')
        setActiveModal(null)
        setCompetitorForm({ name: '', product: '', price: '', offer: '', notes: '' })
        loadData()
      } else {
        showToast(res.message || 'Save failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCompetitorInfo = async (competitorInfoId) => {
    if (!window.confirm('Are you sure you want to delete this competitor record?')) return

    if (!API_URL) {
      setCompetitorInfos(prev => prev.filter(c => c.CompetitorInfoID !== competitorInfoId))
      showToast('Competitor info deleted successfully (mock)')
      return
    }

    try {
      setLoading(true)
      const res = await deleteVisitCompetitorInfo(competitorInfoId)
      if (res && res.isSuccess) {
        showToast('Competitor info deleted successfully!')
        loadData()
      } else {
        showToast(res.message || 'Delete failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Display Inspection handlers ──
  const handleSaveDisplayInspection = async () => {
    const payload = {
      VisitID: Number(id),
      DisplayStatus: 'Inspected',
      IsDisplayClean: inspectionForm.clean ? 1 : 0,
      IsColorCardAvailable: inspectionForm.cards ? 1 : 0,
      IsStandAvailable: inspectionForm.stand ? 1 : 0,
      MissingMaterials: inspectionForm.missing.trim(),
      RequiredAction: inspectionForm.action.trim(),
      Notes: inspectionForm.notes.trim()
    }

    if (!API_URL) {
      setDisplayInspection({
        InspectionID: Date.now(),
        ...payload
      })
      showToast('Display inspection saved successfully (mock)')
      return
    }

    try {
      setLoading(true)
      const res = await saveVisitDisplayInspection(payload)
      if (res && res.isSuccess) {
        showToast('Display inspection details saved successfully!')
        loadData()
      } else {
        showToast(res.message || 'Save failed')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page-content">Loading details...</div>
  if (!visit) return <div className="page-content">Visit not found.</div>

  const isReadOnly = ['COMPLETED', 'CANCELLED', 'MISSED'].includes(visit.StatusCode)

  // Survey Calculations
  const groupQuestions = surveyQuestions.filter(q => q.GroupCode === surveyGroup)
  const answeredCount = surveyQuestions.filter(q => {
    const val = surveyAnswers[q.QuestionCode];
    return val !== undefined && val !== null && String(val).trim() !== '';
  }).length
  const totalCount = surveyQuestions.length
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  const handleSurveyChange = (code, val) => {
    setSurveyAnswers(prev => ({ ...prev, [code]: val }))
  }

  const handleCheckboxToggle = (questionCode, optionVal) => {
    const current = surveyAnswers[questionCode] || ''
    let values = current ? current.split(',').map(s => s.trim()) : []
    if (values.includes(optionVal)) {
      values = values.filter(v => v !== optionVal)
    } else {
      values.push(optionVal)
    }
    handleSurveyChange(questionCode, values.join(', '))
  }

  const handlePhotoUpload = (questionCode, file) => {
    if (!file) return;
    const reader = new FileReader()
    reader.onloadend = () => {
      handleSurveyChange(questionCode, reader.result)
      showToast('Photo uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const navigateToNextUnanswered = () => {
    const nextQ = surveyQuestions.find(q => {
      const val = surveyAnswers[q.QuestionCode];
      return !val || String(val).trim() === '';
    })
    if (nextQ) {
      setSurveyGroup(nextQ.GroupCode)
      showToast(`Scrolled to next unanswered question in ${nextQ.GroupCode}`)
    } else {
      showToast('All survey questions are answered!')
    }
  }

  const handleSurveySubmit = async () => {
    const requiredQuestions = surveyQuestions.filter(q => q.IsRequired === 1 || q.IsRequired === true)
    const missing = requiredQuestions.filter(q => !surveyAnswers[q.QuestionCode]?.trim())
    
    if (missing.length > 0) {
      showToast(`Missing required questions: ${missing.map(q => q.QuestionText).join(', ')}`)
      setSurveyGroup(missing[0].GroupCode)
      return
    }

    const formattedAnswers = surveyQuestions.map(q => {
      const answerVal = surveyAnswers[q.QuestionCode] || ''
      const isChoice = q.QuestionType === 'SingleChoice' || q.QuestionType === 'MultipleChoice'
      
      let optionId = null
      let answerText = answerVal
      let answerNumber = null
      
      if (isChoice && answerVal) {
        const opt = surveyOptions.find(o => o.QuestionID === q.QuestionID && (o.OptionText === answerVal || o.OptionValue === answerVal))
        if (opt) {
          optionId = opt.OptionID
        }
      }
      
      if (q.QuestionType === 'Number' && answerVal) {
        answerNumber = Number(answerVal)
        answerText = null
      }
      
      return {
        QuestionID: q.QuestionID,
        AnswerText: answerText,
        AnswerNumber: answerNumber,
        AnswerDate: q.QuestionType === 'Date' && answerVal ? answerVal : null,
        OptionID: optionId,
        IsAnswered: answerVal ? 1 : 0
      }
    })

    const payload = {
      VisitID: Number(id),
      SurveyTemplateID: surveyTemplate.SurveyTemplateID,
      SurveyStatus: 'Submitted',
      Answers: formattedAnswers
    }

    if (!API_URL) {
      setIsSurveySubmitted(true)
      setVisit(prev => ({ ...prev, IsSurveySubmitted: 1 }))
      showToast('Survey submitted successfully (mock)')
      return
    }

    try {
      setLoading(true)
      const res = await submitSurvey(payload)
      if (res && res.isSuccess) {
        showToast('Survey submitted successfully!')
        setIsSurveySubmitted(true)
        loadData()
      } else {
        showToast(res.message || 'Survey submission failed')
      }
    } catch (err) {
      showToast(`Error submitting survey: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar
        title="Visit Details"
        subtitle="Full page visit details with summary header, operational sidebar, and activity tabs."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/visits')}>
              <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back to Visits
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/visits/new')}>
              <Plus size={14} style={{ marginRight: 4 }} /> New Visit
            </button>
          </>
        }
      />

      <div className="page-content">
        <div className="details-container">
          
          {/* Left Main Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* 1. Visit Summary Card */}
            <div className="summary-card">
              
              {/* Badge Left */}
              <div className="summary-left">
                <div className="summary-left-icon">🎯</div>
                <div className="summary-left-no">{visit.VisitNo}</div>
                <StatusBadge code={visit.StatusCode} name={visit.StatusName} />
              </div>

              {/* Data Fields */}
              <div className="summary-fields-grid">
                <div className="summary-field-item">
                  <div className="summary-field-icon"><User size={14} /></div>
                  <div className="summary-field-info">
                    <label>Target Name</label>
                    <span>{visit.TargetName}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><Calendar size={14} /></div>
                  <div className="summary-field-info">
                    <label>Visit Date</label>
                    <span>{fmtDate(visit.VisitDate)}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><User size={14} /></div>
                  <div className="summary-field-info">
                    <label>Contact Person</label>
                    <span>{visit.ContactPerson || 'Ahmed Hassan'}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><ClipboardList size={14} /></div>
                  <div className="summary-field-info">
                    <label>Target Type</label>
                    <span>{visit.TargetTypeName}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><User size={14} /></div>
                  <div className="summary-field-info">
                    <label>Salesperson</label>
                    <span>{visit.SalespersonName || 'Mohammad'}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><Phone size={14} /></div>
                  <div className="summary-field-info">
                    <label>Mobile</label>
                    <span>{visit.MobileNumber || '0100 123 4567'}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><Sparkles size={14} /></div>
                  <div className="summary-field-info">
                    <label>Purpose</label>
                    <span>{visit.PurposeName}</span>
                  </div>
                </div>

                <div className="summary-field-item">
                  <div className="summary-field-icon"><MapPin size={14} /></div>
                  <div className="summary-field-info">
                    <label>Area</label>
                    <span>{visit.Area || 'Nasr City'}</span>
                  </div>
                </div>
              </div>

              {/* Map Segment */}
              <div className="summary-map-card">
                <div className="map-header">
                  <span>Visit Location</span>
                  <div className="map-dist-badge">1.2 km</div>
                </div>
                <div className="map-visual">
                  <Map size={36} color="var(--primary)" />
                </div>
                <div className="map-visual-address">
                  {visit.Governorate || 'Cairo'}, {visit.Area || 'Nasr City'}, Abbas El Akkad Street
                </div>
                <button className="map-visual-btn" onClick={() => showToast('Redirecting to Google Maps...')}>
                  Open Map
                </button>
              </div>

            </div>

            {/* 2. Visit Notes and Final Notes Card */}
            <div className={`collapsible-card ${notesCollapsed ? 'collapsed' : ''}`}>
              <div className="collapsible-head" onClick={() => setNotesCollapsed(v => !v)}>
                <div className="collapsible-head-title">
                  <h3>Visit Notes and Final Notes</h3>
                  <p>Write visit notes during the visit and final notes before completion</p>
                </div>
                <div className="collapsible-arrow">
                  <ChevronDown size={16} />
                </div>
              </div>

              <div className="collapsible-body">
                <div className="notes-group">
                  <label>Visit Notes <span>(Captured during checkout)</span></label>
                  <textarea 
                    rows={3} 
                    className="notes-textarea" 
                    placeholder="Customer requested specific items..."
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    disabled={visit.StatusCode !== 'CHECKED_IN'}
                  />
                </div>

                <div className="notes-group">
                  <label>Final Notes <span>(Required to complete visit)</span></label>
                  <textarea 
                    rows={3} 
                    className="notes-textarea" 
                    placeholder="Enter final closing notes..."
                    value={finalNotes}
                    onChange={(e) => setFinalNotes(e.target.value)}
                    disabled={visit.StatusCode !== 'CHECKED_OUT'}
                  />
                  <div className="notes-char-count">{finalNotes.length} / 1000</div>
                </div>

                {['CHECKED_IN', 'CHECKED_OUT'].includes(visit.StatusCode) && (
                  <div>
                    <button className="btn btn-primary" onClick={saveVisitNotesLocally}>
                      Save Draft Notes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Visit Activities Card */}
            <div className={`collapsible-card ${activitiesCollapsed ? 'collapsed' : ''}`}>
              <div className="collapsible-head" onClick={() => setActivitiesCollapsed(v => !v)}>
                <div className="collapsible-head-title">
                  <h3>Visit Activities</h3>
                  <p>Survey, attachments, follow-up, competitor info, and display inspection</p>
                </div>
                <div className="collapsible-arrow">
                  <ChevronDown size={16} />
                </div>
              </div>

              <div className="collapsible-body" style={{ padding: 0 }}>
                {/* Tabs row */}
                <div className="activities-tabs-container">
                  <button className={`activities-tab-item ${activeTab === 'Survey' ? 'active' : ''}`} onClick={() => setActiveTab('Survey')}>
                    📄 Survey
                  </button>
                  <button className={`activities-tab-item ${activeTab === 'Attachments' ? 'active' : ''}`} onClick={() => setActiveTab('Attachments')}>
                    📎 Attachments
                  </button>
                  <button className={`activities-tab-item ${activeTab === 'FollowUp' ? 'active' : ''}`} onClick={() => setActiveTab('FollowUp')}>
                    🔔 Follow-up
                  </button>
                  <button className={`activities-tab-item ${activeTab === 'Competitor' ? 'active' : ''}`} onClick={() => setActiveTab('Competitor')}>
                    👥 Competitor Info
                  </button>
                  <button className={`activities-tab-item ${activeTab === 'Inspection' ? 'active' : ''}`} onClick={() => setActiveTab('Inspection')}>
                    💬 Display Inspection
                  </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'Survey' && (
                  <div>
                    {!isSurveyRequired ? (
                      <div className="empty-tab" style={{ padding: 32, textAlign: 'center' }}>
                        <ClipboardList size={48} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                        <h4 style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>No Survey Required</h4>
                        <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
                          This visit is not mapped to any survey template. You can proceed with standard notes and check out.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Progress Segment */}
                        <div className="survey-progress-bar-wrap">
                          <div className="survey-progress-info">
                            <div className="survey-progress-text">
                              Survey Progress: {answeredCount} / {totalCount} questions answered
                            </div>
                            <div className="survey-progress-track">
                              <div className="survey-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                          <div className="survey-progress-actions">
                            <button className="btn btn-ghost btn-sm" onClick={navigateToNextUnanswered}>
                              Next Unanswered
                            </button>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={handleSurveySubmit}
                              disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                            >
                              {isSurveySubmitted ? '✓ Submitted' : 'Submit Survey'}
                            </button>
                          </div>
                        </div>

                        {/* Survey grid */}
                        <div className="survey-body-grid">
                          {/* Sidebar navigation */}
                          <div className="survey-group-sidebar">
                            {surveyGroups.map(grp => {
                              const grpCount = surveyQuestions.filter(q => q.GroupCode === grp.GroupCode).length
                              return (
                                <button 
                                  key={grp.GroupCode}
                                  className={`survey-group-btn ${surveyGroup === grp.GroupCode ? 'active' : ''}`}
                                  onClick={() => setSurveyGroup(grp.GroupCode)}
                                >
                                  <span>{grp.GroupName}</span>
                                  <span className="survey-group-count">{grpCount}</span>
                                </button>
                              )
                            })}
                          </div>

                          {/* Questions List */}
                          <div className="survey-questions-list">
                            {groupQuestions.map((q) => (
                              <div className="question-card" key={q.QuestionID}>
                                <div className="question-num">{q.DisplayOrder}</div>
                                <div className="question-details">
                                  <div className="question-text-wrap">
                                    <span className="question-text">
                                      {q.QuestionText} {q.IsRequired ? <span className="req">*</span> : ''}
                                    </span>
                                    <span className="question-meta">{q.GroupCode} group {q.IsRequired ? ' · Required' : ''}</span>
                                  </div>
                                  <div className="question-input-wrap">
                                    {q.QuestionType === 'SingleChoice' ? (
                                      <select 
                                        className="question-select"
                                        value={surveyAnswers[q.QuestionCode] || ''}
                                        onChange={(e) => handleSurveyChange(q.QuestionCode, e.target.value)}
                                        disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                      >
                                        <option value="">Select an option</option>
                                        {surveyOptions.filter(o => o.QuestionID === q.QuestionID).map(opt => (
                                          <option key={opt.OptionID} value={opt.OptionText}>{opt.OptionText}</option>
                                        ))}
                                      </select>
                                    ) : q.QuestionType === 'MultipleChoice' ? (
                                      <div className="checkbox-options-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                        {surveyOptions.filter(o => o.QuestionID === q.QuestionID).map(opt => {
                                          const isChecked = (surveyAnswers[q.QuestionCode] || '').split(',').map(s => s.trim()).includes(opt.OptionText);
                                          return (
                                            <label key={opt.OptionID} className="checkbox-option-label" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                              <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                onChange={() => handleCheckboxToggle(q.QuestionCode, opt.OptionText)}
                                                disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                              />
                                              <span>{opt.OptionText}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    ) : q.QuestionType === 'Photo' ? (
                                      <div className="photo-upload-container" style={{ marginTop: 8 }}>
                                        {surveyAnswers[q.QuestionCode] ? (
                                          <div className="photo-preview-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 240 }}>
                                            <img src={surveyAnswers[q.QuestionCode]} alt="Uploaded preview" className="photo-preview" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)', maxHeight: 180, objectFit: 'cover' }} />
                                            <button 
                                              className="btn btn-danger btn-sm photo-remove-btn" 
                                              onClick={() => handleSurveyChange(q.QuestionCode, '')}
                                              disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                            >
                                              Remove Photo
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="photo-input-wrap">
                                            <input 
                                              type="file" 
                                              accept="image/*" 
                                              id={`photo-${q.QuestionCode}`}
                                              className="photo-file-input"
                                              style={{ display: 'none' }}
                                              onChange={(e) => handlePhotoUpload(q.QuestionCode, e.target.files[0])}
                                              disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                            />
                                            <label htmlFor={`photo-${q.QuestionCode}`} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                              📸 Choose Photo / Capture
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    ) : q.QuestionType === 'Number' ? (
                                      <input 
                                        type="number" 
                                        className="question-textbox"
                                        placeholder="Enter number response..."
                                        value={surveyAnswers[q.QuestionCode] || ''}
                                        onChange={(e) => handleSurveyChange(q.QuestionCode, e.target.value)}
                                        disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                      />
                                    ) : (
                                      <input 
                                        type="text" 
                                        className="question-textbox"
                                        placeholder="Enter text response..."
                                        value={surveyAnswers[q.QuestionCode] || ''}
                                        onChange={(e) => handleSurveyChange(q.QuestionCode, e.target.value)}
                                        disabled={visit.StatusCode !== 'CHECKED_IN' || isSurveySubmitted}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'Attachments' && (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <strong style={{ fontSize: 13 }}>Attachments / Photos</strong>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setAttachmentForm({ type: 'Photo', name: '', url: '', notes: '' })
                          setActiveModal('add_attachment')
                        }}
                        disabled={isReadOnly}
                      >
                        <PlusCircle size={14} style={{ marginRight: 6 }} /> Add Attachment
                      </button>
                    </div>

                    {attachments.length === 0 ? (
                      <div style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: '32px 16px', textAlign: 'center' }}>
                        <Paperclip size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>No attachments uploaded yet</p>
                        <p style={{ color: 'var(--muted)', fontSize: 11 }}>Click "Add Attachment" above to log files, images, or documents.</p>
                      </div>
                    ) : (
                      <table className="dg-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Type</th><th>File Name</th><th>Notes</th><th>URL</th><th>Created By</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attachments.map(att => (
                            <tr key={att.AttachmentID}>
                              <td><span className="dg-badge dg-normal">{att.AttachmentType}</span></td>
                              <td><strong>{att.FileName}</strong></td>
                              <td>{att.AttachmentNotes || '-'}</td>
                              <td>
                                {att.FileURL ? (
                                  <a href={att.FileURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 700 }}>
                                    Open Link
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--muted)' }}>No link</span>
                                )}
                              </td>
                              <td><span style={{ fontSize: 11 }}>{att.CreatedBy}</span></td>
                              <td>
                                <button 
                                  className="btn btn-ghost btn-sm" 
                                  style={{ color: 'var(--danger)', padding: '2px 8px' }}
                                  onClick={() => handleDeleteAttachment(att.AttachmentID)}
                                  disabled={isReadOnly}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'FollowUp' && (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <strong style={{ fontSize: 13 }}>Pending Tasks</strong>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setTaskForm({ title: '', desc: '', date: '', priority: 'Normal', status: 'Open' })
                          setActiveModal('add_task')
                        }}
                        disabled={isReadOnly}
                      >
                        <PlusCircle size={14} style={{ marginRight: 6 }} /> Add Task
                      </button>
                    </div>

                    {followUpTasks.length === 0 ? (
                      <div style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: '32px 16px', textAlign: 'center' }}>
                        <ClipboardList size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>No follow-up tasks defined yet</p>
                        <p style={{ color: 'var(--muted)', fontSize: 11 }}>Click "Add Task" above to add new tasks.</p>
                      </div>
                    ) : (
                      <table className="dg-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Task Title</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {followUpTasks.map(t => (
                            <tr key={t.FollowUpTaskID}>
                              <td>
                                <div><strong>{t.TaskTitle}</strong></div>
                                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.TaskDescription}</div>
                              </td>
                              <td>{t.DueDate ? fmtDate(t.DueDate) : 'No due date'}</td>
                              <td>
                                <span className={`dg-badge ${t.Priority === 'High' ? 'dg-warn' : (t.Priority === 'Low' ? 'dg-normal' : 'dg-good')}`}>
                                  {t.Priority}
                                </span>
                              </td>
                              <td>
                                <span className={`dg-badge ${t.TaskStatus === 'Completed' ? 'dg-good' : 'dg-warn'}`}>
                                  {t.TaskStatus}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-ghost btn-sm" 
                                  style={{ color: 'var(--danger)', padding: '2px 8px' }}
                                  onClick={() => handleDeleteFollowUpTask(t.FollowUpTaskID)}
                                  disabled={isReadOnly}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'Competitor' && (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <strong style={{ fontSize: 13 }}>Competitor Product Information</strong>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setCompetitorForm({ name: '', product: '', price: '', offer: '', notes: '' })
                          setActiveModal('add_competitor')
                        }}
                        disabled={isReadOnly}
                      >
                        <PlusCircle size={14} style={{ marginRight: 6 }} /> Add Brand Info
                      </button>
                    </div>

                    {competitorInfos.length === 0 ? (
                      <div style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: '32px 16px', textAlign: 'center' }}>
                        <User size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>No competitor records logged</p>
                        <p style={{ color: 'var(--muted)', fontSize: 11 }}>Click "Add Brand Info" to log competitor products details.</p>
                      </div>
                    ) : (
                      <table className="dg-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Competitor Brand</th><th>Product</th><th>Price</th><th>Offer Description</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {competitorInfos.map(c => (
                            <tr key={c.CompetitorInfoID}>
                              <td>
                                <div><strong>{c.CompetitorName}</strong></div>
                                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.Notes}</div>
                              </td>
                              <td>{c.ProductName}</td>
                              <td>{c.Price ? `${c.Price} EGP` : '-'}</td>
                              <td>{c.OfferDescription || '-'}</td>
                              <td>
                                <button 
                                  className="btn btn-ghost btn-sm" 
                                  style={{ color: 'var(--danger)', padding: '2px 8px' }}
                                  onClick={() => handleDeleteCompetitorInfo(c.CompetitorInfoID)}
                                  disabled={isReadOnly}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'Inspection' && (
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="notes-group">
                      <strong style={{ fontSize: 13, marginBottom: 10 }}>GLC Display Inspection Checklist</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={inspectionForm.clean} 
                            onChange={(e) => setInspectionForm(prev => ({ ...prev, clean: e.target.checked }))}
                            disabled={isReadOnly}
                          /> 
                          <span>Display Stand Clean</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={inspectionForm.cards} 
                            onChange={(e) => setInspectionForm(prev => ({ ...prev, cards: e.target.checked }))}
                            disabled={isReadOnly}
                          /> 
                          <span>Color Cards Available</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={inspectionForm.stand} 
                            onChange={(e) => setInspectionForm(prev => ({ ...prev, stand: e.target.checked }))}
                            disabled={isReadOnly}
                          /> 
                          <span>Display Stand Damaged</span>
                        </label>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="notes-group">
                        <label>Missing Materials</label>
                        <input 
                          type="text" 
                          className="question-textbox" 
                          placeholder="e.g. outdoor catalogs, brochures..." 
                          value={inspectionForm.missing}
                          onChange={(e) => setInspectionForm(prev => ({ ...prev, missing: e.target.value }))}
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="notes-group">
                        <label>Required Action</label>
                        <input 
                          type="text" 
                          className="question-textbox" 
                          placeholder="e.g. dispatch new stand, replenish color cards..." 
                          value={inspectionForm.action}
                          onChange={(e) => setInspectionForm(prev => ({ ...prev, action: e.target.value }))}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    <div className="notes-group" style={{ marginTop: 10 }}>
                      <label>Inspection Notes / General Comments</label>
                      <textarea 
                        rows={2} 
                        className="notes-textarea" 
                        placeholder="Specify display updates needed..." 
                        value={inspectionForm.notes}
                        onChange={(e) => setInspectionForm(prev => ({ ...prev, notes: e.target.value }))}
                        disabled={isReadOnly}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleSaveDisplayInspection}
                        disabled={isReadOnly}
                      >
                        Save Display Inspection Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar Columns */}
          <div>
            
            {/* 1. Visit Timeline Card */}
            <div className="sidebar-card">
              <div className="sidebar-card-title">
                📋 Visit Timeline
              </div>
              <div className="timeline-container">
                <div className={`timeline-step completed`}>
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-label">Planned</div>
                  <div className="timeline-desc">Visit has been planned</div>
                </div>

                <div className={`timeline-step ${visit.StatusCode !== 'PLANNED' ? 'completed' : 'active'}`}>
                  <div className="timeline-dot">
                    {['PLANNED'].includes(visit.StatusCode) ? '2' : '✓'}
                  </div>
                  <div className="timeline-label">Checked-In</div>
                  <div className="timeline-desc">
                    {visit.CheckInDateTime ? `Checked in at ${new Date(visit.CheckInDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'You have checked-in at the location'}
                  </div>
                </div>

                <div className={`timeline-step ${['CHECKED_IN'].includes(visit.StatusCode) ? 'active' : (['CHECKED_OUT', 'COMPLETED'].includes(visit.StatusCode) ? 'completed' : '')}`}>
                  <div className="timeline-dot">
                    {['PLANNED', 'CHECKED_IN'].includes(visit.StatusCode) ? '3' : '✓'}
                  </div>
                  <div className="timeline-label">Survey / Files</div>
                  <div className="timeline-desc">Complete survey and upload files</div>
                </div>

                <div className={`timeline-step ${['CHECKED_OUT'].includes(visit.StatusCode) ? 'active' : (['COMPLETED'].includes(visit.StatusCode) ? 'completed' : '')}`}>
                  <div className="timeline-dot">
                    {['PLANNED', 'CHECKED_IN', 'CHECKED_OUT'].includes(visit.StatusCode) ? '4' : '✓'}
                  </div>
                  <div className="timeline-label">Check-Out</div>
                  <div className="timeline-desc">Check-out from location</div>
                </div>

                <div className={`timeline-step ${['COMPLETED'].includes(visit.StatusCode) ? 'completed' : (visit.StatusCode === 'COMPLETED' ? 'active' : '')}`}>
                  <div className="timeline-dot">5</div>
                  <div className="timeline-label">Complete</div>
                  <div className="timeline-desc">Finalize and complete visit</div>
                </div>
              </div>
            </div>

            {/* 2. Check-In / Check-Out Metadata */}
            <div className="sidebar-card">
              <div className="sidebar-card-title">
                ⏰ Check-In / Check-Out
              </div>
              <div className="check-info-grid">
                <div className="check-info-cell">
                  <label>Check-in Time</label>
                  <span>{visit.CheckInDateTime ? new Date(visit.CheckInDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not checked-in'}</span>
                </div>
                <div className="check-info-cell">
                  <label>Check-in GPS</label>
                  <span>{visit.CheckInLatitude ? `${visit.CheckInLatitude.toFixed(4)}, ${visit.CheckInLongitude.toFixed(4)}` : 'N/A'}</span>
                </div>
                <div className="check-info-cell">
                  <label>Check-out Time</label>
                  {visit.CheckOutDateTime ? (
                    <span>{new Date(visit.CheckOutDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  ) : (
                    <span className="highlight">Not checked-out yet</span>
                  )}
                </div>
                <div className="check-info-cell">
                  <label>Visit Duration</label>
                  <span>{visit.VisitDurationMinutes ? `${visit.VisitDurationMinutes} mins` : 'Calculated at check-out'}</span>
                </div>
              </div>
            </div>

            {/* 3. Quick Actions */}
            <div className="sidebar-card">
              <div className="sidebar-card-title">
                ⚡ Quick Actions
              </div>
              <div className="actions-row">
                <button 
                  className="btn btn-success" 
                  disabled={visit.StatusCode !== 'PLANNED'} 
                  onClick={handleCheckIn}
                >
                  ✓ Check-In
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={visit.StatusCode !== 'CHECKED_IN' || (isSurveyRequired && !isSurveySubmitted)} 
                  onClick={() => {
                    setModalNotes(visitNotes)
                    setActiveModal('checkout')
                  }}
                >
                  ⏰ Check-Out
                </button>
              </div>

              {visit.StatusCode === 'CHECKED_IN' && isSurveyRequired && !isSurveySubmitted && (
                <div style={{ marginTop: 8, fontSize: 11, color: '#eb5e28', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(235, 94, 40, 0.08)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(235, 94, 40, 0.2)' }}>
                  <AlertCircle size={14} />
                  <span>Submit the survey to unlock Check-Out.</span>
                </div>
              )}

              {visit.StatusCode === 'CHECKED_OUT' && (
                <div style={{ marginBottom: 8 }}>
                  <button 
                    className="btn btn-success" 
                    style={{ width: '100%', height: 42 }}
                    onClick={() => {
                      setModalNotes(finalNotes)
                      setActiveModal('complete')
                    }}
                  >
                    ✓ Complete Visit
                  </button>
                </div>
              )}

              {!['COMPLETED', 'CANCELLED', 'MISSED'].includes(visit.StatusCode) && (
                <div>
                  <button 
                    className="btn btn-danger action-btn-danger" 
                    onClick={() => {
                      setModalNotes('')
                      setModalReasonId('')
                      setActiveModal('cancel')
                    }}
                  >
                    ✕ Cancel Visit
                  </button>
                </div>
              )}

              {visit.StatusCode === 'PLANNED' && (
                <div style={{ marginTop: 8 }}>
                  <button 
                    className="btn btn-ghost action-btn-danger"
                    style={{ width: '100%', border: '1px solid var(--line)' }}
                    onClick={() => {
                      setModalNotes('')
                      setModalReasonId('')
                      setActiveModal('miss')
                    }}
                  >
                    ⚠️ Miss Visit
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Action Modals */}
      
      {/* 1. Check Out Modal */}
      {activeModal === 'checkout' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Check Out Visit</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body">
              <div className="notes-group">
                <label>Visit Notes / Summary *</label>
                <textarea 
                  rows={4}
                  className="notes-textarea"
                  placeholder="Summarize customer feedback or actions during this visit..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleCheckOutSubmit}>Check Out</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Complete Visit Modal */}
      {activeModal === 'complete' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Complete Visit</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body">
              <div className="notes-group">
                <label>Final Closing Notes *</label>
                <textarea 
                  rows={4}
                  className="notes-textarea"
                  placeholder="Enter final summary notes for the manager/team..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn green" onClick={handleCompleteSubmit}>Complete Visit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cancel Visit Modal */}
      {activeModal === 'cancel' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Cancel Visit</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="notes-group">
                <label>Cancellation Reason *</label>
                <select 
                  className="question-select"
                  value={modalReasonId}
                  onChange={(e) => setModalReasonId(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  {CANCELLATION_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="notes-group">
                <label>Notes / Explanations</label>
                <textarea 
                  rows={3}
                  className="notes-textarea"
                  placeholder="Provide brief details on cancellation..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn red" onClick={handleCancelSubmit}>Cancel Visit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Miss Visit Modal */}
      {activeModal === 'miss' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Mark Visit as Missed</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="notes-group">
                <label>Missed Reason *</label>
                <select 
                  className="question-select"
                  value={modalReasonId}
                  onChange={(e) => setModalReasonId(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  {MISSED_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="notes-group">
                <label>Notes / Explanations</label>
                <textarea 
                  rows={3}
                  className="notes-textarea"
                  placeholder="Provide details..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn red" onClick={handleMissSubmit}>Mark Missed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Attachment Modal */}
      {activeModal === 'add_attachment' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Add Attachment</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="notes-group">
                <label>Attachment Type *</label>
                <select 
                  className="question-select"
                  value={attachmentForm.type}
                  onChange={(e) => setAttachmentForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Photo">Photo</option>
                  <option value="Document">Document</option>
                  <option value="Audio">Audio</option>
                  <option value="Video">Video</option>
                </select>
              </div>

              <div className="notes-group">
                <label>File Name *</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. shop_signboard.jpg" 
                  value={attachmentForm.name}
                  onChange={(e) => setAttachmentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>File URL / Path</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. https://example.com/files/img.jpg" 
                  value={attachmentForm.url}
                  onChange={(e) => setAttachmentForm(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Attachment Notes</label>
                <textarea 
                  rows={2}
                  className="notes-textarea"
                  placeholder="Enter notes about this file..."
                  value={attachmentForm.notes}
                  onChange={(e) => setAttachmentForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleAddAttachment}>Save Attachment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Follow-up Task Modal */}
      {activeModal === 'add_task' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Add Follow-up Task</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="notes-group">
                <label>Task Title *</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. Deliver catalogs" 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  className="question-textbox" 
                  value={taskForm.date}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="notes-group">
                  <label>Priority</label>
                  <select 
                    className="question-select"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="notes-group">
                  <label>Status</label>
                  <select 
                    className="question-select"
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Open">Open</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="notes-group">
                <label>Task Description / Notes</label>
                <textarea 
                  rows={2}
                  className="notes-textarea"
                  placeholder="Enter details about this task..."
                  value={taskForm.desc}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, desc: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleAddFollowUpTask}>Save Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Competitor Info Modal */}
      {activeModal === 'add_competitor' && (
        <div className="dg-modal show">
          <div className="dg-modal-box">
            <div className="dg-modal-head">
              <h3>Add Competitor Brand Information</h3>
              <button className="dg-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="dg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="notes-group">
                <label>Competitor Brand *</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. Sipes Paints" 
                  value={competitorForm.name}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. Outdoor Latex" 
                  value={competitorForm.product}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, product: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Price (EGP)</label>
                <input 
                  type="number" 
                  className="question-textbox" 
                  placeholder="e.g. 450" 
                  value={competitorForm.price}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Offer Description</label>
                <input 
                  type="text" 
                  className="question-textbox" 
                  placeholder="e.g. Buy 10 get 1 free" 
                  value={competitorForm.offer}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, offer: e.target.value }))}
                />
              </div>

              <div className="notes-group">
                <label>Competitor Notes / Observations</label>
                <textarea 
                  rows={2}
                  className="notes-textarea"
                  placeholder="Enter observations..."
                  value={competitorForm.notes}
                  onChange={(e) => setCompetitorForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="dg-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="dg-btn primary" onClick={handleAddCompetitorInfo}>Save Brand Info</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onHide={() => setToast('')} />
    </>
  )
}
