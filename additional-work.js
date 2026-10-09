(() => {
 const lang=portfolioLanguage==='ru'?0:portfolioLanguage==='kk'?1:2;
 const t=(ru,kk,en)=>[ru,kk,en][lang];
 const sites=[
  {name:'AST Group',url:'https://ast-group-website.vercel.app/',style:'ast',description:t('Сайт дизайнерской мебели на заказ в Астане: коллекции, выполненные проекты и этапы работы.','Астанадағы тапсырыспен жасалатын дизайнерлік жиһаз сайты: топтамалар, дайын жобалар және жұмыс кезеңдері.','A custom furniture website in Astana, featuring collections, completed projects and the design process.')},
  {name:'LeadFlow',url:'https://saa-s-bojp.vercel.app/',style:'leadflow',description:t('Сервис для сбора заявок из разных каналов в одном месте.','Әртүрлі арналардан өтінімдерді бір жерде жинауға арналған сервис.','A service that brings leads from different channels into one place.')}
 ];
 const designs=[
  {file:'design-service',name:t('Дизайн под ключ','Толық дизайн қызметі','Turnkey Design'),description:t('Рекламный креатив об услугах: инфографика для WB и OZON, баннеры, посты и визитки.','Қызметтерге арналған жарнамалық креатив: WB және OZON инфографикасы, баннерлер, посттар мен визиткалар.','A promotional creative for design services: WB and OZON infographics, banners, posts and business cards.')},
  {file:'porsche',name:'Porsche 911 GT3 RS',description:t('Постер из четырёх ракурсов: коллаж на глубоком чёрном фоне с алыми акцентами.','Төрт ракурстан жасалған постер: қою қара фон мен алқызыл акценттері бар коллаж.','A four-angle poster: a collage on a deep black background with scarlet accents.')},
  {file:'level-up',name:'Design Level Up',description:t('Обложка в журнальном стиле: полупрозрачные панели, свечение шрифта и штрих-код.','Журнал стиліндегі мұқаба: жартылай мөлдір панельдер, жарқыраған қаріп және штрихкод.','A magazine-style cover with translucent panels, glowing typography and a barcode.')},
  {file:'vader',name:'Darth Vader',description:t('Постер по «Звёздным войнам»: красный градиент, дым и многослойный заголовок.','«Жұлдызды соғыстар» постері: қызыл градиент, түтін және көпқабатты тақырып.','A Star Wars poster with a red gradient, smoke and a layered headline.')}
 ];
 const openSite=t('Открыть сайт','Сайтты ашу','Visit website');
 const view=t('Посмотреть дизайн','Дизайнды қарау','View design');
 function siteCard(p){return `<article class="new-work-card"><a class="new-site-cover ${p.style}" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${openSite}: ${p.name}">${p.style==='ast'?'<span class="site-preview-tag">AST / GROUP</span><strong>AST<br>Group</strong><span class="site-preview-bottom">'+t('Дизайнерская мебель','Дизайнерлік жиһаз','Custom furniture')+'</span>':'<span class="site-preview-tag">LeadFlow</span><strong>'+t('Все заявки.<br>Один поток.','Барлық өтінім.<br>Бір ағын.','Every lead.<br>One flow.')+'</strong><div class="lead-preview-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'}<span class="new-work-arrow">↗</span></a><div class="new-work-caption"><h3>${p.name}</h3><a href="${p.url}" target="_blank" rel="noopener noreferrer">${openSite} ↗</a></div><p>${p.description}</p></article>`;}
 function designCard(p,i){return `<article class="new-work-card design-work-card"><button class="design-cover" type="button" data-design="${i}" aria-label="${view}: ${p.name}"><img src="/assets/design/${p.file}.png" alt="${p.name}" loading="lazy" decoding="async" width="800" height="1100"><span class="new-work-arrow">↗</span></button><div class="new-work-caption"><h3>${p.name}</h3></div><p>${p.description}</p></article>`;}
 const section=document.createElement('section');section.className='additional-work';section.id='additional-work';
 section.innerHTML=`<div class="additional-work-heading"><span class="role-tag">${t('ВЕБ И ДИЗАЙН','ВЕБ ЖӘНЕ ДИЗАЙН','WEB & DESIGN')}</span><h2>${t('Ещё работы','Тағы жұмыстар','More work')}</h2></div><h3 class="work-category">${t('Сайты','Сайттар','Websites')}</h3><div class="new-sites-grid">${sites.map(siteCard).join('')}</div><h3 class="work-category">${t('Графический дизайн','Графикалық дизайн','Graphic design')}</h3><div class="new-design-grid">${designs.map(designCard).join('')}</div>`;
 document.querySelector('.contact').before(section);
 const allGrid=document.querySelector('.all-work-grid');
 if(allGrid){
 const heading=label=>`<h2 class="gallery-section-title">${label}</h2>`;
 allGrid.innerHTML=heading(t('Сайты','Сайттар','Websites'))+projects.slice(0,3).map(projectCard).join('')+sites.map(siteCard).join('')+heading(t('Приложения и ИИ','Қосымшалар және ЖИ','Apps & AI'))+projects.slice(3).map(projectCard).join('')+heading(t('Графический дизайн','Графикалық дизайн','Graphic design'))+designs.map(designCard).join('');
 }
 const viewer=document.createElement('dialog');viewer.className='design-viewer';viewer.innerHTML=`<button class="design-viewer-close" type="button" aria-label="${t('Закрыть','Жабу','Close')}">×</button><figure><img alt=""><figcaption></figcaption></figure>`;document.body.append(viewer);
 let trigger=null;
 document.addEventListener('click',event=>{const button=event.target.closest('[data-design]');if(!button)return;const p=designs[Number(button.dataset.design)];trigger=button;viewer.querySelector('img').src=`/assets/design/${p.file}.png`;viewer.querySelector('img').alt=p.name;viewer.querySelector('figcaption').textContent=p.name;viewer.showModal();});
 viewer.querySelector('button').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
 viewer.addEventListener('close',()=>trigger?.focus());
})();
