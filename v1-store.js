/* Local-only V1 persistence and deterministic demo risk snapshots. */
(function (root) {
  "use strict";
  const DAY = 86400000;
  const events = ["信贷节点资金异常", "账户资金流转异常", "资金循环特征异常", "交易金额规律异常", "非经营时段交易异常", "经营流水波动异常", "交易信息缺失异常", "企业经营融资异常", "信贷资金用途异常", "交易冲销退回异常"];
  const eventAliases = {"授信前资金行为异常":"信贷节点资金异常", "非营业时段交易异常":"非经营时段交易异常", "交易信息完整性异常":"交易信息缺失异常"};
  function migrateEventNames(state) {
    const rows = [...(state.preloanHistory || []).flatMap(b => b.results || []), ...(state.batches || []).flatMap(b => b.rows || []), ...(state.preloanResults || []), ...(state.postloanResults || [])];
    for (const row of rows) if (Array.isArray(row.events)) row.events = [...new Set(row.events.map(event => eventAliases[event] || event))];
  }
  const pad = n => String(n).padStart(2, "0");
  function parts(value = new Date()) {
    const d = new Date(new Date(value).getTime() + 8 * 3600000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes(), s: d.getUTCSeconds() };
  }
  function dateKey(value = new Date()) { const p = parts(value); return `${p.y}-${pad(p.m)}-${pad(p.d)}`; }
  function monthKey(value = new Date()) { return dateKey(value).slice(0, 7); }
  function timeText(value = new Date()) { const p = parts(value); return `${dateKey(value)} ${pad(p.h)}:${pad(p.min)}:${pad(p.s)}`; }
  function at(date, time = "00:00:00") { return new Date(`${String(date).replaceAll("/", "-")}T${time}+08:00`); }
  function shiftMonth(period, offset) { const [y, m] = period.replaceAll("/", "-").split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + offset, 1)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`; }
  function counts(rows) { const out = {high:0, medium:0, low:0, none:0}; rows.forEach(r => { if (!(r.level in out)) throw new Error("未知风险等级"); out[r.level]++; }); return out; }
  function risk(enterprise, period, scene) {
    let h = 0;
    for (const c of String(enterprise.code).toUpperCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const [year, month] = period.split("-").map(Number);
    const marker = (h + year * 12 + month + (scene === "preloan" ? 2 : 0)) % 11;
    let level = "none", selected = [];
    if (marker === 0) { level = "high"; selected = [...events.slice(0, 3), events[8]]; }
    else if (marker === 1 || marker === 4) { level = "medium"; selected = marker === 1 ? [events[3], events[5]] : [events[4], events[6]]; }
    else if (marker === 6) { level = "low"; selected = [events[7], events[9]]; }
    return {...enterprise, month: period, level, events: selected, ai: "已发布"};
  }
  function snapshot(enterprises, period, scene, listId, bankName) {
    return enterprises.map(e => ({...risk({name:e.name, code:e.code, institutionCode:e.institutionCode}, period, scene), listId, bankName})).sort((a,b) => a.name.localeCompare(b.name, "zh-CN"));
  }
  function batchId(list, period) { return `${period}:${list.id}:${list.bankName}`; }
  function statusAt(list, instant) {
    const changes = (list.statusHistory || []).filter(c => c.at <= instant).sort((a,b)=>b.at-a.at);
    return changes[0]?.status || list.status;
  }
  function eligible(list, period, now) {
    const run = at(`${period}-01`, "01:00:00").getTime();
    return run <= new Date(now).getTime() && list.timestamp <= run && list.enterprises?.length > 0 &&
      String(list.startDate).replaceAll("/", "-") <= `${period}-01` && String(list.stopDate).replaceAll("/", "-") >= `${period}-01` &&
      statusAt(list, run) === "有效";
  }
  function runDue(state, now = new Date()) {
    let changed = false;
    const existing = new Set(state.batches.map(b => b.id || `${String(b.month).replace(/年/, "-").replace(/月/, "")}:${b.listId}:${b.bankName}`));
    for (const list of state.listRecords) {
      if (!list.enterprises) continue;
      let period = monthKey(list.timestamp);
      const last = monthKey(now);
      while (period <= last) {
        const id = batchId(list, period);
        if (!existing.has(id) && eligible(list, period, now)) {
          const rows = snapshot(list.enterprises, period, "postloan", list.id, list.bankName);
          const p = parts(at(`${shiftMonth(period, 1)}-01`).getTime() - DAY);
          state.batches.push({id, month:`${period.slice(0,4)}年${period.slice(5)}月`, period, listId:list.id, bankName:list.bankName,
            range:`${period}-01 — ${period}-${pad(p.d)}`, total:rows.length, ...counts(rows), rows,
            status:"已完成", scheduledAt:timeText(at(`${period}-01`, "01:00:00")), time:timeText(now), timestamp:new Date(now).getTime(), simulated:true});
          existing.add(id); changed = true;
        }
        period = shiftMonth(period, 1);
      }
    }
    state.batches.sort((a,b) => String(b.period || b.month).localeCompare(String(a.period || a.month)) || String(a.listId).localeCompare(String(b.listId)));
    state.postloanResults = state.batches.filter(b => b.period === monthKey(now) && Array.isArray(b.rows)).flatMap(b=>b.rows);
    return changed;
  }
  function anomalies(state, now = new Date()) {
    const current = monthKey(now), previous = shiftMonth(current,-1);
    const previousRows = new Map(state.batches.filter(b=>b.period===previous && Array.isArray(b.rows)).flatMap(b=>b.rows).map(r=>[`${r.listId}:${r.code}`,r]));
    const active = new Set(state.listRecords.filter(l=>l.status==="有效").map(l=>l.id));
    return state.batches.filter(b=>b.period===current && Array.isArray(b.rows)).flatMap(b=>b.rows).filter(r=>active.has(r.listId)).flatMap(r=>{
      const old = previousRows.get(`${r.listId}:${r.code}`);
      if (!old) return [];
      const rose = (["none","low"].includes(old.level) && ["medium","high"].includes(r.level)) || (old.level==="medium" && r.level==="high");
      return rose ? [{...r, previousLevel:old.level}] : [];
    }).sort((a,b)=>a.name.localeCompare(b.name,"zh-CN") || a.bankName.localeCompare(b.bankName,"zh-CN") || a.listId.localeCompare(b.listId));
  }
  function prune(state, now = new Date()) {
    const cutoff = `${shiftMonth(monthKey(now),-5)}-01`;
    state.preloanArchive ||= [];
    for (const r of state.preloanHistory) {
      if (r.dateKey < cutoff && r.queried !== false && !state.preloanArchive.some(a=>a.listId===r.listId)) {
        state.preloanArchive.push({listId:r.listId, bankName:r.bankName, dateKey:r.dateKey, companyCount:r.companyCount, counts:counts(r.results || [])});
      }
    }
    state.preloanHistory = state.preloanHistory.filter(r=>r.dateKey >= cutoff);
  }
  function createPersistence(capture, restore, onError) {
    let db, ready = false, timer, saving = Promise.resolve(), paused = false;
    async function open() {
      db = await new Promise((resolve,reject)=>{
        const req = indexedDB.open("risk-monitor-v1",1);
        req.onupgradeneeded = ()=>req.result.createObjectStore("snapshots");
        req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      });
      const saved = await new Promise((resolve,reject)=>{const req=db.transaction("snapshots").objectStore("snapshots").get("business");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
      if (saved) restore(saved);
      ready=true;
      return Boolean(saved);
    }
    function write(value) { return new Promise((resolve,reject)=>{
      const tx=db.transaction("snapshots","readwrite");tx.objectStore("snapshots").put(value,"business");tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || new Error("保存事务已取消"));
    }); }
    function save() {
      clearTimeout(timer);
      if (!ready || paused) return saving;
      const value=structuredClone(capture());
      saving=saving.catch(()=>{}).then(()=>write(value));
      return saving;
    }
    function saveSoon() { if (!ready || paused) return; clearTimeout(timer); timer=setTimeout(()=>save().catch(onError),120); }
    async function atomic(work) {
      clearTimeout(timer);
      if (!ready) throw new Error("本地数据库尚未就绪");
      saving=saving.catch(()=>{}).then(async()=>{
        const before=structuredClone(capture()); paused=true;
        try { const result=await work(); await write(structuredClone(capture())); return result; }
        catch(error) {restore(before);throw error;}
        finally {paused=false;}
      });
      return saving;
    }
    return {open,save,saveSoon,atomic,get ready(){return ready;}};
  }
  const api={events,migrateEventNames,parts,dateKey,monthKey,timeText,at,shiftMonth,counts,risk,snapshot,batchId,statusAt,eligible,runDue,anomalies,prune,createPersistence};
  root.V1Core=api;
  if(typeof module!=="undefined") module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
