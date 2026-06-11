import { statusColor } from '../shared/utils'
import './StatusBadge.css'

export default function StatusBadge({ code, name }) {
  return <span className={`badge badge-${statusColor(code)}`}>{name}</span>
}
