import { useState } from 'react'
import { Eye, EyeOff, Smile } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const inp = {
  width:'100%', padding:'0.75rem 1rem', borderRadius:'12px',
  border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)',
  color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box',
}

export default function AuthScreen() {
  const { showToast, navigate } = useApp()
  const [mode, setMode] = useState('login') // login | register | verify
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email:'', password:'', username:'' })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async () => {
    if (!form.username.trim()) return showToast('Nom d\'utilisateur requis', 'error')
    if (form.password.length < 6) return showToast('Mot de passe trop court (6 min)', 'error')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    })
    if (error) { showToast(error.message, 'error'); setLoading(false); return }
    if (data.user && !data.session) {
      // Email confirmation required
      setMode('verify')
    } else if (data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: form.username.toLowerCase().replace(/\s+/g,'_'),
        display_name: form.username,
      })
      showToast('Compte créé avec succès !')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    })
    if (error) { showToast(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message, 'error') }
    setLoading(false)
  }

  if (mode === 'verify') {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0d1117', padding:'2rem', gap:'1.25rem' }}>
        <div style={{ fontSize:'3rem' }}>📧</div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'1.2rem', marginBottom:'0.5rem' }}>Vérifiez votre email</div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.88rem', lineHeight:1.6 }}>
            Un lien de confirmation a été envoyé à <strong style={{ color:'#25D366' }}>{form.email}</strong>.<br/>Cliquez sur le lien pour activer votre compte.
          </p>
        </div>
        <button onClick={() => setMode('login')} style={{ padding:'0.75rem 2rem', borderRadius:'12px', border:'1.5px solid rgba(37,211,102,0.4)', background:'rgba(37,211,102,0.1)', color:'#25D366', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', background:'linear-gradient(160deg,#0d1117 0%,#091a12 100%)', padding:'2rem 1.5rem' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2.5rem' }}>
        <div style={{ width:44, height:44, borderRadius:'14px', background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Smile size={24} color='#fff'/>
        </div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.1rem' }}>Nexus Stickers</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>Nexus Labs</div>
        </div>
      </div>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1.6rem', marginBottom:'0.4rem' }}>
        {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
      </h1>
      <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.88rem', marginBottom:'2rem' }}>
        {mode === 'login' ? 'Connectez-vous pour continuer' : 'Rejoignez la communauté'}
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
        {mode === 'register' && (
          <input value={form.username} onChange={set('username')} placeholder="Nom d'utilisateur" style={inp}/>
        )}
        <input value={form.email} onChange={set('email')} type='email' placeholder='Adresse email' style={inp}/>
        <div style={{ position:'relative' }}>
          <input value={form.password} onChange={set('password')} type={showPw?'text':'password'} placeholder='Mot de passe' style={{ ...inp, paddingRight:'3rem' }}/>
          <button onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>
            {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          style={{ padding:'0.85rem', borderRadius:'14px', border:'none', background: loading ? 'rgba(37,211,102,0.4)' : 'linear-gradient(90deg,#25D366,#128C7E)', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.95rem', cursor: loading?'not-allowed':'pointer', marginTop:'0.25rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}
        >
          {loading ? <><Spinner/> Chargement…</> : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </div>

      <div style={{ marginTop:'1.5rem', textAlign:'center' }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>
          {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <button onClick={() => setMode(mode==='login'?'register':'login')} style={{ background:'none', border:'none', color:'#25D366', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
            {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </span>
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
}
