import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, onHide }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onHide, 2200)
    return () => clearTimeout(t)
  }, [message])

  return <div className={`toast ${message ? 'show' : ''}`}>{message}</div>
}
