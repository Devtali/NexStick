import { useState, useEffect } from 'react'
import { Plus, Download, Edit3, Eye, EyeOff, Trash2 } from 'lucide-react'
import JSZip from 'jszip'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function MyPacksScreen() {
  const { user, navigate, showToast } = useApp()
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => { fetchPacks() }, [])

  const fetchPacks = async () => {
    setLoading(true)
    const { data } = await supabase.from('packs').select('*').eq('user_id', user.id).order('created_at', { ascending:false })
    setPacks(data || [])
    setLoading(false)
  }

  const togglePublic = async (pack) => {
    const newVal = !pack.is_public
    await supabase.from('packs').update({ is_public:newVal }).eq('id', pack.id)
    setPacks(p => p.map(x => x.id===pack.id ? {...x, is_public:newVal} : x))
    showToast(newVal ? 'Pack rendu public ✓' : 'Pack rendu privé')
  }

  const deletePack = async (pack) => {
    if (!confirm(`Supprimer "${pack.name}" ? Cette action est irréversible.`)) return
    await supabase.from('stickers').delete().eq('pack_id', pack.id)
    await supabase.from('packs').delete().eq('id', pack.id)
    setPacks(p => p.filter(x => x.id !== pack.id))
    showToast('Pack supprimé')
  }

  const downloadZip = async (pack) => {
    setDownloading(pack.id)
    const { data: stickers } = await supabase.from('stickers').select('*').eq('pack_id', pack.id)
    if (!stickers?.length) { showToast('Aucun sticker dans ce pack', 'error'); setDownloading(null); return }

    const zip = new JSZip()
    const folder = zip.folder(pack.name.replace(/\s+/g,'_'))

    // Add sticker manifest (Sticker Maker compatible)
    const manifest = {
      name: pack.name,
      publisher: 'Nexus Labs',
      privacy_policy_website: 'https://t.me/nexuslabstech',
      stickers: stickers.map((s,i) => ({ image_file: `sticker_${i+1}.webp`, emojis:['😊'] }))
    }
    folder.file('stickers.json', JSON.stringify(manifest, null, 2))

    // Fetch and add each sticker
    await Promise.all(stickers.map(async (s, i) => {
      try {
        const res = await fetch(s.image_url)
        const blob = await res.blob()
        folder.file(`sticker_${i+1}.webp`, blob)
      } catch {}
    }))

    const content = await zip.generateAsync({ type:'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a'); a.href=url; a.download=`${pack.name.replace(/\s+/g,'_')}_stickers.zip`; a.click()
    URL.revokeObjectURL(url)

    // Increment download count
    await supabase.from('packs').update({ download_count: (pack.download_count||0)+1 }).eq('id', pack.id)
    setPacks(p => p.map(x => x.id===pack.id ? {...x, download_count:(x.download_count||0)+1} : x))
    showToast('Pack téléchargé !')
    setDownloading(null)
  }

  const editPack = async (pack) => {
    const { data: stickers } = await supabase.from('stickers').select('*').eq('pack_id', pack.id)
    navigate('pack-editor', { pack, stickers: stickers||[] })
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.2rem' }}>Mes packs</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>{packs.length} collection{packs.length!==1?'s':''}</div>
        </div>
        <button onClick={()=>navigate('create')} style={{ width:38, height:38, borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Plus size={20}/>
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0.75rem 1rem' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem 0' }}><Spinner/></div>
        ) : packs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>📦</div>
            <div style={{ fontFamily:"'Syne',sans-serif", color:'rgba(255,255,255,0.4)', fontWeight:600, marginBottom:'0.5rem' }}>Aucun pack pour l'instant</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.25)', fontSize:'0.82rem', marginBottom:'1rem' }}>Créez votre premier pack de stickers</div>
            <button onClick={()=>navigate('create')} style={{ padding:'0.65rem 1.5rem', borderRadius:'12px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
              Créer un pack
            </button>
          </div>
        ) : (
          packs.map(pack => (
            <div key={pack.id} style={{ background:'#111827', borderRadius:'16px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'0.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem' }}>
                {/* Cover thumb */}
                <div style={{ width:60, height:60, borderRadius:'12px', background:'#1a2535', flexShrink:0, overflow:'hidden' }}>
                  {pack.cover_url ? <img src={pack.cover_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>😊</div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'0.92rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pack.name}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', marginTop:'2px' }}>
                    {pack.sticker_count||0} sticker{(pack.sticker_count||0)!==1?'s':''} · {pack.download_count||0} téléchargement{(pack.download_count||0)!==1?'s':''}
                  </div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', marginTop:'4px', padding:'2px 8px', borderRadius:'999px', background:pack.is_public?'rgba(37,211,102,0.15)':'rgba(255,255,255,0.06)', border:`1px solid ${pack.is_public?'rgba(37,211,102,0.3)':'rgba(255,255,255,0.1)'}` }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:pack.is_public?'#25D366':'rgba(255,255,255,0.3)' }}/>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', color:pack.is_public?'#25D366':'rgba(255,255,255,0.4)', fontWeight:600 }}>{pack.is_public?'Public':'Privé'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { icon:Edit3, label:'Éditer', action:()=>editPack(pack) },
                  { icon:pack.is_public?EyeOff:Eye, label:pack.is_public?'Privé':'Public', action:()=>togglePublic(pack) },
                  { icon:Download, label:downloading===pack.id?'…':'ZIP', action:()=>downloadZip(pack), green:true },
                  { icon:Trash2, label:'', action:()=>deletePack(pack), red:true },
                ].map(({ icon:Icon, label, action, green, red }) => (
                  <button key={label+String(red)} onClick={action} style={{ flex:red?0:1, padding:'0.6rem', border:'none', background:'none', color:green?'#25D366':red?'#ef4444':'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem', fontSize:'0.72rem', fontFamily:"'DM Sans',sans-serif", fontWeight:500, minWidth:red?44:undefined }}>
                    <Icon size={14}/>{label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:28, height:28, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}
