/* Browser-local prototype integration. No server scheduler or cross-device storage. */
function csvText(rows) {
  return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');
}
function showBusinessDialog(title, message, action, label='确定') {
  let root=document.querySelector('#businessDialog');
  if(root) root.remove();
  root=document.createElement('div');root.id='businessDialog';root.className='modal-backdrop';
  root.innerHTML='<section class="modal" role="dialog" aria-modal="true" aria-labelledby="businessDialogTitle"><div class="modal-header"><h2 id="businessDialogTitle"></h2><button class="icon-button" aria-label="关闭">×</button></div><div class="panel-body"></div><div class="modal-footer"><button class="button primary"></button></div></section>';
  root.querySelector('h2').textContent=title;root.querySelector('.panel-body').textContent=message;
  const focus=document.activeElement;const close=()=>{root.remove();focus?.focus();};
  root.querySelector('.icon-button').onclick=close;
  const primary=root.querySelector('.primary');primary.textContent=label;primary.onclick=()=>{close();action?.();};
  root.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();(document.activeElement===primary?root.querySelector('button'):primary).focus();}});
  document.body.append(root);primary.focus();
}
function downloadEnterpriseList(rows,id) {
  if(!Array.isArray(rows)) {showToast('该旧演示名单缺少原始明细，待初始化');return;}
  downloadText(csvText([['企业名称','组织机构代码','机构编码'],...rows.map(r=>[r.name,r.code,r.institutionCode])]),id+'-导入名单.csv');
  recordLog('下载名单',id);
}
function downloadPostloanBatch(id) {
  const batch=state.batches.find(b=>b.id===id&&belongsToCurrentBank(b.bankName));
  if(!batch||!Array.isArray(batch.rows)||batch.rows.length!==batch.total){showToast('该批次缺少完整历史快照，待初始化');return;}
  exportResults(batch.rows,`${batch.period}-${batch.listId}-贷中监控结果`,true,'postloan');
}
async function importEnterpriseFile(event,scene) {
  const input=event.target,file=input.files?.[0];
  if(!file||!requireActiveBusinessAccount()) {input.value='';return;}
  const bank=isBankUser()?currentBankInstitution():scene==='preloan'?state.preloanBank:document.querySelector('#importBankSelect').value;
  if(!bank){showToast('请先选择导入银行');input.value='';return;}
  const actor=state.currentAccount;input.disabled=true;
  try {
    const parsed=await V1Import.parse(await file.arrayBuffer(),file.name);
    if(parsed.errors.length){
      const fields={name:'企业名称',code:'组织机构代码',institutionCode:'机构编码',header:'表头',row:'整行',file:'文件'};
      const lines=parsed.errors.map(e=>[e.row,fields[e.field]||e.field,e.value,e.message]);
      showBusinessDialog('名单校验未通过',`整份名单未导入，共发现${lines.length}处错误。\n`+lines.slice(0,12).map(r=>`第${r[0]}行 · ${r[1]} · 原值：${r[2]} · ${r[3]}`).join('\n')+(lines.length>12?'\n其余错误请下载清单查看。':''),()=>downloadText(csvText([['行号','字段','原值','错误原因'],...lines]),'导入错误清单.csv'),'下载错误清单');return;
    }
    if(actor!==state.currentAccount) throw new Error('登录账号已变更，请重新导入');
    let id;
    await V1Persistence.atomic(()=>{
      if(!requireActiveBusinessAccount())throw new Error('当前账号不允许导入');
      const now=new Date();
      if(scene==='preloan') {id=createPreloanListId(now);addPreloanHistory(id,bank,parsed.rows,now,false);state.preloanSelectedListId=null;}
      else {
        state.postloanListSequence=(state.postloanListSequence||0)+1;
        id=`ML-${V1Core.dateKey(now).replaceAll('-','')}-${String(state.postloanListSequence).padStart(6,'0')}`;
        while(state.listRecords.some(l=>l.id===id)){state.postloanListSequence++;id=`ML-${V1Core.dateKey(now).replaceAll('-','')}-${String(state.postloanListSequence).padStart(6,'0')}`;}
        state.listRecords.unshift({id,bankName:bank,companyCount:parsed.rows.length,enterprises:parsed.rows,importAt:formatDateTime(now),timestamp:now.getTime(),startDate:V1Core.dateKey(now),stopDate:V1Core.shiftMonth(V1Core.monthKey(now),12)+'-01',status:'有效',statusHistory:[{at:now.getTime(),status:'有效'}]});
      }
      recordLog('导入名单',id,bank);
    });
    scene==='preloan'?renderPreloan():renderListManagement();showToast(`已导入 ${parsed.rows.length} 家企业，名单编号 ${id}`);
  } catch(error){showToast(`导入失败，未生成名单：${error.message}`);}
  finally {input.value='';input.disabled=false;}
}

const persistentKeys=['listRecords','batches','preloanHistory','preloanArchive','preloanListSequence','postloanListSequence','logRecords','permissionAccounts','customBankNames','customInstitutionNames','quotaAccounts','quotaTransactions','notificationArchive','notificationReads'];
function captureV1Business(){return {schema:1,state:Object.fromEntries(persistentKeys.map(k=>[k,state[k]])),accounts:structuredClone(demoAccounts)};}
function restoreV1Business(saved){
  if(saved.schema!==1||!saved.state||!saved.accounts)throw new Error('本地数据版本不兼容，请先备份浏览器数据');
  for(const key of persistentKeys) if(saved.state[key]!==undefined)state[key]=saved.state[key];
  for(const key of Object.keys(demoAccounts))delete demoAccounts[key];Object.assign(demoAccounts,saved.accounts);
  state.postloanResults=state.batches.filter(b=>b.period===V1Core.monthKey()&&Array.isArray(b.rows)).flatMap(b=>b.rows);
}
window.V1Persistence=V1Core.createPersistence(captureV1Business,restoreV1Business,error=>showToast('本地保存失败：'+error.message));
const v1LoginButton=document.querySelector('#loginButton');v1LoginButton.disabled=true;
window.V1Ready=(async()=>{
  try {
    await V1Persistence.open();refreshExpiredListStatuses();prunePreloanHistory();V1Core.runDue(state);
    await V1Persistence.save();renderDashboard();v1LoginButton.disabled=false;
  }catch(error){showBusinessDialog('本地数据库无法加载',error.message+'。请允许网站使用浏览器本地存储后刷新；不要清除原有数据。');throw error;}
})();
let v1Period=V1Core.monthKey();
let v1Minute=V1Core.timeText().slice(0,16);
setInterval(()=>{
  if(!V1Persistence.ready||state.queryBusy)return;
  const minute=V1Core.timeText().slice(0,16);if(minute===v1Minute)return;v1Minute=minute;
  const period=V1Core.monthKey(),rolled=period!==v1Period;
  if(rolled){v1Period=period;state.dashboardPreloanMonth='latest';state.dashboardPostloanMonth='latest';}
  refreshExpiredListStatuses();prunePreloanHistory();const changed=V1Core.runDue(state);
  if(rolled||changed){V1Persistence.saveSoon();renderCurrentView();updateRiskChangeNotification();}
},1000);
for(const name of ['saveInstitution']){const original=window[name];window[name]=function(...args){const result=original(...args);V1Persistence.saveSoon();return result;};}
