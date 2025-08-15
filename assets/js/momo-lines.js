<!-- 文件：assets/js/momo-lines.js -->
<script>
;(function(){
  const defaultLines = [
    "欢迎回家～先选个声音，慢慢进入自己的节奏 💙",
    "把担心交给海浪，明早还你一片晴 🌊",
    "虫鸣把杂念挂在树梢上～",
    "让雨声洗洗今天的疲惫 ☔️",
    "心跳与 528Hz 对齐，今晚更快入睡。",
    "一次只做一件小事，已经很棒啦。"
  ];

  const Momo = {
    el: null,
    idx: 0,
    timer: null,
    list: [],
    opts: { interval: 6500, random: true },

    mount(cfg={}){
      this.el = typeof cfg.mount==='string' ? document.querySelector(cfg.mount) : cfg.mount;
      if(!this.el){ console.warn('[MomoLines] mount element not found'); return; }
      this.list = (cfg.lines && cfg.lines.length ? cfg.lines : defaultLines).map(x=>{
        return typeof x==='string' ? {text:x} : x;
      });
      this.opts.interval = cfg.interval || this.opts.interval;
      this.opts.random   = cfg.random   ?? this.opts.random;

      // 初次渲染
      this.render(this.list[0]?.text || "你好呀～");
      // 开启轮播
      this.start();
    },

    start(){
      this.stop();
      this.timer = setInterval(()=> this.next(), this.opts.interval);
    },
    stop(){ if(this.timer){ clearInterval(this.timer); this.timer=null; } },

    next(msg){
      if(!this.el) return;
      if (msg) { this.render(msg); return; }

      let nextIdx;
      if(this.opts.random){
        nextIdx = Math.floor(Math.random()*this.list.length);
      }else{
        nextIdx = (this.idx+1) % this.list.length;
      }
      this.idx = nextIdx;
      this.render(this.list[this.idx].text||'');
    },

    render(text){
      if(!this.el) return;
      this.el.textContent = text;
      // 轻微淡入
      this.el.style.opacity = 0;
      this.el.style.transition = 'opacity .4s ease';
      requestAnimationFrame(()=>{ this.el.style.opacity = 1; });
    }
  };

  window.MomoLines = Momo;
})();
</script>