import { Download, Heart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { REACTIONS } from '../lib/supabase'

export default function PackCard({ pack, onReact, userReaction }) {
  const { navigate, user } = useApp()

  return (
    <div
      onClick={() => navigate('pack-detail', { pack })}
      style={{
        background:'#111827', borderRadius:'16px', overflow:'hidden',
        border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer',
        transition:'transform 0.15s', marginBottom:'0.75rem',
      }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
    >
      {/* Cover */}
      <div style={{ height:160, background:'#1a2535', position:'relative', overflow:'hidden' }}>
        {pack.cover_url
          ? <img src={pack.cover_url} alt={pack.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem' }}>😊</div>
        }
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'50%',
          background:'linear-gradient(transparent,rgba(0,0,0,0.7))',
        }}/>
        <div style={{ position:'absolute', bottom:'0.5rem', left:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <Download size={12} color='rgba(255,255,255,0.7)'/>
          <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.72rem', fontFamily:"'DM Sans',sans-serif" }}>
            {pack.download_count || 0}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'#fff', fontSize:'0.9rem' }}>{pack.name}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', marginTop:'1px' }}>
              {pack.sticker_count || 0} sticker{(pack.sticker_count||0)!==1?'s':''}
            </div>
          </div>
          {/* Creator */}
          {pack.profiles && (
            <div
              onClick={e => { e.stopPropagation(); navigate('user-profile', { userId: pack.user_id }) }}
              style={{ display:'flex', alignItems:'center', gap:'0.4rem', cursor:'pointer' }}
            >
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                {pack.profiles.avatar_url
                  ? <img src={pack.profiles.avatar_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:'0.75rem' }}>😊</span>
                }
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.72rem' }}>
                {pack.profiles.username}
              </span>
            </div>
          )}
        </div>

        {/* Reactions */}
        {user && (
          <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }} onClick={e => e.stopPropagation()}>
            {REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => onReact && onReact(pack.id, emoji)}
                style={{
                  padding:'0.2rem 0.5rem', borderRadius:'999px', border:'none', cursor:'pointer',
                  background: userReaction === emoji ? 'rgba(37,211,102,0.2)' : 'rgba(255,255,255,0.06)',
                  fontSize:'0.85rem', transition:'all 0.15s',
                  outline: userReaction === emoji ? '1px solid rgba(37,211,102,0.5)' : 'none',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
