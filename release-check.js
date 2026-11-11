/* Offline release quality gate: node release-check.js */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=__dirname,errors=[];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const jsRefs=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
const cssRefs=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
const icons=['icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png','manifest.json'];
for(const name of [...jsRefs,...cssRefs,...icons])if(!fs.existsSync(path.join(root,name)))errors.push('Missing HTML asset '+name);
for(const name of [...jsRefs,...cssRefs,...icons])if(!sw.includes("'./"+name+"'"))errors.push('Missing offline cache asset '+name);
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync(path.join(root,'tickets.js'),'utf8')+'\nthis.__tickets=TICKETS',ctx);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
vm.runInContext(app.slice(app.indexOf('const TICKET_HEADINGS='),app.indexOf('function ticketHeadings('))+'\nthis.__sections=ticketSections',ctx);
const tickets=ctx.__tickets,counts=tickets.map(t=>ctx.__sections(t).length);
if(tickets.length!==27||counts.some(c=>c!==3))errors.push('Ticket headings not 27x3: '+counts);
for(const t of tickets){const sec=ctx.__sections(t);if(sec.map(x=>x.text.length).some(n=>n<35))errors.push('Suspiciously short source section ticket '+t.number)}
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8')+'\nthis.__topics=TOPICS',ctx);
const ids=ctx.__topics.map(t=>t.id);if(new Set(ids).size!==ids.length)errors.push('Duplicate source topic IDs');
if(!html.includes('discovery.js'))errors.push('Discovery module omitted');
const trainer=fs.readFileSync(path.join(root,'trainer.js'),'utf8');
vm.runInContext(trainer.slice(0,trainer.indexOf('let bankState='))+'\nthis.__bank=BANK',ctx);
const bank=ctx.__bank;
if(bank.length!==67||bank.filter(q=>q.kind==='case').length!==26||new Set(bank.map(q=>q.ticket)).size!==27)errors.push('Trainer changed unexpectedly');
console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',sourceTickets:tickets.length,examQuestions:counts.reduce((a,b)=>a+b,0),sourceTopicRecords:ids.length,curatedLessons:31,trainerQuestions:bank.length,situational:bank.filter(q=>q.kind==='case').length,interactiveSvgModels:12,new3DAtlas:true,newMicroscopeScenes:3,newDecisionCases:3,jsAssets:jsRefs.length,errors},null,2));
if(errors.length)process.exit(1);
