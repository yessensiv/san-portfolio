const portfolioLanguage=(()=>{try{return ['ru','kk','en'].includes(localStorage.getItem('san-language-v2'))?localStorage.getItem('san-language-v2'):'ru';}catch{return 'ru';}})();
const languageWords={
'SOUND —':['ЗВУК —','ДЫБЫС —'],'ON':['ВКЛ','ҚОСУЛЫ'],'OFF':['ВЫКЛ','ӨШІРУЛІ'],'PORTFOLIO':['ПОРТФОЛИО','ПОРТФОЛИО'],'SAN / DIGITAL IDENTITY':['SAN / ЦИФРОВОЙ ОБРАЗ','SAN / ЦИФРЛЫҚ БЕЙНЕ'],'SAN. DESIGNED TO EXPLORE':['SAN. СОЗДАНО ДЛЯ ОТКРЫТИЙ','SAN. ЗЕРТТЕУ ҮШІН ЖАСАЛҒАН'],'MENU':['МЕНЮ','МӘЗІР'],'CLOSE':['ЗАКРЫТЬ','ЖАБУ'],'/ MENU':['/ МЕНЮ','/ МӘЗІР'],'EXPLORE THE PORTFOLIO':['СМОТРЕТЬ ПОРТФОЛИО','ПОРТФОЛИОНЫ ҚАРАУ'],
'ABOUT':['ОБО МНЕ','МЕН ТУРАЛЫ'],'WORK':['ПРОЕКТЫ','ЖОБАЛАР'],'CONNECT':['СВЯЗАТЬСЯ','БАЙЛАНЫС'],
'INDEPENDENT DEVELOPER':['НЕЗАВИСИМЫЙ РАЗРАБОТЧИК','ТӘУЕЛСІЗ ӘЗІРЛЕУШІ'],'LOCAL TIME':['МЕСТНОЕ ВРЕМЯ','ЖЕРГІЛІКТІ УАҚЫТ'],
"HELLO, I'M":['ПРИВЕТ, Я','СӘЛЕМ, МЕН'], 'DEVELOPER / WEB · MOBILE · AI':['РАЗРАБОТЧИК / ВЕБ · МОБИЛЬНЫЕ · ИИ','ӘЗІРЛЕУШІ / ВЕБ · МОБИЛЬДІ · ЖИ'],
'PUBLIC REPOSITORIES':['ОТКРЫТЫЕ РЕПОЗИТОРИИ','АШЫҚ РЕПОЗИТОРИЙЛЕР'],'LIVE WEBSITES':['ОПУБЛИКОВАННЫЕ САЙТЫ','ЖАРИЯЛАНҒАН САЙТТАР'],'WEB / MOBILE / AI':['ВЕБ / МОБИЛЬНЫЕ / ИИ','ВЕБ / МОБИЛЬДІ / ЖИ'],
'KEEP SCROLLING':['ЛИСТАЙ ДАЛЬШЕ','ӘРІ ҚАРАЙ ЖЫЛЖЫТ'],'SELECTED':['ИЗБРАННЫЕ','ТАҢДАУЛЫ'],'WORK':['РАБОТЫ','ЖҰМЫСТАР'],"I'm glad you're still here.":['Рад, что ты всё ещё здесь.','Әлі осында болғаныңа қуаныштымын.'],'EXPLORE MORE':['СМОТРЕТЬ ВСЕ','БАРЛЫҒЫН ҚАРАУ'],
"I'VE BUILT":['МОИ РАЗРАБОТКИ','МЕН ЖАСАҒАН'],'MY PROJECTS':['МОИ ПРОЕКТЫ','МЕНІҢ ЖОБАЛАРЫМ'],'PERSONAL WORKS':['ЛИЧНЫЕ ПРОЕКТЫ','ЖЕКЕ ЖОБАЛАР'],'MY WORK':['МОИ РАБОТЫ','МЕНІҢ ЖҰМЫСТАРЫМ'],
"LET'S CREATE":['ДАВАЙ СОЗДАВАТЬ','ЖАСАЙЫҚ'],'GOOD STUFF':['КЛАССНЫЕ ВЕЩИ','КЕРЕМЕТ ЖОБАЛАР'],'TOGETHER.':['ВМЕСТЕ.','БІРГЕ.'],
'CONNECT ON GITHUB ↗':['СВЯЗАТЬСЯ В GITHUB ↗','GITHUB АРҚЫЛЫ БАЙЛАНЫС ↗'],'EXPLORE MY WORK ↗':['МОИ ПРОЕКТЫ ↗','ЖОБАЛАРЫМДЫ ҚАРАУ ↗'],'MY WORK ↗':['МОИ РАБОТЫ ↗','МЕНІҢ ЖҰМЫСТАРЫМ ↗'],'LIVE PROJECTS':['ОПУБЛИКОВАННЫЕ ПРОЕКТЫ','ЖАРИЯЛАНҒАН ЖОБАЛАР'],
'VIEW SOURCE ↗':['ИСХОДНЫЙ КОД ↗','БАСТАПҚЫ КОД ↗'],'VISIT WEBSITE ↗':['ОТКРЫТЬ САЙТ ↗','САЙТТЫ АШУ ↗'],'VISIT ↗':['ОТКРЫТЬ ↗','АШУ ↗'],'DESIGNED TO EXPLORE':['СОЗДАНО ДЛЯ ОТКРЫТИЙ','ЗЕРТТЕУ ҮШІН ЖАСАЛҒАН'],'SCROLL TO DISCOVER':['ЛИСТАЙ И ОТКРЫВАЙ','ЖЫЛЖЫТЫП ТАНЫС'],
'WEB DEVELOPMENT':['ВЕБ-РАЗРАБОТКА','ВЕБ-ӘЗІРЛЕУ'],'EDUCATION PLATFORM':['УЧЕБНАЯ ПЛАТФОРМА','ОҚУ ПЛАТФОРМАСЫ'],'WEB DESIGN CONCEPT':['КОНЦЕПЦИЯ ВЕБ-ДИЗАЙНА','ВЕБ-ДИЗАЙН ТҰЖЫРЫМДАМАСЫ'],'ANDROID APPLICATION':['ПРИЛОЖЕНИЕ ANDROID','ANDROID ҚОСЫМШАСЫ'],'AI / TELEGRAM BOT':['ИИ / TELEGRAM-БОТ','ЖИ / TELEGRAM-БОТ']};
const projectTranslations=[
['Демонстрационный сайт стоматологии: услуги, врачи, цены, запись и адаптивный интерфейс.','Стоматологияның демо-сайты: қызметтер, дәрігерлер, бағалар, қабылдауға жазылу және бейімделетін интерфейс.'],
['Платформа на русском и казахском для изучения математики и подготовки к ЕНТ: уроки, практика, диагностика и индивидуальные маршруты обучения.','Математиканы үйренуге және ҰБТ-ға дайындалуға арналған қазақша және орысша платформа: сабақтар, жаттығулар, диагностика және жеке оқу бағыттары.'],
['Независимая концепция сайта напитков: выразительная типографика, интерактивные композиции, выбор вкусов и адаптивные анимации.','Сусындар сайтының тәуелсіз тұжырымдамасы: айқын типографика, интерактивті композициялар, дәм таңдау және бейімделетін анимациялар.'],
['Android-приложение для загрузки видео и аудио: выбор формата, фоновые загрузки, медиатека и интерфейс на русском и английском.','Видео мен аудио жүктеуге арналған Android қосымшасы: пішім таңдау, фондық жүктеу, медиатека және орысша, ағылшынша интерфейс.'],
['Telegram-помощник для краткого содержания TXT-документов и ответов на вопросы, с локальным демо и интеграцией OpenAI Responses API.','TXT құжаттарын қорытындылап, сұрақтарға жауап беретін Telegram көмекшісі. Жергілікті демо режимі және OpenAI Responses API интеграциясы бар.']];
const languageIndex=portfolioLanguage==='ru'?0:1;
function languageText(text){return portfolioLanguage==='en'?text:(languageWords[text]?.[languageIndex]||text);}
function localizeProject(project,index){if(portfolioLanguage!=='en'){project.description=projectTranslations[index][languageIndex];project.kind=languageText(project.kind);}}
function initializeLanguages(){
 document.documentElement.lang=portfolioLanguage;
 const picker=document.createElement('nav');picker.className='language-picker';picker.setAttribute('aria-label','Language / Язык / Тіл');
 [['ru','RU'],['kk','KZ'],['en','ENG']].forEach(([code,label])=>{const b=document.createElement('button');b.textContent=label;b.type='button';b.setAttribute('aria-pressed',String(code===portfolioLanguage));b.addEventListener('click',()=>{try{localStorage.setItem('san-language-v2',code);}catch{}location.reload();});picker.append(b);});document.querySelector('.header').append(picker);
 if(portfolioLanguage==='en')return;
 document.querySelector('.hero-intro').innerHTML=portfolioLanguage==='ru'?'Создаю цифровые продукты на пересечении <em>дизайна</em> и <strong>&lt;технологий/&gt;</strong>. От продуманных сайтов до мобильных приложений и ИИ-инструментов — превращаю идеи в то, чем можно пользоваться.':'<em>Дизайн</em> мен <strong>&lt;технология/&gt;</strong> тоғысында цифрлық өнімдер жасаймын. Ойластырылған сайттардан мобильді қосымшалар мен ЖИ құралдарына дейін — идеяларды қолдануға болатын өнімге айналдырамын.';
 function translate(root){if(root.nodeType===3){const trimmed=root.textContent.trim(),translated=languageText(trimmed);if(trimmed!==translated)root.textContent=root.textContent.replace(trimmed,translated);return;}if(root.nodeType!==1||root.closest('script,style,canvas,.language-picker,.hero-quote,.hero-quote-tail'))return;for(const child of [...root.childNodes])translate(child);}
 translate(document.querySelector('.portfolio-root')||document.body);
 new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')translate(r.target);else r.addedNodes.forEach(translate);}}).observe(document.querySelector('.portfolio-root')||document.body,{subtree:true,childList:true,characterData:true});
}
