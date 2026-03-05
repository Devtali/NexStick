import { useState, useEffect } from 'react'
import { UserPlus, UserMinus, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import PackCard from '../components/PackCard'

export default function UserProfileScreen() {
  const { screenParams, user, showToast, navigate } = useApp()
  const { userId } = screenParams
  const [profile, setProfile] = useState(null)
  const [packs, setPacks] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [stats, setStats] = useState({ followers:0, downloads:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [userId])

  const fetchData = async () => {
    setLoading(true)
    const [profileRes, packsRes, followRes, followersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('packs').select('*').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending:false }),
      user ? supabase.from('followers').select('*').eq('follower_id', user.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data:null }),
      supabase.from('followers').select('*', {count:'exact', head:true}).eq('following_id', userId),
    ])
    setProfile(profileRes.data)
    setPacks(packsRes.data||[])
    setIsFollowing(!!followRes.data)
    const downloads = (packsRes.data||[]).reduce((s,p)=>s+(p.download_count||0),0)
    setStats({ followers: followersRes.count||0, downloads })

    // Log profile visit
    if (user && userId !== user.id) {
      await supabase.from('profile_visits').insert({ profile_id:userId, visitor_id:user.id })
    }
    setLoading(false)
  }

  const toggleFollow = async () => {
    if (!user) return showToast('Connectez-vous pour suivre', 'error')
    if (isFollowing) {
      await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', userId)
      setIsFollowing(false)
      setStats(s => ({ ...s, followers: Math.max(0, s.followers-1) }))
    } else {
      await supabase.from('followers').insert({ follower_id:user.id, following_id:userId })
      setIsFollowing(true)
      setStats(s => ({ ...s, followers: s.followers+1 }))
    }
  }

  const reportUser = async () => {
    const reason = prompt('Motif du signalement :')
    if (!reason) return
    await supabase.from('reports').insert({ reporter_id:user.id, pack_id:packs[0]?.id, reason:`Signalement utilisateur: ${reason}` })
    showToast('Signalement envoyé, merci.')
  }

  if (loading) return <div style={{ height:'100%', background:'#0d1117', display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner/></div>
  if (!profile) return null

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title={profile.display_name||profile.username} subtitle={`@${profile.username}`} backScreen='feed'
        right={user && userId!==user.id && (
          <button onClick={reportUser} style={{ width:36, height:36, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,100,100,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Flag size={16}/>
          </button>
        )}
      />

      <div style={{ flex:1, overflowY:'auto' }}>
        {/* Profile header */}
        <div style={{ padding:'1.25rem 1rem', background:'linear-gradient(160deg,#0d1117,#091a12)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', overflow:'hidden', flexShrink:0, border:'2px solid rgba(37,211,102,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontSize:'1.8rem' }}>😊</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.1rem' }}>{profile.display_name||profile.username}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.78rem' }}>@{profile.username}</div>
              <div style={{ display:'flex', gap:'1rem', marginTop:'0.4rem' }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.75rem' }}><strong style={{ color:'#fff' }}>{stats.followers}</strong> abonnés</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.75rem' }}><strong style={{ color:'#fff' }}>{stats.downloads}</strong> téléchargements</span>
              </div>
            </div>
          </div>
          {profile.bio && <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', lineHeight:1.6, marginTop:'0.75rem' }}>{profile.bio}</div>}
          {profile.contact_link && <a href={profile.contact_link} target='_blank' rel='noreferrer' style={{ display:'inline-block', marginTop:'0.5rem', color:'#25D366', fontSize:'0.78rem', fontFamily:"'DM Sans',sans-serif" }}>🔗 {profile.contact_link}</a>}

          {user && userId !== user.id && (
            <button onClick={toggleFollow} style={{ marginTop:'0.85rem', padding:'0.6rem 1.5rem', borderRadius:'12px', border:isFollowing?'1.5px solid rgba(37,211,102,0.4)':'none', background:isFollowing?'transparent':'#25D366', color:isFollowing?'#25D366':'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.85rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              {isFollowing ? <><UserMinus size={15}/> Ne plus suivre</> : <><UserPlus size={15}/> Suivre</>}
            </button>
          )}
        </div>

        {/* Packs */}
        <div style={{ padding:'1rem' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Packs publics · {packs.length}</div>
          {packs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.85rem' }}>Aucun pack public</div>
          ) : packs.map(pack => <PackCard key={pack.id} pack={pack}/>)}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:28, height:28, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}
