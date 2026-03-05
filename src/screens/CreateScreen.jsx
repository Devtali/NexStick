import { useState } from 'react'
import { Package, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const inp = { width:'100%', padding:'0.75rem 1rem', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }

export default function CreateScreen() {
  const { user, showToast, navigate } = useApp()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return showToast('Donnez un nom au pack', 'error')
    setCreating(true)
    const { data, error } = await supabase.from('packs').insert({
      user_id: user.id, name: name.trim(), description: description.trim(), is_public: isPublic,
    }).select().single()
    if (error) { showToast('Erreur lors de la création', 'error'); setCreating(false); return }
    showToast('Pack créé ! Ajoutez vos stickers.')
    navigate('pack-editor', { pack: data, stickers: [] })
    setName(''); setDescription(''); setIsPublic(false)
    setCreating(false)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.2rem' }}>Créer un pack</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>Nouveau pack de stickers</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        {/* Illustration */}
        <div style={{ background:'linear-gradient(135deg,rgba(37,211,102,0.08),rgba(18,140,126,0.08))', borderRadius:'16px', padding:'1.5rem', textAlign:'center', border:'1px dashed rgba(37,211,102,0.2)' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>📦</div>
          <div style={{ fontFamily:"'Syne',sans-serif", color:'rgba(255,255,255,0.6)', fontSize:'0.9rem', fontWeight:600 }}>Nouveau pack de stickers</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.25rem' }}>Jusqu'à 30 stickers par pack</div>
        </div>

        <div>
          <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Nom du pack *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder='ex: Emoji Fun, Work Life…' style={inp} maxLength={50}/>
        </div>

        <div>
          <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder='Décrivez votre pack…' maxLength={200} rows={3}
            style={{ ...inp, resize:'none', lineHeight:1.5 }}/>
        </div>

        {/* Visibility toggle */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1rem', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", color:'#fff', fontWeight:600, fontSize:'0.9rem' }}>Rendre public</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>Visible dans l'Explorer par tous</div>
          </div>
          <div onClick={()=>setIsPublic(v=>!v)} style={{ width:48, height:26, borderRadius:'999px', background:isPublic?'#25D366':'rgba(255,255,255,0.12)', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:isPublic?25:3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
          </div>
        </div>

        <button onClick={handleCreate} disabled={creating||!name.trim()} style={{ padding:'0.9rem', borderRadius:'14px', border:'none', background: (creating||!name.trim())?'rgba(37,211,102,0.3)':'linear-gradient(90deg,#25D366,#128C7E)', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.95rem', cursor:(creating||!name.trim())?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
          {creating ? 'Création…' : <><Package size={18}/> Créer & ajouter des stickers <ArrowRight size={16}/></>}
        </button>

        {/* WhatsApp info */}
        <div style={{ padding:'0.85rem', background:'rgba(37,211,102,0.06)', borderRadius:'12px', border:'1px solid rgba(37,211,102,0.15)' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', lineHeight:1.6 }}>
            📱 <strong style={{ color:'rgba(255,255,255,0.7)' }}>Import WhatsApp :</strong> Depuis "Mes Packs", téléchargez le ZIP du pack. Importez-le ensuite dans <strong style={{ color:'rgba(255,255,255,0.7)' }}>Sticker Maker</strong> (Android) pour l'ajouter à WhatsApp.
          </div>
        </div>
      </div>
    </div>
  )
}
