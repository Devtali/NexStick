import { useState, useEffect } from 'react'
import { Send, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'

export default function CommunityScreen() {
  const { user, profile, showToast } = useApp()
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data } = await supabase.from('community_posts').select('*, profiles(username,avatar_url)').order('created_at',{ascending:false}).limit(30)
    setPosts(data||[])
  }

  const addPost = async () => {
    if (!user) return showToast('Connectez-vous pour poster', 'error')
    if (!text.trim()) return
    setPosting(true)
    const { data, error } = await supabase.from('community_posts').insert({ user_id:user.id, content:text }).select('*, profiles(username,avatar_url)').single()
    if (!error && data) { setPosts(p=>[data,...p]); setText('') }
    setPosting(false)
  }

  const report = async (post) => {
    if (!user) return
    const reason = prompt('Motif du signalement :')
    if (!reason) return
    await supabase.from('reports').insert({ reporter_id:user.id, reason:`Post communauté: ${reason}` })
    showToast('Signalement envoyé.')
  }

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `${Math.floor(diff/60)}min`
    if (diff < 86400) return `${Math.floor(diff/3600)}h`
    return `${Math.floor(diff/86400)}j`
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title='Communauté' subtitle='Avis & Signalements' backScreen='feed'/>

      {/* Post input */}
      {user && (
        <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '😊'}
            </div>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder='Donnez votre avis ou faites un signalement…' rows={2}
              style={{ flex:1, padding:'0.6rem 0.85rem', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.85rem', outline:'none', resize:'none', lineHeight:1.5, boxSizing:'border-box' }}
            />
            <button onClick={addPost} disabled={posting||!text.trim()} style={{ width:36, height:36, borderRadius:'10px', border:'none', background:posting||!text.trim()?'rgba(37,211,102,0.3)':'#25D366', color:'#fff', cursor:posting||!text.trim()?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'0.75rem 1rem' }}>
        {posts.length === 0
          ? <div style={{ textAlign:'center', padding:'3rem', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>Soyez le premier à poster 💬</div>
          : posts.map(p => (
            <div key={p.id} style={{ marginBottom:'0.65rem', padding:'0.85rem', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '😊'}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", color:'#25D366', fontSize:'0.82rem', fontWeight:600 }}>@{p.profiles?.username}</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginLeft:'0.5rem' }}>{timeAgo(p.created_at)}</span>
                </div>
                {user && p.user_id !== user.id && (
                  <button onClick={()=>report(p)} style={{ background:'none', border:'none', color:'rgba(255,100,100,0.5)', cursor:'pointer', padding:'2px' }}><Flag size={13}/></button>
                )}
              </div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', lineHeight:1.6 }}>{p.content}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
