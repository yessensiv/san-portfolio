/* Scroll choreography reconstructed from the supplied desktop and phone videos. */
(() => {
  const root=document.documentElement,body=document.body;
  const hero=document.querySelector('.hero'),stats=document.querySelector('.snapshots'),work=document.querySelector('.work'),notes=document.querySelector('.project-notes');
  const track=document.querySelector('.project-track'),cards=[...track.querySelectorAll('.project-card')];
  const statTiles=[...stats.querySelectorAll('.stat-tile')],wire=track.querySelector('.work-wires path'),workPosition=document.querySelector('#work-position');
  let wireLength=0;
  // Keep the scroll mode aligned with the vertical gallery's CSS breakpoint.
  const mobile=matchMedia('(max-width:1024px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const sequence=document.createElement('div'),viewport=document.createElement('div');
  sequence.className='scroll-sequence';viewport.className='story-viewport';hero.before(sequence);sequence.append(viewport);
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>n*n*(3-2*n);
  const quote=hero.querySelector('.hero-quote');
  const quoteLines=portfolioLanguage==='ru'?['Я ВЕРЮ: КЛАССНЫЕ РАБОТЫ','РОЖДАЮТСЯ НЕ ТОЛЬКО','БЛАГОДАРЯ ТАЛАНТУ.','ЗА НИМИ — БЕССОННЫЕ НОЧИ,','ЧЕРНОВИКИ И ВЕЧНОЕ']:portfolioLanguage==='kk'?['МЕН СЕНЕМІН: КЕРЕМЕТ ЖҰМЫС','ТЕК ТАЛАНТТАН ТУМАЙДЫ.','ОНЫҢ АРТЫНДА — ҰЙҚЫСЫЗ ТҮНДЕР,','СӘТСІЗ НҰСҚАЛАР','ЖӘНЕ ТАҒЫ ДА']:null;
  const words=quoteLines?quoteLines.join(' ').split(' '):['I','BELIEVE','GREAT','WORK','ISN’T','MADE','BY','TALENT','ALONE.','IT’S','FORGED','THROUGH','LATE','NIGHTS,','BAD','DRAFTS,','&','ONE','TOO','MANY'];
  const translatedTail=portfolioLanguage==='ru'?['«ЕЩЁ','ОДНА','ПРАВКА».']:portfolioLanguage==='kk'?['«ТАҒЫ','БІР','ТҮЗЕТУ».']:['“JUST ONE','MORE','TWEAK.”'];
  quote.innerHTML='<div class="hero-quote-main">'+words.map(w=>`<span class="quote-word"><span class="word-space" aria-hidden="true">${w}</span><span class="word-decode">${w}</span></span>`).join(' ')+'</div><div class="hero-quote-tail">'+translatedTail.map((w,i)=>`<span><b class="tail-word">${w}</b>${i===2?' <i>→</i>':''}</span>`).join('')+'</div>';
  const quoteWords=[...quote.querySelectorAll('.quote-word')];
  const quoteMain=quote.querySelector('.hero-quote-main');
  quoteMain.setAttribute('aria-hidden','true');
  function layoutQuote(){
  quoteMain.replaceChildren();let lineStart=0;
  (quoteLines?quoteLines.map((line,i)=>quoteLines.slice(0,i+1).join(' ').split(' ').length):(innerWidth<768?[4,7,9,12,14,16,20]:[3,6,9,12,14,16,20])).forEach((lineEnd,index)=>{
    const line=document.createElement('div');line.className='quote-line';
    if(index===4||index===5)line.classList.add('quote-line-indent');
    line.append(...quoteWords.slice(lineStart,lineEnd));quoteMain.append(line);lineStart=lineEnd;
  });}
  const originalLayoutQuote=layoutQuote;
  layoutQuote=function(){
    originalLayoutQuote();
    if(!quoteLines||innerWidth<768)return;
    quote.style.fontSize='';
    const base=parseFloat(getComputedStyle(quote).fontSize);
    let factor=1;
    quoteMain.querySelectorAll('.quote-line').forEach(line=>{
      const style=getComputedStyle(line),available=line.clientWidth-parseFloat(style.paddingLeft||0);
      const children=[...line.children];
      const needed=children.reduce((sum,word)=>sum+word.getBoundingClientRect().width,0)+Math.max(0,children.length-1)*base*.28;
      if(needed>available)factor=Math.min(factor,available/needed);
    });
    if(factor<1)quote.style.fontSize=`${base*factor}px`;
  };
  layoutQuote();
  const spokenQuote=document.createElement('span');spokenQuote.className='sr-only';
  spokenQuote.textContent=words.join(' ')+' '+translatedTail.join(' ');quote.prepend(spokenQuote);
  const tailWords=[...quote.querySelectorAll('.tail-word')];
  const tailText=tailWords.map(el=>el.textContent);
  const decodeGlyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+<>#';
  function decodeWord(el,text,progress,seed){
    const p=clamp(progress),step=Math.floor(p*24);
    if(el.dataset.decodeStep===String(step))return;
    el.dataset.decodeStep=String(step);
    el.textContent=[...text].map((ch,i)=>ch===' '||i/text.length<p?ch:decodeGlyphs[(seed+i*7+step*11)%decodeGlyphs.length]).join('');
    el.style.color=p<1?'var(--green)':'';
  }
  const quoteTail=quote.querySelector('.hero-quote-tail');hero.append(quoteTail);quoteTail.setAttribute('aria-hidden','true');quoteTail.style.opacity='0';
  const introParts=[hero.querySelector('.hero-name'),hero.querySelector('.hero-intro'),hero.querySelector('.hero-contact'),hero.querySelector('.hero-year'),hero.querySelector('.scroll-cue')];
  let h=innerHeight,w=innerWidth,travel=0,storyTop=0,heroEnd=0,shiftStart=0,shiftEnd=0,galleryEnd=0,end=0,queued=0;
  const masks=new Map();
  const maskPaths=new Map();
  const randomCell=(x,y)=>{const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n);};
  let smoothT=null,lastSceneTime=0;
  const quotePlayers=[0,0,0,0];
  // A stable irregular grid makes a reversible pixel wipe tied to scroll position.
  function pixelMask(element,progress,inverse=false,axis='x'){
    const p=Math.round(clamp(progress)*90)/90,key=`${p}:${inverse}:${w}:${h}:${axis}`;
    if(masks.get(element)===key)return;masks.set(element,key);
    if(p<=0){element.style.clipPath=inverse?'':'inset(0 100% 0 0)';return;}
    if(p>=1){element.style.clipPath=inverse?'inset(0 100% 0 0)':'';return;}
    if(maskPaths.has(key)){element.style.clipPath=maskPaths.get(key);return;}
    const cols=16,rows=Math.max(1,Math.ceil(h/w*cols)),cw=w/cols,ch=h/rows,parts=[];
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const threshold=randomCell(x,y)*.4+(cols-1-x)/(cols-1)*.6;
      if((threshold<=p)!==inverse){const px=x*cw,py=y*ch;parts.push(`M${px.toFixed(2)} ${py.toFixed(2)}h${(cw+.3).toFixed(2)}v${(ch+.3).toFixed(2)}h-${(cw+.3).toFixed(2)}Z`);}
    }
    const path=`path('${parts.join('')}')`;maskPaths.set(key,path);element.style.clipPath=path;
  }
  function mount(){
    body.classList.toggle('scroll-story',!reduce.matches);
    mobileWipe.style.display='none';mobileStats.style.display=mobile.matches&&!reduce.matches?'block':'none';stats.style.marginTop='';
    if(reduce.matches){sequence.before(hero,stats,work);sequence.hidden=true;body.dataset.storySurface='';[hero,stats,work,notes,track,...introParts,...stats.querySelectorAll('.stat-tile')].forEach(e=>{e.style.transform='';e.style.clipPath='';e.style.visibility='';e.style.opacity='';e.inert=false;});quoteTail.style.opacity='0';quote.style.setProperty('--quote-opacity','0');measureWork();updateReferenceHeader();return;}
    sequence.hidden=false;viewport.append(hero);
    if(mobile.matches){sequence.after(stats,work);sequence.style.marginBottom='0';stats.style.marginTop=`-${innerHeight}px`;notes.style.transform='';}
    else{viewport.append(stats,work);sequence.style.marginBottom=`-${innerHeight}px`;}
    [hero,stats,work,...stats.querySelectorAll('.stat-tile')].forEach(e=>{e.style.transform='';e.style.clipPath='';e.style.visibility='';e.inert=false;});
    if(mobile.matches)stats.querySelectorAll('[data-count]').forEach(e=>e.textContent=String(e.dataset.count).padStart(2,'0'));
    masks.clear();
    measure();
  }
  function measure(){
    maskPaths.clear();
    h=innerHeight;w=document.documentElement.clientWidth;storyTop=sequence.getBoundingClientRect().top+scrollY;
    layoutQuote();smoothT=null;
    heroEnd=h*4.5;shiftStart=heroEnd+h*.35;shiftEnd=shiftStart+w*1.34/.94;
    if(mobile.matches){travel=0;end=heroEnd;sequence.style.height=`${end+h}px`;stats.style.marginTop=`-${h}px`;}
    else{
      travel=Math.max(1,cards.at(-1).offsetLeft+cards.at(-1).offsetWidth+track.offsetLeft-w+32);
      galleryEnd=shiftEnd+travel+w*.25;end=galleryEnd+Math.max(h,w*.75);
      sequence.style.height=`${end+h}px`;sequence.style.marginBottom=`-${h}px`;
    }
    wireLength=wire?wire.getTotalLength():0;
    measureReferencePreviews();schedule();
  }
  function scene(now){
    queued=0;if(reduce.matches)return;
    if(body.classList.contains('work-page')){body.dataset.storySurface='';updateReferenceHeader();return;}
    const targetT=clamp(scrollY-storyTop,0,end+h),dt=Math.min(.05,(now-lastSceneTime)/1000||.016);lastSceneTime=now;
    if(smoothT===null||mobile.matches||targetT<heroEnd||root.dataset.smoothScroll==='true')smoothT=targetT;
    else smoothT+=(targetT-smoothT)*(1-Math.exp(-dt*5));
    if(Math.abs(smoothT-targetT)>.2)schedule();else smoothT=targetT;
    const t=smoothT,fade=ease(clamp(t/h));
    const quoteOut=clamp((t-h*4.15)/(h*.35));
    [1,1.65,2.1,2.55].forEach((threshold,i)=>{const target=t>=h*threshold?1:0;quotePlayers[i]+=clamp(target-quotePlayers[i],-dt/.7,dt/.7);if(Math.abs(target-quotePlayers[i])>.001)schedule();});
    const quoteIn=quotePlayers[0];
    introParts.forEach((e,i)=>{e.style.opacity=1-fade;e.style.transform=`translateY(${(i%2?1:-1)*fade*25}px)`;e.inert=fade>.98;});
    quote.style.setProperty('--quote-opacity',String(Math.min(quoteIn*4,1)*(1-quoteOut)));
    quoteTail.style.opacity=String(1-quoteOut);
    quote.setAttribute('aria-hidden',String(quoteIn<=0||quoteOut>=1));
    quoteWords.forEach((e,i)=>{const p=clamp(quoteIn*1.8-i/words.length*.8);e.style.opacity=p>0?'1':'0';decodeWord(e.querySelector('.word-decode'),words[i],p,i);});
    tailWords.forEach((e,i)=>{const p=quotePlayers[i+1];e.parentElement.style.opacity=p>0?'1':'0';decodeWord(e,tailText[i],p,i+30);});
    const glitch=quoteIn>0&&quoteIn<1?Math.sin(quoteIn*Math.PI):0;
    hero.querySelector('#identity').dataset.glitch=glitch.toFixed(3);
    hero.querySelector('.hero-art').style.filter='';
    hero.style.visibility=t>=heroEnd&&!mobile.matches?'hidden':'';
    const reveal=clamp((t-h*3)/(h*1.5));
    if(mobile.matches){
      pixelMask(mobileStats,reveal);body.dataset.storySurface=t<end+h?(reveal>.55?'green':'dark'):'';
    }else{
      const shiftRaw=clamp((clamp((t-shiftStart)/(shiftEnd-shiftStart))-.06)/.94);
      const shift=window.portfolioMotion?window.portfolioMotion.ease('power1.inOut')(shiftRaw):(shiftRaw<.5?2*shiftRaw*shiftRaw:1-2*(1-shiftRaw)*(1-shiftRaw));
      // Both panels are one viewport wide and must share the same moving edge.
      // The 1.34 factor belongs to the scroll duration, not the panel spacing.
      const handoffOffset=shift*w;
      stats.style.transform=`translate3d(${-handoffOffset}px,0,0)`;
      stats.style.visibility=t>=shiftEnd?'hidden':'';
      pixelMask(stats,reveal);
      stats.inert=reveal<.8||shift>.8;
      statTiles.forEach((tile,i)=>{const p=clamp((reveal-.5-i*.035)/.22);tile.style.clipPath=p>=1?'':`inset(${(1-p)*50}% ${Math.max(0,1-p*2)*50}% round 0px)`;const number=tile.querySelector('[data-count]');if(number){const text=String(Math.round(Number(number.dataset.count)*ease(p))).padStart(2,'0');if(number.textContent!==text)number.textContent=text;}});
      const gal=clamp((t-shiftEnd)/(galleryEnd-shiftEnd));
      // Sticky positioning releases at the real scroll boundary. Drive its exit
      // mask with that same position so a delayed wipe cannot survive unpinning.
      const exit=clamp((targetT-galleryEnd)/((end-galleryEnd)*.97));
      viewport.inert=exit>=1;
      sequence.style.pointerEvents='none';
      viewport.style.pointerEvents='none';
      hero.style.pointerEvents='auto';
      stats.style.pointerEvents='auto';
      work.style.pointerEvents=exit>=1?'none':'auto';
      // Hold the next scene behind the mosaic instead of sliding it up over the gallery.
      notes.style.transform=`translateY(${Math.min(0,targetT-end)}px)`;
      work.style.transform=`translate3d(${w-handoffOffset}px,0,0)`;work.style.visibility=t<shiftStart||exit>=1?'hidden':'';
      // Visible links must be usable even while the panel is entering.
      work.inert=t<shiftStart||exit>=1;
      track.style.transform=`translate3d(${-gal*(travel+w*.25)-exit*w*.75}px,0,0)`;
      pixelMask(work,exit,true,'x');
      const position=String(Math.min(cards.length,Math.floor(gal*cards.length)+1)).padStart(2,'0');if(workPosition.textContent!==position)workPosition.textContent=position;
      if(wire){wire.style.strokeDasharray=wireLength;wire.style.strokeDashoffset=wireLength*(1-clamp(gal+.25));}
      body.dataset.storySurface=t<end?(reveal>.55&&exit<.6?'green':'dark'):'';
    }
    updateReferenceHeader();updateRing();
  }
  const mobileWipe=document.createElement('canvas');mobileWipe.className='story-cutout';mobileWipe.setAttribute('aria-hidden','true');viewport.append(mobileWipe);
  const mobileStats=stats.cloneNode(true);mobileStats.removeAttribute('id');mobileStats.classList.add('mobile-stats-preview');mobileStats.setAttribute('aria-hidden','true');mobileStats.inert=true;mobileStats.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));viewport.append(mobileStats);
  document.fonts.ready.then(()=>drawDottedText(mobileStats.querySelector('canvas'),'△','#54339d',5));
  let lastWipe='';
  function drawMobileWipe(p){
    const key=`${Math.round(p*70)}:${w}:${h}`;if(key===lastWipe)return;lastWipe=key;
    mobileWipe.width=w;mobileWipe.height=h;const c=mobileWipe.getContext('2d');c.clearRect(0,0,w,h);c.fillStyle=getComputedStyle(root).getPropertyValue('--green');
    const cols=16,rows=Math.ceil(h/w*cols),cw=w/cols,ch=h/rows;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(randomCell(x,y)*.4+(cols-1-x)/(cols-1)*.6<p)c.fillRect(x*cw,y*ch,cw+.3,ch+.3);
  }
  function schedule(){if(!queued)queued=requestAnimationFrame(scene);}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{masks.clear();measure();});mobile.addEventListener('change',mount);reduce.addEventListener('change',mount);
  document.addEventListener('portfolio:route',event=>{measure();const url=new URL(event.detail.url);if(!body.classList.contains('work-page'))navigateHash(url.hash,event.detail.position);schedule();});
  function navigateHash(hash,fallback=0){
    let top=fallback;
    if(hash==='#home')top=storyTop;
    else if(hash==='#snapshots')top=mobile.matches?stats.offsetTop:storyTop+heroEnd;
    else if(hash==='#work')top=mobile.matches?work.offsetTop:storyTop+shiftEnd;
    else if(hash){const target=document.querySelector(hash);if(target)top=target.getBoundingClientRect().top+scrollY;}
    smoothT=top-storyTop;scrollTo({top,behavior:'instant'});schedule();
  }
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey)return;
    const url=new URL(a.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash){event.preventDefault();history.pushState(null,'',url);if(menu.open)closeMenu();navigateHash(url.hash);}
  });
  track.addEventListener('focusin',event=>{if(mobile.matches||reduce.matches)return;const card=event.target.closest('.project-card');if(!card)return;requestAnimationFrame(()=>{work.querySelector('.work-sticky').scrollLeft=0;const p=clamp((card.offsetLeft+track.offsetLeft-32)/travel);scrollTo({top:storyTop+shiftEnd+p*(galleryEnd-shiftEnd),behavior:'instant'});schedule();});});
  // Original ring geometry: 60px diameter, 29.5px radius, 1px strokes.
  const ring=document.querySelector('.cursor'),circumference=2*Math.PI*29.5;
  ring.innerHTML='<svg viewBox="0 0 60 60" fill="none" aria-hidden="true"><circle class="ring-track" cx="30" cy="30" r="29.5" stroke-width="1"/><circle class="ring-progress" cx="30" cy="30" r="29.5" stroke-width="1" stroke-linecap="round" transform="rotate(-90 30 30)"/></svg>';
  const arc=ring.querySelector('.ring-progress');arc.style.strokeDasharray=circumference;
  let px=0,py=0,rx=0,ry=0,ringFrame=0,ringSeen=false;
  function updateRing(){const max=Math.max(1,root.scrollHeight-innerHeight),p=clamp(scrollY/max);arc.style.strokeDashoffset=circumference*(1-p);ring.dataset.progress=p.toFixed(4);const under=document.elementFromPoint(px,py);ring.classList.toggle('on-green',!!under?.closest('.work,.snapshots,.contact'));}
  let lastRingTime=0;
  function follow(now){const dt=Math.min(.05,(now-lastRingTime)/1000||1/60);lastRingTime=now;const blend=1-Math.exp(-dt*15);rx+=(px-rx)*blend;ry+=(py-ry)*blend;updateRing();ring.style.transform=`translate3d(${rx-30}px,${ry-30}px,0)`;if(Math.abs(px-rx)+Math.abs(py-ry)>.2)ringFrame=requestAnimationFrame(follow);else ringFrame=0;}
  addEventListener('pointermove',event=>{if(event.pointerType==='touch'||reduce.matches)return;px=event.clientX;py=event.clientY;if(!ringSeen){rx=px;ry=py;ringSeen=true;}ring.style.opacity='1';if(!ringFrame){lastRingTime=performance.now();ringFrame=requestAnimationFrame(follow);}},{passive:true});
  document.addEventListener('mouseleave',()=>ring.style.opacity='0');addEventListener('scroll',updateRing,{passive:true});new ResizeObserver(updateRing).observe(document.querySelector('main'));
  mount();document.fonts.ready.then(()=>{measure();if(location.hash)navigateHash(location.hash);});
  // Replay the purple pixel frontier whenever a card re-enters, including in reverse.
  let galleryDirection=1,lastGalleryScroll=scrollY;
  addEventListener('scroll',()=>{const delta=scrollY-lastGalleryScroll;if(Math.abs(delta)>.5)galleryDirection=Math.sign(delta);lastGalleryScroll=scrollY;},{passive:true});
  const cardEffects=new Map();
  function clearCardEffect(state){
    cancelAnimationFrame(state.frame);state.frame=0;state.cover.style.clipPath='';
    state.context.clearRect(0,0,state.canvas.width,state.canvas.height);
    state.cover.dataset.revealState='complete';
  }
  function revealCard(state){
    clearCardEffect(state);if(reduce.matches)return;
    const rect=state.cover.getBoundingClientRect(),width=Math.round(rect.width),height=Math.round(rect.height);
    if(!width||!height)return;
    state.canvas.width=width;state.canvas.height=height;
    const reverse=galleryDirection<0,size=26,cols=Math.ceil(width/size),rows=Math.ceil(height/size),cells=[];
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const noise=randomCell(x,y),sweep=reverse?1-x/Math.max(1,cols-1):x/Math.max(1,cols-1);
      cells.push({x:x*size,y:y*size,sweep,threshold:sweep*.6+noise*.4,noise:randomCell(x+31.7,y+31.7)});
    }
    state.cover.dataset.revealDirection=reverse?'reverse':'forward';
    state.cover.dataset.revealCount=String(Number(state.cover.dataset.revealCount||0)+1);
    state.cover.dataset.revealState='running';
    const begin=performance.now();
    function frame(now){
      if(reduce.matches||document.hidden){clearCardEffect(state);return;}
      const progress=clamp((now-begin)/800),front=progress*1.68-.25,paths=[];
      state.context.clearRect(0,0,width,height);
      for(const cell of cells){
        const bandT=clamp(Math.abs(front-cell.sweep)/.25),bandFade=ease(clamp((bandT-.05)/.95));
        const band=bandT<1&&cell.noise>=bandFade;
        if(cell.threshold<=front||band)paths.push(`M${cell.x.toFixed(1)} ${cell.y.toFixed(1)}h${(size+.7).toFixed(1)}v${(size+.7).toFixed(1)}h-${(size+.7).toFixed(1)}Z`);
        if(band){state.context.fillStyle='#8607ff';state.context.fillRect(cell.x,cell.y,size+1,size+1);}
        else if(cell.threshold<=front&&front<cell.threshold+.18){state.context.fillStyle='rgba(157,241,51,.5)';state.context.fillRect(cell.x,cell.y,size+1,size+1);}
      }
      state.cover.style.clipPath=`path('${paths.join('')}')`;
      if(progress<1)state.frame=requestAnimationFrame(frame);else clearCardEffect(state);
    }
    state.frame=requestAnimationFrame(frame);
  }
  const cardObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const state=cardEffects.get(entry.target);
    if(entry.isIntersecting){if(!state.visible)revealCard(state);state.visible=true;}
    else{state.visible=false;clearCardEffect(state);}
  }),{threshold:.04});
  document.querySelectorAll('.project-card').forEach(card=>{
    const cover=card.querySelector('.project-cover');if(!cover)return;
    const canvas=document.createElement('canvas');canvas.className='card-pixel-frontier';canvas.setAttribute('aria-hidden','true');cover.append(canvas);
    cardEffects.set(card,{cover,canvas,context:canvas.getContext('2d'),frame:0,visible:false});cardObserver.observe(card);
  });
  reduce.addEventListener('change',()=>cardEffects.forEach(clearCardEffect));
  addEventListener('resize',()=>cardEffects.forEach(clearCardEffect));
  // Scrambled section headings and rows are replayed on entry, as in the recording.
  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+<>',animated=new WeakMap();
  function scramble(el){if(reduce.matches)return;cancelAnimationFrame(animated.get(el));const original=el.dataset.motionText||(el.dataset.motionText=el.textContent);el.setAttribute('aria-label',original);const start=performance.now();function tick(now){const p=clamp((now-start)/750);el.textContent=[...original].map((ch,i)=>ch===' '||ch==='\n'||i/original.length<p?ch:glyphs[(i*7+Math.floor(now/45))%glyphs.length]).join('');if(p<1)animated.set(el,requestAnimationFrame(tick));else el.textContent=original;}animated.set(el,requestAnimationFrame(tick));}
  const headings=[document.querySelector('.notes-heading h2'),...document.querySelector('.contact h2').childNodes].filter(el=>el.nodeType===1);
  const footerHeading=document.querySelector('.contact h2');footerHeading.innerHTML=footerHeading.innerHTML.split(/<br\s*\/?\s*>/i).map(line=>`<span class="footer-line">${line}</span>`).join('<br>');
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(entry.target.matches('h2')){entry.target.querySelectorAll('.footer-line').length?entry.target.querySelectorAll('.footer-line').forEach(scramble):scramble(entry.target);}else if(!reduce.matches)entry.target.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'none'}],{duration:600,easing:'ease-out'});}}),{threshold:.35});
  [document.querySelector('.notes-heading h2'),footerHeading,...document.querySelectorAll('.project-choice,.mobile-project')].forEach(el=>reveal.observe(el));
  body.classList.add('motion-ready');
})();

// A dotted footer wordmark with a fading purple displacement trail.
(() => {
 const canvas=document.querySelector('#footer-glyph'),box=canvas.parentElement,context=canvas.getContext('2d');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');let points=[],cw=1,ch=1,frame=0,visible=false,entered=0,lastScroll=0;
 const trail=[];let lastPointer=null;
 function measure(){
  const rect=box.getBoundingClientRect();if(!rect.width||!rect.height)return;cw=Math.round(rect.width);ch=Math.round(rect.height);const ratio=Math.min(devicePixelRatio||1,2);canvas.width=cw*ratio;canvas.height=ch*ratio;context.setTransform(ratio,0,0,ratio,0,0);
  const source=document.createElement('canvas');source.width=cw;source.height=ch;const c=source.getContext('2d',{willReadFrequently:true});let size=ch*1.05;c.font=`500 ${size}px Rajdhani`;size*=Math.min(1,cw*.995/c.measureText('PORTFOLIO/SAN').width);c.font=`500 ${size}px Rajdhani`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.fillText('PORTFOLIO/SAN',cw/2,ch*.55);const rgba=c.getImageData(0,0,cw,ch).data;points=[];const step=cw<600?2:3;for(let y=0;y<ch;y+=step)for(let x=0;x<cw;x+=step)if(rgba[(y*cw+x)*4+3]>100)points.push({x,y,size:step*.6});request();
 }
 function request(){if(!frame)frame=requestAnimationFrame(draw);}
 function draw(now){frame=0;context.clearRect(0,0,cw,ch);while(trail.length&&now-trail[0].time>1300)trail.shift();const intro=reduce.matches?0:Math.max(0,1-(now-entered)/1100),scrollEnergy=reduce.matches?0:Math.max(0,1-(now-lastScroll)/450);
  for(const point of points){let dx=0,dy=0,energy=0;for(const p of trail){const distance=Math.hypot(point.x-p.x,point.y-p.y),power=Math.max(0,1-distance/90)*Math.max(0,1-(now-p.time)/1300);dx+=p.dx*power*.6;dy+=p.dy*power*.6;energy=Math.max(energy,power);}dy+=Math.sin(point.x*.017+now*.006)*intro*ch*.2+Math.sin(point.x*.013)*scrollEnergy*3;context.fillStyle=energy>.08?'#7d00f4':'#070210';context.fillRect(point.x+clampLocal(dx,-28,28),point.y+clampLocal(dy,-25,25),point.size,point.size);}
  if(visible&&!document.hidden&&(trail.length||intro>0||scrollEnergy>0))request();
 }
 function clampLocal(x,a,b){return Math.max(a,Math.min(b,x));}
 box.addEventListener('pointermove',event=>{if(reduce.matches)return;const r=box.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;trail.push({x,y,dx:lastPointer?x-lastPointer.x:0,dy:lastPointer?y-lastPointer.y:0,time:performance.now()});if(trail.length>28)trail.shift();lastPointer={x,y};request();},{passive:true});box.addEventListener('pointerleave',()=>lastPointer=null);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){entered=performance.now();request();}},{threshold:.05}).observe(box);new ResizeObserver(measure).observe(box);document.fonts.ready.then(measure);addEventListener('scroll',()=>{if(visible){lastScroll=performance.now();request();}},{passive:true});
})();




