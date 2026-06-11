import { API_URL, SP_NAME } from './constants'

// Will be activated once API_URL is set
export async function apiCall(operation, lineData = {}, user = 'admin') {
  if (!API_URL) {
    console.warn('[apiCall] API not configured yet. Operation:', operation)
    return { state: 0, data: [] }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Sp_Name: SP_NAME,
      Operation: operation,
      LineData: JSON.stringify(lineData),
      User: user,
    }),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}
