import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header({ title, subtitle, backScreen, right, backFn }) {
  const { navigate } = useApp()
  const handleBack = backFn || (() => navigate(backScreen || 'feed'))

  return (
    <div style={{
      padding:'0.85rem 1rem', display:'flex', alignItems:'center', gap:'0.75rem',
      borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, background:'#0d1117',
    }}>
      <button onClick={handleBack} style={{
        width:36, height:36, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)',
        background:'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <ArrowLeft size={16}/>
      </button>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'0.95rem', truncate:'ellipsis', overflow:'hidden', whiteSpace:'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.7rem', letterSpacing:'0.07em', textTransform:'uppercase' }}>{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}
