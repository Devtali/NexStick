import { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import { supabase } from '../supabase'
import { useApp } from '../context/AppContext'
import PackCard from '../components/PackCard'

export default function FeedScreen() {
  const { user, navigate, showToast } = useApp()
  const [packs, setPacks] = useState([])
  const [reactions, setReactions] = useState({}) // packId -> emoji
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => { fetchFeed() }, [])

  const fetchFeed = async () => {
    setLoading(true)
    const [packsRes, reactionsRes, annoRes] = await Promise.all([
      supabase.from('packs').select('*, profiles(username,avatar_url)').eq('is_public', true).order('created_at', { ascending:false }).limit(50),
      user ? supabase.from('reactions').select('pack_id,emoji').eq('user_id', user.id) : Promise.resolve({ data:[] }),
      supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending:false }).limit(3),
    ])
    setPacks(packsRes.data || [])
    const reactMap = {}
    ;(reactionsRes.data || []).forEach(r => { reactMap[r.pack_id] = r.emoji })
    setReactions(reactMap)
    setAnnouncements(annoRes.data || [])
    setLoading(false)
  }

  const handleReact = async (packId, emoji) => {
    const existing = reactions[packId]
    if (existing === emoji) {
      await supabase.from('reactions').delete().eq('user_id', user.id).eq('pack_id', packId)
      setReactions(r => { const n={...r}; delete n[packId]; return n })
    } else {
      await supabase.from('reactions').upsert({ user_id:user.id, pack_id:packId, emoji }, { onConflict:'user_id,pack_id' })
      setReactions(r => ({ ...r, [packId]: emoji }))
    }
  }

  const filtered = packs.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      {/* Header */}
      <div style={{ padding:'1rem 1rem 0.75rem', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.2rem' }}>Explorer</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>Packs publics</div>
          </div>
          <button onClick={() => navigate('community')} style={{ width:38, height:38, borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bell size={18}/>
          </button>
        </div>
        {/* Search */}
        <div style={{ position:'relative' }}>
          <Search size={16} color='rgba(255,255,255,0.3)' style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)' }}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Rechercher un pack…'
            style={{ width:'100%', padding:'0.65rem 0.85rem 0.65rem 2.5rem', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }}
          />
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0.75rem 1rem' }}>
        {/* Announcements */}
        {announcements.map(a => (
          <div key={a.id} style={{ background:'linear-gradient(135deg,rgba(37,211,102,0.12),rgba(18,140,126,0.12))', border:'1px solid rgba(37,211,102,0.2)', borderRadius:'14px', padding:'0.85rem 1rem', marginBottom:'0.75rem' }}>
            {a.image_url && <img src={a.image_url} alt='' style={{ width:'100%', borderRadius:'10px', marginBottom:'0.5rem', maxHeight:120, objectFit:'cover' }}/>}
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#25D366', fontSize:'0.85rem', marginBottom:'0.25rem' }}>📢 {a.title}</div>
            {a.content && <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.6)', fontSize:'0.8rem', lineHeight:1.5 }}>{a.content}</div>}
            {a.link && <a href={a.link} target='_blank' rel='noreferrer' style={{ color:'#25D366', fontSize:'0.78rem', fontFamily:"'DM Sans',sans-serif" }}>En savoir plus →</a>}
          </div>
        ))}

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem 0' }}><Spinner/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 0', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
            {query ? "Aucun résultat" : "Aucun pack public pour l'instant"}<br/>
            <span style={{ fontSize:'2rem', marginTop:'0.5rem', display:'block' }}>😶</span>
          </div>
        ) : (
          filtered.map(pack => (
            <PackCard key={pack.id} pack={pack} onReact={handleReact} userReaction={reactions[pack.id]}/>
          ))
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:28, height:28, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
}
