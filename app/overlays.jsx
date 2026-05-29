/* ===========================================================
   NOVA WORLD — Reward Moment + Chest Opening overlays
   =========================================================== */

function RewardMoment({ s, outcome, onDone }){
  const gained = outcome.tokensGained;
  const barFrom = Math.max(0, Math.min(CHEST_CAP, s.tokens - gained));
  const barTo = Math.min(CHEST_CAP, s.tokens);
  const remaining = NW_MISSIONS.filter(m => s.missions[m.key] < m.target).length;
  const [phase, setPhase] = useState(0); // 0 token pop, 1 bar fills
  useEffect(()=>{ const t = setTimeout(()=>setPhase(1), 900); return ()=>clearTimeout(t); },[]);

  let pandyMsg;
  if (outcome.allDone) pandyMsg = 'WOW! All quests done — your journey moves forward! 🗺️';
  else if (outcome.missionCompleted) pandyMsg = `Quest complete! ${remaining} more to go!`;
  else pandyMsg = 'Nice work! Keep playing to fill the chest!';

  return (
    <div className="overlay" style={{ background:'rgba(40,24,10,.62)' }}>
      <Confetti x={640} y={300} n={34} />
      <div className="pop" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', textAlign:'center' }}>
        <div className="vhero">🧒</div>
        <div className="big-tok">+{gained}⚡</div>

        {outcome.missionCompleted ? (
          <div className="card" style={{ width:'460px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 8px 0 var(--teal-dk)', border:'3px solid var(--teal)' }}>
            <div style={{ fontSize:'34px' }}>{outcome.mission.icon}</div>
            <div style={{ flex:1, textAlign:'left' }}>
              <div className="h-title" style={{ fontSize:'18px' }}>{outcome.mission.title}</div>
              <div style={{ fontWeight:800, color:'var(--teal-dk)', fontSize:'13px' }}>QUEST COMPLETE +{outcome.mission.reward}⚡</div>
            </div>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--teal)', color:'#fff', display:'grid', placeItems:'center', fontSize:'22px', boxShadow:'0 3px 0 var(--teal-dk)' }}>✓</div>
          </div>
        ) : null}

        {outcome.allDone ? (
          <div className="card" style={{ width:'460px', padding:'14px 18px', boxShadow:'0 8px 0 var(--amber-dk)', border:'3px solid var(--amber)' }}>
            <div className="h-title" style={{ fontSize:'18px' }}>⭐ Daily Bonus +{outcome.bonusReward}⚡ · journey +{BONUS.journeyGain}%</div>
            {outcome.journeyLeveled ? <div style={{ fontWeight:800, color:'var(--amber-dk)', fontSize:'14px', marginTop:'4px' }}>New area unlocked: {NW_LOCATIONS[outcome.newArea].emoji} {NW_LOCATIONS[outcome.newArea].name}!</div> : null}
          </div>
        ) : null}

        {/* focal chest bar */}
        <div className="chestbar" style={{ transform:'scale(1.15)', margin:'6px 0' }}>
          <div className="track" style={{ width:'280px' }}>
            <div className="fill" style={{ width:((phase? barTo:barFrom)/CHEST_CAP*100)+'%' }}></div>
            <div className="val"><CountUp from={barFrom} to={phase?barTo:barFrom} /> / {CHEST_CAP} ⚡</div>
          </div>
          <div className={'chesticon'+(outcome.chestReady?' ready':'')}>🎁</div>
        </div>

        <Bubble style={{ marginTop:'2px' }}>
          <p style={{ margin:0 }}>🐼 {pandyMsg}</p>
        </Bubble>

        <button className="btn lg" onClick={onDone} style={{ marginTop:'6px' }}>
          {outcome.chestReady ? 'Open chest! 🎁' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

function ChestOpening({ s, doOpen, onDone }){
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(0);

  const open = () => {
    if (opened) return;
    const r = doOpen();
    setResult(r); setOpened(true);
  };
  useEffect(()=>{
    if (!result) return;
    if (revealed >= result.revealed.length) return;
    const t = setTimeout(()=>setRevealed(v=>v+1), revealed===0?500:800);
    return ()=>clearTimeout(t);
  },[result, revealed]);

  const allRevealed = result && revealed >= result.revealed.length;
  // rarity meter lands mid-tier (rare)
  const meterPct = opened ? 58 : 0;

  return (
    <div className="overlay" style={{ background:'radial-gradient(circle at 50% 36%, rgba(80,50,16,.55), rgba(30,18,8,.8))' }}>
      {allRevealed ? <Confetti x={640} y={260} n={30} /> : null}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'20px' }}>
        <div className="h-title" style={{ fontSize:'34px', color:'#fff', whiteSpace:'nowrap', marginBottom:'4px' }}>{opened?'Your rewards!':'Chest unlocked!'}</div>

        {!opened ? (
          <>
            <div className="chest3d shaking" onClick={open}>🎁</div>
            <button className="btn lg" onClick={open}>Tap to open!</button>
          </>
        ) : (
          <>
            {/* rarity meter */}
            <div className="rmeter">
              <div className="bar"><div className="barfill" style={{ width:meterPct+'%' }}></div>
                <div className="pointer" style={{ left:'calc('+meterPct+'% - 2px)' }}></div></div>
              <div className="ticks">
                <span style={{ color:'var(--r-common-dk)' }}>COMMON</span>
                <span style={{ color:'var(--r-rare)' }}>RARE</span>
                <span style={{ color:'var(--r-epic)' }}>EPIC</span>
                <span style={{ color:'var(--r-legend-dk)' }}>LEGEND</span>
              </div>
            </div>

            {/* revealed items */}
            <div style={{ display:'flex', gap:'24px', minHeight:'220px', alignItems:'center' }}>
              {result.revealed.map((it,i) => {
                if (i >= revealed) return <div key={i} style={{ width:'180px', height:'200px', borderRadius:'24px',
                  background:'rgba(255,255,255,.12)', border:'3px dashed rgba(255,255,255,.3)' }}></div>;
                const rar = RARITY[it.rarity];
                const isNew = !it.dup && it.rarity!=='common';
                return (
                  <div key={i} className="rcard" style={{ borderColor:rar.color, boxShadow:'0 10px 0 '+rar.dk }}>
                    {it.dup ? <span className="dupb">+{it.coins} 🪙</span> : (isNew ? <span className="newb">NEW</span> : null)}
                    <div className="top" style={{ background: it.rarity==='common'?'#EEF1F3':it.rarity==='rare'?'#E2EEFB':'#EFE4FB' }}>{it.emoji}</div>
                    <div className="meta">
                      <div className="rar" style={{ color:rar.color }}>{it.dup?'Duplicate':rar.label}</div>
                      <div className="nm">{it.dup? '→ '+it.coins+' coins' : it.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ height:'40px' }}>
              {allRevealed && result.coinsGain>0 ? <div className="tag coin" style={{ background:'var(--coin)', color:'#5E3A1F', fontSize:'16px', padding:'8px 16px' }}>Duplicates converted → +{result.coinsGain} 🪙</div> : null}
            </div>

            <button className="btn lg" disabled={!allRevealed} onClick={onDone}>
              {allRevealed ? 'Collect all' : 'Revealing…'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { RewardMoment, ChestOpening });
