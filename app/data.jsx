/* ===========================================================
   NOVA WORLD — data + game state
   =========================================================== */
const { useState, useEffect, useRef, useCallback } = React;

const CHEST_CAP = 500;

const NW_LOCATIONS = [
  { key:'cafe',    name:'Cozy Café',   emoji:'☕' },
  { key:'square',  name:'Town Square', emoji:'⛲' },
  { key:'library', name:'Library',     emoji:'📚' },
  { key:'park',    name:'Sunny Park',  emoji:'🌳' },
  { key:'harbor',  name:'Harbor',      emoji:'⚓' },
];

// daily missions (tokens only — items come from chests)
const NW_MISSIONS = [
  { key:'wordblitz', icon:'🎮', title:'Play Word Blitz',         sub:'3 times', target:3, reward:60,  activity:'wordblitz' },
  { key:'vocab',     icon:'🧩', title:'Complete Vocab Match',    sub:'2 times', target:2, reward:80,  activity:'vocab' },
  { key:'chat',      icon:'🐼', title:'Chat with Pandy + quiz',  sub:'pass it', target:1, reward:120, activity:'chat' },
];
const BONUS = { reward:100, journeyGain:34 }; // ~3 perfect days between areas

// activities dashboard (tokens only)
const NW_ACTIVITIES = [
  { key:'wordblitz', name:'Word Blitz',  emoji:'🎮', type:'arcade', typeLabel:'ARCADE',     tokens:40, flag:'daily', playable:true },
  { key:'vocab',     name:'Vocab Match', emoji:'🧩', type:'vocab',  typeLabel:'VOCABULARY', tokens:60, flag:'daily' },
  { key:'chat',      name:'Pandy Chat',  emoji:'🐼', type:'tutor',  typeLabel:'AI TUTOR',   tokens:120,flag:'daily' },
  { key:'spell',     name:'Spell Run',   emoji:'🏃', type:'arcade', typeLabel:'ARCADE',     tokens:40, flag:'today' },
];

// chest item pool
const NW_ITEMS = [
  { id:'socks',  name:'Café Socks',   emoji:'🧦', rarity:'common' },
  { id:'mug',    name:'Cocoa Mug',    emoji:'☕', rarity:'common' },
  { id:'cap',    name:'Comfy Cap',    emoji:'🧢', rarity:'common' },
  { id:'glove',  name:'Warm Mittens', emoji:'🧤', rarity:'common' },
  { id:'tophat', name:'Top Hat',      emoji:'🎩', rarity:'rare' },
  { id:'scarf',  name:'Star Scarf',   emoji:'🧣', rarity:'rare' },
  { id:'board',  name:'Skateboard',   emoji:'🛹', rarity:'rare' },
  { id:'shades', name:'Cool Shades',  emoji:'🕶️', rarity:'rare' },
  { id:'cape',   name:'Hero Cape',    emoji:'🦸', rarity:'epic' },
  { id:'wings',  name:'Dragon Wings', emoji:'🐲', rarity:'epic' },
  { id:'crown',  name:'Gold Crown',   emoji:'👑', rarity:'epic' },
];
const RARITY = {
  common: { label:'Common', color:'var(--r-common)', dk:'var(--r-common-dk)' },
  rare:   { label:'Rare',   color:'var(--r-rare)',   dk:'var(--r-rare-dk)' },
  epic:   { label:'Epic',   color:'var(--r-epic)',   dk:'var(--r-epic-dk)' },
};
const DUP_COINS = 12;

// Word Blitz questions — pick the English word for the picture
const NW_WB_QUESTIONS = [
  { prompt:'🐶', answer:'Dog',      choices:['Dog','Cat','Cow','Pig'] },
  { prompt:'🍎', answer:'Apple',    choices:['Apple','Orange','Lemon','Pear'] },
  { prompt:'🌞', answer:'Sun',      choices:['Sun','Moon','Star','Cloud'] },
  { prompt:'🚗', answer:'Car',      choices:['Car','Bus','Train','Boat'] },
  { prompt:'🏠', answer:'House',    choices:['House','Tree','Tent','Barn'] },
  { prompt:'🐟', answer:'Fish',     choices:['Fish','Bird','Frog','Crab'] },
  { prompt:'🌈', answer:'Rainbow',  choices:['Rainbow','River','Flower','Cloud'] },
  { prompt:'🦋', answer:'Butterfly',choices:['Butterfly','Bee','Ant','Moth'] },
  { prompt:'🎈', answer:'Balloon',  choices:['Balloon','Ball','Kite','Drum'] },
  { prompt:'🌙', answer:'Moon',     choices:['Moon','Sun','Star','Lamp'] },
  { prompt:'🍌', answer:'Banana',   choices:['Banana','Apple','Carrot','Corn'] },
  { prompt:'🐱', answer:'Cat',      choices:['Cat','Dog','Fox','Rat'] },
];

function nwInitial(){
  return {
    tokens: 340,
    coins: 1240,
    streak: 5,
    missions: { wordblitz:0, vocab:0, chat:0 },
    bonusDone: false,
    journey: { area:0, progress:40 },      // % toward next area
    inventory: ['socks','cap'],            // owned items (for duplicate logic)
    pendingChest: false,
  };
}

const NW_KEY = 'novaworld.proto.v3';

function useNovaState(){
  const [s, setS] = useState(() => {
    try { const raw = localStorage.getItem(NW_KEY); if (raw) return { ...nwInitial(), ...JSON.parse(raw) }; } catch(e){}
    return nwInitial();
  });
  const sRef = useRef(s);
  useEffect(() => { sRef.current = s; try { localStorage.setItem(NW_KEY, JSON.stringify(s)); } catch(e){} }, [s]);

  // Play an activity once. Computes synchronously off the latest state so the
  // outcome can be returned to the caller (used to drive the reward moment).
  const playActivity = useCallback((activityKey) => {
    const prev = sRef.current;
    const act = NW_ACTIVITIES.find(a => a.key === activityKey);
    const mission = NW_MISSIONS.find(m => m.activity === activityKey);
    let gained = act ? act.tokens : 0;
    const missions = { ...prev.missions };
    let missionCompleted = false, missionReward = 0;
    if (mission && missions[mission.key] < mission.target) {
      missions[mission.key] = missions[mission.key] + 1;
      if (missions[mission.key] >= mission.target) {
        missionCompleted = true; missionReward = mission.reward; gained += mission.reward;
      }
    }
    const allDone = NW_MISSIONS.every(m => missions[m.key] >= m.target);
    let bonusReward = 0, journey = prev.journey, bonusDone = prev.bonusDone, leveled = false;
    if (allDone && !prev.bonusDone) {
      bonusDone = true; bonusReward = BONUS.reward; gained += BONUS.reward;
      let area = prev.journey.area, progress = prev.journey.progress + BONUS.journeyGain;
      if (progress >= 100 && area < NW_LOCATIONS.length - 1) { area += 1; progress -= 100; leveled = true; }
      else if (area >= NW_LOCATIONS.length - 1) progress = Math.min(progress, 100);
      journey = { area, progress };
    }
    const newTokens = prev.tokens + gained;
    const pendingChest = newTokens >= CHEST_CAP;
    const next = { ...prev, tokens: newTokens, missions, bonusDone, journey, pendingChest };
    sRef.current = next; setS(next);
    return {
      activityKey, tokensGained: gained, baseTokens: act ? act.tokens : 0,
      mission, missionCompleted, missionReward,
      allDone: bonusReward > 0, bonusReward, journeyLeveled: leveled, newArea: journey.area,
      chestReady: pendingChest, tokensAfter: newTokens,
    };
  }, []);

  // Open the chest: roll 3 items, dupes → coins, deduct cap (carry overflow).
  const openChest = useCallback(() => {
    const prev = sRef.current;
    const picks = [
      NW_ITEMS.filter(i=>i.rarity==='common')[Math.floor(Math.random()*4)],
      NW_ITEMS.filter(i=>i.rarity==='rare')[Math.floor(Math.random()*4)],
      NW_ITEMS.filter(i=>i.rarity==='epic')[Math.floor(Math.random()*3)],
    ];
    const inv = [...prev.inventory];
    let coinsGain = 0;
    const revealed = picks.map(it => {
      const dup = inv.includes(it.id);
      if (dup) coinsGain += DUP_COINS; else inv.push(it.id);
      return { ...it, dup, coins: dup ? DUP_COINS : 0 };
    });
    const tokens = Math.max(0, prev.tokens - CHEST_CAP);
    const next = { ...prev, tokens, inventory: inv, coins: prev.coins + coinsGain, pendingChest: tokens >= CHEST_CAP };
    sRef.current = next; setS(next);
    return { revealed, coinsGain };
  }, []);

  const reset = useCallback(() => { const init = nwInitial(); sRef.current = init; setS(init); }, []);

  return [s, { playActivity, openChest, reset }];
}

Object.assign(window, {
  CHEST_CAP, NW_LOCATIONS, NW_MISSIONS, BONUS, NW_ACTIVITIES, NW_ITEMS, RARITY, DUP_COINS,
  NW_WB_QUESTIONS, useNovaState, nwInitial,
});
