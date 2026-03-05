import { useState, useEffect } from 'react'
import { Edit3, LogOut, Settings, ShieldCheck, Users, Download, Eye, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import PackCard from '../components/PackCard'

export default function ProfileScreen() {
  const { user, profile, isAdmin, navigate, showToast, refreshProfile } = useApp()
  const [packs, setPacks] = useState([])
  const [stats, setStats] = useState({ followers:0, visits:0, downloads:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [packsRes, followersRes, visitsRes] = await Promise.all([
      supabase.from('packs').select('*').eq('user_id', user.id).eq('is_public', true).order('created_at', { ascending:false }),
      supabase.from('followers').select('*', {count:'exact', head:true}).eq('following_id', user.id),
      supabase.from('profile_visits').select('*', {count:'exact', head:true}).eq('profile_id', user.id),
    ])
    setPacks(packsRes.data || [])
    const totalDownloads = (packsRes.data||[]).reduce((s,p)=>s+(p.download_count||0),0)
    setStats({ followers: followersRes.count||0, visits: visitsRes.count||0, downloads: totalDownloads })
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!profile) return null

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      {/* Header bar */}
      <div style={{ padding:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.1rem' }}>Mon Profil</div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button onClick={()=>navigate('edit-profile')} style={{ width:36, height:36, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Edit3 size={16}/></button>
          {isAdmin && <button onClick={()=>navigate('admin')} style={{ width:36, height:36, borderRadius:'10px', border:'1px solid rgba(37,211,102,0.3)', background:'rgba(37,211,102,0.1)', color:'#25D366', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ShieldCheck size={16}/></button>}
          <button onClick={handleLogout} style={{ width:36, height:36, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,100,100,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><LogOut size={16}/></button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {/* Profile card */}
        <div style={{ padding:'1.25rem 1rem', background:'linear-gradient(160deg,#0d1117,#091a12)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', overflow:'hidden', flexShrink:0, border:'2px solid rgba(37,211,102,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontSize:'1.8rem' }}>😊</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.15rem' }}>{profile.display_name||profile.username}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.8rem' }}>@{profile.username}</div>
              {isAdmin && <div style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', marginTop:'4px', padding:'2px 8px', borderRadius:'999px', background:'rgba(37,211,102,0.15)', border:'1px solid rgba(37,211,102,0.4)' }}><ShieldCheck size={10} color='#25D366'/><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', color:'#25D366', fontWeight:700 }}>ADMIN</span></div>}
            </div>
          </div>

          {profile.bio && <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', lineHeight:1.6, marginTop:'0.75rem' }}>{profile.bio}</div>}
          {profile.contact_link && <a href={profile.contact_link} target='_blank' rel='noreferrer' style={{ display:'inline-block', marginTop:'0.5rem', color:'#25D366', fontSize:'0.78rem', fontFamily:"'DM Sans',sans-serif" }}>🔗 {profile.contact_link}</a>}
        </div>

        {/* Stats */}
        <div style={{ display:'flex', padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'0' }}>
          {[
            { icon:Users, value:stats.followers, label:'Abonnés' },
            { icon:Eye, value:stats.visits, label:'Visites' },
            { icon:Download, value:stats.downloads, label:'Téléchargements' },
            { icon:Package, value:packs.length, label:'Packs' },
          ].map(({ icon:Icon, value, label }) => (
            <div key={label} style={{ flex:1, textAlign:'center', padding:'0.5rem 0', borderRight:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#25D366', fontSize:'1rem' }}>{value}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', marginTop:'2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Public packs */}
        <div style={{ padding:'1rem' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Packs publics</div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><Spinner/></div>
          ) : packs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.85rem' }}>Aucun pack public</div>
          ) : (
            packs.map(pack => <PackCard key={pack.id} pack={pack}/>)
          )}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:28, height:28, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}
