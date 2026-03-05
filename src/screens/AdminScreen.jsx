import { useState, useEffect } from 'react'
import { Send, UserX, Flag, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'

const inp = { width:'100%', padding:'0.75rem 1rem', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }
const secTitle = { fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'0.95rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }

export default function AdminScreen() {
  const { isAdmin, showToast, navigate } = useApp()
  const [tab, setTab] = useState('announcements')
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [anno, setAnno] = useState({ title:'', content:'', link:'' })
  const [sending, setSending] = useState(false)
  const [searchUser, setSearchUser] = useState('')

  useEffect(() => {
    if (!isAdmin) return navigate('feed')
    fetchReports()
  }, [isAdmin])

  const fetchReports = async () => {
    const { data } = await supabase.from('reports').select('*, profiles!reporter_id(username), packs(name)').eq('status','pending').order('created_at', { ascending:false })
    setReports(data||[])
  }

  const searchUsers = async () => {
    if (!searchUser.trim()) return
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${searchUser}%`).limit(10)
    setUsers(data||[])
  }

  const banUser = async (profile) => {
    if (!confirm(`Bannir @${profile.username} ?`)) return
    await supabase.from('profiles').update({ is_banned:true }).eq('id', profile.id)
    showToast(`@${profile.username} banni`)
    setUsers(u => u.map(x => x.id===profile.id ? {...x, is_banned:true} : x))
  }

  const unbanUser = async (profile) => {
    await supabase.from('profiles').update({ is_banned:false }).eq('id', profile.id)
    showToast(`@${profile.username} débanni`)
    setUsers(u => u.map(x => x.id===profile.id ? {...x, is_banned:false} : x))
  }

  const resolveReport = async (report, action) => {
    await supabase.from('reports').update({ status:action }).eq('id', report.id)
    if (action === 'banned' && report.packs) {
      await supabase.from('packs').update({ is_public:false }).eq('id', report.pack_id)
    }
    setReports(r => r.filter(x => x.id !== report.id))
    showToast(action === 'resolved' ? 'Signalement résolu' : 'Pack retiré')
  }

  const sendAnnouncement = async () => {
    if (!anno.title.trim()) return showToast('Titre requis', 'error')
    setSending(true)
    const { error } = await supabase.from('announcements').insert({ title:anno.title, content:anno.content, link:anno.link, is_active:true })
    if (error) showToast('Erreur', 'error')
    else { showToast('Annonce publiée !'); setAnno({ title:'', content:'', link:'' }) }
    setSending(false)
  }

  const TABS = [
    ['announcements', '📢 Annonces'],
    ['users', '👥 Utilisateurs'],
    ['reports', `🚩 Signalements (${reports.length})`],
    ['community', '💬 Communauté'],
  ]

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title='Panneau Admin' subtitle='Nexus Labs' backScreen='profile'/>

      {/* Tab strip */}
      <div style={{ display:'flex', padding:'0.5rem', gap:'0.3rem', overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        {TABS.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'0.4rem 0.85rem', borderRadius:'8px', border:'none', background:tab===id?'rgba(37,211,102,0.18)':'transparent', color:tab===id?'#25D366':'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem', fontWeight:tab===id?600:400, cursor:'pointer', whiteSpace:'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
        {/* Announcements */}
        {tab === 'announcements' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div style={secTitle}><Send size={16} color='#25D366'/> Nouvelle annonce</div>
            <input value={anno.title} onChange={e=>setAnno(a=>({...a,title:e.target.value}))} placeholder='Titre de l\'annonce *' style={inp}/>
            <textarea value={anno.content} onChange={e=>setAnno(a=>({...a,content:e.target.value}))} placeholder='Contenu…' rows={4} style={{ ...inp, resize:'none', lineHeight:1.5 }}/>
            <input value={anno.link} onChange={e=>setAnno(a=>({...a,link:e.target.value}))} placeholder='Lien (optionnel)' style={inp}/>
            <button onClick={sendAnnouncement} disabled={sending} style={{ padding:'0.75rem', borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer', opacity:sending?0.6:1 }}>
              {sending?'Envoi…':'📢 Publier l\'annonce'}
            </button>

            {/* Existing announcements */}
            <AnnouncementList/>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div style={secTitle}><UserX size={16} color='#25D366'/> Gestion utilisateurs</div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input value={searchUser} onChange={e=>setSearchUser(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchUsers()} placeholder='Rechercher @username…' style={{ ...inp, flex:1 }}/>
              <button onClick={searchUsers} style={{ padding:'0.75rem 1rem', borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Chercher</button>
            </div>
            {users.map(u => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {u.avatar_url ? <img src={u.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '😊'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", color:'#fff', fontSize:'0.88rem', fontWeight:600 }}>@{u.username}</div>
                  {u.is_banned && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', color:'#ef4444', background:'rgba(239,68,68,0.1)', padding:'1px 6px', borderRadius:'999px' }}>BANNI</span>}
                </div>
                {u.is_banned
                  ? <button onClick={()=>unbanUser(u)} style={{ padding:'0.4rem 0.75rem', borderRadius:'8px', border:'1px solid rgba(37,211,102,0.4)', background:'rgba(37,211,102,0.1)', color:'#25D366', fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>Débannir</button>
                  : <button onClick={()=>banUser(u)} style={{ padding:'0.4rem 0.75rem', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.1)', color:'#ef4444', fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>Bannir</button>
                }
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {tab === 'reports' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div style={secTitle}><Flag size={16} color='#25D366'/> Signalements en attente</div>
            {reports.length === 0
              ? <div style={{ textAlign:'center', padding:'2rem', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>Aucun signalement 🎉</div>
              : reports.map(r => (
                <div key={r.id} style={{ padding:'0.85rem', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", color:'#fff', fontSize:'0.85rem', fontWeight:600, marginBottom:'0.35rem' }}>
                    {r.packs?.name || 'Pack supprimé'}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', marginBottom:'0.5rem' }}>
                    Par @{r.profiles?.username} : {r.reason}
                  </div>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button onClick={()=>resolveReport(r,'resolved')} style={{ flex:1, padding:'0.4rem', borderRadius:'8px', border:'1px solid rgba(37,211,102,0.3)', background:'rgba(37,211,102,0.08)', color:'#25D366', fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
                      <CheckCircle size={13}/> Ignorer
                    </button>
                    <button onClick={()=>resolveReport(r,'banned')} style={{ flex:1, padding:'0.4rem', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
                      <XCircle size={13}/> Retirer le pack
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Community */}
        {tab === 'community' && <CommunityAdmin showToast={showToast}/>}
      </div>
    </div>
  )
}

function AnnouncementList() {
  const [list, setList] = useState([])
  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at',{ascending:false}).limit(5).then(({data})=>setList(data||[]))
  },[])
  const toggle = async (a) => {
    await supabase.from('announcements').update({is_active:!a.is_active}).eq('id',a.id)
    setList(l=>l.map(x=>x.id===a.id?{...x,is_active:!x.is_active}:x))
  }
  if (!list.length) return null
  return (
    <div style={{ marginTop:'0.5rem' }}>
      <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Annonces existantes</div>
      {list.map(a=>(
        <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem', background:'rgba(255,255,255,0.04)', borderRadius:'10px', marginBottom:'0.4rem', border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", color:'#fff', fontSize:'0.82rem', fontWeight:600 }}>{a.title}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.7rem' }}>{a.is_active?'Active':'Inactive'}</div>
          </div>
          <div onClick={()=>toggle(a)} style={{ width:40, height:22, borderRadius:'999px', background:a.is_active?'#25D366':'rgba(255,255,255,0.12)', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:a.is_active?21:3, transition:'left 0.2s' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommunityAdmin({ showToast }) {
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const { user } = useApp()

  useEffect(() => {
    supabase.from('community_posts').select('*, profiles(username,avatar_url)').order('created_at',{ascending:false}).limit(20).then(({data})=>setPosts(data||[]))
  },[])

  const addPost = async () => {
    if (!text.trim()) return
    const { data } = await supabase.from('community_posts').insert({ user_id:user.id, content:text }).select('*, profiles(username,avatar_url)').single()
    if (data) { setPosts(p=>[data,...p]); setText(''); showToast('Post publié !') }
  }

  const deletePost = async (id) => {
    await supabase.from('community_posts').delete().eq('id',id)
    setPosts(p=>p.filter(x=>x.id!==id))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'0.95rem', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><MessageSquare size={16} color='#25D366'/> Communauté</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder='Message pour la communauté…' rows={3} style={{ width:'100%', padding:'0.75rem', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.9rem', outline:'none', resize:'none', lineHeight:1.5, boxSizing:'border-box' }}/>
      <button onClick={addPost} style={{ padding:'0.7rem', borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer' }}>Publier</button>
      {posts.map(p=>(
        <div key={p.id} style={{ padding:'0.75rem', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
            <span style={{ fontFamily:"'Syne',sans-serif", color:'#25D366', fontSize:'0.8rem', fontWeight:600 }}>@{p.profiles?.username}</span>
            <button onClick={()=>deletePost(p.id)} style={{ background:'none', border:'none', color:'rgba(255,100,100,0.6)', cursor:'pointer', fontSize:'0.72rem', fontFamily:"'DM Sans',sans-serif" }}>Supprimer</button>
          </div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', lineHeight:1.5 }}>{p.content}</div>
        </div>
      ))}
    </div>
  )
}
