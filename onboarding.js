/* MICRO LAB guided tour — first visit, restartable, keyboard accessible. */
(()=>{'use strict';
const KEY='micro-lab-tour-v1';
const steps=[
 {selector:'.brand',title:'Добро пожаловать в MICRO LAB',body:'Здесь вы изучаете микробиологию по темам и экзаменационным билетам. Сейчас покажем основные разделы — это займёт около минуты.'},
 {selector:'#nav-home',title:'Темы и лекции',body:'Откройте тему, выберите научное объяснение или вариант простым языком, затем переходите к тесту и карточкам.'},
 {selector:'#nav-tickets',title:'27 экзаменационных билетов',body:'Найдите нужный билет, попробуйте ответить самостоятельно и сверьтесь с исходным конспектом.'},
 {selector:'#nav-bank',title:'Предметный тренажёр',body:'Отвечайте на вопросы по микробиологии. После ответа появится пояснение; ошибки можно повторить.'},
 {selector:'#nav-exam',title:'Пробный экзамен',body:'Выберите количество вопросов и проверьте знания в смешанном режиме.'},
 {selector:'#nav-stats',title:'Статистика',body:'Здесь отображается прогресс, изученные темы и результаты самостоятельной подготовки.'},
 {selector:'#nav-due',title:'Повторение',body:'Карточки возвращаются по расписанию, чтобы закреплять сложные определения и механизмы.'},
 {selector:'.global-nav button:last-child',title:'Визуальная лаборатория',body:'Откройте анимированные схемы, изменяйте параметры ползунком и наблюдайте стадии процесса. Это учебные модели, а не экспериментальные данные.'}
];
let index=0,overlay=null,active=null,priorFocus=null;
const read=()=>{try{return localStorage.getItem(KEY)==='done'}catch{return false}};
const save=()=>{try{localStorage.setItem(KEY,'done')}catch{}};
const css=document.createElement('style');css.textContent=`
.tour-help{border:1px solid #44657b;background:#1a2c42;color:#e9f7ff;border-radius:11px;padding:9px 12px;font-weight:700;cursor:pointer}
.tour-mask{position:fixed;inset:0;background:rgba(4,9,19,.76);z-index:998;}
.tour-spotlight{position:fixed;z-index:1000;pointer-events:none;border:3px solid #80f4d9;border-radius:14px;box-shadow:0 0 0 5px #70ddc329,0 0 30px #73f1d077;transition:top .2s,left .2s,width .2s,height .2s}
.tour-target{position:relative!important;z-index:999!important;isolation:isolate;box-shadow:0 0 0 5px #73e6d044!important;border-radius:10px!important;background:#24435a!important;color:#fff!important}
.tour-pop{position:fixed;z-index:1001;width:min(390px,calc(100vw - 28px));max-height:min(60vh,440px);overflow:auto;background:#17263c;color:#f1f8ff;border:1px solid #78e5d0;border-radius:18px;box-shadow:0 20px 70px #000a;padding:21px}
.tour-pop h2{font-size:21px;margin:6px 0 10px;letter-spacing:0}.tour-pop p{line-height:1.55;margin:0 0 17px;color:#d3e1ef}.tour-pop .tour-count{color:#80e7d4;font-size:12px;font-weight:800;letter-spacing:1px}.tour-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.tour-actions button{border:1px solid #56738b;border-radius:11px;padding:10px 13px;background:#223b55;color:#fff;font-weight:700}.tour-actions .tour-next{background:#7de7d2;color:#0d2630;border-color:#7de7d2;margin-left:auto}.tour-actions .tour-skip{background:transparent;border-color:transparent;color:#bbcbda}
@media(prefers-reduced-motion:reduce){.tour-spotlight{transition:none}}
`;document.head.append(css);
function position(){if(!overlay||!active)return;const r=active.getBoundingClientRect(),spot=overlay.querySelector('.tour-spotlight'),pop=overlay.querySelector('.tour-pop'),pad=5;Object.assign(spot.style,{left:Math.max(2,r.left-pad)+'px',top:Math.max(2,r.top-pad)+'px',width:Math.min(innerWidth-4,r.width+pad*2)+'px',height:r.height+pad*2+'px'});const w=pop.offsetWidth,h=pop.offsetHeight,below=r.bottom+20,above=r.top-h-20;let top=below+h<innerHeight-12?below:above>10?above:Math.max(12,(innerHeight-h)/2);let left=Math.max(14,Math.min(innerWidth-w-14,r.left+r.width/2-w/2));Object.assign(pop.style,{top:Math.round(top)+'px',left:Math.round(left)+'px'});}
function close(){if(!overlay)return;active?.classList.remove('tour-target');active=null;overlay.remove();overlay=null;document.removeEventListener('keydown',keys);window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);save();priorFocus?.focus?.({preventScroll:true});}
function keys(e){if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'&&overlay){const buttons=[...overlay.querySelectorAll('.tour-pop button')];if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
function show(i){if(!overlay)return;active?.classList.remove('tour-target');index=i;const s=steps[index];active=document.querySelector(s.selector);if(!active){if(i<steps.length-1)return show(i+1);return close()};active.scrollIntoView({behavior:'instant',block:'nearest',inline:'center'});active.classList.add('tour-target');const pop=overlay.querySelector('.tour-pop');pop.innerHTML=`<div class="tour-count">ШАГ ${index+1} ИЗ ${steps.length}</div><h2 id="tour-title"></h2><p id="tour-desc"></p><div class="tour-actions"><button type="button" class="tour-skip">Пропустить</button>${index?'<button type="button" class="tour-prev">← Назад</button>':''}<button type="button" class="tour-next">${index===steps.length-1?'Готово ✓':'Далее →'}</button></div>`;pop.querySelector('#tour-title').textContent=s.title;pop.querySelector('#tour-desc').textContent=s.body;pop.querySelector('.tour-skip').onclick=close;pop.querySelector('.tour-prev')?.addEventListener('click',()=>show(index-1));pop.querySelector('.tour-next').onclick=()=>index===steps.length-1?close():show(index+1);requestAnimationFrame(()=>{position();pop.querySelector('.tour-next')?.focus({preventScroll:true})});}
function start(){if(overlay)return;priorFocus=document.activeElement;overlay=document.createElement('div');overlay.className='tour-mask';overlay.innerHTML='<div class="tour-spotlight" aria-hidden="true"></div><section class="tour-pop" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-desc"></section>';document.body.append(overlay);document.addEventListener('keydown',keys);window.addEventListener('resize',position);window.addEventListener('scroll',position,true);show(0)}
const help=document.createElement('button');help.type='button';help.className='tour-help';help.textContent='? Как пользоваться';help.setAttribute('aria-label','Повторить обучение по приложению');help.onclick=start;document.querySelector('header')?.append(help);
// Wait for the last script (visuals.js) to add its navigation item.
const launch=()=>{if(!read())start()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(launch,180),{once:true});else setTimeout(launch,180);
window.MicroTour={start};
})();
