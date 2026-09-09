const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
function dependency(name){try{return require(name);}catch{return require('../_review_render/test-runtime/node_modules/'+name);}}
const {JSDOM}=dependency('jsdom');
const {indexedDB,IDBKeyRange}=dependency('fake-indexeddb');
const core=require('../v1-store.js');
const now=core.at('2026-09-07');
const enterprise={name:'测试企业',code:'00123456A',institutionCode:'C1234567890123'};
function list(){return {id:'ML-X',bankName:'江西银行',timestamp:core.at('2026-07-10').getTime(),startDate:'2026-07-10',stopDate:'2027-01-01',status:'有效',enterprises:[enterprise],statusHistory:[{at:0,status:'有效'}]};}
test('Beijing boundary, immutable snapshots and idempotent monthly catch-up',()=>{
 assert.equal(core.monthKey('2026-08-31T16:00:00Z'),'2026-09');
 const s={listRecords:[list()],batches:[]};core.runDue(s,now);assert.equal(s.batches.length,2);
 assert.deepEqual(s.batches.map(b=>b.period),['2026-09','2026-08']);
 const original=structuredClone(s.batches);assert.equal(core.runDue(s,now),false);assert.deepEqual(s.batches,original);
 assert.deepEqual(s.batches[0].rows.map(r=>r.code),s.batches[1].rows.map(r=>r.code));
 const cross=core.snapshot([enterprise],'2026-09','postloan','other','九江银行')[0];
 assert.equal(cross.level,s.batches[0].rows[0].level);assert.deepEqual(cross.events,s.batches[0].rows[0].events);
 s.listRecords[0].status='已中止';s.listRecords[0].statusHistory.push({at:now.getTime(),status:'已中止'});core.runDue(s,core.at('2026-10-02'));assert.equal(s.batches.length,2);
});
test('anomalies require actual prior results and include medium to high',()=>{
 for(const [before,after,expected] of [['none','medium',1],['low','high',1],['medium','high',1],['high','high',0],['low','low',0]]){
  const s={listRecords:[list()],batches:[{period:'2026-08',rows:[{...enterprise,listId:'ML-X',level:before}]},{period:'2026-09',rows:[{...enterprise,listId:'ML-X',level:after}]}]};assert.equal(core.anomalies(s,now).length,expected);
  s.batches.shift();assert.equal(core.anomalies(s,now).length,0);
 }
});
test('retention keeps summaries without double counting',()=>{
 const s={preloanHistory:[{listId:'a',dateKey:'2026-03-31',companyCount:1,results:[{level:'high'}]},{listId:'b',dateKey:'2026-04-01',results:[{level:'none'}]}]};core.prune(s,now);assert.equal(s.preloanHistory.length,1);assert.equal(s.preloanArchive[0].counts.high,1);core.prune(s,now);assert.equal(s.preloanArchive.length,1);
});
async function app(){
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const dom=new JSDOM(html,{url:'http://localhost:4173',runScripts:'outside-only',pretendToBeVisual:true});
 Object.assign(dom.window,{indexedDB,IDBKeyRange,structuredClone});dom.window.URL.createObjectURL=()=>'';dom.window.URL.revokeObjectURL=()=>{};
 const context=dom.getInternalVMContext();for(const name of ['v1-store.js','import-validation.js','app.js','v1-integration.js','v1-ui.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+name),'utf8'),context,{filename:name});
 await dom.window.V1Ready;return {dom,run:code=>vm.runInContext(code,context)};
}
test('full app: role isolation, successful single charge, failure rollback, filters and persisted reload',async()=>{
 const a=await app();try {
 a.run(`state.currentAccount='003@jxphzx.com';state.currentInstitution='平台运营中心';state.currentView='preloan';state.preloanBank='江西银行';`);
 const id=a.run(`(()=>{const id=createPreloanListId();addPreloanHistory(id,'江西银行',buildDemoResults(35),new Date(),false);return id;})()`);
 const balance=a.run('quotaBalance()');await a.dom.window.queryPreloanList(id);
 assert.equal(a.run('quotaBalance()'),balance-5);assert.equal(a.run('state.preloanHistory.find(r=>r.listId==='+JSON.stringify(id)+').results.length'),35);
 await Promise.all([a.dom.window.queryPreloanList(id),a.dom.window.queryPreloanList(id)]);assert.equal(a.run('quotaBalance()'),balance-5);
 const count=a.run(`getOperatorOverview('preloan').allTotal`);await a.dom.window.queryPreloanList(id);assert.equal(a.run(`getOperatorOverview('preloan').allTotal`),count);
 a.run(`state.preloanHistory.unshift({listId:'bad',bankName:'江西银行',companyCount:2,enterprises:[{name:'坏测试',code:'123456789'}],dateKey:V1Core.dateKey(),importDateKey:V1Core.dateKey(),timestamp:Date.now(),queried:false,results:[]});`);
 await a.dom.window.queryPreloanList('bad');assert.equal(a.run('quotaBalance()'),balance-5);assert.equal(a.run(`state.preloanHistory.find(r=>r.listId==='bad').queried`),false);
 for(const account of ['001@jxphzx.com','江西银行','九江银行']) {
  a.run(`state.currentAccount=${JSON.stringify(account)};`);
  for(const render of ['renderDashboard','renderPreloan','renderPostloan','renderListManagement','renderAnomalyAlerts','renderQuota'])a.run(render+'()');
  for(const mode of ['preloan','postloan']) {
    a.run(`state.dashboardMode='${mode}';renderDashboard();`);
    assert.ok(a.dom.window.document.querySelector('#dashboardMonthSelect'));
    assert.equal(a.run(`dashboardRiskEventRows('${mode}').length`),10);
    assert.equal(a.run('coreRiskEvents.size'),4);
    assert.equal(a.run('V1Core.events.filter(e=>!coreRiskEvents.has(e)).length'),6);
    const namesOnly=a.run('formatRiskEvents(V1Core.events)');
    assert.ok(!namesOnly.includes('核心风险事件'));
    for(const event of core.events) assert.ok(namesOnly.includes(event));
    const positiveEvents=a.run(`dashboardRiskEventRows('${mode}').filter(item=>item.count>0).length`);
    assert.ok(a.dom.window.document.querySelector('#dashboardView').textContent.includes(`共 ${positiveEvents} 类风险事件`));
    assert.ok(a.dom.window.document.querySelectorAll('#dashboardView .risk-event-row').length<=5);
    for(const count of a.dom.window.document.querySelectorAll('#dashboardView .risk-event-count')) assert.ok(parseInt(count.textContent,10)>0);
    const meters=[...a.dom.window.document.querySelectorAll('#dashboardView .distribution-track')];
    assert.equal(meters.length,4);
    const sum=meters.reduce((n,e)=>n+Number(e.getAttribute('aria-valuenow')),0);
    assert.ok(sum===0 || Math.abs(sum-100)<0.03);
    assert.equal(a.dom.window.document.querySelectorAll('#dashboardView [data-v1-reset]').length,0);
  }
  if(!account.includes('@')) assert.equal(a.run('currentPostloanResults().every(r=>r.bankName===currentBankInstitution())'),true);
 }
 a.run(`state.currentAccount='001@jxphzx.com';renderLogs();renderPermissions();renderQuota();state.quotaTypeFilter='贷前筛查消费';`);
 assert.ok(a.run('V1UI.matchingQuotaRecords().length')>=1);
 // Downloads must read each selected batch, not the current month.
 a.run(`window.downloads=[];downloadText=(content,filename)=>downloads.push({content,filename});`);
 const batchIds=a.run(`state.batches.filter(b=>b.listId===state.batches[0].listId).slice(0,2).map(b=>b.id)`);
 assert.equal(batchIds.length,2);
 batchIds.forEach(id=>a.dom.window.downloadPostloanBatch(id));
 const files=a.run('downloads');assert.notEqual(files[0].content,files[1].content);
 assert.equal(files[0].content.split('\r\n').length,files[1].content.split('\r\n').length);
 // Single and combined filters, then reset only the current filter area.
 a.run(`state.currentView='postloan';state.query='';state.selectedRisk='all';state.postBankFilter='江西银行';state.postListQuery='all';renderPostloan();`);
 assert.equal(a.run(`filteredResults(currentPostloanResults(),'postloan').every(r=>r.bankName==='江西银行')`),true);
 a.run(`state.selectedRisk='high';renderPostloan();`);
 assert.equal(a.run(`filteredResults(currentPostloanResults(),'postloan').every(r=>r.bankName==='江西银行'&&r.level==='high')`),true);
 a.dom.window.document.querySelector('#postloanView .result-toolbar [data-v1-reset]').click();assert.equal(a.run('state.selectedRisk'),'all');assert.equal(a.run('state.postBankFilter'),'all');
 a.run(`state.currentAccount='江西银行';updateRiskChangeNotification();notificationMessages().forEach(n=>markNotificationRead(n.id));`);
 const readCount=a.run('readNotificationIds().size');await a.dom.window.V1Persistence.save();
 const b=await app();try{b.run(`state.currentAccount='003@jxphzx.com';`);assert.equal(b.run('quotaBalance()'),balance-5);b.run(`state.currentAccount='江西银行';`);assert.equal(b.run('readNotificationIds().size'),readCount);}finally{b.dom.window.close();}
 }finally{a.dom.window.close();}
});
