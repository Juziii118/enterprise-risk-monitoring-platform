const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../v1-store.js');
test('DQ/DZ sequences are daily, separate by scene and shared by banks',()=>{
 const s={}; const now=core.at('2026-09-11','09:00:00');
 assert.equal(core.nextListId(s,'preloan',now),'DQ-20260911-00001');
 s.currentAccount='九江银行';
 assert.equal(core.nextListId(s,'preloan',now),'DQ-20260911-00002');
 assert.equal(core.nextListId(s,'postloan',now),'DZ-20260911-00001');
 assert.equal(core.nextListId(s,'postloan',now),'DZ-20260911-00002');
 assert.equal(core.nextListId(s,'preloan',core.at('2026-09-12')),'DQ-20260912-00001');
 assert.equal(core.nextListId(s,'preloan',now),'DQ-20260911-00003');
});
test('Beijing midnight, reload, deletion, historical IDs and upper limit',()=>{
 let s={preloanHistory:[{listId:'DQ-20260911-00007'},{listId:'PF-20260911-000099'}],listRecords:[{id:'ML-20260911-99'}]};
 assert.equal(core.nextListId(s,'preloan','2026-09-11T15:59:59Z'),'DQ-20260911-00008');
 s=JSON.parse(JSON.stringify(s));s.preloanHistory=[];
 assert.equal(core.nextListId(s,'preloan','2026-09-11T15:59:59Z'),'DQ-20260911-00009');
 assert.equal(core.nextListId(s,'preloan','2026-09-11T16:00:00Z'),'DQ-20260912-00001');
 s.dailyListSequences['DZ-20260911']=99998;
 assert.equal(core.nextListId(s,'postloan',core.at('2026-09-11')),'DZ-20260911-99999');
 assert.throws(()=>core.nextListId(s,'postloan',core.at('2026-09-11')),/99999/);
 assert.throws(()=>core.nextListId(s,'invalid'),/未知/);
});
