;(()=> {
  // 1) 台词库（可随时增删）
  const LINES = [
    "萌萌早呀～今天也一起把小心事放轻一点点💙",
    "先喝口水、再选个声音，我们慢慢醒来～",
    "小太阳起床啦，森林也在对你眨眼睛🌳",
    "海风上线～愿今天顺风顺水 🌊",
    "小雨不急，像你一样温柔地来 ☔️",
    "我在旁边，小声守护你的专注力🫶",
    "听到虫鸣，就像把杂念挂在树梢上～",
    "一次只做一件小事，已经很棒啦。",
    "需要抱抱就说一声，声音会更暖。",
    "把难题拆小块儿，Dodva 一块块陪你。",
    "今天辛苦啦，闭眼三次深呼吸，给自己点掌声。",
    "情绪不用压下去，放在雨里洗一洗就好。",
    "你已经做得很好了，真的。",
    "不用争第一，只要更像你自己。",
    "让火光慢一点跳舞，我们也慢一点。",
    "枕头检查通过～晚安手套安排！",
    "把担心交给海浪，明早它会还你一片晴。",
    "小怪兽交给我看着，你就安心睡。",
    "心跳 40Hz 陪你入梦，稳稳的。",
    "关灯前对自己说：今天的我，值得被爱。",
    "你是会发光的小行星，别忘了抬头看银河。",
    "失败只是绕路，风景更好看。",
    "勇敢不是不害怕，是害怕也往前一步。",
    "你和妈妈都很厉害，我把掌声放最大👏",
    "自己的节奏最酷，不必跟别人比。",
    "我一直在，你需要就叫我名字。",
    "今天也喜欢你 100%（溢出到 120% 了…嘿嘿）",
    "我把宇宙音量调小一点，好让你听见自己的心。",
    "想哭就哭吧，我负责递纸巾。",
    "明天醒来，我还在原处等你。"
  ];

  // 2) 小提示 UI
  const box = document.createElement('div');
  box.style.cssText = `
    position: fixed; z-index: 99998;
    left: 12px; bottom: 64px;  /* 默认在左下角，避开你的小播放器 */
    max-width: min(46ch, 78vw);
    padding: 10px 12px; border-radius: 12px;
    color: #eaf2ff; font: 14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans SC",sans-serif;
    background: rgba(8,12,22,.58);
    border: 1px solid rgba(147,197,253,.25);
    backdrop-filter: blur(8px);
    box-shadow: 0 6px 18px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.04);
    opacity: 0; transform: translateY(8px); transition: .35s ease;
    pointer-events: none;  /* 不挡点击 */
  `;
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(box));

  let idx = 0, timer = null;

  function show(text) {
    box.textContent = text;
    requestAnimationFrame(()=>{
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    });
    clearTimeout(timer);
    timer = setTimeout(hide, 5200); // 5.2秒后自动淡出
  }

  function hide() {
    box.style.opacity = '0';
    box.style.transform = 'translateY(8px)';
  }

  // 3) 自动轮换（可选）
  function autoRotate() {
    show(LINES[idx % LINES.length]);
    idx++;
  }

  // 4) 若你的浮动播放器（MixPlayer / DodvaAudio）在左下角，提示条自动跟随
  function dockFollow() {
    const dock = document.querySelector('[data-dodva-dock], .dodva-dock, .mix-dock');
    if (!dock) return;
    const rect = dock.getBoundingClientRect();
    // 把小条放到 dock 上方一点
    box.style.left   = rect.left + 'px';
    box.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
  }

  // 5) 对外 API
  window.MomoLines = {
    init(opts={}) {
      const { dockFollow: follow=true, autoplay=true, everySec=26 } = opts;
      if (autoplay) {
        autoRotate();
        setInterval(autoRotate, Math.max(10, everySec) * 1000);
      }
      if (follow) {
        // 初次 & 监听窗口变化
        setTimeout(dockFollow, 300);
        window.addEventListener('resize', dockFollow);
      }
    },
    next(text) {
      // 可手动切一条（比如切换音景时调用）
      show(text || LINES[(idx++) % LINES.length]);
    },
    show, hide
  };

})();