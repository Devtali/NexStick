import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import StickerCanvas from '../components/StickerCanvas'

export default function PackEditorScreen() {
  const { screenParams, navigate, showToast, user } = useApp()
  const { pack } = screenParams
  const [saving, setSaving] = useState(false)
  const [stickers, setStickers] = useState(screenParams.stickers || [])
  let getDataURL = null

  const handleAddSticker = async () => {
    if (!getDataURL) return
    const dataURL = getDataURL('webp')
    if (!dataURL) return showToast('Veuillez importer une image d\'abord', 'error')
    setSaving(true)
    try {
      // Upload to Supabase Storage
      const blob = await (await fetch(dataURL)).blob()
      const fileName = `stickers/${user.id}/${Date.now()}.webp`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('stickers').upload(fileName, blob, { contentType:'image/webp' })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('stickers').getPublicUrl(fileName)
      // Save sticker to DB
      const { data: stickerData, error: stickerError } = await supabase.from('stickers').insert({ pack_id: pack.id, image_url: publicUrl }).select().single()
      if (stickerError) throw stickerError
      // Update pack sticker count + cover
      const newCount = stickers.length + 1
      const updates = { sticker_count: newCount }
      if (newCount === 1) updates.cover_url = publicUrl
      await supabase.from('packs').update(updates).eq('id', pack.id)
      setStickers(s => [...s, stickerData])
      showToast('Sticker ajouté !')
    } catch(e) {
      showToast("Erreur lors de l'ajout", 'error')
      console.error(e)
    }
    setSaving(false)
  }

  const deleteSticker = async (sticker) => {
    await supabase.from('stickers').delete().eq('id', sticker.id)
    const remaining = stickers.filter(s => s.id !== sticker.id)
    setStickers(remaining)
    await supabase.from('packs').update({ sticker_count: remaining.length, cover_url: remaining[0]?.image_url || null }).eq('id', pack.id)
    showToast('Sticker supprimé')
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title={pack?.name || 'Éditeur'} subtitle={`${stickers.length} sticker${stickers.length!==1?'s':''}`} backFn={()=>navigate('mypacks')}
        right={
          <button onClick={handleAddSticker} disabled={saving} style={{ padding:'0.5rem 0.85rem', borderRadius:'10px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.78rem', cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'0.4rem', opacity:saving?0.6:1 }}>
            <Save size={14}/> {saving?'…':'Ajouter'}
          </button>
        }
      />

      <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
        {/* Existing stickers */}
        {stickers.length > 0 && (
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Stickers du pack</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
              {stickers.map(s => (
                <div key={s.id} style={{ position:'relative', width:72, height:72, borderRadius:'10px', overflow:'hidden', background:'#1a2535' }}>
                  <img src={s.image_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <button onClick={()=>deleteSticker(s)} style={{ position:'absolute', top:2, right:2, width:20, height:20, borderRadius:'50%', background:'rgba(239,68,68,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Trash2 size={10} color='#fff'/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas editor */}
        <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Créer un sticker</div>
        <StickerCanvas onExport={fn => { getDataURL = fn }}/>
      </div>
    </div>
  )
}
