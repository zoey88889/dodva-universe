;(()=>{

/** DodvaAudio v2 — 跨页记忆·单实例播放器
 *  功能：
 *  - 记忆：bank(分类)、文件、音量、是否播放
 *  - 首次交互后自动续播（规避浏览器自动播放拦截）
 *  - 可选左下角“小控制条”（dock:true）
 *  - 可传自定义音频库 banks；否则用内置默认目录结构
 *
 *  用法（页面底部）：
 *    <script src="assets/js/dodva-audio.js"></script>
 *    <script>
 *      DodvaAudio.init({
 *        root: 'assets/audio/',   // 你的音频根目录（子页用 ../assets/audio/）
 *        dock: true,              // 是否显示左下角小控制条
 *        banks: {                 // 可选：自定义库
 *          forest: ['forest/crickets.mp3', ...]
 *        }
 *      });
 *    </script>
 */
const MOMO_LINES_BY_BANK = {
  forest: "虫鸣把杂念挂在树梢上～🌳",
  rain:   "让雨声洗洗今天的疲惫 ☔️",
  ocean:  "把担心交给海浪，给心一点空间 🌊",
  relax:  "心跳 40Hz & 528Hz，稳稳地抱住你 🫶"
};

function setBank(bank, opts = {}) {
  // …原来的设置 src/volume/播放 …

  // ——联动文案——
  if (window.MomoLines) {
    const msg = MOMO_LINES_BY_BANK[bank] || "声音就位，我们慢慢来～";
    MomoLines.next(msg); // ← 这里新加
  }
}
const STORAGE_KEY = 'dodva.audio.v2';

const defaultBanks = (root)=>({
  forest: [
    `${root}forest/crickets.mp3`,
    `${root}forest/leaves-wind.mp3`,
    `${root}forest/stream-soft.mp3`,
  ],
  rain: [
    `${root}rain/window-rain.mp3`,
    `${root}rain/distant-thunder.mp3`,
  ],
  ocean: [
    `${root}ocean/waves-1.mp3`,
    `${root}ocean/wind-sea.mp3`,
  ],
  relax: [
    `${root}relax/fireplace-1.mp3`,
    `${root}relax/space-hum-60hz.mp3`,
    `${root}relax/heart-40hz.mp3`,
    `${root}relax/528hz.mp3`,
  ]
});

const labels = {
  off: '关闭',
  forest:'🌳 森林',
  rain:'🌧 雨声',
  ocean:'🌊 海洋',
  relax:'🔥 舒缓/频率'
};

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function clamp01(v){ v = Number(v); return Math.max(0, Math.min(1, isNaN(v)?0:v)); }

const state = {
  inited: false,
  audio: null,
  root: 'assets/audio/',
  banks: null,
  bank: 'off',
  src: '',
  volume: 0.3,
  playing: false,
  dock: false,
  needGestureResume: false,
};

function save(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      bank: state.bank,
      src: state.src,
      volume: state.volume,
      playing: state.playing
    }));
  }catch(e){}
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object'){
      if (obj.bank) state.bank = obj.bank;
      if (obj.src) state.src = obj.src;
      if (typeof obj.volume === 'number') state.volume = clamp01(obj.volume);
      if (typeof obj.playing === 'boolean') state.playing = obj.playing;
    }
  }catch(e){}
}

async function ensurePlay(){
  if (!state.audio) return;
  try{
    await state.audio.play();
    state.needGestureResume = false;
    state.playing = true;
    save();
    updateDock();
  }catch(e){
    // 浏览器拦截，等一次用户手势
    state.needGestureResume = true;
    state.playing = false;
    updateDockHint('点击任意处以继续播放');
  }
}

function setBank(bank, opts={}){
  if (!state.banks[bank]) {
    stop();
    state.bank = 'off';
    state.src = '';
    save();
    updateDock();
    return;
  }
  const src = opts.src || pick(state.banks[bank]);
  state.bank = bank;
  state.src = src;
  if (!state.audio) return;
  state.audio.src = src;
  state.audio.loop = true;
  state.audio.volume = clamp01(opts.volume ?? state.volume);
  ensurePlay();
  updateDock();
}

function setVolume(v){
  state.volume = clamp01(v);
  if (state.audio) state.audio.volume = state.volume;
  save();
  updateDock();
}

function pause(){
  if (!state.audio) return;
  state.audio.pause();
  state.playing = false;
  save();
  updateDock();
}

function stop(){
  if (!state.audio) return;
  state.audio.pause();
  state.audio.removeAttribute('src');
  state.audio.load();
  state.playing = false;
  state.bank = 'off';
  state.src = '';
  save();
  updateDock();
}

function toggle(){
  if (!state.audio) return;
  if (state.playing) pause(); else ensurePlay();
}

/* ========== Dock（小控制条） ========== */
let dockEl, selEl, volEl, btnEl, hintEl;

function buildDock(){
  if (!state.dock || dockEl) return;

  dockEl = document.createElement('div');
  dockEl.style.cssText = `
    position:fixed; left:12px; bottom:12px; z-index:9999; display:flex; gap:6px; align-items:center;
    background:rgba(8,12,22,.55); border:1px solid rgba(147,197,253,.18); border-radius:12px; padding:8px 10px;
    backdrop-filter:blur(8px); color:#eaf2ff; font:14px/1 system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans SC",sans-serif;
  `;

  selEl = document.createElement('select');
  selEl.style.cssText = `background:rgba(147,197,253,.06); border:1px solid rgba(147,197,253,.25); color:#eaf2ff; border-radius:8px; padding:4px 6px;`;
  selEl.innerHTML = `
    <option value="off">${labels.off}</option>
    <option value="forest">${labels.forest}</option>
    <option value="rain">${labels.rain}</option>
    <option value="ocean">${labels.ocean}</option>
    <option value="relax">${labels.relax}</option>
  `;

  volEl = document.createElement('input');
  volEl.type='range'; volEl.min='0'; volEl.max='1'; volEl.step='0.01';
  volEl.style.cssText = `width:120px`; volEl.value = String(state.volume);

  btnEl = document.createElement('button');
  btnEl.textContent = '▶︎/⏸';
  btnEl.style.cssText = `
    cursor:pointer;border:1px solid rgba(147,197,253,.25);border-radius:8px;padding:6px 10px;
    background:linear-gradient(135deg,#a5b4fc,#67e8f9,#f0abfc); color:#051019; font-weight:800;`;

  hintEl = document.createElement('span');
  hintEl.style.cssText = `margin-left:8px; font-size:12px; opacity:.85; color:#cfe3ff;`;

  dockEl.appendChild(selEl);
  dockEl.appendChild(volEl);
  dockEl.appendChild(btnEl);
  dockEl.appendChild(hintEl);
  document.body.appendChild(dockEl);

  selEl.value = state.bank || 'off';
  selEl.onchange = ()=> {
    const v = selEl.value;
    if (v==='off') { stop(); }
    else setBank(v);
  };
  volEl.oninput = ()=> setVolume(volEl.value);
  btnEl.onclick = ()=> toggle();
  updateDock();
}

function updateDock(){
  if (!dockEl) return;
  selEl.value = state.bank || 'off';
  volEl.value = String(state.volume);
  btnEl.textContent = state.playing ? '⏸ 暂停' : '▶︎ 播放';
  hintEl.textContent = state.needGestureResume ? '（点一下页面以恢复）' :
                       state.bank==='off' ? '已关闭' :
                       `正在播放：${labels[state.bank]||state.bank}`;
}

function updateDockHint(text){
  if (hintEl) hintEl.textContent = text || '';
}

/* ========== 初始化 ========== */
function init(opts={}){
  if (state.inited) return;
  state.inited = true;

  state.root = opts.root || state.root;
  state.dock = !!opts.dock;
  state.banks = opts.banks ? normalizeBanks(opts.banks, state.root) : defaultBanks(state.root);

  state.audio = new Audio();
  state.audio.preload = 'auto';
  state.audio.loop = true;

  load(); // 读上次状态
  if (state.bank && state.bank!=='off'){
    // 先设置音量
    state.audio.volume = clamp01(state.volume);
    // 准备 src（以记忆的 src 优先，否则随机该分类）
    const list = state.banks[state.bank];
    const src = (state.src && (!list || list.includes(state.src))) ? state.src : (list ? pick(list) : '');
    if (src) {
      state.audio.src = src;
      state.src = src;
    }
    // 是否需要自动续播
    if (state.playing) {
      // 可能被自动播放拦截：用一次交互恢复
      ensurePlay();
      // 若被拦截，挂一次性的手势监听
      const resume = ()=>{ if (state.needGestureResume) ensurePlay(); window.removeEventListener('pointerdown', resume, true); };
      window.addEventListener('pointerdown', resume, true);
    }
  }else{
    state.playing = false; // off 状态
  }

  if (state.dock) buildDock();

  // 页面隐藏时可选暂停（这里不强制）
  document.addEventListener('pagehide', ()=>{ try{ state.audio.pause(); }catch(e){} }, {passive:true});
}

function normalizeBanks(banks, root){
  // 允许传：['forest/a.mp3'] 或 ['a.mp3']（会自动补 root + 分类名？）
  // 这里简单处理：如果项不含 '://' 且不以 root 开头，就拼 root
  const out = {};
  for (const k of Object.keys(banks)){
    out[k] = (banks[k]||[]).map(p=>{
      if (/^https?:\/\//i.test(p)) return p;
      if (p.startsWith(root)) return p;
      return `${root}${p.replace(/^\/+/,'')}`;
    });
  }
  return out;
}

/* ========== 导出 ========== */
window.DodvaAudio = {
  init,
  setBank,
  setVolume,
  play: ()=>{ state.playing = true; ensurePlay(); },
  pause,
  stop,
  toggle,

  // 调试/读取
  _state: state
};

})();