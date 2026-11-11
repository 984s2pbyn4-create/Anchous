/* Static audit for supplementary trainer data. Run with node quality-check.js */
const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/trainer.js','utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(0,source.indexOf('let bankState='))+'\nthis.__bank=BANK;',context);
const bank=context.__bank;
const errors=[];const ids=new Set();const tickets=new Set();
for(const q of bank){
 if(ids.has(q.id))errors.push('Duplicate ID '+q.id);ids.add(q.id);
 if(!Number.isInteger(q.ticket)||q.ticket<1||q.ticket>27)errors.push('Invalid ticket '+q.id);
 tickets.add(q.ticket);
 if(!q.question||q.question.trim().length<12)errors.push('Short question '+q.id);
 if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options).size!==q.options.length)errors.push('Bad options '+q.id);
 if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length)errors.push('Bad correct '+q.id);
 if(!q.explanation||q.explanation.length<25)errors.push('Short explanation '+q.id);
}
const report={questionCount:bank.length,caseCount:bank.filter(q=>q.kind==='case').length,coveredTickets:tickets.size,errors};
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
