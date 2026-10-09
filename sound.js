// Clean reference music and interface effects; never play screen-recording audio.
const portfolioSound = (() => {
  let enabled = true;
  const preferenceKey = 'portfolio:sound:clean-music';
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch {}
  let started = false;
  const background = new Audio('/assets/sound/background.mp3');
  background.loop = true;
  background.preload = 'auto';
  background.volume = .3;
  background.hidden = true;
  background.dataset.sound = 'background';
  document.body.append(background);
  const effects = Object.fromEntries(['hover','click'].map(name => [name, {
    next:0,
    voices:Array.from({length:4}, () => {
      const audio = new Audio(`/assets/sound/${name}.wav`);
      audio.preload='auto'; audio.volume=.5;
      audio.hidden=true;audio.dataset.sound=name;document.body.append(audio);
      return audio;
    })
  }]));
  function update() {
    document.querySelectorAll('.sound-toggle').forEach(button => {
      button.setAttribute('aria-pressed',String(enabled));
      button.setAttribute('aria-label',enabled?'Mute sound':'Enable sound');
      button.querySelector('span').textContent=enabled?'ON':'OFF';
      button.dataset.audioState=background.paused?'paused':'running';
    });
  }
  async function start() {
    if(!enabled || document.hidden)return;
    try {
      await background.play();
      if(!enabled || document.hidden){background.pause();return;}
      started=true;update();
    } catch { update(); }
  }
  function stop() {
    background.pause();
    for(const effect of Object.values(effects)) for(const audio of effect.voices){audio.pause();audio.currentTime=0;}
  }
  function play(name) {
    if(!enabled || document.hidden) return;
    const effect=effects[name],audio=effect.voices[effect.next++%effect.voices.length];
    audio.currentTime=0;audio.play().catch(()=>{});
  }
  document.querySelectorAll('.sound-toggle').forEach(button=>button.addEventListener('click',async()=>{
    enabled=!enabled;
    try{localStorage.setItem(preferenceKey,enabled?'on':'off');}catch{}
    update();
    if(enabled){await start();if(enabled)play('click');}else stop();
  }));
  for(const eventName of ['pointerdown','keydown'])document.addEventListener(eventName,event=>{
    if(!event.target.closest('.sound-toggle') && !started)start();
  });
  let lastHover=0;
  document.addEventListener('pointerover',event=>{
    const target=event.target.closest('a,button,summary,.stat-tile');
    if(!started || !target || target.contains(event.relatedTarget) || performance.now()-lastHover<90)return;
    lastHover=performance.now();play('hover');
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop();else if(enabled&&started)start();
  });
  for(const eventName of ['playing','pause'])background.addEventListener(eventName,update);
  update();
  return {click:()=>play('click')};
})();


