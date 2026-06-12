import axios from 'axios'
import { API_URL as CONST_API_URL } from '../shared/constants'

// Base URL is either imported CONST_API_URL or defaults to root-level endpoint
const API_URL = CONST_API_URL || '/api/GeneralAPI/DynamicDatabase'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    sp_name: 'APIVisitOperation',
    'Content-Type': 'application/json',
  },
})

const defaultPayload = {
  User: 'o.taha',
  PlatForm: 'web',
  AppVersionWeb: '33',
  AndroidVersion: '33',
  IOSVersion: '33',
  FireBaseToken: '',
  DatabaseIP: '45.32.255.109',
  DatabaseName: 'visit',
}

export async function callApi(payload = {}) {
  const finalPayload = {
    ...defaultPayload,
    ...payload,
  }
  const response = await api.post('', finalPayload)
  return normalizeApiResponse(response.data)
}

export function normalizeApiResponse(data) {
  const lists = []
  if (data && typeof data === 'object') {
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) lists.push(data[key])
    })
  }
  return {
    raw: data,
    list0: data?.List0 || data?.list0 || lists[0] || [],
    list1: data?.List1 || data?.list1 || lists[1] || [],
    list2: data?.List2 || data?.list2 || lists[2] || [],
    list3: data?.List3 || data?.list3 || lists[3] || [],
    list4: data?.List4 || data?.list4 || lists[4] || [],
    list5: data?.List5 || data?.list5 || lists[5] || [],
    listCount: lists.length,
    hasData: lists.length > 0,
    state: data?.State ?? data?.state ?? 0,
    message: data?.Message ?? data?.message ?? '',
    isSuccess: Number(data?.State ?? data?.state ?? 0) >= 0,
  }
}

export async function executeOperation(operation, extraPayload = {}) {
  return callApi({
    operation,
    ...extraPayload,
  })
}

// ── Visit ──
export async function getVisitList(extraPayload = {}) {
  return executeOperation('Get Visit List', extraPayload)
}

export async function getVisitDetails(visitId) {
  return executeOperation('Get Single', {
    LineData: JSON.stringify([{ VisitID: Number(visitId) }]),
  })
}

export async function addVisit(lineData) {
  return executeOperation('New Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function editVisit(lineData) {
  return executeOperation('Update Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function startVisit(lineData) {
  return executeOperation('Check In', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function checkOutVisit(lineData) {
  return executeOperation('Check Out', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function completeVisit(lineData) {
  return executeOperation('Complete Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function cancelVisit(lineData) {
  return executeOperation('Cancel Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function missVisit(lineData) {
  return executeOperation('Miss Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function approveVisit(lineData) {
  return executeOperation('Approve Visit', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

// ── Targets ──
export async function getErpCustomers() {
  return executeOperation('Get ERP Customers')
}

export async function getShowRooms() {
  return executeOperation('Get Show Rooms')
}

export async function getProjectMaster() {
  return executeOperation('Get Project Master')
}

export async function getNearestTarget(lineData) {
  return executeOperation('Get Nearest Target', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function getTargets(targetTypeId) {
  const extra = {}
  if (targetTypeId) {
    extra.LineData = JSON.stringify([{ TargetTypeID: Number(targetTypeId), TargetID: Number(targetTypeId) }])
  }
  return executeOperation('Get Targets', extra)
}

export async function getTargetTypes() {
  return executeOperation('Get Target Type List')
}

export async function getPurposes() {
  return executeOperation('Get Purpose List')
}

export async function addTarget(lineData) {
  return executeOperation('New Target', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function editTarget(lineData) {
  return executeOperation('Update Target', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteTarget(targetId) {
  return executeOperation('Delete Target', {
    LineData: JSON.stringify([{ TargetID: Number(targetId) }]),
  })
}

// ── User Master ──
export async function getUsers() {
  return executeOperation('Get User List')
}

export async function addUser(lineData) {
  return executeOperation('New User', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function editUser(lineData) {
  return executeOperation('Update User', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteUser(userId) {
  return executeOperation('Delete User', {
    LineData: JSON.stringify([{ UserID: Number(userId) }]),
  })
}

// ── Team Master ──
export async function getTeams() {
  return executeOperation('Get Team List')
}

export async function addTeam(lineData) {
  return executeOperation('New Team', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function editTeam(lineData) {
  return executeOperation('Update Team', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteTeam(teamId) {
  return executeOperation('Delete Team', {
    LineData: JSON.stringify([{ TeamID: Number(teamId) }]),
  })
}

// ── User Permission Master ──
export async function getPermissions() {
  return executeOperation('Get Permission List')
}

export async function addPermission(lineData) {
  return executeOperation('New Permission', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function editPermission(lineData) {
  return executeOperation('Update Permission', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deletePermission(permissionId) {
  return executeOperation('Delete Permission', {
    LineData: JSON.stringify([{ PermissionID: Number(permissionId) }]),
  })
}

// ── Survey Template Builder ──
export async function getSurveyTemplates() {
  return executeOperation('Get Survey Template List')
}

export async function getSurveyTemplateDetails(templateId) {
  return executeOperation('Get Survey Template Details', {
    LineData: JSON.stringify([{ SurveyTemplateID: Number(templateId) }]),
  })
}

export async function saveSurveyTemplate(lineData) {
  return executeOperation('Save Survey Template', {
    LineData: JSON.stringify(lineData),
  })
}

export async function deleteSurveyTemplate(templateId) {
  return executeOperation('Delete Survey Template', {
    LineData: JSON.stringify([{ SurveyTemplateID: Number(templateId) }]),
  })
}

// ── Survey ──
export async function submitSurvey(lineData) {
  return executeOperation('Submit Survey', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function getSurveyAnswers(lineData) {
  return executeOperation('Get Survey Answers', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

// ── Team ──
export async function getSalespersons() {
  return executeOperation('Get Salesperson List')
}

export async function getMerchantUsers() {
  return executeOperation('Get Merchant User List')
}

// ── KPI ──
export async function getDashboardKPI(lineData = {}) {
  return executeOperation('Get Dashboard KPI', {
    LineData: JSON.stringify([lineData]),
  })
}

export async function getSalespersonKPI(lineData = {}) {
  return executeOperation('Get Salesperson KPI', {
    LineData: JSON.stringify([lineData]),
  })
}

export async function getMerchantKPI(lineData = {}) {
  return executeOperation('Get Merchant KPI', {
    LineData: JSON.stringify([lineData]),
  })
}

export async function getCompetitorKPI(lineData = {}) {
  return executeOperation('Get Competitor KPI', {
    LineData: JSON.stringify([lineData]),
  })
}

// ── Tabs CRUD ──
export async function saveVisitAttachment(lineData) {
  return executeOperation('Save Attachment', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteVisitAttachment(attachmentId) {
  return executeOperation('Delete Attachment', {
    LineData: JSON.stringify([{ AttachmentID: Number(attachmentId) }]),
  })
}

export async function saveVisitFollowUpTask(lineData) {
  return executeOperation('Save Follow-up Task', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteVisitFollowUpTask(taskId) {
  return executeOperation('Delete Follow-up Task', {
    LineData: JSON.stringify([{ FollowUpTaskID: Number(taskId) }]),
  })
}

export async function saveVisitCompetitorInfo(lineData) {
  return executeOperation('Save Competitor Info', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function deleteVisitCompetitorInfo(competitorInfoId) {
  return executeOperation('Delete Competitor Info', {
    LineData: JSON.stringify([{ CompetitorInfoID: Number(competitorInfoId) }]),
  })
}

export async function saveVisitDisplayInspection(lineData) {
  return executeOperation('Save Display Inspection', {
    LineData: JSON.stringify(Array.isArray(lineData) ? lineData : [lineData]),
  })
}

export async function getSurveyDashboardData(visitId = null, templateId = null) {
  const lineData = {}
  if (visitId) lineData.VisitID = Number(visitId)
  if (templateId) lineData.SurveyTemplateID = Number(templateId)
  
  return executeOperation('Get Survey Dashboard Data', {
    LineData: JSON.stringify([lineData]),
  })
}

export default api

