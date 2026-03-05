import { useState, useRef } from 'react'
import { Camera, Save } from 'lucide-react'
import { supabase } from '../supabase'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'

const inp = { width:'100%', padding:'0.75rem 1rem', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }

export default function EditProfileScreen() {
  const { user, profile, navigate, showToast, refreshProfile } = useApp()
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    contact_link: profile?.contact_link || '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const fileRef = useRef(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAvatarUpload = async (file) => {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true, contentType:file.type })
    if (error) { showToast('Erreur upload', 'error'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.username.trim()) return showToast('Nom d\'utilisateur requis', 'error')
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      display_name: form.display_name,
      username: form.username.toLowerCase().replace(/\s+/g,'_'),
      bio: form.bio,
      contact_link: form.contact_link,
      avatar_url: avatarUrl,
    }).eq('id', user.id)
    if (error) { showToast('Erreur lors de la sauvegarde', 'error') }
    else { showToast('Profil mis à jour !'); refreshProfile(); navigate('profile') }
    setSaving(false)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117' }}>
      <Header title='Modifier le profil' subtitle='Vos informations' backScreen='profile'
        right={
          <button onClick={handleSave} disabled={saving} style={{ padding:'0.5rem 0.85rem', borderRadius:'10px', border:'none', background:'#25D366', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.78rem', cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'0.4rem', opacity:saving?0.6:1 }}>
            <Save size={14}/> {saving?'…':'Sauvegarder'}
          </button>
        }
      />

      <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ position:'relative', width:88, height:88 }}>
            <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', overflow:'hidden', border:'2px solid rgba(37,211,102,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {avatarUrl ? <img src={avatarUrl} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontSize:'2.5rem' }}>😊</span>}
            </div>
            <button onClick={()=>fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#25D366', border:'2px solid #0d1117', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {uploading ? <div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> : <Camera size={13} color='#fff'/>}
            </button>
          </div>
          <input ref={fileRef} type='file' accept='image/*,video/*' style={{ display:'none' }} onChange={e=>handleAvatarUpload(e.target.files[0])}/>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.75rem' }}>Photo ou vidéo de profil</div>
        </div>

        {[
          { label:'Nom affiché', key:'display_name', placeholder:'Votre nom' },
          { label:'Nom d\'utilisateur', key:'username', placeholder:'@username' },
          { label:'Bio', key:'bio', placeholder:'Parlez de vous…', area:true },
          { label:'Lien contact', key:'contact_link', placeholder:'https://t.me/vous' },
        ].map(({ label, key, placeholder, area }) => (
          <div key={key}>
            <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>{label}</label>
            {area
              ? <textarea value={form[key]} onChange={set(key)} placeholder={placeholder} rows={3} style={{ ...inp, resize:'none', lineHeight:1.5 }}/>
              : <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inp}/>
            }
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
