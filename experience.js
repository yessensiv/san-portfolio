document.documentElement.classList.add('js');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionQuery.matches;
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('.menu-toggle');
function playClick() { portfolioSound.click(); }
function syncMenu() {
  menuButton.setAttribute('aria-expanded', String(menu.open));
  menuButton.querySelector('span').textContent = menu.open ? 'CLOSE' : 'MENU';
  menuButton.classList.toggle('active', menu.open);
  document.body.classList.toggle('menu-open', menu.open);
}
function closeMenu() { menu.close(); syncMenu(); menuButton.focus({preventScroll:true}); }
document.querySelector('.menu-close').addEventListener('click', closeMenu);
menuButton.addEventListener('click', () => {
  if (menu.open) closeMenu(); else { menu.showModal(); syncMenu(); }
});
menu.addEventListener('close', syncMenu);
menu.addEventListener('cancel', () => { requestAnimationFrame(syncMenu); });
menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.hash);
  requestAnimationFrame(() => {
    window.scrollTo({top:target.offsetTop, behavior:reducedMotion?'instant':'smooth'});
    target.setAttribute('tabindex','-1'); target.focus({preventScroll:true});
  });
}));
document.addEventListener('click', e => { if (e.target.closest('a,button,summary') && !e.target.closest('.sound-toggle')) playClick(); });

function updateClock() {
  const clock = document.querySelector('#clock');
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Qyzylorda',hour:'2-digit',minute:'2-digit',hour12:false}).format(now) + ' / UTC+5';
  clock.dateTime = now.toISOString();
}
updateClock(); setInterval(updateClock, 60000);

const scrambleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/+#';
const scrambleTimers = new WeakMap();
document.querySelectorAll('[data-scramble]').forEach(element => {
  const original = element.textContent;
  element.setAttribute('aria-label', original);
  element.addEventListener('mouseenter', () => {
    if (reducedMotion) return;
    clearInterval(scrambleTimers.get(element));
    let iteration = 0;
    const timer = setInterval(() => {
      element.textContent = [...original].map((char,index) => index < iteration || char === ' ' ? char : scrambleCharacters[Math.floor(Math.random()*scrambleCharacters.length)]).join('');
      iteration += .8;
      if (iteration >= original.length) { clearInterval(timer); element.textContent = original; }
    }, 30);
    scrambleTimers.set(element, timer);
  });
});

const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    countObserver.unobserve(entry.target);
    if (reducedMotion) return;
    const final = Number(entry.target.dataset.count);
    const begin = performance.now();
    function count(now) {
      const progress = Math.min((now-begin)/950,1);
      entry.target.textContent = String(Math.round(final*(1-Math.pow(1-progress,3)))).padStart(2,'0');
      if (progress<1) requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>countObserver.observe(el));

const workSection = document.querySelector('.work');
const workTrack = document.querySelector('.project-track');
const workProgress = document.querySelector('.work-progress span');
let workTop = 0, workTravel = 1, trackTravel = 0;
function measureWork() {
  if(document.body.classList.contains('scroll-story')) return;
  if(document.body.classList.contains("work-page")) return;
  if(innerWidth<=600){workTrack.style.transform='';return;}
  workTop = workSection.getBoundingClientRect().top + window.scrollY;
  workTravel = Math.max(1, workSection.offsetHeight - document.querySelector('.work-sticky').offsetHeight);
  const lastCard=workTrack.querySelector('.project-card:last-child');
  trackTravel = Math.max(0,lastCard.offsetLeft+lastCard.offsetWidth+workTrack.offsetLeft-document.documentElement.clientWidth+32);
  updateWork();
}
function updateWork() {
  if(document.body.classList.contains('scroll-story')) return;
  if(document.body.classList.contains("work-page")) return;
  if(innerWidth<=600){workTrack.style.transform='';return;}
  if (reducedMotion) { workTrack.style.transform=''; return; }
  const progress = Math.max(0,Math.min(1,(window.scrollY-workTop)/workTravel));
  workTrack.style.transform = `translate3d(${-progress*trackTravel}px,0,0)`;
  workProgress.style.transform = `scaleX(${progress})`;
  document.querySelector('#work-position').textContent = String(Math.min(6,Math.floor(progress*6)+1)).padStart(2,'0');
}
let scrollQueued = false;
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { updateWork(); scrollQueued = false; });
}, {passive:true});
new ResizeObserver(measureWork).observe(workSection);
addEventListener('resize',measureWork);
document.fonts.ready.then(measureWork);
measureWork();
workTrack.addEventListener('focusin', event => {
  if(document.body.classList.contains('scroll-story')) return;
  if(reducedMotion || innerWidth<=600) return;
  const card=event.target.closest('.project-card');
  if(!card) return;
  requestAnimationFrame(()=>{
    document.querySelector('.work-sticky').scrollLeft=0;
    const bounds=card.getBoundingClientRect();
    if(bounds.left>=0 && bounds.right<=document.documentElement.clientWidth) return;
    const progress=Math.min(1,Math.max(0,(card.offsetLeft+workTrack.offsetLeft-32)/Math.max(1,trackTravel)));
    window.scrollTo({top:workTop+progress*workTravel,behavior:'instant'});
    updateWork();
  });
});
// Native details keeps the full project information usable without JavaScript.
document.querySelectorAll('.project-detail').forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  document.querySelectorAll('.project-detail').forEach(other => { if (other !== detail) other.open = false; });
}));

const cursor = document.querySelector('.cursor');
// The cursor progress ring is driven by motion.js, together with the scroll scenes.

const canvas = document.querySelector('#identity');
const ctx = canvas.getContext('2d');
const glyph = document.createElement('canvas');
const glyphContext = glyph.getContext('2d', {willReadFrequently:true});
let points = [], canvasWidth=1, canvasHeight=1, identityVisible=true;
let pointerX=.5, pointerY=.4, pointerActive=false, pointerStrength=0, identityLastTime=0, frameId=0;
function measureIdentity() {
  const rect = canvas.getBoundingClientRect();
  if(rect.width<1 || rect.height<1) return;
  canvasWidth = Math.round(rect.width); canvasHeight = Math.round(rect.height);
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = canvasWidth*ratio; canvas.height = canvasHeight*ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  glyph.width = canvasWidth; glyph.height = canvasHeight;
  glyphContext.clearRect(0,0,canvasWidth,canvasHeight);
  glyphContext.fillStyle = '#fff';
  glyphContext.textAlign = 'center';
  glyphContext.font = `600 ${canvasWidth*.46}px Rajdhani`;
  glyphContext.textBaseline = 'middle';
  const identityMetrics=glyphContext.measureText('SAN');
  const identityX=canvasWidth*.5+(identityMetrics.actualBoundingBoxLeft-identityMetrics.actualBoundingBoxRight)/2;
  const identityY=canvasHeight*.5+(identityMetrics.actualBoundingBoxAscent-identityMetrics.actualBoundingBoxDescent)/2;
  glyphContext.fillText('SAN',identityX,identityY);
  const pixels = glyphContext.getImageData(0,0,canvasWidth,canvasHeight).data;
  points = [];
  for (let y=0;y<canvasHeight;y+=3) for(let x=0;x<canvasWidth;x+=3) {
    if (pixels[(y*canvasWidth+x)*4+3] > 100) points.push({x,y,seed:Math.random(),size:Math.random()>.8?2:1.4,offsetX:0,offsetY:0});
  }
  drawIdentity(performance.now());
}
function drawIdentity(time) {
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  const elapsed=Math.min(50,Math.max(1,time-identityLastTime||16.67));
  identityLastTime=time;
  const easing=1-Math.exp(-elapsed/140);
  pointerStrength+=((pointerActive&&!reducedMotion?1:0)-pointerStrength)*easing;
  const glitch = reducedMotion ? 0 : Number(canvas.dataset.glitch || 0);
  const scan = reducedMotion ? -180 : canvasHeight*.5+Math.sin(time*.00055)*(canvasHeight*.5+150);
  for (const point of points) {
    const centerGlow = Math.max(0, 1 - Math.hypot(point.x/canvasWidth-pointerX,point.y/canvasHeight-pointerY)*1.7);
    const scanGlow = Math.exp(-Math.pow((point.y-scan)/95,2));
    const brightness = Math.floor(80+point.seed*45+centerGlow*25+scanGlow*65+(reducedMotion?0:Math.sin(time*.001+point.seed*6.28)*8));
    const dx=point.x-pointerX*canvasWidth, dy=point.y-pointerY*canvasHeight;
    const distance=Math.hypot(dx,dy);
    const influence=pointerStrength*Math.max(0,1-distance/100);
    const repel=influence*influence*14;
    point.offsetX+=((distance?dx/distance*repel:0)-point.offsetX)*easing;
    point.offsetY+=((distance?dy/distance*repel:0)-point.offsetY)*easing;
    const wavePhase=point.x/canvasWidth*Math.PI*2-time*.0012;
    const waveAmplitude=Math.min(11,canvasWidth*.014);
    const waveX=reducedMotion?0:Math.cos(wavePhase+point.y/canvasHeight*2)*waveAmplitude*.35;
    const waveY=reducedMotion?0:Math.sin(wavePhase)*waveAmplitude;
    const px=point.x+point.offsetX+waveX;
    const py=point.y+point.offsetY+waveY;
    if(glitch>.02){
      const split=glitch*(5+Math.sin(point.y*.045+time*.018)*4);
      ctx.fillStyle=`rgba(125,0,244,${glitch*.75})`;
      ctx.fillRect(point.x-split,point.y,point.size+1,point.size+1);
      ctx.fillStyle=`rgba(163,255,58,${glitch*.65})`;
      ctx.fillRect(point.x+split,point.y,point.size+1,point.size+1);
    }
    ctx.fillStyle = `rgb(${Math.round(brightness-scanGlow*35)},${Math.min(255,Math.round(brightness+15+scanGlow*45))},${Math.round(brightness-scanGlow*70)})`;
    const offset = reducedMotion?0:Math.sin(time*.0007+point.y*.008)*.45;
    ctx.fillRect(px+offset, py, point.size, point.size+1);
    if(point.seed>.996) {ctx.fillStyle='#a3f52b80';ctx.fillRect(point.x,point.y,3,3);}
  }
  ctx.strokeStyle = '#a3f52b32';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(canvasWidth*.5,canvasHeight*.5,canvasWidth*.36,0,Math.PI*2);ctx.stroke();
  if(!reducedMotion && identityVisible && !document.hidden) frameId=requestAnimationFrame(drawIdentity);
}
function restartIdentity() { cancelAnimationFrame(frameId); drawIdentity(performance.now()); }
new ResizeObserver(()=>{cancelAnimationFrame(frameId);measureIdentity();}).observe(canvas);
new IntersectionObserver(entries=>{identityVisible=entries[0].isIntersecting;restartIdentity();},{threshold:0}).observe(canvas);
document.fonts.ready.then(()=>{cancelAnimationFrame(frameId);measureIdentity();});
document.addEventListener('visibilitychange',restartIdentity);
document.querySelector('.hero').addEventListener('pointermove', event=>{
  const rect=canvas.getBoundingClientRect();
  pointerActive=event.pointerType!=="touch";
  pointerX=(event.clientX-rect.left)/rect.width; pointerY=(event.clientY-rect.top)/rect.height;
},{passive:true});
document.querySelector('.hero').addEventListener('pointerleave',()=>{pointerActive=false;});
motionQuery.addEventListener('change',event=>{reducedMotion=event.matches;measureWork();restartIdentity();});
