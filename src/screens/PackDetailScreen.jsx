import { useState, useEffect } from 'react'
import { Download, Flag, User } from 'lucide-react'
import JSZip from 'jszip'
import { supabase, REACTIONS } from '../supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'

export default function PackDetailScreen() {
  const { screenParams, user, showToast, navigate } = useApp()
  const { pack } = screenParams
  const [stickers, setStickers] = useState([])
  const [reaction, setReaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { fetchData() }, [pack?.id])

  const fetchData = async () => {
    setLoading(true)
    const [stickerRes, reactionRes] = await Promise.all([
      supabase.from('stickers').select('*').eq('pack_id', pack.id),
      user ? supabase.from('reactions').select('emoji').eq('user_id', user.id).eq('pack_id', pack.id).maybeSingle() : Promise.resolve({ data:null }),
    ])
    setStickers(stickerRes.data||[])
    setReaction(reactionRes.data?.emoji || null)
    setLoading(false)
  }

  const handleReact = async (emoji) => {
    if (!user) return showToast('Connectez-vous pour réagir', 'error')
    if (reaction === emoji) {
      await supabase.from('reactions').delete().eq('user_id', user.id).eq('pack_id', pack.id)
      setReaction(null)
    } else {
      await supabase.from('reactions').upsert({ user_id:user.id, pack_id:pack.id, emoji }, { onConflict:'user_id,pack_id' })
      setReaction(emoji)
    }
  }

  const downloadZip = async () => {
    setDownloading(true)
    const zip = new JSZip()
    const folder = zip.folder(pack.name.replace(/\s+/g,'_'))
    folder.file('stickers.json', JSON.stringify({ name:pack.name, publisher:'Nexus Labs', stickers:stickers.map((s,i)=>({image_file:`sticker_${i+1}.webp`,emojis:['😊']})) }, null, 2))
    await Promise.all(stickers.map(async(s,i) => {
      try { const blob = await (await fetch(s.image_url)).blob(); folder.file(`sticker_${i+1}.webp`,blob) } catch {}
    }))
    const content = await zip.generateAsync({ type:'blob' })
    const a = document.createElement('a'); a.href=URL.createObjectURL(content); a.download=`${pack.name}_stickers.zip`; a.click()
    await supabase.from('packs').update({ download_count:(pack.download_count||0)+1 }).eq('id',pack.id)
    showToast('Pack téléchargé !')
    setDownloading(false)
  }

  const report = async () => {
    if (!user) return
    const reason = prompt('Motif du signalement :')
    if (!reason) return
    await supabase.from('reports').insert({ reporter_id:user.id, pack_id:pack.id, reason })
    showToast('Signalement envoyé.')
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title={pack?.name} backScreen='feed'
        right={
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {user && <button onClick={report} style={{ width:36, height:36, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,100,100,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Flag size={15}/></button>}
            <button onClick={downloadZip} disabled={downloading||loading||stickers.length===0} style={{ padding:'0.5rem 0.85rem', borderRadius:'10px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', opacity:downloading?0.6:1 }}>
              <Download size={14}/>{downloading?'…':'ZIP'}
            </button>
          </div>
        }
      />

      <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
        {/* Creator */}
        {pack.profiles && (
          <div onClick={()=>navigate('user-profile',{userId:pack.user_id})} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'rgba(255,255,255,0.04)', borderRadius:'14px', cursor:'pointer', marginBottom:'1rem', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {pack.profiles.avatar_url ? <img src={pack.profiles.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <User size={18} color='#fff'/>}
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", color:'#fff', fontWeight:600, fontSize:'0.85rem' }}>{pack.profiles.username}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem' }}>Voir le profil →</div>
            </div>
            <div style={{ marginLeft:'auto', fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>{pack.download_count||0} téléchargements</div>
          </div>
        )}

        {/* Reactions */}
        <div style={{ marginBottom:'1rem' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Réactions</div>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={()=>handleReact(emoji)} style={{ padding:'0.35rem 0.75rem', borderRadius:'999px', border:'none', cursor:'pointer', background:reaction===emoji?'rgba(37,211,102,0.2)':'rgba(255,255,255,0.07)', fontSize:'1rem', outline:reaction===emoji?'1.5px solid rgba(37,211,102,0.5)':'none', transition:'all 0.15s' }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Stickers grid */}
        <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.5rem' }}>
          Stickers · {stickers.length}
        </div>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><Spinner/></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
            {stickers.map(s => (
              <div key={s.id} style={{ aspectRatio:'1', borderRadius:'12px', background:'#1a2535', overflow:'hidden' }}>
                <img src={s.image_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:28, height:28, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}
