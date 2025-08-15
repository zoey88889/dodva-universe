// 在文件顶部或适当位置放一份分类到文案的映射
const MOMO_LINES_BY_BANK = {
  forest: "虫鸣把杂念挂在树梢上～🌳",
  rain:   "让雨声洗洗今天的疲惫 ☔️",
  ocean:  "把担心交给海浪，给心一点空间 🌊",
  relax:  "心跳 40Hz & 528Hz，稳稳地抱住你 🫶"
};

// 例1：如果你有 setBank(bank) 这种“单轨/主分类”函数：
function setBank(bank /* ... 你的其他参数 */) {
  // …原来的逻辑（设置 audio.src / 播放 / 调音量 …）

  // ——联动文案——
  if (window.MomoLines) {
    const msg = MOMO_LINES_BY_BANK[bank] || "声音就位，我们慢慢来～";
    MomoLines.next(msg); // ← 这里新加
  }
}

// 例2：如果你有多轨开关，比如 toggleTrack(key, on)：
function toggleTrack(key, on) {
  // …原来的逻辑（为某轨创建/暂停 Audio 实例 …）

  // ——联动文案（仅在开启该轨时说一句）——
  if (on && window.MomoLines) {
    const msg = MOMO_LINES_BY_BANK[key] || "把音量调到舒服的位置就好～";
    MomoLines.next(msg); // ← 这里新加
  }
};(()=>{

// ====== 基础配置 ======
const STORAGE_KEY = 'dodva.mix.v1';

// 自动推断 assets/audio/ 根路径（支持子页面）
function detectRoot(){
  const here = location.pathname.replace(/\/+$/,'');
  const depth = (here.match(/\//g)||[]).length; // /a.html ->1, /sub/page.html ->2
  // 你现在所有页面都在根目录，直接返回 'assets/audio/'
  // 若将来放子目录，可改成 '../'.repeat(depth-1)+'assets/audio/'
  return 'assets/audio/';
}
const ROOT = detectRoot();

const BANKS = {
  forest: [
    `${ROOT}forest/crickets.mp3`,
    `${ROOT}forest/leaves-wind.mp3`,
    `${ROOT}forest/stream-soft.mp3`,
  ],
  rain: [
    `${ROOT}rain/window-rain.mp3`,
    `${ROOT}rain/distant-thunder.mp3`,
  ],
  ocean: [
    `${ROOT}ocean/waves-1.mp3`,
    `${ROOT}ocean/wind-sea.mp3`,
  ],
  relax: [
    `${ROOT}relax/fireplace-1.mp3`,
    `${ROOT}relax/space-hum-60hz.mp3`,
    `${ROOT}relax/heart-40hz.mp3`,
    `${ROOT}relax/528hz.mp3`,
  ],
};

const LABEL = { forest:'🌳 森林', rain:'🌧️ 雨声', ocean:'🌊 海洋', relax:'🔥 舒缓/频率' };

const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp01 = v => Math.max(0, Math.min(1, Number(v)||0));

// ====== 全局状态（多轨）======
const state = {
  tracks: { // key -> {audio, on, vol, src}
    forest: { audio:new Audio(), on:false, vol:0.35, src:'' },
    rain:   { audio:new Audio(), on:false, vol:0.30, src:'' },
    ocean:  { audio:new Audio(), on:false, vol:0.30, src:'' },
    relax:  { audio:new Audio(), on:false, vol:0.20, src:'' },
  },
  needGesture: false,
  inited: false,
  dock: true,
};

// 初始化每条轨
for (const k of Object.keys(state.tracks)){
  const a = state.tracks[k].audio;
  a.loop = true; a.preload='auto';
}

// ====== 持久化 ======
function save(){
  const snapshot = {};
  for (const k of Object.keys(state.tracks)){
    const t = state.tracks[k];
    snapshot[k] = { on:t.on, vol:t.vol, src:t.src };
  }
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); }catch(e){}
}
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    for (const k of Object.keys(state.tracks)){
      if (obj[k]){
        state.tracks[k].on  = !!obj[k].on;
        state.tracks[k].vol = clamp01(obj[k].vol);
        state.tracks[k].src = obj[k].src || '';
        state.tracks[k].audio.volume = state.tracks[k].vol;
      }
    }
  }catch(e){}
}

// ====== 播放控制 ======
async function playTrack(key, forceSrc){
  const t = state.tracks[key]; if(!t) return;
  const list = BANKS[key]; if(!list||!list.length) return;

  const src = forceSrc || (t.src && list.includes(t.src) ? t.src : pick(list));
  t.src = src;
  t.audio.src = src;
  t.audio.volume = clamp01(t.vol);

  try{
    await t.audio.play();
    t.on = true; state.needGesture = false; save(); updateDock();
  }catch(e){
    // 等用户任意点击
    t.on = false; state.needGesture = true; updateDock();
  }
}

function stopTrack(key){
  const t = state.tracks[key]; if(!t) return;
  try{ t.audio.pause(); }catch(_){}
  t.audio.removeAttribute('src'); t.audio.load();
  t.on = false; save(); updateDock();
}

function setVol(key, v){
  const t = state.tracks[key]; if(!t) return;
  t.vol = clamp01(v);
  t.audio.volume = t.vol;
  save(); updateDock();
}

// 一键停止
function stopAll(){
  Object.keys(state.tracks).forEach(stopTrack);
}

// 手势恢复（若被拦截）
function enableGestureResumeOnce(){
  const h = ()=> {
    if (state.needGesture){
      // 恢复所有“标记为开启”的轨
      Object.keys(state.tracks).forEach(async key=>{
        if (state.tracks[key].on===true){ await playTrack(key, state.tracks[key].src); }
      });
    }
    window.removeEventListener('pointerdown', h, true);
  };
  window.addEventListener('pointerdown', h, true);
}

// ====== Dock（左下角控制台）======
let dockEl=null;

function buildDock(){
  if (!state.dock || dockEl) return;
  dockEl = document.createElement('div');
  dockEl.style.cssText = `
    position:fixed;left:12px;bottom:12px;z-index:9999;
    background:rgba(8,12,22,.55);border:1px solid rgba(147,197,253,.18);
    border-radius:12px;padding:10px;backdrop-filter:blur(8px);color:#eaf2ff;
    font:14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans SC",sans-serif;
    max-width: min(92vw,360px);
  `;
  dockEl.innerHTML = `<div style="font-weight:700;margin-bottom:6px;">🎧 Dodva 多轨混音</div>`;
  for (const key of Object.keys(state.tracks)){
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:6px 0;';
    row.innerHTML = `
      <button data-key="${key}" class="toggle" style="
        cursor:pointer;border:1px solid rgba(147,197,253,.25);border-radius:8px;padding:6px 10px;
        background:linear-gradient(135deg,#a5b4fc,#67e8f9,#f0abfc);color:#051019;font-weight:800;">
        开启
      </button>
      <div style="min-width:80px">${LABEL[key]||key}</div>
      <input data-key="${key}" class="vol" type="range" min="0" max="1" step="0.01" style="flex:1" />
    `;
    dockEl.appendChild(row);
  }
  const hint = document.createElement('div');
  hint.id='mix-hint';
  hint.style.cssText='margin-top:6px;font-size:12px;opacity:.85;color:#cfe3ff;';
  hint.textContent = '首次播放需点任意按钮授权';
  dockEl.appendChild(hint);

  const stopBtn = document.createElement('button');
  stopBtn.textContent = '⏹ 全停';
  stopBtn.style.cssText='margin-top:8px;cursor:pointer;border:1px solid rgba(147,197,253,.25);border-radius:8px;padding:6px 10px;background:rgba(147,197,253,.08);color:#eaf2ff;';
  stopBtn.onclick = ()=>{ stopAll(); };
  dockEl.appendChild(stopBtn);

  document.body.appendChild(dockEl);

  // 事件
  dockEl.querySelectorAll('button.toggle').forEach(btn=>{
    btn.onclick = async ()=>{
      const key = btn.getAttribute('data-key');
      const t = state.tracks[key];
      if (!t.on){ await playTrack(key); } else { stopTrack(key); }
    };
  });
  dockEl.querySelectorAll('input.vol').forEach(sl=>{
    const key = sl.getAttribute('data-key');
    sl.value = String(state.tracks[key].vol);
    sl.oninput = (e)=> setVol(key, e.target.value);
  });

  updateDock();
}

function updateDock(){
  if (!dockEl) return;
  dockEl.querySelectorAll('button.toggle').forEach(btn=>{
    const key = btn.getAttribute('data-key');
    btn.textContent = state.tracks[key].on ? '暂停' : '开启';
  });
  const hint = dockEl.querySelector('#mix-hint');
  if (hint){
    hint.textContent = state.needGesture ? '（点任意处以恢复播放）' : ' ';
  }
}

// ====== 对外 API ======
function init(opts={}){
  if (state.inited) return;
  state.inited = true;
  state.dock = opts.dock !== false;

  load();                 // 恢复上次 on/vol/src
  if (state.dock) buildDock();

  // 若上次是“开启”的轨，尝试续播（可能被拦截）
  let needResume = false;
  (async ()=>{
    for (const k of Object.keys(state.tracks)){
      const t = state.tracks[k];
      if (t.on){ needResume = true; await playTrack(k, t.src); }
    }
    if (state.needGesture || needResume){ enableGestureResumeOnce(); }
  })();

  // 页面隐藏时不强行关；你愿意可以在这里暂停
  addEventListener('pagehide', ()=>{ /* 可选暂停 */ }, {passive:true});
}

window.MixPlayer = { init, playTrack, stopTrack, stopAll, setVol, _state:state };

})();
