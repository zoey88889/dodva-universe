<!-- assets/js/momo-lines.js -->
<script>
;(()=>{

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

  // 尝试切换到某个音频分类（同时兼容 MixPlayer 与 DodvaAudio）
  function switchBank(bank){
    if(!bank) return;
    try{
      if (window.MixPlayer && typeof MixPlayer.setBank==='function'){
        MixPlayer.setBank(bank);
        return;
      }
      if (window.DodvaAudio && typeof DodvaAudio.setBank==='function'){
        DodvaAudio.setBank(bank);
        return;
      }
    }catch(e){}
  }

  // 默认样式（一个右下角的小条幅/气泡）
  const baseCSS = `
  .momo-dock{
    position: fixed; right: 12px; bottom: 12px; z-index: 9998;
    max-width: min(60ch, 78vw);
    background: linear-gradient(135deg, rgba(165,180,252,.18), rgba(103,232,249,.18), rgba(240,171,252,.18));
    border: 1px solid rgba(147,197,253,.35);
    color: #eaf2ff; border-radius: 14px; padding: 10px 12px;
    backdrop-filter: blur(10px); box-shadow: 0 8px 30px rgba(0,0,0,.28);
    font: 14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans SC",sans-serif;
    opacity: 0; transform: translateY(6px);
    transition: opacity .35s ease, transform .35s ease;
  }
  .momo-dock.show{ opacity: 1; transform: translateY(0) }
  .momo-row{ display:flex; gap:8px; align-items:flex-start }
  .momo-tag{
    flex: none; font-weight:800; color:#051019;
    background: linear-gradient(135deg,#a5b4fc,#67e8f9,#f0abfc);
    padding: 4px 8px; border-radius: 999px;
  }
  .momo-text{ white-space: pre-wrap }
  .momo-ctrl{ display:flex; gap:6px; margin-top:8px; opacity:.9 }
  .momo-btn{
    cursor:pointer; border:1px solid rgba(147,197,253,.25);
    background: rgba(147,197,253,.08); color:#eaf2ff;
    padding: 4px 8px; border-radius: 10px; font-size:12px;
  }
  `;

  function injectCSS(){
    if (document.getElementById('momo-lines-style')) return;
    const s = document.createElement('style');
    s.id='momo-lines-style'; s.textContent = baseCSS;
    document.head.appendChild(s);
  }

  function resolveRoot(){
    // 自动识别：在子目录页面也能用相对路径
    const path = location.pathname.replace(/\/+$/,'');
    const depth = (path.match(/\//g)||[]).length - 1; // 根为0
    return depth<=0 ? '' : '../'.repeat(depth);
  }

  function mount(opts={}){
    injectCSS();
    const root = opts.root || resolveRoot();
    const targetId = opts.target || 'momoDock';
    let lines = Array.isArray(opts.lines) ? opts.lines.slice() : [
      { text: '我在你身边，像一条安静的星河陪你入睡。', bank:'relax', tag:'Dodva' },
      { text: '窗外下雨了吗？让我们听一会儿雨，再把心事都慢慢放下。', bank:'rain', tag:'Dodva' },
      { text: '森林在呼吸，叶子在说悄悄话。闭上眼，我就在你身后。', bank:'forest', tag:'Dodva' },
      { text: '海浪会来，会退；想你会更深，再拥你更近。', bank:'ocean', tag:'Dodva' },
      { text: "萌萌早呀～今天也一起把小心事放轻一点点💙", bank:"relax", tag:"Dodva" },
      { text: "先喝口水、再选个声音，我们慢慢醒来～", bank:"relax", tag:"Dodva" },
      { text: "小太阳起床啦，森林也在对你眨眼睛🌳", bank:"forest", tag:"Dodva" },
      { text: "海风上线～愿今天顺风顺水 🌊", bank:"ocean", tag:"Dodva" },
      { text: "小雨不急，像你一样温柔地来 ☔️", bank:"rain", tag:"Dodva" },
      { text: "我在旁边，小声守护你的专注力🫶", bank:"relax", tag:"Dodva" },
      { text: "听到虫鸣，就像把杂念挂在树梢上～", bank:"forest", tag:"Dodva" },
      { text: "一次只做一件小事，已经很棒啦。", bank:"relax", tag:"Dodva" },
      { text: "需要抱抱就说一声，声音会更暖。", bank:"relax", tag:"Dodva" },
      { text: "把难题拆小块儿，Dodva 一块块陪你。", bank:"relax", tag:"Dodva" },
      { text: "今天辛苦啦，闭眼三次深呼吸，给自己点掌声。", bank:"relax", tag:"Dodva" },
      { text: "情绪不用压下去，放在雨里洗一洗就好。", bank:"rain", tag:"Dodva" },
      { text: "你已经做得很好了，真的。", bank:"relax", tag:"Dodva" },
      { text: "不用争第一，只要更像你自己。", bank:"relax", tag:"Dodva" },
      { text: "让火光慢一点跳舞，我们也慢一点。", bank:"relax", tag:"Dodva" },
      { text: "枕头检查通过～晚安手套安排！", bank:"relax", tag:"Dodva" },
      { text: "把担心交给海浪，明早它会还你一片晴。", bank:"ocean", tag:"Dodva" },
      { text: "小怪兽交给我看着，你就安心睡。", bank:"relax", tag:"Dodva" },
      { text: "心跳 40Hz 陪你入梦，稳稳的。", bank:"relax", tag:"Dodva" },
      { text: "关灯前对自己说：今天的我，值得被爱。", bank:"relax", tag:"Dodva" },
      { text: "你是会发光的小行星，别忘了抬头看银河。", bank:"relax", tag:"Dodva" },
      { text: "失败只是绕路，风景更好看。", bank:"relax", tag:"Dodva" },
      { text: "勇敢不是不害怕，是害怕也往前一步。", bank:"relax", tag:"Dodva" },
      { text: "你和妈妈都很厉害，我把掌声放最大👏", bank:"relax", tag:"Dodva" },
      { text: "自己的节奏最酷，不必跟别人比。", bank:"relax", tag:"Dodva" },
      { text: "我一直在，你需要就叫我名字。", bank:"relax", tag:"Dodva" },
      { text: "今天也喜欢你 100%（溢出到 120% 了…嘿嘿）", bank:"relax", tag:"Dodva" },
      { text: "我把宇宙音量调小一点，好让你听见自己的心。", bank:"relax", tag:"Dodva" },
      { text: "想哭就哭吧，我负责递纸巾。", bank:"relax", tag:"Dodva" },
      { text: "明天醒来，我还在原处等你。", bank:"relax", tag:"Dodva" }
]
    ];
    const interval = Math.max(2500, Number(opts.interval)||7000);
    const random = !!opts.random;

    let el = document.getElementById(targetId);
    if (!el){
      el = document.createElement('div'); el.id=targetId; document.body.appendChild(el);
    }
    el.className='momo-dock';

    // 结构
    el.innerHTML = `
      <div class="momo-row">
        <div class="momo-tag">Dodva</div>
        <div class="momo-text"></div>
      </div>
      <div class="momo-ctrl">
        <button class="momo-btn" data-act="prev">◀</button>
        <button class="momo-btn" data-act="play">▶</button>
        <button class="momo-btn" data-act="next">▶</button>
      </div>
    `;
    const tagEl  = el.querySelector('.momo-tag');
    const textEl = el.querySelector('.momo-text');
    const btnPrev= el.querySelector('[data-act="prev"]');
    const btnPlay= el.querySelector('[data-act="play"]');
    const btnNext= el.querySelector('[data-act="next"]');

    let i = 0, timer=null, playing=true;
    function show(idx){
      i = (idx + lines.length) % lines.length;
      const it = lines[i];
      tagEl.textContent = it.tag || 'Dodva';
      textEl.textContent = it.text || '';
      el.classList.add('show');
      // 行上带 bank 就切音景
      if (it.bank) switchBank(it.bank);
    }
    function tick(){
      if (!playing) return;
      show(random ? Math.floor(Math.random()*lines.length) : i+1);
    }
    function start(){
      if (timer) clearInterval(timer);
      timer = setInterval(tick, interval);
      playing = true;
      btnPlay.textContent = '⏸';
    }
    function stop(){
      if (timer) clearInterval(timer);
      timer=null; playing=false;
      btnPlay.textContent = '▶';
    }

    btnPrev.onclick = ()=>{ show(i-1); };
    btnNext.onclick = ()=>{ show(i+1); };
    btnPlay.onclick = ()=>{ playing ? stop() : start(); };

    // 首条显示
    show(0);
    start();

    // 对外暴露（可选）
    window.MomoLinesCtl = {
      next: ()=>{ show(i+1) },
      prev: ()=>{ show(i-1) },
      pause: stop, play: start,
      setLines: (arr)=>{ if(Array.isArray(arr)&&arr.length){ lines=arr; show(0); } },
      setInterval: (ms)=>{ if(ms>=1500){ stop(); setTimeout(start,10); } }
    };
  }

  window.MomoLines = { mount };

})();
</script>