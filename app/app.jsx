/* ===========================================================
   NOVA WORLD — app router, stage scaler, tweaks
   =========================================================== */
const { Hub, MissionBoard, Activities, WorldMap, WordBlitz,
        RewardMoment, ChestOpening, Hud, Dock, Toasts } = window;

function App(){
  const [s, actions] = useNovaState();
  const [route, setRoute] = useState('hub');          // hub | activities | map | wordblitz
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [rewardOutcome, setRewardOutcome] = useState(null);
  const [chestOpen, setChestOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 1900);
  }, []);

  useEffect(() => { window.__novaReset = () => { actions.reset(); setRoute('hub'); setMissionsOpen(false); setRewardOutcome(null); setChestOpen(false); }; }, [actions]);

  const onNav = (key) => {
    if (key === 'missions') { setMissionsOpen(true); return; }
    setMissionsOpen(false); setRoute(key);
  };

  const launch = (key) => {
    setMissionsOpen(false);
    const act = NW_ACTIVITIES.find(a => a.key === key);
    if (act && act.playable) { setRoute('wordblitz'); return; }
    setRoute('hub');
    const outcome = actions.playActivity(key);
    pushToast(`${act ? act.name : 'Activity'} complete!`);
    setRewardOutcome(outcome);
  };

  const wbWin = () => {
    const outcome = actions.playActivity('wordblitz');
    setRoute('hub');
    setRewardOutcome(outcome);
  };

  const rewardDone = () => {
    const o = rewardOutcome; setRewardOutcome(null);
    if (o && o.chestReady) setChestOpen(true);
  };

  const missionCount = NW_MISSIONS.filter(m => s.missions[m.key] < m.target).length;
  const showChrome = route === 'hub' || route === 'activities';

  return (
    <>
      {route === 'hub' && <Hub s={s} onNav={onNav} pushToast={pushToast} />}
      {route === 'activities' && <Activities s={s} onLaunch={launch} pushToast={pushToast} />}
      {route === 'map' && <WorldMap s={s} onClose={() => setRoute('hub')} />}
      {route === 'wordblitz' && <WordBlitz onWin={wbWin} onQuit={() => setRoute('hub')} />}

      {showChrome && <Hud s={s} onChestClick={() => s.pendingChest && setChestOpen(true)} />}
      {showChrome && <Dock active={missionsOpen ? 'missions' : route} onNav={onNav} missionCount={missionCount} />}

      {missionsOpen && <MissionBoard s={s} onClose={() => setMissionsOpen(false)} onLaunch={launch} />}
      {rewardOutcome && <RewardMoment s={s} outcome={rewardOutcome} onDone={rewardDone} />}
      {chestOpen && <ChestOpening s={s} doOpen={actions.openChest} onDone={() => setChestOpen(false)} />}

      <Toasts items={toasts} />
    </>
  );
}

/* ---------- stage scaler ---------- */
function fitStage(){
  const st = document.getElementById('stage');
  if (!st) return;
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  st.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);

ReactDOM.createRoot(document.getElementById('stage')).render(<App />);
setTimeout(fitStage, 0);

/* ===========================================================
   Tweaks panel (separate root, outside the scaled stage)
   =========================================================== */
const NOVA_THEMES = {
  Amber: ['#FFAA1D','#C96E07'],
  Berry: ['#FF5D73','#C9344A'],
  Teal:  ['#21C0AE','#11897C'],
  Grape: ['#9B5DE5','#6E37AE'],
};
const NOVA_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Amber",
  "reduceMotion": false
}/*EDITMODE-END*/;

function NovaTweaks(){
  const [t, setTweak] = useTweaks(NOVA_TWEAK_DEFAULTS);
  useEffect(() => {
    const [c, d] = NOVA_THEMES[t.accent] || NOVA_THEMES.Amber;
    document.documentElement.style.setProperty('--amber', c);
    document.documentElement.style.setProperty('--amber-2', c);
    document.documentElement.style.setProperty('--amber-dk', d);
    document.body.classList.toggle('reduce-motion', !!t.reduceMotion);
  }, [t.accent, t.reduceMotion]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakRadio label="Accent" value={t.accent} options={['Amber','Berry','Teal','Grape']}
        onChange={(v) => setTweak('accent', v)} />
      <TweakToggle label="Reduce motion" value={t.reduceMotion}
        onChange={(v) => setTweak('reduceMotion', v)} />
      <TweakSection label="Progress" />
      <TweakButton label="Reset demo" onClick={() => window.__novaReset && window.__novaReset()} />
    </TweaksPanel>
  );
}
ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<NovaTweaks />);
