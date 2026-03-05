import { CheckCircle, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  const isErr = toast.type === 'error'
  return (
    <div style={{
      position:'absolute', bottom:'5rem', left:'50%',
      transform:`translateX(-50%) translateY(${toast.visible?0:'1rem'})`,
      opacity: toast.visible ? 1 : 0,
      transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      background: isErr ? '#ef4444' : '#25D366',
      color:'#fff', padding:'0.65rem 1.3rem', borderRadius:'999px',
      fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'0.82rem',
      boxShadow: isErr ? '0 8px 32px rgba(239,68,68,0.4)' : '0 8px 32px rgba(37,211,102,0.35)',
      zIndex:9999, display:'flex', alignItems:'center', gap:'0.5rem',
      pointerEvents:'none', whiteSpace:'nowrap', maxWidth:'80%',
    }}>
      {isErr ? <AlertCircle size={15}/> : <CheckCircle size={15}/>}
      {toast.message}
    </div>
  )
}
