/* ===========================================================
   NOVA WORLD — screens & overlays
   =========================================================== */

/* ---------- helpers ---------- */
function msToMidnight(){
  const n = new Date(); const m = new Date(n); m.setHours(24,0,0,0); return m - n;
}
function fmtCountdown(ms){
  const s = Math.floor(ms/1000); const h = String(Math.floor(s/3600)).padStart(2,'0');
  const mi = String(Math.floor((s%3600)/60)).padStart(2,'0'); const se = String(s%60).padStart(2,'0');
  return `${h}:${mi}:${se}`;
}
function useCountdown(){
  const [t,setT] = useState(msToMidnight());
  useEffect(()=>{ const i=setInterval(()=>setT(msToMidnight()),1000); return ()=>clearInterval(i); },[]);
  return fmtCountdown(t);
}
function CountUp({ from, to, dur=900, prefix='', suffix='' }){
  const [v,setV] = useState(from);
  useEffect(()=>{
    let raf, start;
    const step = (ts)=>{ if(!start) start=ts; const p=Math.min(1,(ts-start)/dur);
      setV(Math.round(from+(to-from)*(1-Math.pow(1-p,3)))); if(p<1) raf=requestAnimationFrame(step); };
    raf=requestAnimationFrame(step); return ()=>cancelAnimationFrame(raf);
  },[from,to]);
  return <span>{prefix}{v}{suffix}</span>;
}

/* ===========================================================
   HUB — point-and-click café
   =========================================================== */
function Hub({ s, onNav, pushToast }){
  const [showBubble, setShowBubble] = useState(true);
  const pending = NW_MISSIONS.filter(m => s.missions[m.key] < m.target).length;
  return (
    <div className="screen hub-wall">
      <div className="wainscot"></div>
      <div className="hub-floor"></div>
      <div className="hub-rug"></div>

      {/* window */}
      <div className="hub-window"><span className="sun"></span><span className="cloud"></span><span className="bar"></span></div>
      {/* lamps */}
      <div className="hub-lamp" style={{ left:'520px' }}></div>
      <div className="hub-lamp" style={{ left:'760px' }}></div>
      {/* counter */}
      <div className="hub-counter"><div className="machine"></div>
        <div className="steam" style={{ right:'70px', top:'-86px' }}></div>
        <div className="steam" style={{ right:'58px', top:'-80px', animationDelay:'1s' }}></div>
      </div>
      <div className="hub-cat">🐱</div>
      <div className="hub-plant" style={{ right:'30px', bottom:'31%' }}>🪴</div>

      {/* optional drop-in full scene art (sits above flat shapes if filled) */}
      <Slot id="hub-scene-overlay" placeholder="Optional: drop full café art"
            style={{ position:'absolute', left:'330px', top:'92px', width:'150px', height:'70px', opacity:.0, pointerEvents:'none' }} />

      {/* HOTSPOT: corkboard = missions */}
      <div className={'hotspot corkboard' + (pending? ' glowing':'')} style={{ left:'150px', top:'300px' }}
           onClick={()=>onNav('missions')}>
        {pending ? <span className="nbadge">{pending}</span> : null}
        <div className="board">
          <div className="ttl">Today's<br/>Quests</div>
          <div style={{ display:'flex', gap:'8px', fontSize:'24px' }}><span>🎮</span><span>🧩</span><span>🐼</span></div>
        </div>
        <span className="label">Mission Board</span>
      </div>

      {/* HOTSPOT: door = games */}
      <div className="hotspot cafe-door" style={{ right:'70px', bottom:'32%' }} onClick={()=>onNav('activities')}>
        <div className="door"><span className="win"></span></div>
        <span className="label">Games Room</span>
      </div>

      {/* HOTSPOT: signpost = world map */}
      <div className="hotspot signpost" style={{ left:'70px', bottom:'33%' }} onClick={()=>onNav('map')}>
        <div className="post"></div>
        <div className="arrow">🗺️ Map</div>
        <span className="label">World Map</span>
      </div>

      {/* player */}
      <div className="stand" style={{ left:'530px', top:'250px', width:'255px' }}>
        <img src="novakids_girl.png" style={{ width:'255px', height:'375px', objectFit:'contain', display:'block' }} alt="player" />
        <div className="shadow"></div>
        <div className="wardrobe-btn" style={{ right:'-10px', top:'240px' }} onClick={()=>pushToast('Wardrobe coming soon! 👕')}>👕</div>
      </div>

      {/* pandy + bubble */}
      <div className="stand" style={{ left:'70px', bottom:'8%', width:'130px' }}>
        <img src="novakid-panda.png" style={{ width:'130px', height:'150px', objectFit:'contain', display:'block' }} alt="Pandy" />
        <div className="shadow"></div>
      </div>
      {showBubble ? (
        <Bubble style={{ position:'absolute', left:'210px', bottom:'150px' }}>
          <p>Hey! Word Blitz is back with a NEW rare reward today 🎁 Want to play?</p>
          <div className="acts">
            <button className="btn sm" onClick={()=>onNav('wordblitz')}>Let's go!</button>
            <button className="btn sm ghost" onClick={()=>setShowBubble(false)}>Maybe later</button>
          </div>
        </Bubble>
      ) : null}
    </div>
  );
}

/* ===========================================================
   MISSION BOARD — corkboard overlay (variant B)
   =========================================================== */
function MissionBoard({ s, onClose, onLaunch }){
  const allDone = NW_MISSIONS.every(m => s.missions[m.key] >= m.target);
  const loc = NW_LOCATIONS[s.journey.area];
  const next = NW_LOCATIONS[Math.min(s.journey.area+1, NW_LOCATIONS.length-1)];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" style={{ width:'1080px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'#C99B5E', border:'12px solid #8A5A2E', borderRadius:'28px', padding:'26px 30px 30px',
                      boxShadow:'0 16px 0 rgba(0,0,0,.25)', position:'relative' }}>
          <button className="icon-btn" style={{ position:'absolute', right:'18px', top:'18px' }} onClick={onClose}>✕</button>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
            <div style={{ fontSize:'52px' }}>🐼</div>
            <div>
              <div className="h-title" style={{ fontSize:'34px', color:'#fff' }}>Today's Adventure</div>
              <div style={{ fontWeight:800, color:'#FFF3DA', fontSize:'16px' }}>Finish all three quests to journey onward! 👍</div>
            </div>
          </div>

          {/* bonus banner — journey progression, no mystery item */}
          <div style={{ background:'#FFF7E8', borderRadius:'20px', padding:'16px 20px', marginBottom:'18px',
                        boxShadow:'0 6px 0 rgba(74,47,26,.18)', display:'flex', alignItems:'center', gap:'18px' }}>
            <div style={{ fontSize:'40px' }}>⭐</div>
            <div style={{ flex:1 }}>
              <div className="h-title" style={{ fontSize:'20px' }}>Daily Bonus — complete all 3 quests</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'8px' }}>
                <span style={{ fontWeight:800, fontSize:'13px', color:'var(--ink-2)' }}>{loc.emoji} {loc.name}</span>
                <div className="meter" style={{ flex:1 }}><div className="mfill" style={{ width:(allDone? Math.min(100,s.journey.progress):s.journey.progress)+'%' }}></div></div>
                <span style={{ fontWeight:800, fontSize:'13px', color:'var(--ink-soft)' }}>{next.emoji} {next.name}</span>
              </div>
            </div>
            <div className="tok" style={{ fontSize:'18px' }}>+{BONUS.reward}⚡</div>
            {allDone ? <span className="tag daily">CLAIMED ✓</span> : <span className="tag ghost">+{BONUS.journeyGain}% journey</span>}
          </div>

          {/* mission cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'18px' }}>
            {NW_MISSIONS.map((m,i) => {
              const done = s.missions[m.key] >= m.target;
              const tilt = [-1.5,1,-0.6][i];
              return (
                <div key={m.key} className={'card' + (done?'':' tappable')} style={{ transform:`rotate(${tilt}deg)`, cursor: done?'default':'pointer' }}
                     onClick={done? undefined : ()=>onLaunch(m.activity)}>
                  <div style={{ height:'96px', background: done? 'linear-gradient(180deg,#BFEBCB,#9FE0B4)':'var(--cream-2)',
                                display:'grid', placeItems:'center', fontSize:'44px', position:'relative' }}>
                    {m.icon}
                    {done ? <div style={{ position:'absolute', top:'8px', right:'8px', width:'34px', height:'34px', borderRadius:'50%',
                      background:'var(--teal)', color:'#fff', display:'grid', placeItems:'center', fontSize:'20px',
                      boxShadow:'0 3px 0 var(--teal-dk)' }}>✓</div> : null}
                  </div>
                  <div style={{ padding:'14px' }}>
                    <div className="h-title" style={{ fontSize:'18px' }}>{m.title}</div>
                    <div style={{ fontWeight:800, color:'var(--ink-2)', fontSize:'13px', margin:'2px 0 10px' }}>{m.sub}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {Array.from({length:m.target}).map((_,k)=>(
                          <span key={k} style={{ width:'16px', height:'16px', borderRadius:'50%',
                            border:'3px solid '+(k < s.missions[m.key]?'var(--teal-dk)':'var(--line-soft)'),
                            background:k < s.missions[m.key]?'var(--teal)':'transparent' }}></span>
                        ))}
                      </div>
                      <span className="tok">{done?'DONE ':' '}+{m.reward}⚡</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign:'center', marginTop:'8px', color:'#5E3A1F', fontWeight:800, fontSize:'13px' }}>
            Tap a quest card to start playing →
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   ACTIVITIES — Today's Games dashboard
   =========================================================== */
function Activities({ s, onLaunch, pushToast }){
  const cd = useCountdown();
  return (
    <div className="screen" style={{ background:'linear-gradient(180deg,#FFF4DF,#FBE7C6)' }}>
      <div style={{ position:'absolute', left:'34px', top:'26px', right:'34px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div className="h-title" style={{ fontSize:'40px' }}>Today's Games</div>
          <div style={{ fontWeight:800, color:'var(--ink-2)' }}>Tap a game to play and earn ⚡ tokens</div>
        </div>
      </div>
      <span className="tag today" style={{ position:'absolute', right:'34px', top:'34px', fontSize:'15px', padding:'8px 16px' }}>🔄 Rotates in {cd}</span>

      <div style={{ position:'absolute', left:'34px', right:'34px', top:'130px', bottom:'96px',
                    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'22px' }}>
        {NW_ACTIVITIES.map(a => (
          <div key={a.key} className="card tappable" onClick={()=>onLaunch(a.key)}
               style={a.flag==='today'?{ boxShadow:'0 8px 0 var(--flame-dk)', border:'3px solid var(--flame)' }:null}>
            <div style={{ height:'132px', position:'relative', display:'grid', placeItems:'center', fontSize:'64px',
                          background: a.type==='tutor'?'linear-gradient(180deg,#E7D6FB,#D8BEF6)':a.type==='vocab'?'linear-gradient(180deg,#C9F1EB,#A6E6DC)':'linear-gradient(180deg,#FFE0D2,#FFC7AE)' }}>
              {a.emoji}
              <span className={'tag '+(a.flag==='today'?'today':'daily')} style={{ position:'absolute', top:'12px', left:'12px' }}>
                {a.flag==='today'?'🔥 Today only':'📋 Daily mission'}
              </span>
            </div>
            <div style={{ padding:'14px 18px 18px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                <div className="h-title" style={{ fontSize:'23px', whiteSpace:'nowrap' }}>{a.name}</div>
                <span className={'tag '+a.type}>{a.typeLabel}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span className="tok" style={{ fontSize:'17px' }}>+{a.tokens}⚡</span>
                {a.playable ? <span style={{ fontWeight:800, color:'var(--teal-dk)', fontSize:'14px', whiteSpace:'nowrap' }}>▶ Playable</span>
                            : <span style={{ fontWeight:800, color:'var(--ink-soft)', fontSize:'14px', whiteSpace:'nowrap' }}>Quick play</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================================================
   WORLD MAP — journey / path meter
   =========================================================== */
function WorldMap({ s, onClose }){
  const area = s.journey.area;
  const nodes = NW_LOCATIONS;
  const ys = [560, 430, 470, 340, 300];
  const xs = [120, 360, 600, 840, 1090];
  return (
    <div className="screen" style={{ background:'linear-gradient(180deg,#BFE9FF 0%, #DFF6E4 60%, #CDEBD2 100%)' }}>
      <div style={{ position:'absolute', left:'34px', top:'26px' }}>
        <div className="h-title" style={{ fontSize:'40px' }}>Nova World Map</div>
        <div style={{ fontWeight:800, color:'var(--ink-2)' }}>Finish your 3 daily quests to journey to the next place</div>
      </div>
      <button className="icon-btn" style={{ position:'absolute', right:'24px', top:'26px' }} onClick={onClose}>✕</button>

      {/* path */}
      <svg viewBox="0 0 1280 800" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
        <polyline points={xs.map((x,i)=>`${x},${ys[i]}`).join(' ')}
          fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <polyline points={xs.map((x,i)=>`${x},${ys[i]}`).join(' ')}
          fill="none" stroke="#C9854A" strokeWidth="10" strokeDasharray="2 26" strokeLinecap="round" />
      </svg>

      {/* nodes */}
      {nodes.map((n,i) => {
        const state = i < area ? 'done' : i === area ? 'current' : 'locked';
        return (
          <div key={n.key} style={{ position:'absolute', left:xs[i]-55, top:ys[i]-55, width:'110px', textAlign:'center' }}>
            <div className={state==='current'?'floaty':''} style={{ width:'92px', height:'92px', margin:'0 auto', borderRadius:'50%',
              background: state==='locked'?'#E7D3B0':'#FFFDF8', border:'6px solid '+(state==='current'?'var(--amber)':state==='done'?'var(--teal)':'#CBB892'),
              boxShadow:'0 7px 0 rgba(74,47,26,.18)', display:'grid', placeItems:'center', fontSize:'42px',
              filter: state==='locked'?'grayscale(.6) opacity(.7)':'none', position:'relative' }}>
              {state==='locked'?'🔒':n.emoji}
              {state==='current' ? <div style={{ position:'absolute', top:'-34px', left:'50%', transform:'translateX(-50%)', fontSize:'30px' }}>🧒</div> : null}
              {state==='done' ? <div style={{ position:'absolute', bottom:'-6px', right:'-6px', width:'30px', height:'30px', borderRadius:'50%', background:'var(--teal)', color:'#fff', display:'grid', placeItems:'center', boxShadow:'0 3px 0 var(--teal-dk)' }}>✓</div> : null}
            </div>
            <div className="h-title" style={{ fontSize:'17px', marginTop:'8px',
              color: state==='locked'?'var(--ink-soft)':'var(--ink)' }}>{n.name}</div>
            {state==='current' ? <span className="tag daily" style={{ fontSize:'11px' }}>YOU ARE HERE</span> : null}
          </div>
        );
      })}

      {/* journey meter */}
      <div className="panel" style={{ position:'absolute', left:'50%', bottom:'22px', transform:'translateX(-50%)', width:'620px', padding:'16px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
          <span className="h-title" style={{ fontSize:'17px' }}>Journey to {NW_LOCATIONS[Math.min(area+1,NW_LOCATIONS.length-1)].name}</span>
          <span style={{ fontWeight:800, color:'var(--teal-dk)' }}>{Math.round(s.journey.progress)}%</span>
        </div>
        <div className="meter"><div className="mfill" style={{ width:s.journey.progress+'%' }}></div></div>
      </div>
    </div>
  );
}

Object.assign(window, { Hub, MissionBoard, Activities, WorldMap, CountUp, useCountdown });
