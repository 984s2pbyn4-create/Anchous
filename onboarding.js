/* MICRO LAB FUSION 3.1 — current-app contextual tour (desktop / iPad / iPhone). */
(()=>{'use strict';
const KEY='micro-lab-tour-fusion-v2';
const steps=[
 {selectors:['.fusion-hero'],title:'Добро пожаловать в MICRO LAB FUSION',body:'Это главная учебная станция. Здесь можно изучать 31 тему, готовиться по 27 билетам и исследовать микромир. Покажем, где находятся новые инструменты.'},
 {selectors:['#fusion-route-3d'],title:'NEON LAB — интерактивный 3D',body:'Откройте атлас: вращайте модель бактерии, переключайте строение Gram+ и Gram−, скрывайте оболочки и находите структуры по заданиям.'},
 {selectors:['#fusion-route-scope'],title:'SCOPE STATION — виртуальный микроскоп',body:'Изучайте три синтетических учебных образца, меняйте фокус и увеличение и определяйте форму бактерий. Это тренажёр, а не настоящая микрофотография.'},
 {selectors:['#fusion-route-tickets'],title:'SCIENCE ATLAS — билеты',body:'Все 27 билетов содержат текст исходного конспекта. Можно изучить вопросы, потренировать устный ответ и сверить его с источником.'},
 {selectors:['#fusion-route-trainer'],title:'Предметный тренажёр',body:'Практикуйтесь на 67 авторских заданиях с объяснениями и разбором ошибок. Это учебные вопросы, а не дословная копия экзамена.'},
 {selectors:['#fusion-route-mission'],title:'MICRO MISSION — учебные цели',body:'Выполняйте три миссии: проходите уроки, отвечайте на вопросы и проверяйте билеты. Прогресс считается по реальным действиям, без искусственных очков.'},
 {selectors:['.fusion-focus'],title:'План на сегодня',body:'Здесь короткий маршрут: одна тема, карточки для повторения и самопроверка. Прогресс сохраняется в браузере этого устройства.'},
 {selectors:['#fusion-search'],title:'Быстрый поиск',body:'Лупа в верхней панели возвращает к библиотеке тем и ставит курсор в поле поиска.'},
 {selectors:['#fusion-theme'],title:'Светлая и тёмная темы',body:'По умолчанию включена тёмная тема. Нажмите значок солнца, чтобы перейти к светлой, и значок луны — чтобы вернуться. Выбор сохраняется.'},
 {selectors:['#nav-more','.global-nav'],title:'Навигация по разделам',body:'На компьютере разделы доступны в боковом меню. На iPhone и iPad — в нижней панели; кнопка «Ещё» открывает дополнительные разделы: экзамен, статистику, повторение, миссии и визуальную лабораторию.'},
 {selectors:['.tour-help'],title:'Обучение можно повторить',body:'Кнопка «?» в верхней панели снова откроет эту экскурсию в любой момент. Готово — можно начинать исследование!'}
];
let overlay=null,stepIndex=0,active=null,priorFocus=null,resizePending=false;
const read=()=>{try{return localStorage.getItem(KEY)==='done'}catch{return false}};
const save=()=>{try{localStorage.setItem(KEY,'done')}catch{}};
const css=document.createElement('style');css.textContent=`
.tour-mask-segment{position:fixed;background:rgba(4,9,23,.80);z-index:995;pointer-events:auto;}
.tour-spotlight{position:fixed;z-index:996;border:3px solid #74ecde;box-shadow:0 0 0 4px #6deedb44,0 0 35px #64dccc77;border-radius:16px;pointer-events:none;}
.tour-guard{position:fixed;z-index:997;background:transparent;pointer-events:auto;cursor:default;}
.tour-pop{position:fixed;z-index:1001;width:min(390px,calc(100vw - 24px));max-height:min(69dvh,480px);overflow:auto;background:linear-gradient(145deg,#202d49,#111e33);color:#f4f9ff;border:1px solid #6688a9;border-radius:20px;box-shadow:0 22px 70px #000a;padding:20px;}
.tour-pop h2{font-size:20px;color:#fff;line-height:1.22;letter-spacing:-.025em;margin:9px 0 11px;}
.tour-pop p{color:#cddbef;line-height:1.56;margin:0 0 18px;font-size:13px;}
.tour-count{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#92eadb;font-size:11px;font-weight:850;letter-spacing:.1em;}
.tour-meter{display:flex;gap:3px;height:4px;margin:11px 0 14px;}
.tour-meter i{display:block;height:100%;flex:1;background:#3a4c67;border-radius:12px;}
.tour-meter i.current{background:#78e7d7;}
.tour-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.tour-actions button{font-size:12px;cursor:pointer;border:1px solid #637b96;border-radius:11px;padding:10px 13px;background:#2a3a55;color:#fff;font-weight:750;}
.tour-actions .tour-next{background:#83e6d7;border-color:#83e6d7;color:#0c2531;margin-left:auto;}
.tour-actions .tour-skip{border-color:transparent;color:#d8e3f1;background:transparent;padding-left:4px;padding-right:4px;}
.tour-actions button:focus-visible{outline:3px solid #ffe0a2;outline-offset:2px;}
@media(max-width:610px){.tour-pop{padding:16px;border-radius:17px;max-height:54dvh;}.tour-pop h2{font-size:18px}.tour-pop p{font-size:12px}.tour-actions button{padding:9px 11px;}}
@media(prefers-reduced-motion:reduce){.tour-spotlight,.tour-pop{transition:none!important;}}
`;
document.head.append(css);
function isVisible(el){if(!el)return false;const style=getComputedStyle(el);const rect=el.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;}
function findTarget(s){return s.selectors.map(q=>document.querySelector(q)).find(isVisible)||null;}
function place(){if(!overlay||!active)return;const r=active.getBoundingClientRect();const pad=6,left=Math.max(4,r.left-pad),top=Math.max(4,r.top-pad),right=Math.min(innerWidth-4,r.right+pad),bottom=Math.min(innerHeight-4,r.bottom+pad),rect={left,top,right,bottom};
 const seg=overlay.querySelectorAll('.tour-mask-segment');const set=(e,l,t,w,h)=>Object.assign(e.style,{left:`${Math.max(0,l)}px`,top:`${Math.max(0,t)}px`,width:`${Math.max(0,w)}px`,height:`${Math.max(0,h)}px`});
 set(seg[0],0,0,innerWidth,top);set(seg[1],0,top,left,bottom-top);set(seg[2],right,top,innerWidth-right,bottom-top);set(seg[3],0,bottom,innerWidth,innerHeight-bottom);
 const guard=overlay.querySelector('.tour-guard'),spot=overlay.querySelector('.tour-spotlight');set(guard,left,top,right-left,bottom-top);set(spot,left,top,right-left,bottom-top);
 const pop=overlay.querySelector('.tour-pop');const w=pop.offsetWidth,h=pop.offsetHeight;let y;
 if(innerHeight-bottom>=h+16)y=bottom+12;else if(top>=h+16)y=top-h-12;else y=Math.max(8,Math.min(innerHeight-h-8,innerHeight/2-h/2));
 const x=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2));Object.assign(pop.style,{top:`${Math.round(y)}px`,left:`${Math.round(x)}px`});
}
function schedulePlace(){if(resizePending)return;resizePending=true;requestAnimationFrame(()=>{resizePending=false;place()});}
function close(){if(!overlay)return;overlay.remove();overlay=null;active=null;document.removeEventListener('keydown',keys,true);window.removeEventListener('resize',schedulePlace);window.removeEventListener('scroll',schedulePlace,true);save();priorFocus?.focus?.({preventScroll:true});}
function keys(e){if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close();return}if(e.key==='ArrowRight'&&e.target.tagName!=='INPUT'){e.preventDefault();stepIndex<steps.length-1?show(stepIndex+1):close();return}if(e.key==='ArrowLeft'&&e.target.tagName!=='INPUT'){e.preventDefault();if(stepIndex>0)show(stepIndex-1);return}
 if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('.tour-pop button')];if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
}
function show(i){if(!overlay)return;const s=steps[i];if(!s){close();return}stepIndex=i;active=findTarget(s);if(!active){const next=i+1;if(next<steps.length)return show(next);return close()}
 const rect=active.getBoundingClientRect();if(rect.top<85||rect.bottom>innerHeight-80)active.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
 const pop=overlay.querySelector('.tour-pop');pop.innerHTML=`<div class="tour-count"><span>ЭКСКУРСИЯ ПО FUSION</span><span>ШАГ ${i+1} / ${steps.length}</span></div><div class="tour-meter" aria-hidden="true">${steps.map((_,n)=>`<i class="${n<=i?'current':''}"></i>`).join('')}</div><h2 id="tour-title"></h2><p id="tour-desc"></p><div class="tour-actions"><button class="tour-skip" type="button">Пропустить</button>${i?'<button class="tour-prev" type="button">← Назад</button>':''}<button class="tour-next" type="button">${i===steps.length-1?'Начать ✓':'Далее →'}</button></div>`;
 pop.querySelector('#tour-title').textContent=s.title;pop.querySelector('#tour-desc').textContent=s.body;
 pop.querySelector('.tour-skip').onclick=close;pop.querySelector('.tour-prev')?.addEventListener('click',()=>show(i-1));pop.querySelector('.tour-next').onclick=()=>i===steps.length-1?close():show(i+1);
 requestAnimationFrame(()=>{place();pop.querySelector('.tour-next')?.focus({preventScroll:true})});
}
function start(){if(overlay)return;priorFocus=document.activeElement;if(!document.querySelector('.fusion-hero'))window.MicroFusion?.home?.();
 overlay=document.createElement('div');overlay.className='tour-overlay';overlay.innerHTML='<div class="tour-mask-segment"></div><div class="tour-mask-segment"></div><div class="tour-mask-segment"></div><div class="tour-mask-segment"></div><div class="tour-guard" aria-hidden="true"></div><div class="tour-spotlight" aria-hidden="true"></div><section class="tour-pop" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-desc"></section>';
 document.body.append(overlay);document.addEventListener('keydown',keys,true);window.addEventListener('resize',schedulePlace);window.addEventListener('scroll',schedulePlace,true);show(0);
}
const help=document.createElement('button');help.type='button';help.className='tour-help';help.textContent='?';help.title='Повторить экскурсию по интерфейсу';help.setAttribute('aria-label','Повторить обучение по приложению');help.onclick=start;document.querySelector('header')?.append(help);
const launch=()=>{if(!read())start()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(launch,180),{once:true});else setTimeout(launch,180);
window.MicroTour={start,close,getStep:()=>stepIndex,steps:steps.map(({title})=>title)};
})();
