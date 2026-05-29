/* ===========================================================
   NOVA WORLD — Word Blitz mini-game
   Pick the English word for the picture. 5 quick rounds.
   =========================================================== */
function wbShuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; }

function WordBlitz({ onWin, onQuit }){
  const ROUNDS = 5;
  const [qs] = useState(() => wbShuffle(NW_WB_QUESTIONS).slice(0,ROUNDS).map(q => ({ ...q, choices: wbShuffle(q.choices) })));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);   // chosen string or '__timeout__'
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(100);

  const q = qs[i];

  // reset timer each question
  useEffect(()=>{ setTime(100); },[i]);
  // countdown
  useEffect(()=>{
    if (picked!==null || done) return;
    if (time<=0){ setPicked('__timeout__'); return; }
    const t = setTimeout(()=>setTime(v=>v-1.6), 100); // ~6.3s
    return ()=>clearTimeout(t);
  },[time, picked, done]);
  // advance after a pick
  useEffect(()=>{
    if (picked===null) return;
    const t = setTimeout(()=>{
      if (i+1 >= ROUNDS) setDone(true);
      else { setI(i+1); setPicked(null); }
    }, 1000);
    return ()=>clearTimeout(t);
  },[picked]);

  const choose = (c) => {
    if (picked!==null) return;
    setPicked(c);
    if (c === q.answer) setScore(s=>s+1);
  };

  if (done){
    const stars = score>=5?3:score>=3?2:score>=1?1:0;
    return (
      <div className="screen" style={{ background:'linear-gradient(180deg,#FFE9C4,#FFD79A)', display:'grid', placeItems:'center' }}>
        <Confetti x={640} y={300} n={30} />
        <div className="pop" style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
          <div className="vhero" style={{ fontSize:'96px' }}>🎉</div>
          <div className="h-title" style={{ fontSize:'46px' }}>You did it!</div>
          <div style={{ fontSize:'52px', letterSpacing:'6px' }}>{'⭐'.repeat(stars)}{'·'.repeat(3-stars)}</div>
          <div style={{ fontWeight:800, fontSize:'24px', color:'var(--ink-2)' }}>Score {score} / {ROUNDS}</div>
          <button className="btn lg" onClick={()=>onWin(score)}>Claim +40⚡</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ background:'linear-gradient(180deg,#FFEFD0,#FFD79A)' }}>
      {/* top bar */}
      <div style={{ position:'absolute', left:'24px', right:'24px', top:'22px', display:'flex', alignItems:'center', gap:'14px' }}>
        <button className="icon-btn" onClick={onQuit}>✕</button>
        <div className="h-title" style={{ fontSize:'26px' }}>Word Blitz</div>
        <div style={{ display:'flex', gap:'8px', marginLeft:'10px' }}>
          {Array.from({length:ROUNDS}).map((_,k)=>(
            <span key={k} style={{ width:'16px', height:'16px', borderRadius:'50%',
              background: k<i?'var(--teal)':k===i?'var(--amber)':'#F0E2C6',
              border:'3px solid #fff', boxShadow:'0 2px 0 rgba(74,47,26,.12)' }}></span>
          ))}
        </div>
        <div style={{ marginLeft:'auto' }} className="tok">⚡ {score*40 + (picked===q.answer?40:0)}</div>
      </div>

      {/* prompt card */}
      <div style={{ position:'absolute', left:'50%', top:'110px', transform:'translateX(-50%)', textAlign:'center' }}>
        <div style={{ fontWeight:800, color:'var(--ink-2)', fontSize:'20px', marginBottom:'10px' }}>What is this in English?</div>
        <div style={{ width:'260px', height:'200px', margin:'0 auto', borderRadius:'30px', background:'#fff',
                      boxShadow:'0 10px 0 rgba(74,47,26,.14)', display:'grid', placeItems:'center', fontSize:'120px' }}>{q.prompt}</div>
        {/* timer */}
        <div style={{ width:'260px', height:'12px', margin:'14px auto 0', borderRadius:'999px', background:'#F0E2C6', overflow:'hidden' }}>
          <div style={{ height:'100%', width:Math.max(0,time)+'%', borderRadius:'999px',
            background: time>30?'var(--teal)':'var(--flame)', transition:'width .1s linear' }}></div>
        </div>
      </div>

      {/* answer grid */}
      <div style={{ position:'absolute', left:'50%', bottom:'70px', transform:'translateX(-50%)',
                    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', width:'620px' }}>
        {q.choices.map(c => {
          const isAnswer = c === q.answer;
          const isPicked = c === picked;
          let bg='#fff', col='var(--ink)', sh='0 6px 0 var(--line-soft)', bd='3px solid #fff';
          if (picked!==null){
            if (isAnswer){ bg='var(--teal)'; col='#fff'; sh='0 6px 0 var(--teal-dk)'; bd='3px solid var(--teal)'; }
            else if (isPicked){ bg='var(--berry)'; col='#fff'; sh='0 6px 0 var(--berry-dk)'; bd='3px solid var(--berry)'; }
            else { bg='#FBEFD8'; col='var(--ink-soft)'; }
          }
          return (
            <button key={c} onClick={()=>choose(c)} disabled={picked!==null}
              className={isPicked && !isAnswer ? 'wb-wrong':''}
              style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'30px', padding:'22px',
                       borderRadius:'22px', border:bd, background:bg, color:col, boxShadow:sh, cursor:picked!==null?'default':'pointer',
                       transition:'all .15s var(--ease)' }}>
              {c}{picked!==null && isAnswer ? ' ✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { WordBlitz });
