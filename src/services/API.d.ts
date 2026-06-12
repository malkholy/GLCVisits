import type { AxiosInstance } from 'axios'

export interface ApiListResponse<T = Record<string, unknown>> {
  raw: unknown
  list0: T[]
  list1: T[]
  list2: T[]
  list3: T[]
  listCount: number
  hasData: boolean
  state: number
  message: string
  isSuccess: boolean
}

declare const api: AxiosInstance
export default api

export function callApi(payload?: Record<string, unknown>): Promise<ApiListResponse>
export function normalizeApiResponse(data: Record<string, unknown>): ApiListResponse
export function executeOperation(operation: string, extraPayload?: Record<string, unknown>): Promise<ApiListResponse>

export function getVisitList(extraPayload?: Record<string, unknown>): Promise<ApiListResponse>
export function getVisitDetails(visitId: number | string): Promise<ApiListResponse>
export function addVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function editVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function startVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function checkOutVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function completeVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function cancelVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function missVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function approveVisit(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>

export function getErpCustomers(): Promise<ApiListResponse>
export function getShowRooms(): Promise<ApiListResponse>
export function getProjectMaster(): Promise<ApiListResponse>
export function getNearestTarget(lineData: Record<string, unknown>): Promise<ApiListResponse>
export function getTargets(targetTypeId: number | string): Promise<ApiListResponse>
export function getTargetTypes(): Promise<ApiListResponse>
export function getPurposes(): Promise<ApiListResponse>
export function addTarget(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function editTarget(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function deleteTarget(targetId: number | string): Promise<ApiListResponse>

export function getUsers(): Promise<ApiListResponse>
export function addUser(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function editUser(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function deleteUser(userId: number | string): Promise<ApiListResponse>

export function getTeams(): Promise<ApiListResponse>
export function addTeam(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function editTeam(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function deleteTeam(teamId: number | string): Promise<ApiListResponse>

export function getPermissions(): Promise<ApiListResponse>
export function addPermission(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function editPermission(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function deletePermission(permissionId: number | string): Promise<ApiListResponse>

export function getSurveyTemplates(): Promise<ApiListResponse>
export function getSurveyTemplateDetails(templateId: number | string): Promise<ApiListResponse>
export function saveSurveyTemplate(lineData: Record<string, unknown>): Promise<ApiListResponse>
export function deleteSurveyTemplate(templateId: number | string): Promise<ApiListResponse>

export function submitSurvey(lineData: Record<string, unknown> | Record<string, unknown>[]): Promise<ApiListResponse>
export function getSurveyAnswers(lineData: Record<string, unknown>): Promise<ApiListResponse>

export function getSalespersons(): Promise<ApiListResponse>
export function getMerchantUsers(): Promise<ApiListResponse>

export function getDashboardKPI(lineData?: Record<string, unknown>): Promise<ApiListResponse>
export function getSalespersonKPI(lineData?: Record<string, unknown>): Promise<ApiListResponse>
export function getMerchantKPI(lineData?: Record<string, unknown>): Promise<ApiListResponse>
export function getCompetitorKPI(lineData?: Record<string, unknown>): Promise<ApiListResponse>
