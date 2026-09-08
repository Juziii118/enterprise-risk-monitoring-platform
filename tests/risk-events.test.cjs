const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../v1-store.js');

test('all ten event types can occur in deterministic demo results',()=>{
  const seen=new Set();
  for(let i=0;i<200;i++) core.risk({name:'企业',code:String(i).padStart(9,'0')},'2026-09','preloan').events.forEach(e=>seen.add(e));
  assert.equal(core.events.length,10);
  assert.deepEqual([...seen].sort(),[...core.events].sort());
});

test('legacy event names migrate without recomputing saved risk snapshots',()=>{
  const row={code:'123456789',level:'high',month:'2026-08',events:['授信前资金行为异常','非营业时段交易异常','交易信息完整性异常']};
  const state={preloanHistory:[{results:[structuredClone(row)]}],batches:[{rows:[structuredClone(row)]}]};
  core.migrateEventNames(state);
  const expected={...row,events:['信贷节点资金异常','非经营时段交易异常','交易信息缺失异常']};
  assert.deepEqual(state.preloanHistory[0].results,[expected]);
  assert.deepEqual(state.batches[0].rows,[expected]);
  const migrated=structuredClone(state);core.migrateEventNames(state);assert.deepEqual(state,migrated);
});
