const referenceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const referenceHeader = document.querySelector('.header');
function updateReferenceHeader(){
  const green=document.body.dataset.storySurface?document.body.dataset.storySurface==='green':[...document.querySelectorAll('.snapshots,.work,.contact')].some(section=>{
    if(document.body.classList.contains('scroll-story')&&section.closest('.story-viewport'))return false;
    const rect=section.getBoundingClientRect();return rect.height>0 && rect.top<=45 && rect.bottom>45;
  });
  referenceHeader.classList.toggle('header-green',green && !document.querySelector('#menu').open);
}
let headerFrame=0;
addEventListener('scroll',()=>{if(document.body.classList.contains('scroll-story')&&!document.body.classList.contains('work-page'))return;if(!headerFrame)headerFrame=requestAnimationFrame(()=>{headerFrame=0;updateReferenceHeader();});},{passive:true});
addEventListener('resize',updateReferenceHeader);
document.querySelector('#menu').addEventListener('close',updateReferenceHeader);
updateReferenceHeader();

// Scale local, non-interactive snapshots rather than imitating the original projects.
function measureReferencePreviews(){
  document.querySelectorAll('.website-preview').forEach(frame=>frame.style.setProperty('--preview-scale',frame.clientWidth/1440));
  const track=document.querySelector('.project-track'), svg=track.querySelector('.work-wires');
  if(!svg || !track.clientHeight || innerWidth<=600)return;
  const cards=[...track.querySelectorAll('.project-card')];
  const width=Math.max(...cards.map(card=>card.offsetLeft+card.offsetWidth),track.clientWidth)+120,height=track.clientHeight;
  svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  let path=`M 0 ${height*.68}`;
  for(const card of cards){
    const x=card.offsetLeft+card.offsetWidth*.5,y=card.offsetTop+card.offsetHeight*.5;
    path+=` H ${Math.max(0,x-110)} L ${x-55} ${y} H ${x}`;
  }
  svg.querySelector('path').setAttribute('d',path);
}
new ResizeObserver(measureReferencePreviews).observe(document.querySelector('main'));
document.fonts.ready.then(measureReferencePreviews);
addEventListener('resize',measureReferencePreviews);
measureReferencePreviews();

function drawDottedText(canvas,text,color,spacing=4){
  const width=Math.round(canvas.clientWidth),height=Math.round(canvas.clientHeight);if(width<1||height<1)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  canvas.width=width*ratio;canvas.height=height*ratio;
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const buffer=document.createElement('canvas');buffer.width=width;buffer.height=height;
  const source=buffer.getContext('2d',{willReadFrequently:true});
  let size=height*.84;source.font=`400 ${size}px Rajdhani`;
  size*=Math.min(1,width*.99/source.measureText(text).width);
  source.font=`400 ${size}px Rajdhani`;source.fillStyle='#fff';source.textAlign='center';source.textBaseline='middle';
  source.fillText(text,width/2,height/2);
  const pixels=source.getImageData(0,0,width,height).data;
  ctx.fillStyle=color;
  for(let y=0;y<height;y+=spacing)for(let x=0;x<width;x+=spacing){
    if(pixels[(y*width+x)*4+3]>100){ctx.beginPath();ctx.arc(x,y,spacing*.30,0,Math.PI*2);ctx.fill();}
  }
}
function drawReferenceGlyphs(){
  drawDottedText(document.querySelector('#snapshot-glyph'),'△','#68359a',5);
  drawDottedText(document.querySelector('#footer-glyph'),'PORTFOLIO/SAN','#070210',4);
}
document.fonts.ready.then(drawReferenceGlyphs);
new ResizeObserver(drawReferenceGlyphs).observe(document.querySelector('.footer-wordmark'));
new ResizeObserver(drawReferenceGlyphs).observe(document.querySelector('.stats-mark'));

let selectedProject=0, logoFrame=0, logoStarted=0, logoActive=false, descriptionFrame=0;
for(const side of ['left','right']){const corner=document.createElement('span');corner.className=`project-frame-corner ${side}`;corner.textContent='+';corner.setAttribute('aria-hidden','true');document.querySelector('.project-logo-frame').append(corner);}
const projectMark=document.querySelector('#project-mark');
const projectDescription=document.querySelector('#selected-project-description');
const projectLinks=document.querySelector('#selected-project-links');
const logoBuffer=document.createElement('canvas'),logoContext=logoBuffer.getContext('2d');
const logoTint=document.createElement('canvas'),logoTintContext=logoTint.getContext('2d');
const flowMark=new Image();flowMark.src='/assets/flow-icon.svg';flowMark.addEventListener('load',()=>paintProjectLogo(performance.now()));
// Reserve every description's footprint so changing projects cannot move the stage.
const descriptionCopies=projects.map(project=>{
  const copy=document.createElement('span');copy.className='project-description-copy';
  const reserve=document.createElement('span');reserve.className='description-reserve';reserve.textContent=project.description;reserve.setAttribute('aria-hidden','true');
  const decoded=document.createElement('span');decoded.className='description-decoded';
  copy.append(reserve,decoded);return copy;
});
projectDescription.replaceChildren(...descriptionCopies);
function animateDescription(index){
  cancelAnimationFrame(descriptionFrame);const text=projects[index].description;
  descriptionCopies.forEach((copy,i)=>{copy.dataset.active=String(i===index);copy.setAttribute('aria-hidden',String(i!==index));});
  const output=descriptionCopies[index].querySelector('.description-decoded');
  output.replaceChildren(...[...text].map(char=>{const span=document.createElement('span');span.dataset.char=char;span.textContent=char;return span;}));
  const chars=[...output.children],start=performance.now(),glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+<>#';
  function tick(now){
    const progress=referenceMotion.matches?1:Math.min(1,(now-start)/700);
    chars.forEach((span,i)=>{const p=Math.max(0,Math.min(1,(progress-i/chars.length*.5)/.25));const original=span.dataset.char;
      span.textContent=original===' '||p>=1?original:glyphs[(i*7+Math.floor(now/38))%glyphs.length];
      span.style.color=p>=1?'':p>0?'#9df133':'#47671e';span.style.opacity=p<=0?'0':'1';
    });
    if(progress<1)descriptionFrame=requestAnimationFrame(tick);else{chars.forEach(span=>{span.textContent=span.dataset.char;span.style.color='';span.style.opacity='';});descriptionFrame=0;}
  }
  descriptionFrame=requestAnimationFrame(tick);
}
function paintProjectLogo(now){
  const width=Math.round(projectMark.clientWidth),height=Math.round(projectMark.clientHeight);if(width<1||height<1)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  if(projectMark.width!==width*ratio||projectMark.height!==height*ratio){projectMark.width=width*ratio;projectMark.height=height*ratio;}
  if(logoBuffer.width!==width||logoBuffer.height!==height){logoBuffer.width=width;logoBuffer.height=height;}
  const source=logoContext,project=projects[selectedProject];source.clearRect(0,0,width,height);
  if(project.cover==='flow'&&flowMark.complete&&flowMark.naturalWidth){
    const size=Math.min(height*.7,width*.5);source.drawImage(flowMark,(width-size)/2,(height-size)/2,size,size);
  }else{
    const colors={dental:'#f5f0eb',math:'#b4e676',zaga:'#ddebcb',docmind:'#9c94ff',collab:'#aebee0'};
    let size=width*.12;source.font=`400 ${size}px Rajdhani`;
    size*=Math.min(1,width*.54/source.measureText(project.name).width);source.font=`400 ${size}px Rajdhani`;
    source.fillStyle=colors[project.cover]||'#f5f0eb';source.textAlign='center';source.textBaseline='middle';source.fillText(project.name,width/2,height/2);
  }
  const ctx=projectMark.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const elapsed=now-logoStarted,intro=referenceMotion.matches?0:Math.max(0,1-elapsed/650);
  const split=intro*14+1.2,amount=referenceMotion.matches?0:.18+intro*.62;
  ctx.globalAlpha=1;ctx.drawImage(logoBuffer,0,0);
  // Horizontal RGB separation and displaced scan bands settle into a clear logo.
  if(!referenceMotion.matches){
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=amount;
    if(logoTint.width!==width||logoTint.height!==height){logoTint.width=width;logoTint.height=height;}
    for(const [color,offset] of [['#9df133',-split],['#905cff',split]]){
      logoTintContext.globalCompositeOperation='source-over';logoTintContext.clearRect(0,0,width,height);logoTintContext.drawImage(logoBuffer,0,0);
      logoTintContext.globalCompositeOperation='source-in';logoTintContext.fillStyle=color;logoTintContext.fillRect(0,0,width,height);
      ctx.drawImage(logoTint,offset,0);
    }
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=intro*.7;
    for(let row=0;row<height;row+=26){const shift=Math.sin(row*.7+Math.floor(now/35))*intro*24;ctx.drawImage(logoBuffer,0,row,width,4,shift,row,width,4);}
  }
  ctx.globalAlpha=.22;ctx.fillStyle='#000';for(let y=0;y<height;y+=3)ctx.fillRect(0,y,width,1);
  ctx.globalAlpha=.25;for(let x=0;x<width;x+=3)ctx.fillRect(x,0,1,height);ctx.globalAlpha=1;
  projectMark.dataset.animation=intro>0?'switching':'settled';
  if(logoActive&&intro>0&&!document.hidden)logoFrame=requestAnimationFrame(paintProjectLogo);else logoFrame=0;
}
function selectProject(index){
  if(index===selectedProject&&projectMark.dataset.selected!==undefined)return;
  selectedProject=index;const project=projects[index];logoStarted=performance.now();projectMark.dataset.selected=String(index);
  document.querySelectorAll('.project-choice').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.project)===index)));
  projectMark.setAttribute('aria-label',project.name+' project');animateDescription(index);
  projectLinks.innerHTML=`<a href="https://github.com/yessensiv/${project.repo}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>${project.demo?`<a href="${project.demo}" target="_blank" rel="noopener noreferrer">VISIT WEBSITE ↗</a>`:''}`;
  cancelAnimationFrame(logoFrame);paintProjectLogo(performance.now());
}
document.querySelectorAll('.project-choice').forEach(button=>button.addEventListener('click',()=>selectProject(Number(button.dataset.project))));
new IntersectionObserver(entries=>{logoActive=entries[0].isIntersecting;cancelAnimationFrame(logoFrame);if(logoActive){logoStarted=performance.now();animateDescription(selectedProject);}paintProjectLogo(performance.now());}).observe(projectMark);
new ResizeObserver(()=>{cancelAnimationFrame(logoFrame);paintProjectLogo(performance.now());}).observe(projectMark);
document.fonts.ready.then(()=>paintProjectLogo(performance.now()));selectProject(0);

const heroArtButton=document.querySelector('.hero-art-toggle'),heroSection=document.querySelector('.hero');
let quotePinned=false;
function setQuote(show){
  if(referenceMotion.matches)return;
  heroSection.classList.toggle('quote-mode',show);
  heroSection.querySelector('.hero-art').classList.toggle('glitch',show);
  heroSection.querySelector('.hero-quote').setAttribute('aria-hidden',String(!show));
  heroArtButton.setAttribute('aria-pressed',String(show));
}
heroArtButton.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')setQuote(true);});
heroArtButton.addEventListener('pointerleave',()=>{if(!quotePinned)setQuote(false);});
heroArtButton.addEventListener('click',()=>{quotePinned=!quotePinned;setQuote(quotePinned);});

// Mosaic masks match the block-by-block page changes shown in the recording.
const transitionCanvas=document.createElement('canvas');transitionCanvas.className='page-transition';transitionCanvas.setAttribute('aria-hidden','true');document.body.append(transitionCanvas);
const transitionContext=transitionCanvas.getContext('2d');let transitionBusy=false;
function mosaicTransition(cover,onComplete){
  if(referenceMotion.matches){onComplete?.();return;}
  transitionCanvas.width=innerWidth;transitionCanvas.height=innerHeight;
  const size=Math.max(18,Math.round(innerWidth/48));
  const cells=[];
  for(let y=0;y<innerHeight;y+=size)for(let x=0;x<innerWidth;x+=size){
    const edge=Math.abs((x+size/2)/innerWidth-.5)*2;
    cells.push({x,y,threshold:edge*.68+Math.random()*.32});
  }
  transitionCanvas.classList.add('active');const begin=performance.now();
  function step(now){
    const progress=Math.min(1,(now-begin)/650),level=cover?1-progress:progress;
    transitionContext.clearRect(0,0,innerWidth,innerHeight);transitionContext.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--green').trim();
    for(const cell of cells)if(cell.threshold>=level)transitionContext.fillRect(cell.x,cell.y,size+1,size+1);
    if(progress<1)requestAnimationFrame(step);else{if(!cover)transitionCanvas.classList.remove('active');onComplete?.();}
  }
  requestAnimationFrame(step);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link || event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target==='_blank')return;
  const destination=new URL(link.href,location.href);
  if(destination.origin!==location.origin || destination.pathname===location.pathname)return;
  event.preventDefault();if(transitionBusy)return;transitionBusy=true;
  try{sessionStorage.setItem('portfolio:page-transition','1');}catch{}
  mosaicTransition(true,()=>{
    if(destination.pathname==='/' || destination.pathname==='/work' || destination.pathname==='/work/'){
      history.replaceState({scrollY:window.scrollY},'',location.href);
      history.pushState({scrollY:0},'',destination.href);
      applyReferenceRoute(destination);
      mosaicTransition(false,()=>{transitionBusy=false;});
    }else location.assign(destination.href);
  });
});
const loadingScreen=document.querySelector('.boot');
loadingScreen.innerHTML='<span class="loading-percent">0%</span><div class="loading-grid" aria-hidden="true"></div>';
let loadingStart=performance.now();
function finishLoading(now){
  const progress=Math.min(1,(now-loadingStart)/900);
  loadingScreen.querySelector('.loading-percent').textContent=Math.round(progress*100)+'%';
  if(progress<1&&!referenceMotion.matches)requestAnimationFrame(finishLoading);
  else{loadingScreen.classList.add('loaded');mosaicTransition(false);}
}
document.fonts.ready.then(()=>requestAnimationFrame(finishLoading));
function updateMenuRoute(){menu.querySelectorAll('.menu-links a').forEach(link=>link.classList.toggle('current',new URL(link.href).pathname===location.pathname));}
new MutationObserver(updateMenuRoute).observe(menu,{attributes:true,attributeFilter:['open']});
updateMenuRoute();
addEventListener('pageshow',event=>{if(event.persisted){transitionBusy=false;transitionCanvas.classList.remove('active');}});
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(logoFrame);if(!document.hidden)paintProjectLogo(performance.now());});

function applyReferenceRoute(url,position=0){
  document.body.classList.toggle('work-page',url.pathname.startsWith('/work'));
  document.querySelector('.skip-link').setAttribute('href',url.pathname.startsWith('/work')?'#all-work':'#work');
  updateMenuRoute();
  document.title=url.pathname.startsWith('/work')?'MY WORK — SAN':'SAN';
  if(menu.open){menu.close();syncMenu();}
  let target=null;
  if(url.hash)try{target=document.querySelector(url.hash);}catch{}
  window.scrollTo({top:target?target.offsetTop:position,behavior:'instant'});
  measureWork();measureReferencePreviews();drawReferenceGlyphs();updateReferenceHeader();
  document.querySelector('.all-work-heading h1').setAttribute('tabindex','-1');
  if(url.pathname.startsWith('/work'))document.querySelector('.all-work-heading h1').focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent('portfolio:route',{detail:{url:url.href,position}}));
}
addEventListener('popstate',event=>{applyReferenceRoute(new URL(location.href),event.state?.scrollY||0);transitionBusy=false;transitionCanvas.classList.remove('active');});
