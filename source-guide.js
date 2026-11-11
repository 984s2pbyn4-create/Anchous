/* Source-first reading companion: excerpts are extracted from the user's PDF text, not externally verified. */
(function(){
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const split=s=>clean(s).split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z])/).filter(x=>x.length>35&&x.length<550);
function guide(t){
 const text=String(t.text||'');const parts=typeof ticketSections==='function'?ticketSections(t):[];
 return (parts.length?parts:[{number:1,title:'Материал билета',text}]).map((p,i)=>{
  const s=split(p.text);const anchors=s.filter(x=>/\b(это|называют|представляет собой|различают|выделяют|относят|состоит|происходит|характеризуется|определяют|обусловлен|обеспечивает|осуществляется)\b/i.test(x));
  const excerpt=(anchors.length?anchors:s).slice(0,3);
  return {number:p.number||i+1,title:clean(p.title),source:p.text,excerpts:excerpt,checklist:[
   'Сформулируйте основное определение своими словами.',
   'Назовите классификацию, стадии или признаки, если они приведены в конспекте.',
   'Приведите пример из материала и объясните его значение.'
  ]};
 });
}
function show(n){const t=TICKETS.find(x=>x.number===n);if(!t)return;const sections=guide(t);const pg=typeof SOURCE_PAGES!=='undefined'?SOURCE_PAGES[n]:null;window.current=null;
 app.innerHTML=`<button class="back" id="guide-back">← К билету</button><div class="eyebrow">РАБОТА С ПЕРВОИСТОЧНИКОМ · БИЛЕТ ${n}</div><h1>План изучения билета № ${n}</h1>${pg?`<p class="muted">Найдите оригинал в PDF на страницах <b>${pg.start}–${pg.end}</b>. Нумерация относится к страницам файла, а не печатным номерам.</p>`:""}<p class="muted">Это навигатор по извлечённому тексту PDF, а не научно отредактированная лекция. Фрагменты приводятся из вашего конспекта; спорные формулировки следует сверять с оригиналом.</p>${sections.map((s,i)=>`<section class="panel" style="margin:16px 0"><div class="eyebrow">ВОПРОС ${i+1} · ИЗ ИСХОДНОГО ТЕКСТА</div><h2>${esc(s.title)}</h2><h3>Опорные положения конспекта</h3>${s.excerpts.length?s.excerpts.map(e=>`<blockquote class="source-quote">${esc(e)}</blockquote>`).join(''):'<p class="muted">Не удалось уверенно выделить определения. Откройте полный текст вопроса.</p>'}<h3>Проверьте себя</h3><ol>${s.checklist.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><details><summary>Показать полный фрагмент из PDF</summary><div class="ticket-excerpt">${esc(s.source)}</div></details></section>`).join('')}<div class="bottom"><button class="btn primary" id="guide-practice">Пройти устную самопроверку</button><button class="btn" id="guide-all">Все билеты</button></div>`;
 document.querySelector('#guide-back').onclick=()=>ticketView(n);document.querySelector('#guide-practice').onclick=()=>ticketPractice(n);document.querySelector('#guide-all').onclick=()=>ticketLibrary();scrollTo(0,0);
}
window.sourceGuide={guide,show};
})();
