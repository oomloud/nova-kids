/* ===========================================================
   NOVA WORLD — shared UI components
   =========================================================== */

// user-fillable art placeholder
function Slot({ id, shape='rounded', radius=20, mask, fit, placeholder='Drop art', style }){
  const base = { background:'rgba(255,255,255,.55)', boxShadow:'inset 0 0 0 3px rgba(74,47,26,.18)' };
  const props = { id, shape, radius, placeholder, style: { ...base, ...style } };
  if (mask) props.mask = mask;
  if (fit) props.fit = fit;
  return React.createElement('image-slot', props);
}

// currency HUD (top-right)
function Hud({ s, onChestClick }){
  const pct = Math.min(100, (s.tokens / CHEST_CAP) * 100);
  return (
    <div className="hud">
      <div className="pill flame"><span className="ic">🔥</span>{s.streak}</div>
      <div className="pill coin"><span className="ic">🪙</span>{s.coins.toLocaleString()}</div>
      <div className="chestbar">
        <div className="track"><div className="fill" style={{ width: pct+'%' }}></div>
          <div className="val">{Math.min(s.tokens, CHEST_CAP)} / {CHEST_CAP} ⚡</div></div>
        <div className={'chesticon' + (s.pendingChest ? ' ready' : '')}
             onClick={s.pendingChest ? onChestClick : undefined}
             style={{ cursor: s.pendingChest ? 'pointer' : 'default' }}>🎁</div>
      </div>
    </div>
  );
}

function Bubble({ children, style }){
  return <div className="bubble" style={style}>{children}</div>;
}

// bottom dock (kept minimal — Hub is mostly diegetic)
function Dock({ active, onNav, missionCount }){
  const items = [
    { key:'hub',  ic:'🏠', label:'Home' },
    { key:'missions', ic:'📋', label:'Missions', badge: missionCount },
    { key:'activities', ic:'🎮', label:'Games' },
    { key:'map',  ic:'🗺️', label:'Map' },
  ];
  return (
    <div className="dock">
      {items.map(it => (
        <div key={it.key} className={'d' + (active===it.key?' active':'')} onClick={() => onNav(it.key)}>
          {it.badge ? <span className="badge">{it.badge}</span> : null}
          <span className="di">{it.ic}</span>{it.label}
        </div>
      ))}
    </div>
  );
}

function Toasts({ items }){
  return (
    <div className="toast-wrap">
      {items.map(t => <div className="toast" key={t.id}>{t.text}</div>)}
    </div>
  );
}

// confetti burst at a point (px within the 1280x800 stage)
function Confetti({ x=640, y=300, n=26, colors }){
  const ref = useRef(null);
  const palette = colors || ['#FFAA1D','#21C0AE','#FF5D73','#9B5DE5','#FFC23D','#FF6A2C'];
  useEffect(() => {
    const host = ref.current; if (!host) return;
    const pieces = [];
    for (let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className = 'confetti';
      d.style.left = x+'px'; d.style.top = y+'px';
      d.style.background = palette[i % palette.length];
      if (i%3===0) d.style.borderRadius = '50%';
      host.appendChild(d); pieces.push(d);
      const ang = Math.random()*Math.PI*2;
      const dist = 120 + Math.random()*220;
      const dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist - 120;
      d.animate([
        { transform:'translate(0,0) rotate(0deg)', opacity:1 },
        { transform:`translate(${dx}px,${dy+260}px) rotate(${Math.random()*720-360}deg)`, opacity:0 }
      ], { duration: 1100 + Math.random()*700, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
    }
    return () => pieces.forEach(p => p.remove());
  }, []);
  return <div ref={ref} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:88 }}></div>;
}

Object.assign(window, { Slot, Hud, Bubble, Dock, Toasts, Confetti });
