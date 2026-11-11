/* MICRO LAB FUSION: one visual system around the existing ticket, trainer and WebGL engines. */
(()=>{'use strict';
const root=document.getElementById('app');
const ICON={
  microscope:'<path d="M6 18h12M9 18l-1-2M16 18l1-2M9 6l3 3m-2-5 3 3-4 4-3-3 4-4Zm-2 9a6 6 0 0 0 10-4M17 4h3"/>',
  atom:'<ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  book:'<path d="M4 5.5c3-1 5-1 8 .6 3-1.6 5-1.6 8-.6v14c-3-1-5-1-8 .6-3-1.6-5-1.6-8-.6zM12 6v14"/>',
  ticket:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M11 9h7M11 13h7M11 17h5"/>',
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5m-9 5v10"/>',
  trophy:'<path d="M8 4h8v7a4 4 0 0 1-8 0V4ZM8 6H5v2a3 3 0 0 0 3 3m8-5h3v2a3 3 0 0 1-3 3M12 15v4m-4 1h8"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  repeat:'<path d="M20 7h-9l3-3m-3 3 3 3M4 17h9l-3-3m3 3-3 3M6 8a7 7 0 0 0-2 5m14 3a7 7 0 0 0 2-5"/>',
  arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  moon:'<path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  beaker:'<path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M7 16h10"/>'
};
const icon=(name,size=21)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]||ICON.atom}</svg>`;
const safeGet=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
let theme=safeGet('micro-fusion-theme')==='light'?'light':'dark';
function applyTheme(){const dark=theme==='dark';document.body.classList.toggle('fusion-dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0d1425':'#f5f6fb');const b=document.getElementById('fusion-theme');if(b){b.innerHTML=icon(dark?'sun':'moon',19);b.title=dark?'Переключить на светлую тему':'Переключить на тёмную тему';b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(dark))}}
function installHeader(){const header=document.querySelector('header');if(!header)return;const help=header.querySelector('.tour-help');
 header.innerHTML=`<div class="brand"><span class="fusion-mark" aria-hidden="true">${icon('atom',23)}</span><span>MICRO <b>LAB</b><span class="fusion-brand-sub">FUSION · ИССЛЕДУЙ И ПОНИМАЙ</span></span></div><div class="fusion-header-right"><span class="fusion-header-tag">Интерактивная микробиология</span><button class="fusion-icon-button" id="fusion-search" title="Поиск по темам" aria-label="Поиск по темам">${icon('search',19)}</button><button class="fusion-icon-button" id="fusion-theme" title="Сменить тему" aria-label="Сменить тему"></button><span class="fusion-user-disc" aria-hidden="true">μ</span></div>`;
 if(help){help.textContent='?';help.title='Повторить обучение';header.querySelector('.fusion-header-right').prepend(help)}
 document.getElementById('fusion-search').onclick=()=>{home();document.getElementById('search')?.focus();document.getElementById('search')?.scrollIntoView({behavior:'smooth',block:'center'})};
 document.getElementById('fusion-theme').onclick=()=>{theme=theme==='light'?'dark':'light';safeSet('micro-fusion-theme',theme);applyTheme()};applyTheme();
}
function heroIllustration(){return `<svg viewBox="0 0 470 360" role="img" aria-label="Учебная иллюстрация строения бактериальной клетки">
<defs><radialGradient id="fhalo"><stop stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#a4bdde" stop-opacity=".03"/></radialGradient><linearGradient id="fcell" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#77b9b2"/><stop offset="1" stop-color="#8795d9"/></linearGradient><linearGradient id="finner" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ccebdc"/><stop offset="1" stop-color="#e2c8dc"/></linearGradient></defs>
<circle cx="241" cy="179" r="163" fill="url(#fhalo)" stroke="#ffffff" stroke-width="2" stroke-opacity=".78"/>
<circle cx="241" cy="179" r="133" fill="none" stroke="#9cb1dd" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="5 8"/>
<circle cx="241" cy="179" r="110" fill="none" stroke="#a4c7d7" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 10"/>
<g transform="rotate(-17 244 184)"><rect x="87" y="116" width="310" height="139" rx="68" fill="url(#fcell)" stroke="#a9d3d8" stroke-width="8" opacity=".92"/>
<rect x="102" y="131" width="280" height="110" rx="55" fill="#fbebdb" stroke="#7dbab8" stroke-width="7"/>
<rect x="119" y="145" width="246" height="82" rx="40" fill="url(#finner)" stroke="#99c1ce" stroke-width="3"/>
<path d="M151 192C188 132 193 239 239 185S290 173 318 197S338 175 350 168" stroke="#e795a7" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M398 174C446 116 462 251 434 244" stroke="#75bebd" stroke-width="8" fill="none" stroke-linecap="round"/>
<g fill="#8b7bbf"><circle cx="157" cy="161" r="6"/><circle cx="185" cy="213" r="6"/><circle cx="203" cy="165" r="5"/><circle cx="264" cy="156" r="6"/><circle cx="300" cy="221" r="7"/><circle cx="339" cy="201" r="5"/><circle cx="341" cy="160" r="5"/><circle cx="238" cy="214" r="6"/></g>
<ellipse cx="205" cy="181" rx="13" ry="9" fill="none" stroke="#a39ad1" stroke-width="4"/><ellipse cx="319" cy="183" rx="14" ry="8" fill="none" stroke="#a39ad1" stroke-width="4"/>
</g><circle cx="71" cy="112" r="10" fill="#8acbbf"/><circle cx="355" cy="70" r="7" fill="#b3a4d9"/><circle cx="387" cy="286" r="12" fill="#ecc2c7"/><circle cx="106" cy="267" r="6" fill="#b6afd8"/>
<g font-family="system-ui,-apple-system,sans-serif" font-weight="700" fill="#687fa0" font-size="10"><path d="M354 73L316 104" stroke="#9c9dd1" stroke-width="1.5"/><text x="352" y="61" text-anchor="end">РИБОСОМЫ</text><path d="M109 267L154 233" stroke="#91b5b7" stroke-width="1.5"/><text x="57" y="280">ОБОЛОЧКА</text></g></svg>`}
function completedTickets(){return TICKETS.filter(t=>ticketStats(t.number)===ticketSections(t).length).length}
function studyCounts(){return {done:topics.filter(t=>progress[topicId(t)]).length,total:topics.length,tickets:completedTickets(),bank:Object.keys(bankState).length,due:dueCount()}}
function routeCard(cfg){return `<button type="button" class="fusion-route ${cfg.cls||''}" id="${cfg.id}"><span class="fusion-route-icon">${icon(cfg.icon,23)}</span><span class="fusion-route-arrow">↗</span><span class="fusion-route-label">${cfg.label}</span><strong>${cfg.title}</strong><small>${cfg.copy}</small></button>`}
function installHome(){
 const old=root.querySelector('.hero');if(!old)return;
 root.classList.add('fusion-home');const c=studyCounts(),next=topics.find(t=>!progress[topicId(t)])||topics[0];
 const header=document.createElement('div');header.className='fusion-breadcrumb';header.innerHTML='<strong>Твоя учебная станция / Главная</strong><span class="fusion-micro-status">✦ 27 билетов · один маршрут</span>';
 old.before(header);
 const hero=document.createElement('section');hero.className='fusion-hero';hero.innerHTML=`<div class="fusion-hero-copy"><span class="fusion-hero-pill">✧ &nbsp; ПРОДОЛЖАЙ ИССЛЕДОВАНИЕ</span><h1>Микромир ближе,<br><em>чем кажется.</em></h1><p>Понимай строение клетки, исследуй 3D-модели и готовься к экзамену в своём темпе.</p><div class="fusion-hero-actions"><button class="fusion-cta primary" id="fusion-open-next">${icon('book',17)} Продолжить урок</button><button class="fusion-cta" id="fusion-open-exam">Начать экзамен ${icon('arrow',16)}</button></div></div><div class="fusion-hero-art">${heroIllustration()}<span class="fusion-float-label"><b>01 · Бактериальная клетка</b>Структуры, функции, взаимодействия</span></div>`;
 old.replaceWith(hero);
 const stats=document.createElement('div');stats.className='fusion-stats';stats.innerHTML=`<div class="fusion-stat"><div class="fusion-stat-icon">${icon('book',22)}</div><div><b>${c.done}<span style="font-size:14px;font-weight:700;color:var(--fusion-muted)">/${c.total}</span></b><small>Изучено уроков</small></div></div><div class="fusion-stat"><div class="fusion-stat-icon">${icon('ticket',21)}</div><div><b>${c.tickets}<span style="font-size:14px;font-weight:700;color:var(--fusion-muted)">/27</span></b><small>Билетов повторено</small></div></div><div class="fusion-stat"><div class="fusion-stat-icon">${icon('check',23)}</div><div><b>${c.bank}<span style="font-size:14px;font-weight:700;color:var(--fusion-muted)">/67</span></b><small>Заданий опробовано</small></div></div>`;
 hero.after(stats);
 // The five duplicate route cards were removed. Sections now live in one menu;
 // the homepage is a dashboard for the next actual learning action, not a second menu.
 const focus=document.createElement('section');focus.className='fusion-focus';focus.innerHTML=`<div class="fusion-focus-title"><span class="fusion-section-tag">ПЕРСОНАЛЬНЫЙ МАРШРУТ</span><h2>Три шага на сегодня</h2><p>Короткая сессия: изучи тему, закрепи карточками и проверь понимание. К повторению сейчас: <b>${c.due}</b>.</p></div><div class="fusion-checks"><button class="fusion-check" id="fusion-plan-lesson"><span class="dot">${icon('book',19)}</span><span><b>Изучи одну тему</b><small>${esc(next.title)}</small></span><span class="arrow">→</span></button><button class="fusion-check" id="fusion-plan-recall"><span class="dot">${icon('repeat',20)}</span><span><b>Повтори карточки</b><small>${c.due?`Запланировано ${c.due} повторений`:'Открой режим интервального повторения'}</small></span><span class="arrow">→</span></button><button class="fusion-check" id="fusion-plan-test"><span class="dot">${icon('check',20)}</span><span><b>Проверь знания</b><small>Тематические вопросы с объяснениями</small></span><span class="arrow">→</span></button></div>`;
 stats.after(focus);
 // Move the already wired controls rather than cloning them, preserving original import/export and filters.
 const shortcuts=root.querySelector('.study-shortcuts'),bar=root.querySelector('.toolbar'),list=root.querySelector('#topiclist'),originalLibraryHeading=bar?.previousElementSibling,source=root.querySelector('.source');
 const library=document.createElement('section');library.className='fusion-library';library.id='fusion-library';library.innerHTML=`<div class="fusion-headline"><div><span class="fusion-section-tag">НАУЧНЫЙ АТЛАС · 31 УРОК</span><h2>Библиотека тем</h2><p>Выбери раздел или найди конкретный термин.</p></div></div>`;
 focus.after(library);
 if(shortcuts){shortcuts.classList.add('fusion-study-tools');library.append(shortcuts)}
 if(bar)library.append(bar);if(list)library.append(list);
 if(source){source.classList.add('fusion-source-note');library.append(source)}
 if(originalLibraryHeading&&originalLibraryHeading.tagName==='H2')originalLibraryHeading.remove();
 root.querySelector('.dashboard-note')?.remove();root.querySelector('#home-discovery')?.remove();
 const open=(id,fn)=>{document.getElementById(id).onclick=fn};
 open('fusion-open-next',()=>lesson(next));open('fusion-open-exam',()=>examSetup());
 open('fusion-plan-lesson',()=>lesson(next));open('fusion-plan-recall',()=>dueReview());open('fusion-plan-test',()=>bankHome());
 scrollTo(0,0);
}
function practiceHub(){
 root.className='fusion-practice-hub';root.innerHTML=`<button class="back" id="practice-back">← На главную</button><div class="fusion-practice-hero"><div class="eyebrow">MICRO LAB / ПРАКТИКА</div><h1>Проверяй знания без лишних переходов</h1><p>Все способы самопроверки собраны здесь. Выбирайте формат: экзамен, тесты с вариантами или повторение карточек.</p></div><div class="fusion-practice-grid">
 <button class="fusion-practice-card" id="practice-exam"><span>01 / ЭКЗАМЕН</span><strong>Начать экзамен</strong><small>10, 20 или 30 вопросов из выбранных тем. Если нет готового теста, отвечайте своими словами и сверяйте конспект.</small><b>Выбрать параметры →</b></button>
 <button class="fusion-practice-card" id="practice-bank"><span>02 / ТРЕНАЖЁР</span><strong>Предметные вопросы</strong><small>67 авторских заданий с разбором ответов и повторением ошибок.</small><b>Открыть тренажёр →</b></button>
 <button class="fusion-practice-card" id="practice-repeat"><span>03 / ПОВТОРЕНИЕ</span><strong>Карточки памяти</strong><small>Вернитесь к определениям, которые пора повторить по расписанию.</small><b>Открыть карточки →</b></button></div>`;
 document.getElementById('practice-back').onclick=home;
 document.getElementById('practice-exam').onclick=examSetup;
 document.getElementById('practice-bank').onclick=bankHome;
 document.getElementById('practice-repeat').onclick=dueReview;
 scrollTo(0,0);
}
function missions(){
 window.MicroAnimationController?.stop?.();
 const c=studyCounts();const items=[
 {name:'Первые открытия',tag:'УЧЁБНЫЙ МАРШРУТ',target:5,value:c.done,desc:'Изучи пять уроков и закрепи основные понятия.',button:'Открыть уроки',action:()=>home()},
 {name:'Аналитический ум',tag:'ТРЕНАЖЁР',target:10,value:c.bank,desc:'Попробуй десять разных авторских вопросов, анализируя объяснения.',button:'Начать тренировку',action:()=>bankHome()},
 {name:'Уверенный ответ',tag:'ЭКЗАМЕНАЦИОННЫЕ БИЛЕТЫ',target:3,value:c.tickets,desc:'Заверши самопроверку трёх билетов после сверки с конспектом.',button:'К билетам',action:()=>ticketLibrary()}
 ];
 root.className='fusion-mission-view';root.innerHTML=`<button class="back" id="fusion-mission-back">← На главную</button><div class="fusion-mission-hero"><div class="eyebrow">MICRO MISSION · БЕЗ ИСКУССТВЕННЫХ ОЧКОВ</div><h1>Твои исследовательские миссии</h1><p>Небольшие цели на основе настоящего прогресса. Здесь нет вымышленных XP: завершение каждого маршрута определяется уроками, тестами и самопроверкой билетов на этом устройстве.</p></div><div class="fusion-headline"><div><span class="fusion-section-tag">3 МИССИИ</span><h2>Выбирай темп</h2><p>Прогресс обновляется после завершения реальных учебных действий.</p></div></div><div class="fusion-mission-list">${items.map((m,i)=>{const n=Math.min(m.value,m.target);return `<article class="fusion-mission"><div class="fusion-mission-top"><span>${m.tag}</span><span>${n===m.target?'✓ ВЫПОЛНЕНО':String(i+1).padStart(2,'0')+' / 03'}</span></div><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p><div class="fusion-mission-meter" aria-label="Выполнено ${n} из ${m.target}"><span style="width:${100*n/m.target}%"></span></div><div class="fusion-mission-foot"><small><b>${n} / ${m.target}</b> выполнено</small><button class="btn primary" data-mission="${i}">${m.button} →</button></div></article>`}).join('')}</div><div class="fusion-headline"><div><span class="fusion-section-tag">ДОПОЛНИТЕЛЬНЫЙ ОПЫТ</span><h2>Исследование без оценки</h2><p>Практикуйся в пространстве 3D и виртуальном микроскопе.</p></div></div><div class="fusion-route-grid">${routeCard({id:'fusion-mission-3d',cls:'fusion-route-atlas',icon:'cube',label:'НЕОНОВАЯ ЛАБОРАТОРИЯ',title:'Рассмотри клетку',copy:'Открой оболочки и проверь знание структур.'})}${routeCard({id:'fusion-mission-scope',cls:'fusion-route-scope',icon:'microscope',label:'МИКРОСКОП',title:'Сравни образцы',copy:'Морфология, фокус и учебные изображения.'})}</div><p class="source">Данные сохраняются локально в браузере. Это личные учебные ориентиры, а не официальная оценка знаний.</p>`;
 document.getElementById('fusion-mission-back').onclick=home;root.querySelectorAll('[data-mission]').forEach(b=>b.onclick=items[+b.dataset.mission].action);
 document.getElementById('fusion-mission-3d').onclick=()=>MicroDiscovery.open('atlas');document.getElementById('fusion-mission-scope').onclick=()=>MicroDiscovery.open('microscope');scrollTo(0,0);
}
function installNav(){
 const nav=document.querySelector('.global-nav');if(!nav)return;
 const primary=[['nav-home','⌂ Главная'],['nav-tickets','▦ Билеты'],['nav-bank','✦ Практика'],['nav-discovery','⬡ Лаборатория'],['nav-more','☷ Ещё']];
 for(const [id,label] of primary){const b=nav.querySelector('#'+id);if(b)b.textContent=label}
 nav.querySelector('#nav-home').onclick=home;
 nav.querySelector('#nav-bank').onclick=practiceHub;
 nav.querySelector('#nav-discovery').onclick=()=>MicroDiscovery.open('atlas');
 for(const b of [...nav.querySelectorAll(':scope > button')]){
  if(!primary.some(([id])=>id===b.id))b.remove();
 }
 const more=nav.querySelector('#nav-more'),menu=nav.querySelector('#nav-overflow');
 if(menu){menu.innerHTML='<button type="button" data-extra="stats">▤ Мой прогресс</button><button type="button" data-extra="missions">♢ Миссии</button><button type="button" data-extra="glossary">▤ Атлас терминов</button><button type="button" data-extra="svg">◉ 12 интерактивных схем</button>';
  menu.querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>{menu.hidden=true;more.setAttribute('aria-expanded','false');const action=b.dataset.extra;if(action==='stats')statistics();if(action==='missions')missions();if(action==='glossary')MicroGlossary.open();if(action==='svg')MicroVisualLab.open()});
 }
 nav.addEventListener('click',e=>{const button=e.target.closest('button');if(button&&button.parentElement===nav&&button.id!=='nav-more')requestAnimationFrame(updateRoute)});
}
function updateRoute(){
 const isDiscovery=!!root.querySelector('.disco-tabs');
 const isScope=isDiscovery&&!!root.querySelector('[data-explore="microscope"].active');
 root.classList.toggle('fusion-discovery-view',isDiscovery);
 root.classList.toggle('fusion-scope-view',isScope);
 root.classList.toggle('fusion-home',!!root.querySelector('.fusion-hero'));
 const practice=!!root.querySelector('.fusion-practice-hero,#begin-exam,#exit-exam,#bank-kind,#exam-feedback,#exam-again,#due-back');
 const r=isDiscovery?'nav-discovery':root.classList.contains('fusion-home')?'nav-home':root.querySelector('#ticket-search')?'nav-tickets':practice?'nav-bank':null;
 document.querySelectorAll('.global-nav>button').forEach(b=>{const selected=b.id===r;b.classList.toggle('fusion-nav-active',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
installHeader();installNav();
const previousHome=home;
home=function(){previousHome();installHome();updateRoute()};
const observer=new MutationObserver(()=>{if(window.__fusionPending)return;window.__fusionPending=true;requestAnimationFrame(()=>{window.__fusionPending=false;updateRoute()})});
observer.observe(root,{childList:true,subtree:true});
window.MicroFusion={home:()=>home(),practice:practiceHub,missions,theme:()=>theme};
home();
})();
