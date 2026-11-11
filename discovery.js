/* MICRO LAB Discovery 2.0: offline-first interactive educational WebGL atlas and practical simulations.
   Models and microscope fields are original simplified drawings, not diagnostic images or lab protocols. */
(()=>{'use strict';
const $=(s,root=document)=>root.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const sceneItems=[
 {id:'capsule',label:'Капсула',color:'#7ce8cd',desc:'Дополнительная наружная структура у некоторых бактерий. Участвует в защите от неблагоприятных факторов и может помогать избегать фагоцитоза. Есть не у всех бактерий.', pos:[-1.15,.5,.45]},
 {id:'wall',label:'Клеточная стенка',color:'#f8b76e',desc:'Поддерживает форму бактерии. Содержит пептидогликан; у грамположительных бактерий его слой обычно значительно толще.',pos:[.4,.75,.28]},
 {id:'outer',label:'Наружная мембрана',color:'#e79bd0',desc:'Внешний мембранный слой грамотрицательных бактерий. Содержит липополисахарид; в грамположительной модели отсутствует.',pos:[.7,.78,.3]},
 {id:'membrane',label:'Цитоплазматическая мембрана',color:'#64a5f4',desc:'Избирательный барьер вокруг цитоплазмы; участвует в транспорте веществ и энергетических процессах.',pos:[.9,.4,.4]},
 {id:'nucleoid',label:'Нуклеоид',color:'#fee78e',desc:'Область расположения основной бактериальной хромосомной ДНК. Не окружена ядерной мембраной. Нуклеоид не следует путать с нуклеотидом.',pos:[.05,.0,.53]},
 {id:'ribosome',label:'Рибосомы',color:'#f1a4a9',desc:'Рибосомы бактерии осуществляют синтез белка. В учебной модели представлены условными маленькими гранулами.',pos:[-.7,.42,.54]},
 {id:'plasmid',label:'Плазмида',color:'#bfacff',desc:'Небольшая внехромосомная молекула ДНК; плазмиды встречаются не у всех бактерий и могут нести дополнительные признаки.',pos:[-.68,-.25,.54]},
 {id:'flagellum',label:'Жгутик',color:'#83d9f7',desc:'Жгутики обеспечивают движение некоторых бактерий. Их расположение и количество зависят от вида.',pos:[2.28,.34,.13]}
];
const quizOrder=['nucleoid','wall','ribosome','flagellum','membrane'];
const state={mode:'positive',hidden:new Set(),selected:'nucleoid',quizIndex:0,quiz:false, yaw:-.29,pitch:.25,zoom:6.7};
let currentRenderer=null;
function markup(title,body){return `<button class="back" id="disco-back">← К темам</button><div class="eyebrow">MICRO LAB / FUSION · LAB</div><h1>${title}</h1><p class="muted">${body}</p><div class="disco-tabs" role="group" aria-label="Разделы исследовательской лаборатории"><button data-explore="atlas">◉ 3D-атлас</button><button data-explore="microscope">🔬 Микроскоп</button><button data-explore="cases">◇ Учебные кейсы</button><button data-explore="method">▤ Собери схему</button><button id="disco-to-svg">◌ 12 схем</button></div><div id="disco-content"></div>`}
function enter(tab='atlas'){
 window.MicroAnimationController?.stop?.();
 const app=$('#app');app.innerHTML=markup('Лаборатория открытий','Вращайте 3D-модель, меняйте слои, исследуйте микроскопическое поле и решайте задачи. Модели концептуальные, не в масштабе и не являются диагностическими протоколами.');
 $('#disco-back').onclick=()=>home();
 document.querySelectorAll('[data-explore]').forEach(b=>b.onclick=()=>switchTab(b.dataset.explore));
 $('#disco-to-svg').onclick=()=>window.MicroVisualLab?.open?.();
 switchTab(tab);window.scrollTo(0,0);
}
function switchTab(tab){
 document.querySelectorAll('[data-explore]').forEach(b=>{b.classList.toggle('active',b.dataset.explore===tab);b.setAttribute('aria-pressed',String(b.dataset.explore===tab))});
 const target=$('#disco-content');target.replaceChildren();currentRenderer=null;
 if(tab==='atlas')atlas(target);else if(tab==='microscope')microscope(target);else if(tab==='cases')cases(target);else method(target);
}
function atlas(host){
 const info=sceneItems.find(x=>x.id===state.selected);
 host.innerHTML=`<section class="disco-panel"><div class="disco-title-row"><div><div class="eyebrow">НАСТОЯЩАЯ WEBGL 3D-МОДЕЛЬ · УЧЕБНАЯ РЕКОНСТРУКЦИЯ</div><h2>Бактериальная клетка</h2></div><div class="disco-status" id="webgl-status">Загрузка 3D</div></div><p class="muted small">Перетащите модель для вращения, прокрутите колесо или используйте кнопки увеличения. Слои можно скрыть, чтобы увидеть внутренние структуры. Размеры условны.</p><div class="gram-switch" role="group" aria-label="Тип оболочки"><button id="gram-plus" class="${state.mode==='positive'?'active':''}">Грам +</button><button id="gram-minus" class="${state.mode==='negative'?'active':''}">Грам −</button></div><div class="disco-3d-wrap"><canvas id="bacteria-webgl" aria-label="Трёхмерная модель бактериальной клетки: поворот перетаскиванием или клавишами-стрелками" tabindex="0"></canvas><div class="disco-hint">↔ вращать · + / − масштаб</div><div class="model-hotspots" aria-hidden="true"></div></div><div class="disco-controls"><button class="btn" id="rotate-left" aria-label="Повернуть влево">↶</button><button class="btn" id="rotate-right" aria-label="Повернуть вправо">↷</button><button class="btn" id="zoom-in" aria-label="Увеличить">+</button><button class="btn" id="zoom-out" aria-label="Уменьшить">−</button><button class="btn" id="reset-view">Сбросить ракурс</button></div><div class="disco-columns"><div><h3>Структуры</h3><div class="disco-parts" id="disco-parts"></div><p class="muted small">Скрытие элементов влияет только на учебную модель. Капсула, плазмиды и жгутики встречаются не у всех бактерий.</p></div><aside class="disco-info" aria-live="polite"><div class="eyebrow">СТРОЕНИЕ И ФУНКЦИЯ</div><h3 id="disco-name">${info.label}</h3><p id="disco-description">${info.desc}</p><button class="btn" id="disco-quiz">Проверь себя: найди структуру</button><div id="disco-quiz-feedback" role="status"></div></aside></div><p class="source">Схематическая 3D-реконструкция, созданная для MICRO LAB. Не изображение конкретного вида бактерии. Дополнительное пояснение: OpenStax Microbiology, раздел «Unique Characteristics of Prokaryotic Cells». Исходный текст билета № 15 сохраняется отдельно.</p><div class="disco-controls"><button class="btn" id="source-ticket-15">Открыть исходный билет № 15 →</button><button class="btn" id="to-micro">Перейти к микроскопу →</button></div></section>`;
 function drawList(){
  const root=$('#disco-parts');root.innerHTML=sceneItems.filter(x=>x.id!=='outer'||state.mode==='negative').map(x=>`<div class="part-row"><button class="part-select ${x.id===state.selected?'active':''}" data-part="${x.id}" style="--part-color:${x.color}">${x.label}</button>${['capsule','wall','membrane','outer','ribosome','plasmid','flagellum'].includes(x.id)?`<button class="part-toggle" data-toggle="${x.id}" aria-label="${state.hidden.has(x.id)?'Показать':'Скрыть'} ${x.label}" aria-pressed="${!state.hidden.has(x.id)}">${state.hidden.has(x.id)?'◌':'◉'}</button>`:''}</div>`).join('');
  root.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>selectPart(b.dataset.part));
  root.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.toggle;state.hidden.has(id)?state.hidden.delete(id):state.hidden.add(id);drawList();currentRenderer?.draw()});
 }
 function selectPart(id){
  if(state.quiz){const target=quizOrder[state.quizIndex%quizOrder.length],ok=id===target;$('#disco-quiz-feedback').textContent=ok?'✓ Верно! '+sceneItems.find(x=>x.id===id).label+'.':'Не совсем. Попробуйте ещё раз — посмотрите на расположение структуры.';if(ok){state.quizIndex++;state.quiz=false;$('#disco-quiz').textContent='Следующее задание →';}}
  state.selected=id;const item=sceneItems.find(x=>x.id===id);$('#disco-name').textContent=item.label;$('#disco-description').textContent=item.desc;drawList();currentRenderer?.draw();
 }
 drawList();
 $('#gram-plus').onclick=()=>{state.mode='positive';state.hidden.delete('wall');atlas(host)};
 $('#gram-minus').onclick=()=>{state.mode='negative';state.hidden.delete('outer');atlas(host)};
 $('#disco-quiz').onclick=()=>{state.quiz=true;$('#disco-quiz-feedback').textContent='Найдите: '+sceneItems.find(x=>x.id===quizOrder[state.quizIndex%quizOrder.length]).label;$('#disco-quiz').textContent='Задание активно';};
 $('#source-ticket-15').onclick=()=>ticketView(15);
 $('#to-micro').onclick=()=>switchTab('microscope');
 const r=createRenderer($('#bacteria-webgl'),host,state,selectPart);currentRenderer=r;
 for(const [id,action] of [['rotate-left',()=>{state.yaw-=.25;r.draw()}],['rotate-right',()=>{state.yaw+=.25;r.draw()}],['zoom-in',()=>{state.zoom=Math.max(3.6,state.zoom-.65);r.draw()}],['zoom-out',()=>{state.zoom=Math.min(11,state.zoom+.65);r.draw()}],['reset-view',()=>{state.yaw=-.29;state.pitch=.25;state.zoom=6.7;r.draw()}]])$('#'+id).onclick=action;
}
function createRenderer(canvas,host,st,selectPart){
 const status=$('#webgl-status');let gl=null;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false})||canvas.getContext('experimental-webgl')}catch(e){}
 if(!gl){status.textContent='Режим 2D';const fallback=document.createElement('div');fallback.className='disco-fallback';fallback.innerHTML='<svg viewBox="0 0 600 320" role="img" aria-label="Схематический разрез бактерии"><ellipse cx="295" cy="157" rx="260" ry="106" fill="#2b686b" stroke="#80e6d2" stroke-width="8"/><ellipse cx="295" cy="157" rx="238" ry="85" fill="#284b78" stroke="#f8b76e" stroke-width="13"/><path d="M200 155C245 60 270 260 335 165S410 160 375 180" fill="none" stroke="#fee78e" stroke-width="10"/><circle cx="195" cy="140" r="9" fill="#edb0af"/><circle cx="335" cy="123" r="9" fill="#edb0af"/><path d="M548 155Q580 100 600 170" stroke="#82d9f7" stroke-width="4" fill="none"/></svg><p>WebGL на этом устройстве недоступен. Выберите структуры в списке ниже для изучения.</p>';canvas.replaceWith(fallback);return {draw:()=>{}}}
 const vs=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat3 uRot;uniform float uZoom;uniform float uAspect;varying float vLight;void main(){vec3 p=uRot*aPosition;float d=uZoom-p.z;gl_Position=vec4(p.x*2.5/uAspect,p.y*2.5,d-2.0,d);vec3 n=normalize(uRot*aNormal);vLight=0.68+0.32*max(dot(n,normalize(vec3(-0.5,0.8,1.0))),0.0);}`;
 const fs=`precision mediump float;uniform vec4 uColor;uniform float uSelected;varying float vLight;void main(){gl_FragColor=vec4(min(vec3(1.0),uColor.rgb*(vLight+uSelected*.35)),uColor.a);}`;
 function shader(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(o));return o}
 let pr;try{pr=gl.createProgram();gl.attachShader(pr,shader(gl.VERTEX_SHADER,vs));gl.attachShader(pr,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error('WebGL shader error')}catch(e){status.textContent='3D недоступно';console.error(e);return {draw:()=>{}}}
 gl.useProgram(pr);
 const posL=gl.getAttribLocation(pr,'aPosition'),normL=gl.getAttribLocation(pr,'aNormal'),colorL=gl.getUniformLocation(pr,'uColor'),rotL=gl.getUniformLocation(pr,'uRot'),zL=gl.getUniformLocation(pr,'uZoom'),aL=gl.getUniformLocation(pr,'uAspect'),selL=gl.getUniformLocation(pr,'uSelected');
 const meshes=[];
 function mesh(id,color,alpha,fn){const v=[],n=[];const point=(a,b,c,na,nb,nc)=>{v.push(a,b,c);n.push(na,nb,nc)};const tri=(p,q,r)=>{for(const u of [p,q,r])point(...u.p,...u.n)};fn(tri);const pb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(n),gl.STATIC_DRAW);meshes.push({id,pb,nb,count:v.length/3,color:rgba(color,alpha)})}
 function rgba(hex,a){return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255,a]}
 function sphere(id,col,alpha,c,r,lat=11,lon=18){mesh(id,col,alpha,tri=>{for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){const at=(u,v)=>{const th=Math.PI*u,ph=Math.PI*2*v,normal=[Math.cos(th),Math.sin(th)*Math.sin(ph),Math.sin(th)*Math.cos(ph)];return {p:normal.map((x,k)=>c[k]+r*x),n:normal}};const a=at(i/lat,j/lon),b=at((i+1)/lat,j/lon),c1=at(i/lat,(j+1)/lon),d=at((i+1)/lat,(j+1)/lon);tri(a,b,c1);tri(c1,b,d)}})}
 function capsule(id,col,alpha,r,half){mesh(id,col,alpha,tri=>{const rings=[];for(let i=0;i<=12;i++){let th=(Math.PI/2)*i/12;rings.push([-half-r*Math.cos(th),r*Math.sin(th),-Math.cos(th),Math.sin(th)])}for(let i=1;i<=10;i++)rings.push([-half+2*half*i/10,r,0,1]);for(let i=1;i<=12;i++){let th=(Math.PI/2)*i/12;rings.push([half+r*Math.sin(th),r*Math.cos(th),Math.sin(th),Math.cos(th)])}
 const slices=42,lo=.55,hi=Math.PI*2-.55;
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<slices;j++){
  const point=(k,m)=>{const ring=rings[k],phi=lo+(hi-lo)*m/slices;return {p:[ring[0],ring[1]*Math.sin(phi),ring[1]*Math.cos(phi)],n:[ring[2],ring[3]*Math.sin(phi),ring[3]*Math.cos(phi)]}};
  const a=point(i,j),b=point(i+1,j),c=point(i,j+1),d=point(i+1,j+1);tri(a,b,c);tri(c,b,d);
 }
 })}
 function tube(id,col,alpha,pts,r=.03){mesh(id,col,alpha,tri=>{for(let i=0;i<pts.length-1;i++){
  const p=pts[i],q=pts[i+1],dir=q.map((x,k)=>x-p[k]),len=Math.hypot(...dir)||1,u=dir.map(x=>x/len);let s=[-u[1],u[0],0],sn=Math.hypot(...s);if(sn<.02){s=[0,-u[2],u[1]];sn=Math.hypot(...s)}s=s.map(x=>x/sn);const t=[u[1]*s[2]-u[2]*s[1],u[2]*s[0]-u[0]*s[2],u[0]*s[1]-u[1]*s[0]];
  for(let k=0;k<7;k++){const point=(center,a)=>{const normal=s.map((x,h)=>x*Math.cos(a)+t[h]*Math.sin(a));return {p:center.map((x,h)=>x+r*normal[h]),n:normal}};const a=point(p,Math.PI*2*k/7),b=point(q,Math.PI*2*k/7),c=point(p,Math.PI*2*(k+1)/7),d=point(q,Math.PI*2*(k+1)/7);tri(a,b,c);tri(c,b,d)}
 }})}
 const mode=st.mode;
 // Actual 3D meshes with independently switchable capsule, membrane, wall and organelles.
 capsule('capsule','#7ce8cd',.22,1.09,.86);
 if(mode==='negative')capsule('outer','#e79bd0',.43,1.00,.86);
 capsule('wall','#f8b76e',mode==='positive'?.53:.29,mode==='positive'?.93:.88,.86);
 capsule('membrane','#64a5f4',.42,.76,.86);
 const dna=[];for(let i=0;i<85;i++){let t=i/84*Math.PI*5;dna.push([-.66+1.28*i/84,.28*Math.sin(t),.30+.15*Math.cos(t)])}tube('nucleoid','#fee78e',1,dna,.055);
 for(let k=0;k<22;k++){const x=((k*37)%61)/61*1.55-.76,y=((((k*19)%41)/41)-.5)*1.12,z=.30+((((k*13)%17)/17)-.5)*.50;sphere('ribosome','#f1a4a9',1,[x,y,z],.06,7,9)}
 const plas=[];for(let i=0;i<=40;i++){let t=i*Math.PI*2/40;plas.push([-.55+.18*Math.cos(t),-.25+.18*Math.sin(t),.55])}tube('plasmid','#bfacff',1,plas,.04);
 const flag=[];for(let i=0;i<=48;i++){const t=i/48;flag.push([1.55+1.33*t,.21*Math.sin(t*17),.12+.16*Math.cos(t*12)])}tube('flagellum','#83d9f7',1,flag,.04);
 for(let k=0;k<9;k++){const a=k/9*Math.PI*2;const pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push([-.85+((k%3)-1)*.55,(1.0+t*.38)*Math.sin(a), (1.0+t*.38)*Math.cos(a)])}tube('capsule','#7ce8cd',.75,pts,.014)}
 const aspect=()=>canvas.width/canvas.height;
 function rotation(){const y=st.yaw,p=st.pitch,c=Math.cos(y),s=Math.sin(y),cp=Math.cos(p),sp=Math.sin(p);return [c,s*sp,-s*cp,0,cp,sp,s,-c*sp,c*cp]}
 function screenPoint(point){const R=rotation();const [x,y,z]=[0,1,2].map(i=>R[i]*point[0]+R[i+3]*point[1]+R[i+6]*point[2]);const depth=st.zoom-z;return {x:(.5+x*2.5/(aspect()*depth)/2)*100,y:(.5-y*2.5/depth/2)*100}}
 const hotspots=$('.model-hotspots',host);
 const visible=x=>!(st.hidden.has(x.id))&&(x.id!=='outer'||st.mode==='negative');
 function draw(){if(!canvas.isConnected)return;
  const dpr=Math.min(window.devicePixelRatio||1,1.6),cw=Math.max(200,Math.round(canvas.clientWidth*dpr)),ch=Math.max(200,Math.round(canvas.clientHeight*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}gl.viewport(0,0,cw,ch);gl.clearColor(.04,.095,.16,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE);gl.uniformMatrix3fv(rotL,false,new Float32Array(rotation()));gl.uniform1f(zL,st.zoom);gl.uniform1f(aL,aspect());
  const sorted=[...meshes].sort((a,b)=>({capsule:1,outer:2,wall:3,membrane:4,nucleoid:5,ribosome:6,plasmid:7,flagellum:8}[a.id]||0)-({capsule:1,outer:2,wall:3,membrane:4,nucleoid:5,ribosome:6,plasmid:7,flagellum:8}[b.id]||0));
  for(const m of sorted){if(st.hidden.has(m.id)||m.id==='outer'&&st.mode!=='negative')continue;gl.depthMask(m.color[3]>=.95);gl.uniform4fv(colorL,new Float32Array(m.color));gl.uniform1f(selL,m.id===st.selected?.35:0);gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.enableVertexAttribArray(posL);gl.vertexAttribPointer(posL,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.enableVertexAttribArray(normL);gl.vertexAttribPointer(normL,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,m.count)}gl.depthMask(true);
  hotspots.replaceChildren();for(const item of sceneItems.filter(visible)){const v=screenPoint(item.pos);if(v.x<8||v.x>92||v.y<8||v.y>92)continue;const b=document.createElement('button');b.type='button';b.className='disco-pin'+(st.selected===item.id?' selected':'');b.style.left=v.x+'%';b.style.top=v.y+'%';b.title=item.label;b.setAttribute('aria-label','Выбрать '+item.label);b.style.setProperty('--part-color',item.color);b.onclick=()=>selectPart(item.id);hotspots.append(b)}
 }
 let x0=0,y0=0,drag=false,moved=false;
 canvas.addEventListener('pointerdown',e=>{drag=true;moved=false;x0=e.clientX;y0=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-x0,dy=e.clientY-y0;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;st.yaw+=dx*.009;st.pitch=Math.max(-1.15,Math.min(1.15,st.pitch+dy*.007));x0=e.clientX;y0=e.clientY;draw()});
 canvas.addEventListener('pointerup',()=>{drag=false});canvas.addEventListener('pointercancel',()=>{drag=false});
 canvas.addEventListener('wheel',e=>{e.preventDefault();st.zoom=Math.min(11,Math.max(3.6,st.zoom+Math.sign(e.deltaY)*.38));draw()},{passive:false});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')st.yaw-=.22;if(e.key==='ArrowRight')st.yaw+=.22;if(e.key==='ArrowUp')st.pitch=Math.max(-1.15,st.pitch-.18);if(e.key==='ArrowDown')st.pitch=Math.min(1.15,st.pitch+.18);if(e.key==='+')st.zoom=Math.max(3.6,st.zoom-.5);if(e.key==='-')st.zoom=Math.min(11,st.zoom+.5);draw()}});
 status.textContent='WebGL 3D работает';
 const observer=new ResizeObserver(()=>{if(canvas.isConnected)draw();else observer.disconnect()});observer.observe(canvas);draw();return {draw};
}
const microScenes=[
 {title:'Кокки в скоплениях',image:'micrographs/cocci.webp',answer:'cocci',initial:14,best:66,desc:'Кокки — бактерии с округлыми клетками. Здесь показаны условно грамположительно окрашенные скопления. Группировка не устанавливает вид бактерии.'},
 {title:'Палочковидные формы',image:'micrographs/bacilli.webp',answer:'rods',initial:82,best:31,desc:'Палочковидные бактерии имеют вытянутую форму. Розовая окраска иллюстрирует грамотрицательный вариант, но по одной форме и цвету вид определить нельзя.'},
 {title:'Спиральные формы — спирохеты',image:'micrographs/spirochetes.webp',answer:'spiral',initial:12,best:74,desc:'Спирохеты — тонкие спиралевидные бактерии. Эта иллюстрация имитирует темнопольный способ наблюдения. Спирохеты и спириллы относятся к разным морфологическим группам; видовая идентификация здесь невозможна.'}
];
function microscope(host){
 let scene=0,focus=0,mag=40,answered=false;
 host.innerHTML=`<section class="disco-panel micro-lab-panel"><div class="eyebrow">SCOPE STATION / ТРЕНАЖЁР МОРФОЛОГИИ</div><h2>Настрой микроскоп и определи форму</h2><p class="muted small">Три <b>сгенерированные научно-стилизованные иллюстрации</b>, а не настоящие микрофотографии. Настройте резкость каждого образца — иначе варианты ответа недоступны.</p>
 <div class="micro-grid"><div><div class="micro-viewport"><img id="micro-image" alt="Сгенерированная иллюстрация микроскопического поля" width="708" height="708" draggable="false"/><div class="micro-lens-glow" aria-hidden="true"></div></div>
 <div class="micro-focus-meter"><span id="micro-focus-status" role="status">Настройте фокус</span><b id="micro-sharpness">0% резкости</b></div><div class="micro-meter"><span id="micro-meter-fill"></span></div>
 <label class="micro-range" for="micro-focus">Точная фокусировка <input id="micro-focus" type="range" min="0" max="100" step="1" value="0" aria-describedby="micro-focus-hint" /></label>
 <p class="muted small" id="micro-focus-hint">Двигайте ползунок, пока изображение не станет чётким. Резкость меняется по мере движения.</p>
 <label class="micro-range" for="micro-magnification">Цифровое приближение <select id="micro-magnification"><option value="10">×10</option><option value="40" selected>×40</option><option value="100">×100</option></select></label></div>
 <div class="micro-work"><div class="eyebrow">ОБРАЗЕЦ <span id="micro-count">1 / 3</span></div><h3>Какая форма бактерий видна?</h3><p class="micro-challenge" id="micro-challenge">Сначала настройте изображение.</p>
 <div class="disco-answers"><button data-shape="cocci" disabled>Кокки — шаровидные</button><button data-shape="rods" disabled>Палочковидные бактерии</button><button data-shape="spiral" disabled>Спиральные формы</button></div><p id="micro-feedback" class="feedback-line" role="status">Наведи резкость, чтобы разблокировать ответ.</p><div class="disco-explain" id="micro-explain"></div><button class="btn primary" id="micro-next" disabled>Следующий образец →</button></div></div>
 <details class="micro-sources"><summary>Источники реальных микрофотографий для сравнения</summary><p class="muted small">В симуляторе используются созданные изображения. Реальные препараты и их подписи доступны отдельно:</p><ul><li><a target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/File:Gram_Positive_Coccus_Bacteria.jpg">Грамположительные кокки — Wikimedia Commons, Kucantikuu, CC BY 4.0</a></li><li><a target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/File:Gram_positive_coccus_and_gram_negative_rod.png">Кокк и палочка — Mikael Häggström, CC0</a></li><li><a target="_blank" rel="noopener" href="https://wwwn.cdc.gov/phil/Details.aspx?pid=20519">Спирохеты Borrelia mayonii — CDC PHIL № 20519, public domain</a></li></ul></details>
 <p class="source">Учебный симулятор: резкость и увеличение моделируются цифровыми эффектами, не имитируют реальные оптические параметры. Не предназначено для диагностики.</p></section>`;
 const img=$('#micro-image'),focusSlider=$('#micro-focus'),buttons=[...host.querySelectorAll('[data-shape]')];
 function updateFocus(){
  const s=microScenes[scene],distance=Math.abs(focus-s.best),sharp=Math.max(0,Math.round(100-distance*2.6)),ready=distance<=6;
  const blur=Math.min(15,distance*.24),scale=mag===10?1:mag===40?1.22:1.75;
  img.style.filter=`blur(${blur.toFixed(2)}px) contrast(${(.75+sharp*.0045).toFixed(2)}) saturate(${(.8+sharp*.003).toFixed(2)})`;
  img.style.transform=`scale(${scale})`;
  $('#micro-sharpness').textContent=`${sharp}% резкости`;
  $('#micro-meter-fill').style.width=sharp+'%';
  $('#micro-focus-status').textContent=ready?'✓ Изображение в фокусе':'◌ Наведите резкость';
  $('#micro-focus-hint').textContent=ready?'Отлично! Можно определить форму бактерий.':'Найдите максимум резкости, перемещая ползунок.';
  $('#micro-challenge').textContent=ready?'Определите форму по морфологии.':'Настройте фокус для выбора ответа.';
  if(!answered){buttons.forEach(b=>b.disabled=!ready);$('#micro-feedback').textContent=ready?'✓ Образец сфокусирован. Теперь выберите форму бактерий.':'Настраивайте ползунок, пока изображение не станет чётким.';}
 }
 function setScene(){
  answered=false;const s=microScenes[scene];focus=s.initial;focusSlider.value=focus;mag=40;$('#micro-magnification').value='40';img.src=s.image;img.alt='Учебная генеративная иллюстрация: образец '+(scene+1);
  $('#micro-count').textContent=`${scene+1} / ${microScenes.length}`;$('#micro-feedback').textContent='Наведи резкость, чтобы разблокировать ответ.';$('#micro-explain').textContent='';$('#micro-next').disabled=true;
  buttons.forEach(b=>{b.disabled=true;b.classList.remove('correct','wrong')});updateFocus();
 }
 focusSlider.addEventListener('input',e=>{focus=Number(e.target.value);updateFocus()});
 $('#micro-magnification').addEventListener('change',e=>{mag=Number(e.target.value);updateFocus()});
 buttons.forEach(b=>b.addEventListener('click',()=>{
  if(answered||Math.abs(focus-microScenes[scene].best)>6)return;
  answered=true;const s=microScenes[scene],ok=b.dataset.shape===s.answer;
  $('#micro-feedback').textContent=ok?'✓ Верно!':'✕ Не совсем. Посмотрите объяснение.';
  $('#micro-explain').textContent=s.desc;
  buttons.forEach(x=>{x.disabled=true;if(x.dataset.shape===s.answer)x.classList.add('correct');else if(x===b)x.classList.add('wrong')});
  $('#micro-next').disabled=false;$('#micro-next').textContent=scene===microScenes.length-1?'Начать заново →':'Следующий образец →';
 }));
 $('#micro-next').addEventListener('click',()=>{scene=(scene+1)%microScenes.length;setScene()});
 setScene();
}
const caseSet=[
 {title:'Смешанная микрофлора в образце',body:'В условном учебном кейсе в образце обнаружены разные морфологические группы бактерий. Какой вывод корректнее?',answers:['Можно сразу назвать единственного возбудителя','Морфологические признаки сами по себе не доказывают этиологию заболевания','Любой обнаруженный микроорганизм вызывает болезнь'],correct:1,why:'Микроскопия даёт ориентировочную информацию. Для причинной связи нужны контекст, подходящие подтверждающие исследования и интерпретация.'},
 {title:'Бактерия без клеточной стенки',body:'Условный агент относится к бактериям без пептидогликановой клеточной стенки. Какое утверждение верно?',answers:['β-лактамы подавляют её стенку так же, как у большинства других бактерий','Отсутствие стенки означает отсутствие клеточной мембраны','Препараты, нацеленные на синтез пептидогликана, не действуют на отсутствующую мишень'],correct:2,why:'Микоплазмы не имеют пептидогликановой клеточной стенки. Выбор терапии при реальной инфекции требует профессиональной диагностики и рекомендаций.'},
 {title:'Оценка окрашенного препарата',body:'В препарате видны розовые палочки. Какой вывод можно сделать по результату одной грамокраски?',answers:['Ориентировочно грамотрицательные палочковидные бактерии','Точный вид возбудителя установлен','Можно судить о полной лекарственной чувствительности'],correct:0,why:'Грамокраска позволяет оценить форму и тип окраски, но не подтверждает вид и не заменяет тест на чувствительность.'}
];
function cases(host){let index=0,correct=0;function draw(){const s=caseSet[index];host.innerHTML=`<section class="disco-panel"><div class="eyebrow">ПРАКТИЧЕСКОЕ МЫШЛЕНИЕ · КЕЙС ${index+1} ИЗ ${caseSet.length}</div><h2>${esc(s.title)}</h2><div class="disco-case-body">${esc(s.body)}</div><div class="disco-answers">${s.answers.map((a,i)=>`<button data-case-choice="${i}">${esc(a)}</button>`).join('')}</div><p role="status" class="feedback-line" id="case-feedback">Сначала выбери обоснованный вывод.</p><div class="disco-explain" id="case-explain"></div><button id="case-next" class="btn primary" disabled>Следующий кейс →</button><p class="source">Авторские учебные ситуации, не клинические рекомендации и не дословный текст экзаменационного билета.</p></section>`;
  host.querySelectorAll('[data-case-choice]').forEach(b=>b.onclick=()=>{const id=+b.dataset.caseChoice,ok=id===s.correct;if(ok)correct++;host.querySelectorAll('[data-case-choice]').forEach(x=>{x.disabled=true;if(+x.dataset.caseChoice===s.correct)x.classList.add('correct');else if(x===b)x.classList.add('wrong')});$('#case-feedback').textContent=ok?'✓ Верно':'✕ Требуется уточнение';$('#case-explain').textContent=s.why;$('#case-next').disabled=false});
  $('#case-next').onclick=()=>{index++;if(index<caseSet.length)draw();else{host.innerHTML=`<section class="disco-panel"><h2>Разбор завершён</h2><p class="feedback-line">${correct} из ${caseSet.length} — верных решений.</p><p>Повторите ошибки и сопоставьте объяснения с соответствующими темами.</p><button class="btn primary" id="case-restart">Повторить кейсы</button></section>`;$('#case-restart').onclick=()=>{index=0;correct=0;draw()}}};
 }draw()}
const methodSteps=['Первичный краситель','Раствор Люголя (мордант)','Обесцвечивание','Контрастное окрашивание'];
function method(host){let steps=[];function render(){host.innerHTML=`<section class="disco-panel"><div class="eyebrow">ВИЗУАЛЬНЫЙ ЭКЗАМЕН · ПОРЯДОК ЭТАПОВ</div><h2>Собери принципиальную схему окраски по Граму</h2><p class="muted">Выбирай стадии в правильной последовательности. Без режимов времени, концентраций и практических инструкций — это упражнение на понимание.</p><div class="disco-method-grid"><div><h3>Доступные этапы</h3><div class="disco-answers">${methodSteps.map((x,i)=>`<button data-method="${i}" ${steps.includes(i)?'disabled':''}>${esc(x)}</button>`).join('')}</div></div><div><h3>Твоя последовательность</h3><div class="method-order">${steps.length?steps.map((i,n)=>`<div class="method-chip"><span>${n+1}. ${esc(methodSteps[i])}</span><button data-remove="${n}" aria-label="Убрать ${esc(methodSteps[i])}">×</button></div>`).join(''):'<p class="muted">Выбери первый этап слева.</p>'}</div><div class="disco-controls"><button class="btn" id="method-clear">Сброс</button><button class="btn primary" id="method-check" ${steps.length!==4?'disabled':''}>Проверить порядок</button></div></div></div><p class="feedback-line" id="method-result" role="status"></p><p class="source">Основано на общепринятой концептуальной последовательности метода окраски по Граму, не лабораторный протокол.</p></section>`;
  host.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{steps.push(+b.dataset.method);render()});host.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{steps.splice(+b.dataset.remove,1);render()});$('#method-clear').onclick=()=>{steps=[];render()};$('#method-check').onclick=()=>{$('#method-result').textContent=steps.every((x,i)=>x===i)?'✓ Верно. По этапам меняется удержание красителя клеточными оболочками.':'Порядок отличается от учебной схемы. Подумай, когда происходит фиксация комплекса красителя и когда — контрастное окрашивание.'};}render()}
// Responsive menu remains accessible even when most navigation buttons are visually hidden.
function setupNavigation(){const nav=$('.global-nav');if(!nav)return;
 const b=document.createElement('button');b.id='nav-discovery';b.textContent='⬡ Исследовать';b.onclick=()=>enter('atlas');nav.append(b);
 const more=document.createElement('button');more.id='nav-more';more.textContent='☷ Ещё';more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','nav-overflow');nav.append(more);
 const menu=document.createElement('div');menu.id='nav-overflow';menu.className='nav-overflow';menu.hidden=true;menu.setAttribute('aria-label','Дополнительные разделы');nav.append(menu);
 const originalButtons=[...nav.querySelectorAll(':scope > button')].filter(x=>x!==more);
 for(const item of originalButtons){const copy=document.createElement('button');copy.type='button';copy.textContent=item.textContent;copy.dataset.forNav=item.id||'';copy.onclick=()=>{menu.hidden=true;more.setAttribute('aria-expanded','false');item.click()};menu.append(copy)}
 more.onclick=()=>{menu.hidden=!menu.hidden;more.setAttribute('aria-expanded',String(!menu.hidden))};
 document.addEventListener('click',e=>{if(!nav.contains(e.target)){menu.hidden=true;more.setAttribute('aria-expanded','false')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;more.setAttribute('aria-expanded','false');more.focus()}});
 const lab=$('#nav-lab');if(lab){const fn=lab.onclick;lab.onclick=()=>{fn?.();const container=$('#app');const box=document.createElement('section');box.className='disco-promo';box.innerHTML='<div><div class="eyebrow">MICRO LAB FUSION</div><h3>3D-анатомия, микроскоп и виртуальные задания</h3><p>Откройте новую лабораторию для исследования клеточных структур и самопроверки.</p></div><button class="btn primary" id="lab-to-discovery">Открыть 3D →</button>';const heading=container.querySelector('h1');heading?.after(box);$('#lab-to-discovery').onclick=()=>enter('atlas')}};
}
setupNavigation();
// Connect the new learning tools to the existing home screen and related lessons.
function homeEntry(){
 const hero=$('#app .hero');if(!hero||$('#home-discovery'))return;
 const panel=document.createElement('section');panel.id='home-discovery';panel.className='disco-promo';
 panel.innerHTML='<div><div class="eyebrow">MICRO LAB FUSION</div><h3>Микромир в 3D</h3><p>Исследуй строение бактерии, решай кейсы и научись различать формы в виртуальном микроскопе.</p></div><button class="btn primary" id="home-enter-discovery">Исследовать →</button>';
 hero.after(panel);$('#home-enter-discovery').onclick=()=>enter('atlas');
}
const previousHome=home;home=function(){previousHome();homeEntry()};
const previousLesson=lesson;lesson=function(topic){previousLesson(topic);
 if(/строени|бактериальн|морфологи|капсул|клеточн|формы бактер|спорообразован/i.test(topic.title)){
  const b=document.createElement('button');b.className='btn primary';b.textContent='⬡ Посмотреть строение в 3D';b.onclick=()=>enter('atlas');
  $('#app .study-shortcuts')?.append(b);
 }
};
homeEntry();
window.MicroDiscovery={open:enter,scenes:microScenes.length,cases:caseSet.length};
})();
