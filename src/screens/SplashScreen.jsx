import { useState } from 'react'
import { Smile, Send, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TELEGRAM_LINK } from '../supabase'

export default function SplashScreen() {
  const { navigate } = useApp()
  const [step, setStep] = useState('splash') // splash | telegram
  const [joined, setJoined] = useState(false)

  if (step === 'telegram') {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg,#0d1117 0%,#0a2318 60%,#0d1117 100%)', padding:'2rem', gap:'1.5rem' }}>
        {/* Telegram card */}
        <div style={{ width:72, height:72, borderRadius:'20px', background:'linear-gradient(135deg,#229ED9,#1a7db5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(34,158,217,0.4)' }}>
          <Send size={36} color='#fff' strokeWidth={1.5}/>
        </div>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.5rem', color:'#fff', marginBottom:'0.5rem' }}>
            Rejoignez la communauté
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.88rem', lineHeight:1.6, maxWidth:280, margin:'0 auto' }}>
            Pour utiliser Nexus Stickers, abonnez-vous à notre canal Telegram et restez informé des nouveautés.
          </p>
        </div>

        <a
          href={TELEGRAM_LINK}
          target='_blank'
          rel='noreferrer'
          onClick={() => setJoined(true)}
          style={{
            display:'block', width:'100%', maxWidth:300, padding:'0.9rem',
            borderRadius:'14px', border:'none', textDecoration:'none',
            background:'linear-gradient(90deg,#229ED9,#1a7db5)',
            color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700,
            fontSize:'0.95rem', textAlign:'center', cursor:'pointer',
            boxShadow:'0 4px 20px rgba(34,158,217,0.4)',
          }}
        >
          📣 S'abonner à @nexuslabstech
        </a>

        {joined && (
          <button
            onClick={() => navigate('auth')}
            style={{
              display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 2rem',
              borderRadius:'14px', border:'1.5px solid rgba(37,211,102,0.4)',
              background:'rgba(37,211,102,0.1)', color:'#25D366',
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
            }}
          >
            <CheckCircle size={18}/> J'ai rejoint, continuer →
          </button>
        )}

        {!joined && (
          <button
            onClick={() => navigate('auth')}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.8rem', cursor:'pointer', textDecoration:'underline' }}
          >
            Ignorer (accès limité)
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg,#0d1117 0%,#0a2318 60%,#0d1117 100%)', gap:'1.5rem', position:'relative', overflow:'hidden' }}>
      {[200,300,400].map((s,i) => (
        <div key={i} style={{
          position:'absolute', width:s, height:s, borderRadius:'50%',
          border:`1px solid rgba(37,211,102,${0.07-i*0.02})`,
          top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          animation:`pulse ${3+i}s ease-in-out infinite alternate`,
        }}/>
      ))}

      <div style={{ width:88, height:88, borderRadius:'24px', background:'linear-gradient(135deg,#25D366 0%,#128C7E 100%)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 60px rgba(37,211,102,0.4)', position:'relative', zIndex:1 }}>
        <Smile size={44} color='#fff' strokeWidth={1.5}/>
      </div>

      <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'2rem', background:'linear-gradient(90deg,#25D366,#a8ffcd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-0.02em' }}>
          Nexus Stickers
        </div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', letterSpacing:'0.18em', marginTop:'0.3rem', textTransform:'uppercase' }}>
          Powered by Nexus Labs
        </div>
      </div>

      <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', textAlign:'center', maxWidth:240, lineHeight:1.6, position:'relative', zIndex:1, margin:0 }}>
        Créez et partagez vos stickers WhatsApp personnalisés.
      </p>

      <button
        onClick={() => setStep('telegram')}
        style={{ marginTop:'0.5rem', padding:'0.85rem 2.5rem', borderRadius:'999px', border:'none', background:'linear-gradient(90deg,#25D366 0%,#128C7E 100%)', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 4px 24px rgba(37,211,102,0.4)', position:'relative', zIndex:1 }}
      >
        Commencer →
      </button>

      <style>{`@keyframes pulse{from{opacity:0.4;transform:translate(-50%,-50%) scale(0.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1.03)}}`}</style>
    </div>
  )
}
