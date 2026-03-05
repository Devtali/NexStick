import { useRef, useEffect, useCallback, useState } from 'react'
import { Image, Type, Sliders, Download, Plus } from 'lucide-react'

const labelStyle = { fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase' }
const rangeStyle = { width:'100%', accentColor:'#25D366', cursor:'pointer' }

export default function StickerCanvas({ onExport }) {
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [imageObj, setImageObj] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [text, setText] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(52)
  const [fontWeight, setFontWeight] = useState('bold')
  const [shape, setShape] = useState('square')
  const [bgColor, setBgColor] = useState('transparent')
  const [strokeColor, setStrokeColor] = useState('#25D366')
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [tab, setTab] = useState('image')
  const [drag, setDrag] = useState(false)

  const loadImg = src => new Promise((res,rej) => { const i=new window.Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src })

  const handleFile = async file => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = async e => { const src=e.target.result; setUploadedImage(src); setImageObj(await loadImg(src)) }
    reader.readAsDataURL(file)
  }

  const clipPath = (ctx, S, sw) => {
    ctx.beginPath()
    if (shape === 'circle') {
      ctx.arc(S/2, S/2, S/2 - sw/2, 0, Math.PI*2)
    } else if (shape === 'square') {
      const r=40; ctx.moveTo(r,0); ctx.lineTo(S-r,0); ctx.quadraticCurveTo(S,0,S,r)
      ctx.lineTo(S,S-r); ctx.quadraticCurveTo(S,S,S-r,S); ctx.lineTo(r,S)
      ctx.quadraticCurveTo(0,S,0,S-r); ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0)
    } else {
      for (let i=0;i<6;i++) {
        const a=(Math.PI/3)*i - Math.PI/6
        const x=S/2+(S/2-sw/2)*Math.cos(a), y=S/2+(S/2-sw/2)*Math.sin(a)
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
      }
      ctx.closePath()
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), S=512
    ctx.clearRect(0,0,S,S)
    ctx.save(); clipPath(ctx, S, strokeWidth); ctx.clip()
    if (bgColor !== 'transparent') { ctx.fillStyle=bgColor; ctx.fillRect(0,0,S,S) }
    if (imageObj) {
      const scale=Math.max(S/imageObj.width, S/imageObj.height)
      const sw=imageObj.width*scale, sh=imageObj.height*scale
      ctx.drawImage(imageObj,(S-sw)/2,(S-sh)/2,sw,sh)
    }
    if (text) {
      ctx.font=`${fontWeight} ${fontSize}px 'Syne',sans-serif`
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=12
      if (strokeWidth>0) { ctx.strokeStyle=strokeColor; ctx.lineWidth=fontSize*0.1; ctx.lineJoin='round'; ctx.strokeText(text,S/2,S-fontSize*1.2) }
      ctx.fillStyle=textColor; ctx.fillText(text,S/2,S-fontSize*1.2); ctx.shadowBlur=0
    }
    ctx.restore()
    if (strokeWidth>0) { ctx.save(); ctx.strokeStyle=strokeColor; ctx.lineWidth=strokeWidth; clipPath(ctx,S,strokeWidth); ctx.stroke(); ctx.restore() }
  }, [imageObj, text, textColor, fontSize, fontWeight, shape, bgColor, strokeColor, strokeWidth])

  useEffect(() => { draw() }, [draw])

  const getDataURL = (format='webp') => canvasRef.current?.toDataURL(format==='png'?'image/png':'image/webp', 0.95)

  // Expose getDataURL to parent
  useEffect(() => { if (onExport) onExport(getDataURL) }, [])
  useEffect(() => { if (onExport) onExport(getDataURL) }, [draw])

  const ColorPicker = ({ colors, value, onChange }) => (
    <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
      {colors.map(c => (
        <div key={c} onClick={()=>onChange(c)} style={{ width:30, height:30, borderRadius:'8px', background:c==='transparent'?'repeating-conic-gradient(#aaa 0% 25%,#fff 0% 50%) 0 0/10px 10px':c, border:`2px solid ${value===c?'#25D366':'rgba(255,255,255,0.1)'}`, cursor:'pointer', transform:value===c?'scale(1.15)':'scale(1)', transition:'transform 0.15s' }}/>
      ))}
    </div>
  )

  const tabs = [['image','Image',Image],['text','Texte',Type],['style','Style',Sliders]]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
      {/* Preview */}
      <div style={{ display:'flex', justifyContent:'center' }}>
        <div style={{ position:'relative', width:200, height:200, borderRadius:'1rem', overflow:'hidden' }}>
          <svg width={200} height={200} style={{ position:'absolute', inset:0, opacity:0.35 }}>
            <defs><pattern id="chk" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#ccc"/><rect x="10" y="10" width="10" height="10" fill="#ccc"/><rect x="10" y="0" width="10" height="10" fill="#fff"/><rect x="0" y="10" width="10" height="10" fill="#fff"/></pattern></defs>
            <rect width={200} height={200} fill="url(#chk)" rx="12"/>
          </svg>
          <canvas ref={canvasRef} width={512} height={512} style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'1rem' }}/>
          {!uploadedImage && !text && (
            <div onClick={()=>fileRef.current?.click()} style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem', cursor:'pointer' }}>
              <div style={{ width:40, height:40, borderRadius:'12px', background:'rgba(37,211,102,0.15)', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px dashed rgba(37,211,102,0.4)' }}>
                <Plus size={18} color='#25D366'/>
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.72rem' }}>Image</span>
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type='file' accept='image/*' style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>

      {/* Tabs */}
      <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'12px', padding:'3px', gap:'2px' }}>
        {tabs.map(([id,label,Icon]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'0.5rem 0', borderRadius:'9px', border:'none', background:tab===id?'rgba(37,211,102,0.18)':'transparent', color:tab===id?'#25D366':'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.72rem', fontWeight:tab===id?700:400, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'14px', padding:'0.85rem', border:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
        {tab === 'image' && <>
          <div onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
            style={{ border:`2px dashed ${drag?'#25D366':'rgba(255,255,255,0.12)'}`, borderRadius:'10px', padding:'1rem', textAlign:'center', cursor:'pointer', background:drag?'rgba(37,211,102,0.06)':'transparent' }}>
            <Image size={20} color='rgba(255,255,255,0.3)'/> 
            <p style={{ margin:'0.3rem 0 0', fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'0.78rem' }}>{uploadedImage ? "Changer l'image" : "Cliquer ou glisser"}</p>
          </div>
          <label style={labelStyle}>Forme</label>
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {[['circle','Cercle'],['square','Carré'],['hexagon','Hex']].map(([v,l]) => (
              <button key={v} onClick={()=>setShape(v)} style={{ flex:1, padding:'0.5rem', borderRadius:'9px', border:`1.5px solid ${shape===v?'#25D366':'rgba(255,255,255,0.1)'}`, background:shape===v?'rgba(37,211,102,0.12)':'transparent', color:shape===v?'#25D366':'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.72rem', cursor:'pointer' }}>{l}</button>
            ))}
          </div>
          <label style={labelStyle}>Fond</label>
          <ColorPicker colors={['transparent','#000','#fff','#25D366','#128C7E','#FF6B6B','#FFE66D']} value={bgColor} onChange={setBgColor}/>
        </>}
        {tab === 'text' && <>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder='Texte du sticker…' maxLength={30}
            style={{ width:'100%', padding:'0.65rem', borderRadius:'10px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }}/>
          <label style={labelStyle}>Couleur</label>
          <ColorPicker colors={['#fff','#000','#25D366','#FFE66D','#FF6B6B','#74C0FC','#f783ac']} value={textColor} onChange={setTextColor}/>
          <label style={labelStyle}>Taille — {fontSize}px</label>
          <input type='range' min={20} max={120} value={fontSize} onChange={e=>setFontSize(+e.target.value)} style={rangeStyle}/>
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {[['bold','Gras'],['normal','Normal']].map(([v,l]) => (
              <button key={v} onClick={()=>setFontWeight(v)} style={{ flex:1, padding:'0.5rem', borderRadius:'9px', border:`1.5px solid ${fontWeight===v?'#25D366':'rgba(255,255,255,0.1)'}`, background:fontWeight===v?'rgba(37,211,102,0.12)':'transparent', color:fontWeight===v?'#25D366':'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", fontWeight:v, fontSize:'0.8rem', cursor:'pointer' }}>{l}</button>
            ))}
          </div>
        </>}
        {tab === 'style' && <>
          <label style={labelStyle}>Couleur contour</label>
          <ColorPicker colors={['#25D366','#fff','#000','#FFE66D','#FF6B6B','#74C0FC']} value={strokeColor} onChange={setStrokeColor}/>
          <label style={labelStyle}>Épaisseur — {strokeWidth}px</label>
          <input type='range' min={0} max={24} value={strokeWidth} onChange={e=>setStrokeWidth(+e.target.value)} style={rangeStyle}/>
        </>}
      </div>
    </div>
  )
}
