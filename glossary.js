/* Source-linked terminology explorer: quotations are excerpts from supplied ticket text. */
(()=>{
'use strict';
const terms=['иммунитет','фагоцитоз','антиген','антитело','комплемент','интерферон','вакцина','сыворотка','агглютинация','преципитация','бактерия','спора','капсула','жгутик','грамположительные','грамотрицательные','пептидогликан','плазмида','трансформация','трансдукция','конъюгация','мутация','вирус','бактериофаг','культивирование','питательная среда','стерилизация','дезинфекция','антибиотик','резистентность','патогенность','вирулентность','инфекция','инкубационный период','эпидемия','диагностика','серологическая реакция','ПЦР','аэробы','анаэробы'];
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const corpus=typeof TICKETS==='undefined'?[]:TICKETS;
const entries=terms.map(term=>{
 const hits=[];
 for(const ticket of corpus){const text=ticket.text.replace(/\s+/g,' ');const p=text.toLocaleLowerCase('ru').indexOf(term.toLocaleLowerCase('ru'));if(p<0)continue;
 const start=Math.max(0,text.lastIndexOf('.',p-1)+1,p-120);let end=text.indexOf('.',p+term.length);if(end<0||end-p>340)end=Math.min(text.length,p+260);else end++;
 const quote=text.slice(start,end).trim();if(quote.length>=term.length+24)hits.push({number:ticket.number,quote});if(hits.length>=3)break;
 }
 return {term,hits};
}).filter(x=>x.hits.length);
let selected=0,search='';
function show(){
 app.innerHTML=`<button class="back" id="gl-back">← К темам</button><div class="eyebrow">АТЛАС ПОНЯТИЙ · ПО ИСХОДНОМУ PDF</div><h1>Термины в контексте билетов</h1><p class="muted">Найдите термин, прочитайте, как он используется в исходном конспекте, и откройте билет для изучения. Это <b>цитатные выдержки</b>, а не отредактированные словарные определения. Фрагменты автоматически извлечены из PDF и могут содержать ошибки форматирования.</p><div class="panel"><label class="field-label" for="gl-search">Поиск термина</label><input class="search" id="gl-search" placeholder="Например, фагоцитоз" value="${safe(search)}" style="width:100%"/><div class="gl-layout"><div id="gl-terms" class="gl-terms"></div><section id="gl-detail" class="gl-detail" aria-live="polite"></section></div></div>`;
 document.querySelector('#gl-back').onclick=home;
 document.querySelector('#gl-search').oninput=e=>{search=e.target.value;renderList()};renderList();window.scrollTo(0,0);
}
function renderList(){const matching=entries.map((x,i)=>({...x,index:i})).filter(x=>x.term.toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru')));const list=document.querySelector('#gl-terms');if(!list)return;list.innerHTML=matching.map(x=>`<button class="gl-term ${selected===x.index?'active':''}" data-gl="${x.index}" aria-pressed="${selected===x.index}">${safe(x.term)} <small>${x.hits.length} бил.</small></button>`).join('')||'<p class="muted">Совпадений нет.</p>';list.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{selected=+b.dataset.gl;renderList()});if(matching.length&&!matching.some(x=>x.index===selected))selected=matching[0].index;renderDetail();}
function renderDetail(){const area=document.querySelector('#gl-detail');if(!area)return;const x=entries[selected];if(!x){area.innerHTML='';return;}area.innerHTML=`<div class="eyebrow">ТЕРМИН</div><h2>${safe(x.term)}</h2><p class="muted small">Ниже — фрагменты предоставленного PDF, содержащие этот термин. Чтобы увидеть полный ответ, откройте билет.</p>${x.hits.map(h=>`<article class="gl-quote"><div class="eyebrow">Билет № ${h.number}</div><p>${safe(h.quote)}</p><button class="btn" data-gl-ticket="${h.number}">Открыть билет № ${h.number} →</button></article>`).join('')}`;area.querySelectorAll('[data-gl-ticket]').forEach(b=>b.onclick=()=>ticketView(Number(b.dataset.glTicket)));}
const nav=document.querySelector('.global-nav');if(nav){const b=document.createElement('button');b.id='nav-glossary';b.textContent='▤ Атлас терминов';b.onclick=show;nav.append(b)}
window.MicroGlossary={open:show,count:entries.length};
})();
