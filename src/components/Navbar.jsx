import { Globe, PlusSquare, Package, User, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { screen, navigate, isAdmin } = useApp()

  const tabs = [
    { id:'feed',    icon:Globe,      label:'Explorer' },
    { id:'create',  icon:PlusSquare, label:'Créer' },
    { id:'mypacks', icon:Package,    label:'Mes packs' },
    { id:'profile', icon:User,       label:'Profil' },
    ...(isAdmin ? [{ id:'admin', icon:ShieldCheck, label:'Admin' }] : []),
  ]

  return (
    <div style={{
      display:'flex', background:'#111827',
      borderTop:'1px solid rgba(255,255,255,0.06)',
      padding:'0.5rem 0 0.75rem', flexShrink:0,
    }}>
      {tabs.map(({ id, icon:Icon, label }) => {
        const active = screen === id
        return (
          <button key={id} onClick={() => navigate(id)} style={{
            flex:1, border:'none', background:'none', color: active ? '#25D366' : 'rgba(255,255,255,0.35)',
            cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
            padding:'0.3rem 0', transition:'color 0.2s',
          }}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8}/>
            <span style={{ fontSize:'0.62rem', fontFamily:"'DM Sans',sans-serif", fontWeight: active?600:400, letterSpacing:'0.02em' }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
