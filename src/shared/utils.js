export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB') : '—'

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB') : '—'

export const fmtDuration = (mins) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

export const statusColor = (code) => ({
  PLANNED:     'blue',
  CHECKED_IN:  'yellow',
  CHECKED_OUT: 'purple',
  COMPLETED:   'green',
  CANCELLED:   'red',
  MISSED:      'gray',
  DRAFT:       'gray',
}[code] ?? 'gray')
