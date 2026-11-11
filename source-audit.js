/* Reproducible lexical audit. Does not establish scientific correctness. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const dir=__dirname;
function load(file,marker,name){const src=fs.readFileSync(path.join(dir,file),'utf8');const ctx=vm.createContext({});vm.runInContext(src.slice(0,marker?src.indexOf(marker):undefined)+`;this.result=${name};`,ctx);return JSON.parse(JSON.stringify(ctx.result));}
const tickets=load('tickets.js',null,'TICKETS');
const questions=load('trainer.js','let bankState=','BANK');
const stop=new Set('после какой какая какие какое почему нужно между может будет когда этот этого который которые наиболее при этом если также бактерии бактерия микроорганизм микробов организм процесс результат следует вопрос материала инфекции инфекция'.split(' '));
function tokens(s){return [...new Set((s.toLowerCase().match(/[а-яёa-z]{6,}/g)||[]).filter(x=>!stop.has(x)).map(x=>x.slice(0,-2)))];}
const flagged=new Set([32,39,1001,1002]);
const report=questions.map(q=>{const ticket=tickets.find(t=>t.number===q.ticket);const terms=tokens(q.question+' '+q.options[q.correct]);const corpus=(ticket?.text||'').toLowerCase();const found=terms.filter(t=>corpus.includes(t));const ratio=terms.length?found.length/terms.length:0;return {id:q.id,ticket:q.ticket,kind:q.kind||'knowledge',terms:terms.length,found:found.length,ratio:+ratio.toFixed(2),status:flagged.has(q.id)?'РУЧНАЯ СВЕРКА ТРЕБУЕТСЯ':ratio<.2?'ПРОВЕРИТЬ':ratio<.4?'СЛАБОЕ СОВПАДЕНИЕ':'ТЕКСТОВОЕ СОВПАДЕНИЕ',question:q.question};});
const csv=['id,ticket,kind,matched_terms,total_terms,match_ratio,status,question',...report.map(r=>[r.id,r.ticket,r.kind,r.found,r.terms,r.ratio,r.status,r.question].map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(','))].join('\n');
fs.writeFileSync(path.join(dir,'SOURCE_AUDIT.csv'),csv+'\n');
const counts={total:report.length,needsReview:report.filter(x=>x.status==='ПРОВЕРИТЬ'||x.status==='РУЧНАЯ СВЕРКА ТРЕБУЕТСЯ').length,weak:report.filter(x=>x.status==='СЛАБОЕ СОВПАДЕНИЕ').length,textMatch:report.filter(x=>x.status==='ТЕКСТОВОЕ СОВПАДЕНИЕ').length};
fs.writeFileSync(path.join(dir,'SOURCE_AUDIT.md'),`# Предварительная проверка привязки вопросов к PDF\n\nЭтот отчёт сравнивает слова вопроса и правильного ответа с текстом билета. **Совпадение слов не подтверждает научную правильность ответа**, а отсутствие совпадений не означает ошибку: материал мог быть перефразирован.\n\n- Всего заданий: ${counts.total}\n- Требуют ручной проверки в первую очередь: ${counts.needsReview}\n- Слабое текстовое совпадение: ${counts.weak}\n- Найдены текстовые совпадения: ${counts.textMatch}\n\nПодробности: SOURCE_AUDIT.csv. Для экспертной сверки следует открывать страницы оригинального PDF, а не полагаться на автоматический балл.\n`);
console.log(JSON.stringify(counts));
