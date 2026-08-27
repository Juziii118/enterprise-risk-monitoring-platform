const state = {
  currentView: "dashboard",
  dashboardMode: "preloan",
  dashboardPreloanMonth: "latest",
  dashboardPostloanMonth: "latest",
  dashboardEventPage: { preloan: 1, postloan: 1 },
  sidebarCollapsed: false,
  selectedRisk: "all",
  query: "",
  preloanPage: 1,
  preloanBank: "",
  preloanListSequence: 1,
  preloanListFilter: "all",
  preloanResultBankFilter: "all",
  preloanHistoryPage: 1,
  preloanHistoryBankFilter: "all",
  preloanHistoryListQuery: "all",
  preloanHistoryStartDate: "",
  preloanHistoryEndDate: "",
  postloanPage: 1,
  listPage: 1,
  anomalyPage: 1,
  anomalyBankFilter: "all",
  anomalyListFilter: "all",
  anomalyCurrentLevelFilter: "all",
  anomalyPreviousLevelFilter: "all",
  listBankFilter: "all",
  listIdQuery: "",
  listImportBank: "",
  logPage: 1,
  logBankFilter: "all",
  logStartDate: "",
  logEndDate: "",
  batchMonthFilter: "all",
  batchListFilter: "all",
  batchBankFilter: "all",
  currentAccount: "未登录",
  currentOperator: "未登录",
  currentInstitution: "用户",
  customDisplayName: "",
  hasPermissionAdmin: false,
  permissionInstitutionDraft: "",
  customInstitutionNames: [],
  postBankFilter: "all",
  postListQuery: "",
  batchStartDate: "",
  batchEndDate: "",
  aiTarget: null,
  listManageTarget: null,
  institutionModalTarget: null,
  customBankNames: [],
  preloanResults: [],
  preloanHistory: [],
  postloanResults: [],
  listRecords: [],
  logRecords: [],
  permissionAccounts: [],
  permissionPage: 1,
  permissionQuery: "",
  permissionTypeFilter: "all",
  permissionStatusFilter: "all",
  permissionTargetAccount: null,
  batches: [
    { month: "2026年07月", range: "2026-07-01 — 2026-07-31", total: 46, high: 4, medium: 9, low: 4, none: 29, status: "已完成", time: "2026-08-05 09:18" },
    { month: "2026年06月", range: "2026-06-01 — 2026-06-30", total: 1241, high: 31, medium: 151, low: 64, none: 995, status: "已完成", time: "2026-07-06 10:02" },
    { month: "2026年05月", range: "2026-05-01 — 2026-05-31", total: 1198, high: 29, medium: 143, low: 58, none: 968, status: "已完成", time: "2026-06-05 09:42" }
  ]
};

const pageSize = 10;
const preloanHistoryPageSize = 10;
const preloanHistoryRetentionMonths = 6;
const demoEnterpriseNames = [
  "九江华盛贸易有限公司", "九江市新联科技有限公司", "九江市远航物流有限公司", "景德镇华瓷文化有限公司", "景德镇瑞景陶瓷有限公司",
  "江西安达供应链有限公司", "江西博远信息技术有限公司", "江西昌盛农业发展有限公司", "江西德润新材料有限公司", "江西丰华食品有限公司",
  "江西国泰工程有限公司", "江西恒泰建设有限公司", "江西华信实业有限公司", "江西嘉和商业有限公司", "江西金瑞矿业有限公司",
  "江西康盛医药有限公司", "江西联创电子有限公司", "江西明达设备有限公司", "江西鹏程物流有限公司", "江西瑞达设备制造有限公司",
  "江西盛达贸易有限公司", "江西天润农业有限公司", "江西万和实业有限公司", "江西新拓科技有限公司", "江西银丰纺织有限公司",
  "江西云拓供应链有限公司", "南昌市恒信建材有限公司", "南昌市远景商业有限公司", "萍乡市鼎盛物流有限公司", "上饶市佳和商贸有限公司",
  "上饶市瑞丰实业有限公司", "宜春市中汇贸易有限公司", "鹰潭市锦华供应链有限公司", "抚州市宏达实业有限公司", "吉安市宏盛建设有限公司",
  "江西中科实业有限公司", "江西宏远建材有限公司", "江西海润农业有限公司", "江西东旭机械有限公司", "江西金桥物流有限公司",
  "南昌市华安科技有限公司", "赣州市联盛贸易有限公司", "赣州市嘉诚建设有限公司", "九江市鼎盛实业有限公司", "宜春市恒源材料有限公司", "吉安市瑞华商贸有限公司"
];

const trendData = [
  { month: "2026/02", high: 26, medium: 128 },
  { month: "2026/03", high: 29, medium: 138 },
  { month: "2026/04", high: 34, medium: 147 },
  { month: "2026/05", high: 29, medium: 143 },
  { month: "2026/06", high: 31, medium: 151 },
  { month: "2026/07", high: 38, medium: 164 }
];

const bankNames = ["江西银行", "九江银行", "南昌农商银行", "赣州银行", "上饶银行", "景德镇农商银行"];
const logPageSize = 20;
const logActions = ["登录成功", "导入名单", "查询结果", "导出结果", "删除名单", "中止名单监测", "登出平台", "修改名称"];

function pad(value) { return String(value).padStart(2, "0"); }

function availableBankNames() {
  return [...new Set([...bankNames, ...state.customBankNames, ...state.listRecords.map(item => item.bankName), ...state.preloanHistory.map(item => item.bankName)].filter(Boolean))];
}

function importBankOptions(selected = "") {
  const options = availableBankNames().map(bank => `<option value="${escapeHTML(bank)}" ${selected === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("");
  return `<option value="">选择导入银行</option>${options}<option value="__add_bank__">新增银行机构</option>`;
}

function formatDateTime(date) {
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDate(date) {
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

function buildListRecords() {
  const base = new Date("2026-08-25T09:18:42");
  const samples = [
    { bankName: "江西银行", companyCount: 9, status: "有效" },
    { bankName: "九江银行", companyCount: 7, status: "有效" },
    { bankName: "南昌农商银行", companyCount: 6, status: "有效" },
    { bankName: "赣州银行", companyCount: 8, status: "有效" },
    { bankName: "上饶银行", companyCount: 6, status: "有效" },
    { bankName: "景德镇农商银行", companyCount: 5, status: "已中止" },
    { bankName: "江西银行", companyCount: 4, status: "已中止" },
    { bankName: "九江银行", companyCount: 3, status: "失效" }
  ];
  return samples.map((sample, index) => {
    const imported = new Date(base.getTime() - index * 86400000 * 1.13);
    const started = new Date(imported.getTime() - 86400000 * 2);
    const stopped = sample.status === "失效" ? new Date("2026-08-01T00:00:00") : new Date(base.getTime() + 86400000 * 365);
    return {
      id: `ML-${imported.getFullYear()}${pad(imported.getMonth() + 1)}${pad(imported.getDate())}-${pad(index + 1)}`,
      bankName: sample.bankName,
      companyCount: sample.companyCount,
      importAt: formatDateTime(imported),
      startDate: formatDate(started),
      stopDate: formatDate(stopped),
      timestamp: imported.getTime(),
      status: sample.status
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function buildLogRecords() {
  const base = new Date("2026-08-25T09:18:42");
  return Array.from({ length: 64 }, (_, index) => {
    const date = new Date(base.getTime() - index * 7.6 * 3600000);
    const action = logActions[index % logActions.length];
    const list = `ML-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad((index % 46) + 1)}`;
    const target = action === "登录成功" || action === "登出平台" ? "平台账户" : action.includes("名单") ? list : action === "导出结果" ? "贷中监控结果" : "企业风险结果";
    return {
      id: `LOG-${String(index + 1).padStart(4, "0")}`,
      dateKey: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      date: formatDateTime(date),
      bankName: bankNames[index % bankNames.length],
      operator: `机构用户${String((index % 6) + 1).padStart(3, "0")}`,
      account: `bank${String((index % 6) + 1).padStart(3, "0")}@example.com`,
      action,
      target,
      result: "成功"
    };
  });
}

function recordLog(action, target, institution = state.currentInstitution) {
  const now = new Date();
  state.logRecords.unshift({
    id: `LOG-${Date.now()}`,
    dateKey: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    date: formatDateTime(now),
    bankName: institution,
    operator: state.currentOperator,
    account: state.currentAccount,
    action,
    target,
    result: "成功"
  });
}

function createPreloanListId(date = new Date()) {
  const dateKey = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const sequence = String(state.preloanListSequence++).padStart(3, "0");
  return `PF-${dateKey}-${sequence}`;
}

function buildDemoResults(seed = 0, listId = state.listRecords[0]?.id, bankName = state.listRecords[0]?.bankName) {
  return demoEnterpriseNames.slice().sort((a, b) => a.localeCompare(b, "zh-CN")).map((name, index) => {
    const marker = (index + seed) % 11;
    let level = "none";
    let events = [];
    if (marker === 0) { level = "high"; events = ["授信前资金行为异常", "账户资金流转异常", "资金循环特征异常"]; }
    else if (marker === 4) { level = "medium"; events = ["交易金额规律异常", "经营流水波动异常"]; }
    else if (marker === 8) { level = "medium"; events = ["非营业时段交易异常", "交易信息完整性异常"]; }
    else if (marker === 6) { level = "low"; events = ["企业经营融资异常"]; }
    const list = state.listRecords[0];
    return { name, code: String(360100001 + index), month: "2026-07", listId: listId || list.id, bankName: bankName || list.bankName, events, level, ai: "已发布" };
  });
}

function riskCountsForRows(rows) {
  const counts = blankRiskCounts();
  rows.forEach(row => addRiskCount(counts, row.level));
  return counts;
}

function buildCurrentPostloanDataset() {
  refreshExpiredListStatuses();
  const activeLists = state.listRecords.filter(list => list.status === "有效");
  const currentMonitorMonth = "2026/07";
  const currentBatches = activeLists.map(list => {
    const rows = buildDemoResults(3, list.id, list.bankName).slice(0, list.companyCount).map(row => ({ ...row, month: "2026-07" }));
    const counts = riskCountsForRows(rows);
    return { month: "2026年07月", range: "2026-07-01 — 2026-07-31", total: rows.length, ...counts, status: "已完成", time: "2026-08-05 09:18", listId: list.id, bankName: list.bankName, rows };
  });
  state.postloanResults = currentBatches.flatMap(batch => batch.rows);
  const existingListIds = new Set(state.listRecords.map(list => list.id));
  const retainedHistory = (Array.isArray(state.batches) ? state.batches : [])
    .filter(batch => monthKeyFromBatch(batch.month) !== currentMonitorMonth && existingListIds.has(batch.listId))
    .map(batch => {
      const list = state.listRecords.find(item => item.id === batch.listId);
      const seed = monthKeyFromBatch(batch.month) === "2026/06" ? 9 : 8;
      const rows = buildDemoResults(seed, list.id, list.bankName).slice(0, list.companyCount);
      const counts = riskCountsForRows(rows);
      return { ...batch, total: rows.length, ...counts };
    });
  const historicalBatches = retainedHistory.length ? retainedHistory : [
    { month: "2026年06月", range: "2026-06-01 — 2026-06-30", time: "2026-07-06 10:02", seed: 9 },
    { month: "2026年05月", range: "2026-05-01 — 2026-05-31", time: "2026-06-05 09:42", seed: 8 }
  ].filter((template, index) => activeLists.length && activeLists[index]).map((template, index) => {
    const list = activeLists[index];
    const rows = buildDemoResults(template.seed, list.id, list.bankName).slice(0, list.companyCount);
    const counts = riskCountsForRows(rows);
    return { month: template.month, range: template.range, total: rows.length, ...counts, status: "已完成", time: template.time, listId: list.id, bankName: list.bankName };
  });
  state.batches = [...currentBatches.map(({ rows, ...batch }) => batch), ...historicalBatches];
}

function currentRiskChangeAlerts() {
  buildCurrentPostloanDataset();
  const activeLists = state.listRecords.filter(list => list.status === "有效" && belongsToCurrentBank(list.bankName));
  const activeListIds = new Set(activeLists.map(list => list.id));
  const previousLevelByEnterprise = new Map();
  activeLists.forEach(list => {
    buildDemoResults(9, list.id, list.bankName).slice(0, list.companyCount).forEach(row => {
      previousLevelByEnterprise.set(`${list.id}::${row.code}`, row.level);
    });
  });
  return state.postloanResults
    .filter(row => activeListIds.has(row.listId))
    .map(row => ({ ...row, previousLevel: previousLevelByEnterprise.get(`${row.listId}::${row.code}`) || "none" }))
    .filter(row => ["medium", "high"].includes(row.level) && ["none", "low"].includes(row.previousLevel))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN") || a.bankName.localeCompare(b.bankName, "zh-CN") || a.listId.localeCompare(b.listId));
}

state.listRecords = buildListRecords();
state.logRecords = buildLogRecords();
state.permissionAccounts = buildPermissionAccounts();
refreshExpiredListStatuses();
const initialPreloanHistory = [
  { date: new Date("2026-08-25T08:45:00"), bankName: "江西银行", seed: 0 },
  { date: new Date("2026-07-18T14:20:00"), bankName: "九江银行", seed: 1 },
  { date: new Date("2026-06-12T10:16:00"), bankName: "南昌农商银行", seed: 2 },
  { date: new Date("2026-05-09T16:32:00"), bankName: "赣州银行", seed: 3 }
];
state.preloanResults = buildDemoResults(0, createPreloanListId(initialPreloanHistory[0].date), initialPreloanHistory[0].bankName);
state.preloanHistory = initialPreloanHistory.map(item => {
  const listId = item.seed === 0 ? state.preloanResults[0].listId : createPreloanListId(item.date);
  const results = item.seed === 0 ? state.preloanResults : buildDemoResults(item.seed, listId, item.bankName);
  return {
    listId,
    bankName: item.bankName,
    companyCount: results.length,
    queryAt: formatDateTime(item.date),
    dateKey: `${item.date.getFullYear()}-${pad(item.date.getMonth() + 1)}-${pad(item.date.getDate())}`,
    timestamp: item.date.getTime(),
    results
  };
});
buildCurrentPostloanDataset();

const levelText = { high: "高风险", medium: "中风险", low: "低风险", none: "无风险" };
const levelClass = { high: "high", medium: "medium", low: "low", none: "none" };
const riskEventDirections = {
  "授信前资金行为异常": "核查授信前资金来源、资金用途及短期集中流入情况。",
  "账户资金流转异常": "核查账户间资金划转路径、收支节奏及异常资金去向。",
  "资金循环特征异常": "核查关联交易对手、资金回流路径及交易闭环情况。",
  "交易金额规律异常": "核查交易金额分布、整数金额占比及异常拆分情况。",
  "非营业时段交易异常": "核查非营业时段交易的业务背景、交易对手和必要性。",
  "经营流水波动异常": "结合经营资料核查收入、回款及流水波动的合理性。",
  "交易信息完整性异常": "核查交易摘要、对手信息及相关业务凭证的完整性。",
  "企业经营融资异常": "结合企业经营状况和融资信息核查资金需求及偿债安排。"
};
const coreRiskEvents = new Set(["授信前资金行为异常", "账户资金流转异常", "资金循环特征异常", "交易金额规律异常"]);
const roleProfiles = {
  bank: { name: "风险管理岗", institution: "用户" },
  operator: { name: "产品运营人员", institution: "平台运营中心" },
  admin: { name: "系统管理员", institution: "用户" }
};
const demoAccounts = {
  "001@jxphzx.com": { password: "Password1234", role: "operator", permissionAdmin: true, enabled: true },
  "002@jxphzx.com": { password: "Password1234", role: "operator", permissionAdmin: true, enabled: true },
  "003@jxphzx.com": { password: "Password1234", role: "operator", permissionAdmin: false, enabled: true },
  "aaa@jsbank.com": { password: "Password1234", role: "bank", permissionAdmin: false, enabled: true },
  "ccc@jsbank.com": { password: "Password1234", role: "bank", permissionAdmin: false, enabled: true },
  "bbb@jjbank.com": { password: "Password1234", role: "bank", permissionAdmin: false, enabled: true }
};
const accountFormats = [
  { role: "operator", pattern: /^[^@\s]+@jxphzx\.com$/i },
  { role: "bank", pattern: /^[^@\s]+@[^@\s]+bank\.com$/i }
];
const bankDomainInstitutions = { "jsbank.com": "江西银行", "jjbank.com": "九江银行" };

function isBankUser() { return demoAccounts[state.currentAccount]?.role === "bank"; }

function currentBankInstitution() {
  if (!isBankUser()) return "";
  const domain = String(state.currentAccount).split("@")[1]?.toLowerCase() || "";
  return bankDomainInstitutions[domain] || getPermissionRecord()?.institution || domain;
}

function belongsToCurrentBank(bankName) {
  return !isBankUser() || bankName === currentBankInstitution();
}

function buildPermissionAccounts() {
  return [
    { account: "001@jxphzx.com", type: "运营账号", institution: "平台运营中心", permission: "最高权限", status: "有效", createdAt: "2026/08/01", builtin: true },
    { account: "002@jxphzx.com", type: "运营账号", institution: "平台运营中心", permission: "最高权限", status: "有效", createdAt: "2026/08/12", builtin: false },
    { account: "003@jxphzx.com", type: "运营账号", institution: "平台运营中心", permission: "业务操作", status: "有效", createdAt: "2026/08/15", builtin: false },
    { account: "AAA@jsbank.com", type: "银行机构用户", institution: "江西银行", permission: "业务操作", status: "有效", createdAt: "2026/08/18", builtin: false },
    { account: "CCC@jsbank.com", type: "银行机构用户", institution: "江西银行", permission: "业务操作", status: "有效", createdAt: "2026/08/22", builtin: false },
    { account: "BBB@jjbank.com", type: "银行机构用户", institution: "九江银行", permission: "业务操作", status: "有效", createdAt: "2026/08/20", builtin: false }
  ];
}

function getPermissionRecord(account = state.currentAccount) {
  const accountKey = String(account || "").toLowerCase();
  return state.permissionAccounts.find(item => item.account.toLowerCase() === accountKey) || null;
}

function currentPermissionLevel() {
  return getPermissionRecord()?.permission || (demoAccounts[state.currentAccount]?.permissionAdmin ? "最高权限" : "只读查看");
}

function canViewPermissionManagement() {
  const config = demoAccounts[state.currentAccount];
  return config?.role === "operator" && Boolean(getPermissionRecord());
}

function canAddPermissionAccount() {
  const record = getPermissionRecord();
  return Boolean(record && (record.builtin || record.permission === "最高权限" || (record.permission === "业务操作" && record.type === "运营账号")));
}

function canManagePermissionRecord(target) {
  const current = getPermissionRecord();
  if (!current || target.account.toLowerCase() === state.currentAccount.toLowerCase() || target.builtin) return false;
  if (current.builtin) return true;
  return current.permission === "最高权限" && target.permission === "业务操作";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function formatRiskEvents(events) {
  return events.length ? events.map(event => `<span class="rule-tag">${escapeHTML(event)}</span>`).join("") : `<span class="muted-text">未触发风险事件</span>`;
}

function formatAiRiskEvents(events) {
  return events.length ? events.map(event => `<span class="risk-event-chip ${coreRiskEvents.has(event) ? "core" : "non-core"}">${escapeHTML(event)}</span>`).join("") : `<span class="muted-text">未触发风险事件</span>`;
}

function riskBadge(level) {
  return `<span class="risk-badge ${levelClass[level]}">${levelText[level]}</span>`;
}

function renderBankDashboard() {
  const riskTotal = 1286;
  const trendMax = Math.max(...trendData.map(item => Math.max(item.high, item.medium)));
  const trendBars = trendData.map(item => `<div class="bar-group"><div class="bar-pair"><div class="bar-slot"><em>${item.high}</em><div class="bar bar-high" style="height:${Math.max(9, item.high / trendMax * 100)}%"></div></div><div class="bar-slot"><em>${item.medium}</em><div class="bar bar-medium" style="height:${Math.max(9, item.medium / trendMax * 100)}%"></div></div></div><span>${item.month}</span></div>`).join("");
  document.querySelector("#dashboardView").innerHTML = `
    <div class="page-heading">
      <div><div class="eyebrow">Risk insight / 2026.07</div><h1>工作台</h1><p>聚焦企业名单风险变化，快速进入筛查与监控任务。</p></div>
      <button class="button ghost" id="refreshDashboard">↻ 刷新数据</button>
    </div>
    <div class="hero-banner">
      <div class="hero-content"><div class="eyebrow">本月风险监测概览</div><h1>把风险线索，变成可核查的结果</h1><p>基于经授权使用的企业流水数据，支持贷前即时筛查与贷中月度监控。</p></div>
      <div class="hero-meta"><strong>1,286</strong>家企业已完成本月监测<br/>数据截止：2026-07-31</div>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-top"><span>监测企业总数</span><span class="stat-icon teal">▦</span></div><div class="stat-value">1,286</div><div class="stat-foot">较上月 <span class="up">↑ 3.6%</span></div></div>
      <div class="stat-card"><div class="stat-top"><span>高风险企业</span><span class="stat-icon red">!</span></div><div class="stat-value">38</div><div class="stat-foot">占比 2.95%，需优先核查</div></div>
      <div class="stat-card"><div class="stat-top"><span>中风险企业</span><span class="stat-icon orange">△</span></div><div class="stat-value">164</div><div class="stat-foot">占比 12.75%，建议持续关注</div></div>
      <div class="stat-card"><div class="stat-top"><span>无风险企业</span><span class="stat-icon blue">✓</span></div><div class="stat-value">1,017</div><div class="stat-foot">占比 79.08%，当前占比最高</div></div>
    </div>
    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel-header"><div><h3>业务入口</h3><p>选择业务场景，开始名单查询或查看月度结果</p></div></div>
        <div class="panel-body quick-actions">
          <div class="quick-card" data-go-view="preloan"><div class="quick-card-icon search">⌕</div><div class="quick-card-copy"><strong>贷前筛查</strong><span>导入企业名单，单次查询并即时获取风险结果</span></div><div class="quick-card-arrow">›</div></div>
          <div class="quick-card" data-go-view="postloan"><div class="quick-card-icon clock">◷</div><div class="quick-card-copy"><strong>贷中监控</strong><span>按月自动运行监控批次，查看企业风险变化</span></div><div class="quick-card-arrow">›</div></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><h3>本月风险分布</h3><p>按风险等级统计</p></div><span class="muted-text">2026年07月</span></div>
        <div class="panel-body chart-area"><div class="donut"><div class="donut-center"><strong>${riskTotal}</strong><span>监测企业</span></div></div><div class="legend"><div class="legend-row"><i class="legend-dot" style="background:var(--red)"></i><span>高风险</span><strong>38 <small>2.95%</small></strong></div><div class="legend-row"><i class="legend-dot" style="background:var(--orange)"></i><span>中风险</span><strong>164 <small>12.75%</small></strong></div><div class="legend-row"><i class="legend-dot" style="background:var(--teal)"></i><span>低风险</span><strong>67 <small>5.21%</small></strong></div><div class="legend-row"><i class="legend-dot" style="background:#7d9bb5"></i><span>无风险</span><strong>1,017 <small>79.08%</small></strong></div></div></div>
      </div>
    </div>
    <div class="panel trend-panel"><div class="panel-header"><div><h3>风险企业趋势</h3><p>近六个月高风险与中风险企业数量变化</p></div><div class="trend-header-right"><div class="trend-legend"><span><i class="legend-dot" style="background:var(--red)"></i>高风险</span><span><i class="legend-dot" style="background:var(--orange)"></i>中风险</span></div><span class="muted-text">单位：家</span></div></div><div class="panel-body"><div class="bar-chart">${trendBars}</div></div></div>
  `;
  document.querySelector("#refreshDashboard").addEventListener("click", () => showToast("数据已刷新，当前为最新监测结果"));
  document.querySelectorAll("[data-go-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.goView)));
}

function monthKeyFromDateKey(dateKey) {
  const parts = String(dateKey).split(/[\/-]/);
  return parts.length >= 2 ? `${parts[0]}/${pad(parts[1])}` : "";
}

function monthKeyFromBatch(month) {
  const match = String(month).match(/(\d{4})年(\d{1,2})月/);
  return match ? `${match[1]}/${pad(match[2])}` : String(month);
}

function monthLabel(monthKey) {
  const parts = String(monthKey).split("/");
  return parts.length === 2 ? `${parts[0]}年${parts[1]}月` : monthKey;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}`;
}

function currentPreloanResults() {
  const month = currentMonthKey();
  return state.preloanHistory.filter(record => monthKeyFromDateKey(record.dateKey) === month && belongsToCurrentBank(record.bankName)).flatMap(record => record.results);
}

function currentPostloanResults() {
  const activeListIds = new Set(state.listRecords.filter(list => list.status === "有效").map(list => list.id));
  const currentMonth = "2026/07";
  return state.postloanResults.filter(row => activeListIds.has(row.listId) && monthKeyFromDateKey(row.month) === currentMonth && belongsToCurrentBank(row.bankName));
}

function addRiskCount(target, level, count = 1) {
  if (level === "high") target.high += count;
  else if (level === "medium") target.medium += count;
  else if (level === "low") target.low += count;
  else if (level === "none") target.none += count;
}

function blankRiskCounts() { return { high: 0, medium: 0, low: 0, none: 0 }; }

function preloanRiskCounts(records) {
  const counts = blankRiskCounts();
  records.forEach(record => record.results.forEach(row => addRiskCount(counts, row.level)));
  return counts;
}

function postloanRiskCounts(batches) {
  return batches.reduce((counts, batch) => ({ high: counts.high + batch.high, medium: counts.medium + batch.medium, low: counts.low + batch.low, none: counts.none + batch.none }), blankRiskCounts());
}

function sortMonthKeys(months) {
  return [...new Set(months.filter(Boolean))].sort((a, b) => b.localeCompare(a));
}

function getDashboardOverview(mode, institution = "") {
  const scoped = Boolean(institution);
  if (mode === "preloan") {
    const monthMap = new Map();
    const records = state.preloanHistory.filter(record => !scoped || record.bankName === institution);
    records.forEach(record => {
      const month = monthKeyFromDateKey(record.dateKey);
      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month).push(record);
    });
    const months = sortMonthKeys([...monthMap.keys()]);
    const selectedMonthState = "dashboardPreloanMonth";
    const selectedMonth = state[selectedMonthState] === "latest" || !months.includes(state[selectedMonthState]) ? (months[0] || "") : state[selectedMonthState];
    state[selectedMonthState] = selectedMonth || "latest";
    const allCounts = preloanRiskCounts(records);
    const monthlyRecords = monthMap.get(selectedMonth) || [];
    const allTotal = allCounts.high + allCounts.medium + allCounts.low + allCounts.none;
    return { months, selectedMonth, allTotal, allCounts, monthlyCounts: preloanRiskCounts(monthlyRecords), trend: months, getMonthCounts: month => preloanRiskCounts(monthMap.get(month) || []) };
  }
  const monthMap = new Map();
  const batches = state.batches.filter(batch => !scoped || batch.bankName === institution);
  batches.forEach(batch => {
    const month = monthKeyFromBatch(batch.month);
    monthMap.set(month, (monthMap.get(month) || []).concat(batch));
  });
  const months = sortMonthKeys([...monthMap.keys()]);
  const selectedMonthState = "dashboardPostloanMonth";
  const selectedMonth = state[selectedMonthState] === "latest" || !months.includes(state[selectedMonthState]) ? (months[0] || "") : state[selectedMonthState];
  state[selectedMonthState] = selectedMonth || "latest";
  const allCounts = postloanRiskCounts(batches);
  const monthlyBatches = monthMap.get(selectedMonth) || [];
  const allTotal = allCounts.high + allCounts.medium + allCounts.low + allCounts.none;
  return { months, selectedMonth, allTotal, allCounts, monthlyCounts: postloanRiskCounts(monthlyBatches), trend: months, getMonthCounts: month => postloanRiskCounts(monthMap.get(month) || []) };
}

function getOperatorOverview(mode) {
  return getDashboardOverview(mode);
}

function getScopedBankOverview(mode) {
  return getDashboardOverview(mode, currentBankInstitution());
}

function sixMonthKeys(latestMonth) {
  const [year, month] = String(latestMonth || "2026/07").split("/").map(Number);
  const end = new Date(year || 2026, (month || 7) - 1, 1);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(end.getFullYear(), end.getMonth() - (5 - index), 1);
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}`;
  });
}

function buildOperatorTrend(overview) {
  const latest = overview.months[0] || (overview.mode === "postloan" ? "2026/07" : "2026/08");
  return sixMonthKeys(latest).map(month => ({ month, ...overview.getMonthCounts(month) }));
}

function lineChartMarkup(data) {
  const width = 760;
  const height = 235;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 36;
  const maxValue = Math.max(1, ...data.map(item => Math.max(item.high, item.medium)));
  const tickStep = Math.max(1, Math.ceil(maxValue / 4));
  const chartMax = tickStep * 4;
  const x = index => left + index * ((width - left - right) / Math.max(1, data.length - 1));
  const y = value => top + (height - top - bottom) * (1 - value / chartMax);
  const grid = Array.from({ length: 4 }, (_, index) => {
    const value = tickStep * (index + 1);
    const lineY = y(value);
    return `<line x1="${left}" y1="${lineY}" x2="${width - right}" y2="${lineY}" class="line-grid"/><text x="${left - 9}" y="${lineY + 4}" text-anchor="end" class="line-axis-label">${value}</text>`;
  }).join("");
  const series = [{ key: "high", color: "#c6535d" }, { key: "medium", color: "#d8893c" }];
  const lines = series.map(item => {
    const points = data.map((row, index) => `${x(index)},${y(row[item.key])}`).join(" ");
    const dots = data.map((row, index) => {
      const highY = y(row.high);
      const mediumY = y(row.medium);
      const crowded = Math.abs(highY - mediumY) < 18;
      const offset = -9;
      const labelX = x(index) + (crowded ? (item.key === "high" ? -9 : 9) : 0);
      const anchor = crowded ? (item.key === "high" ? "end" : "start") : "middle";
      const labelY = Math.max(top + 10, Math.min(height - bottom - 5, y(row[item.key]) + offset));
      return `<circle cx="${x(index)}" cy="${y(row[item.key])}" r="3.2" fill="#fffefb" stroke="${item.color}" stroke-width="2"/><text x="${labelX}" y="${labelY}" text-anchor="${anchor}" class="line-value-label" style="fill:${item.color}">${row[item.key]}</text>`;
    }).join("");
    return `<polyline points="${points}" fill="none" stroke="${item.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
  }).join("");
  const labels = data.map((row, index) => `<text x="${x(index)}" y="${height - 10}" text-anchor="middle" class="line-axis-label">${row.month}</text>`).join("");
  return `<div class="line-chart-wrap"><svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="近六个月风险企业趋势折线图">${grid}<line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" class="line-axis"/>${lines}${labels}</svg></div>`;
}

function riskDistributionMarkup(overview) {
  const counts = overview.monthlyCounts;
  const total = counts.high + counts.medium + counts.low + counts.none;
  const highEnd = total ? counts.high / total * 100 : 0;
  const mediumEnd = total ? (counts.high + counts.medium) / total * 100 : 0;
  const lowEnd = total ? (counts.high + counts.medium + counts.low) / total * 100 : 0;
  const donutStyle = `background:conic-gradient(var(--red) 0 ${highEnd}%, var(--orange) ${highEnd}% ${mediumEnd}%, var(--teal) ${mediumEnd}% ${lowEnd}%, #7d9bb5 ${lowEnd}% 100%)`;
  const legendRow = (label, value, color) => `<div class="legend-row"><i class="legend-dot" style="background:${color}"></i><span>${label}</span><strong>${value.toLocaleString()} <small>${total ? (value / total * 100).toFixed(2) : "0.00"}%</small></strong></div>`;
  const monthOptions = overview.months.map(month => `<option value="${escapeHTML(month)}" ${overview.selectedMonth === month ? "selected" : ""}>${escapeHTML(monthLabel(month))}</option>`).join("");
  return `<div class="panel"><div class="panel-header"><div><h3>风险分布</h3><p>按选定月份展示高、中、低、无风险企业分布</p></div><select class="select-input dashboard-month-select" id="dashboardMonthSelect">${monthOptions}</select></div><div class="panel-body chart-area"><div class="donut" style="${donutStyle}"><div class="donut-center"><strong>${total.toLocaleString()}</strong><span>监测企业</span></div></div><div class="legend">${legendRow("高风险", counts.high, "var(--red)")}${legendRow("中风险", counts.medium, "var(--orange)")}${legendRow("低风险", counts.low, "var(--teal)")}${legendRow("无风险", counts.none, "#7d9bb5")}</div></div></div>`;
}

function operatorStatMarkup(overview, mode) {
  const title = mode === "preloan" ? "查询企业总数" : "监控企业总数";
  const totalLabel = mode === "preloan" ? "累计贷前查询企业" : "累计完成贷中跑批企业";
  const counts = overview.allCounts;
  return `<div class="stat-card"><div class="stat-top"><span>${title}</span><span class="stat-icon teal">▦</span></div><div class="stat-value">${overview.allTotal.toLocaleString()}</div><div class="stat-foot">${totalLabel}，不限制当月</div></div><div class="stat-card"><div class="stat-top"><span>高风险企业</span><span class="stat-icon red">!</span></div><div class="stat-value">${counts.high.toLocaleString()}</div><div class="stat-foot">累计高风险结果</div></div><div class="stat-card"><div class="stat-top"><span>中风险企业</span><span class="stat-icon orange">△</span></div><div class="stat-value">${counts.medium.toLocaleString()}</div><div class="stat-foot">累计中风险结果</div></div><div class="stat-card"><div class="stat-top"><span>低风险企业</span><span class="stat-icon blue">✓</span></div><div class="stat-value">${counts.low.toLocaleString()}</div><div class="stat-foot">累计低风险结果</div></div>`;
}

function dashboardRiskEventRows(mode) {
  const levelWeight = { high: 3, medium: 2, low: 1, none: 0 };
  const rows = mode === "preloan" ? currentPreloanResults() : currentPostloanResults();
  const eventMap = new Map();
  rows.forEach(row => (row.events || []).forEach(event => {
    if (!eventMap.has(event)) eventMap.set(event, { event, count: 0, level: "none", enterprises: new Set() });
    const item = eventMap.get(event);
    const enterpriseKey = String(row.code || row.name || "");
    if (!item.enterprises.has(enterpriseKey)) {
      item.enterprises.add(enterpriseKey);
      item.count += 1;
    }
    if (levelWeight[row.level] > levelWeight[item.level]) item.level = row.level;
  }));
  return [...eventMap.values()].sort((a, b) => b.count - a.count || a.event.localeCompare(b.event, "zh-CN"));
}

function dashboardRiskEventDetailRows(mode, eventName) {
  const rows = mode === "preloan" ? currentPreloanResults() : currentPostloanResults();
  const detailMap = new Map();
  rows.filter(row => (row.events || []).includes(eventName)).forEach(row => {
    const enterpriseKey = String(row.code || row.name || "");
    if (!detailMap.has(enterpriseKey)) {
      detailMap.set(enterpriseKey, { name: row.name, code: row.code, listIds: new Set(), events: new Set(), banks: new Set() });
    }
    const item = detailMap.get(enterpriseKey);
    if (row.listId) item.listIds.add(row.listId);
    if (row.bankName) item.banks.add(row.bankName);
    (row.events || []).forEach(event => item.events.add(event));
  });
  return [...detailMap.values()].map(item => ({
    ...item,
    listIds: [...item.listIds].sort((a, b) => a.localeCompare(b, "zh-CN")),
    events: [...item.events].sort((a, b) => a.localeCompare(b, "zh-CN")),
    banks: [...item.banks].sort((a, b) => a.localeCompare(b, "zh-CN"))
  })).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

function dashboardRiskEventMarkup(mode) {
  const items = dashboardRiskEventRows(mode);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, state.dashboardEventPage[mode] || 1), totalPages);
  state.dashboardEventPage[mode] = currentPage;
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const latestMonitorMonth = sortMonthKeys(state.batches.map(batch => monthKeyFromBatch(batch.month)))[0] || "";
  const periodText = mode === "preloan" ? `${monthLabel(currentMonthKey())} · 截至当前日期` : `${monthLabel(latestMonitorMonth)} · 跑批完成后更新`;
  const rowsMarkup = pageItems.length ? pageItems.map((item, index) => { const category = coreRiskEvents.has(item.event) ? "core" : "non-core"; const categoryText = category === "core" ? "核心风险事件" : "非核心风险事件"; return `<div class="risk-event-row"><span class="risk-event-rank">${start + index + 1}</span><div class="risk-event-copy"><strong class="risk-event-inline ${category}">${categoryText}：${escapeHTML(item.event)}</strong></div><button type="button" class="risk-event-count" data-dashboard-event="${escapeHTML(item.event)}" aria-label="查看${escapeHTML(item.event)}企业明细">${item.count.toLocaleString()}<small>家</small></button></div>`; }).join("") : `<div class="empty-state">当前月度暂无风险事件</div>`;
  const pageButtons = Array.from({ length: totalPages }, (_, index) => index + 1).map(page => `<button class="page-button ${page === currentPage ? "active" : ""}" data-dashboard-event-page="${page}">${page}</button>`).join("");
  return `<div class="panel risk-event-panel"><div class="panel-header"><div><h3>当前月度风险事件提示</h3><p>${mode === "preloan" ? "按当月已查询企业的风险事件数量排序" : "按最新月度跑批企业的风险事件数量排序"}</p></div><span class="muted-text">${escapeHTML(periodText)}</span></div><div class="panel-body risk-event-list">${rowsMarkup}</div><div class="result-pagination risk-event-pagination"><span>共 ${items.length} 类风险事件 · 第 ${currentPage}/${totalPages} 页</span><div class="page-controls"><button class="page-button" data-dashboard-event-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹</button>${pageButtons}<button class="page-button" data-dashboard-event-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>›</button></div></div></div>`;
}

function renderDashboardOverview(institution = "") {
  const mode = state.dashboardMode;
  const overview = institution ? getScopedBankOverview(mode) : getOperatorOverview(mode);
  overview.mode = mode;
  const trend = buildOperatorTrend(overview);
  const modeLabel = mode === "preloan" ? "贷前总览" : "贷中总览";
  const heroLabel = mode === "preloan" ? "累计贷前查询概览" : "累计贷中监控概览";
  const headingDescription = institution ? "面向机构用户的本机构业务数据概览与风险趋势分析。" : "面向运营人员的全量业务数据概览与风险趋势分析。";
  const heroDescription = institution ? `汇总${escapeHTML(institution)}的名单查询和月度监控结果，支持按业务场景查看风险变化。` : "汇总所有用户的名单查询和月度监控结果，支持按业务场景查看风险变化。";
  document.querySelector("#dashboardView").innerHTML = `<div class="page-heading dashboard-heading"><div><div class="eyebrow">Operations overview / ${mode === "preloan" ? "Pre-loan" : "Post-loan"}</div><h1>总览</h1><p>${headingDescription}</p></div><div class="dashboard-tabs" role="tablist"><button class="dashboard-tab ${mode === "preloan" ? "active" : ""}" data-dashboard-mode="preloan">贷前总览</button><button class="dashboard-tab ${mode === "postloan" ? "active" : ""}" data-dashboard-mode="postloan">贷中总览</button></div></div>
    <div class="hero-banner"><div class="hero-content"><div class="eyebrow">${heroLabel}</div><h1>把风险线索，变成可核查的结果</h1><p>${heroDescription}</p></div><div class="hero-meta"><strong>${overview.allTotal.toLocaleString()}</strong>${mode === "preloan" ? "家企业已完成贷前查询" : "家企业已完成贷中跑批"}<br/>统计范围：截至当前</div></div>
    <div class="stat-grid">${operatorStatMarkup(overview, mode)}</div>
    <div class="dashboard-grid operator-dashboard-grid"><div>${riskDistributionMarkup(overview)}</div><div>${dashboardRiskEventMarkup(mode)}</div></div>
    <div class="panel trend-panel"><div class="panel-header"><div><h3>风险企业趋势</h3><p>近六个月高风险与中风险企业数量变化</p></div><div class="trend-header-right"><div class="trend-legend"><span><i class="legend-dot" style="background:var(--red)"></i>高风险</span><span><i class="legend-dot" style="background:var(--orange)"></i>中风险</span></div><span class="muted-text">单位：家</span></div></div><div class="panel-body">${lineChartMarkup(trend)}</div></div>`;
  document.querySelectorAll("[data-dashboard-mode]").forEach(button => button.addEventListener("click", () => { state.dashboardMode = button.dataset.dashboardMode; renderDashboard(); }));
  document.querySelector("#dashboardMonthSelect").addEventListener("change", event => { state[mode === "preloan" ? "dashboardPreloanMonth" : "dashboardPostloanMonth"] = event.target.value; renderDashboard(); });
  document.querySelectorAll("[data-dashboard-event-page]").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.dashboardEventPage[mode] = Number(button.dataset.dashboardEventPage); renderDashboard(); } }));
  document.querySelectorAll("[data-dashboard-event]").forEach(button => button.addEventListener("click", () => openDashboardEventModal(mode, button.dataset.dashboardEvent)));
  document.querySelectorAll("[data-go-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.goView)));
}

function renderOperatorDashboard() {
  renderDashboardOverview();
}

function renderScopedBankDashboard() {
  renderDashboardOverview(currentBankInstitution());
}

function renderDashboard() {
  buildCurrentPostloanDataset();
  if (demoAccounts[state.currentAccount]?.role === "operator") renderOperatorDashboard();
  else if (isBankUser()) renderScopedBankDashboard();
  else renderBankDashboard();
  updateRiskChangeNotification();
}

function resultRows(results, type, includeListId = false, includeBank = false) {
  if (!results.length) return `<tr><td colspan="${5 + (includeListId ? 1 : 0) + (includeBank ? 1 : 0)}"><div class="empty-state">没有符合条件的结果</div></td></tr>`;
  return results.map(row => `<tr>
    <td><div class="company-cell"><strong>${escapeHTML(row.name)}</strong><span>${escapeHTML(row.code)}</span></div></td>
    ${includeListId ? `<td><span class="list-id table-list-id">${escapeHTML(row.listId || "—")}</span></td>` : ""}
    ${includeBank ? `<td>${escapeHTML(row.bankName || "—")}</td>` : ""}
    <td>${escapeHTML(row.month)}</td>
    <td><div class="rule-tags">${formatRiskEvents(row.events || [])}</div></td>
    <td>${riskBadge(row.level)}</td>
    <td><div class="row-actions"><button class="text-button ai" data-result-code="${escapeHTML(row.code)}" data-result-list-id="${escapeHTML(row.listId || "")}" data-result-type="${type}">AI解读</button><button class="text-button" data-export-code="${escapeHTML(row.code)}" data-export-list-id="${escapeHTML(row.listId || "")}" data-result-type="${type}">导出</button></div></td>
  </tr>`).join("");
}

function filteredResults(results, type = "preloan") {
  return results.filter(row => {
    const matchesRisk = state.selectedRisk === "all" || row.level === state.selectedRisk;
    const haystack = `${row.name}${row.code}${(row.events || []).join("")}`.toLowerCase();
    const bankScopeMatched = belongsToCurrentBank(row.bankName);
    const matchesBank = type === "postloan" ? (state.postBankFilter === "all" || row.bankName === state.postBankFilter) : type === "preloan" ? (state.preloanResultBankFilter === "all" || row.bankName === state.preloanResultBankFilter) : true;
    const listFilter = type === "preloan" ? state.preloanListFilter : state.postListQuery;
    const matchesList = listFilter === "all" || !listFilter || row.listId === listFilter;
    return bankScopeMatched && matchesRisk && matchesBank && matchesList && haystack.includes(state.query.toLowerCase());
  }).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

function paginationMarkup(total, page, pageKey, size = pageSize, showTotal = true) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).map(number => `<button class="page-button ${number === page ? "active" : ""}" data-page-key="${pageKey}" data-page="${number}">${number}</button>`).join("");
  return `<div class="result-pagination"><span>${showTotal ? `共 ${total} 家企业 · ` : ""}第 ${page}/${totalPages} 页</span><div class="page-controls"><button class="page-button" data-page-key="${pageKey}" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹</button>${pages}<button class="page-button" data-page-key="${pageKey}" data-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>›</button></div></div>`;
}

function resultTable(results, type, title = "监测结果", description = "一家企业一行，多类风险事件合并展示", includeListId = false) {
  const pageKey = `${type}Page`;
  const filtered = filteredResults(results, type);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, state[pageKey]), totalPages);
  state[pageKey] = page;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const listOptions = [...new Set(results.map(item => item.listId).filter(Boolean))];
  const resultBankOptions = [...new Set(results.map(item => item.bankName).filter(Boolean))];
  const monthLabelText = type === "preloan" ? "查询月份" : "监测月份";
  const includeBank = includeListId && !isBankUser();
  const bankFilterClass = isBankUser() ? " hidden-app" : "";
  const riskFilter = `<select class="select-input" id="riskFilter"><option value="all">全部风险等级</option><option value="high" ${state.selectedRisk === "high" ? "selected" : ""}>高风险</option><option value="medium" ${state.selectedRisk === "medium" ? "selected" : ""}>中风险</option><option value="low" ${state.selectedRisk === "low" ? "selected" : ""}>低风险</option><option value="none" ${state.selectedRisk === "none" ? "selected" : ""}>无风险</option></select>`;
  const resultFilters = type === "postloan" ? `<select class="select-input${bankFilterClass}" id="postBankFilter"><option value="all">全部银行机构</option>${[...new Set(state.listRecords.map(item => item.bankName))].map(bank => `<option value="${escapeHTML(bank)}" ${state.postBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><select class="select-input list-filter-input" id="postListFilter"><option value="all">全部名单编号</option>${listOptions.map(listId => `<option value="${escapeHTML(listId)}" ${state.postListQuery === listId ? "selected" : ""}>${escapeHTML(listId)}</option>`).join("")}</select>` : type === "preloan" ? `<select class="select-input${bankFilterClass}" id="preloanResultBankFilter"><option value="all">全部银行机构</option>${resultBankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.preloanResultBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><select class="select-input list-filter-input" id="preloanListFilter"><option value="all">全部名单编号</option>${listOptions.map(listId => `<option value="${escapeHTML(listId)}" ${state.preloanListFilter === listId ? "selected" : ""}>${escapeHTML(listId)}</option>`).join("")}</select>` : "";
  return `<div class="panel result-panel"><div class="panel-header"><div><h3>${title}</h3><p>${description}</p></div><div class="result-toolbar"><input class="search-input" id="resultSearch" type="search" placeholder="搜索企业名称或代码" value="${escapeHTML(state.query)}"/>${riskFilter}${resultFilters}<button class="button ghost" id="exportAll">↓ 导出结果</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>企业名称 / 组织机构代码</th>${includeListId ? "<th>名单编号</th>" : ""}${includeBank ? "<th>银行机构</th>" : ""}<th>${monthLabelText}</th><th>风险事件</th><th>风险等级</th><th>操作</th></tr></thead><tbody>${resultRows(pageRows, type, includeListId, includeBank)}</tbody></table></div>${paginationMarkup(filtered.length, page, pageKey)}</div>`;
}

function bindResultEvents(results, type) {
  const search = document.querySelector("#resultSearch");
  const filter = document.querySelector("#riskFilter");
  const pageKey = `${type}Page`;
  search.addEventListener("input", event => { state.query = event.target.value; state[pageKey] = 1; renderCurrentView(); });
  filter.addEventListener("change", event => { state.selectedRisk = event.target.value; state[pageKey] = 1; renderCurrentView(); });
  if (type === "postloan") {
    document.querySelector("#postBankFilter").addEventListener("change", event => { state.postBankFilter = event.target.value; state.postloanPage = 1; renderCurrentView(); });
    document.querySelector("#postListFilter").addEventListener("change", event => { state.postListQuery = event.target.value; state.postloanPage = 1; renderCurrentView(); });
  }
  if (type === "preloan") {
    document.querySelector("#preloanResultBankFilter").addEventListener("change", event => { state.preloanResultBankFilter = event.target.value; state.preloanPage = 1; renderCurrentView(); });
    document.querySelector("#preloanListFilter").addEventListener("change", event => { state.preloanListFilter = event.target.value; state.preloanPage = 1; renderCurrentView(); });
  }
  document.querySelector("#exportAll").addEventListener("click", () => exportResults(filteredResults(results, type), "风险监测结果", true));
  document.querySelectorAll("[data-page-key]").forEach(button => button.addEventListener("click", () => {
    if (button.disabled) return;
    state[button.dataset.pageKey] = Number(button.dataset.page);
    renderCurrentView();
  }));
  document.querySelectorAll("[data-result-code]").forEach(button => button.addEventListener("click", () => {
    const row = results.find(item => item.code === button.dataset.resultCode && (!button.dataset.resultListId || item.listId === button.dataset.resultListId));
    openAiModal(row, button.dataset.resultType);
  }));
  document.querySelectorAll("[data-export-code]").forEach(button => button.addEventListener("click", () => {
    const row = results.find(item => item.code === button.dataset.exportCode && (!button.dataset.exportListId || item.listId === button.dataset.exportListId));
    if (!row) return;
    exportResults([row], `${row.name}-风险结果`, true);
  }));
}

function refreshExpiredListStatuses(now = new Date()) {
  state.listRecords.forEach(list => {
    if (list.status === "有效" && parseListDate(list.stopDate) < now) list.status = "失效";
  });
}

function filteredListRecords() {
  refreshExpiredListStatuses();
  return state.listRecords.filter(list => {
    const bankScopeMatched = belongsToCurrentBank(list.bankName);
    const deletedVisible = !isBankUser() || list.status !== "已删除";
    const bankMatched = state.listBankFilter === "all" || list.bankName === state.listBankFilter;
    const idMatched = !state.listIdQuery || list.id.toLowerCase().includes(state.listIdQuery.toLowerCase());
    return bankScopeMatched && deletedVisible && bankMatched && idMatched;
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function listManagementRows(records) {
  if (!records.length) return `<tr><td colspan="7"><div class="empty-state">没有符合条件的名单</div></td></tr>`;
  return records.map(list => `<tr>
    <td><div class="list-id">${escapeHTML(list.id)}</div><span class="list-status ${list.status !== "有效" ? "stopped" : ""}">${escapeHTML(list.status)}</span></td>
    <td>${escapeHTML(list.bankName)}</td>
    <td><span class="list-count">${list.companyCount.toLocaleString()}</span> 家</td>
    <td class="muted-text">${escapeHTML(list.importAt)}</td>
    <td class="muted-text">${escapeHTML(list.startDate)}</td>
    <td class="muted-text">${escapeHTML(list.stopDate)}</td>
    <td><div class="list-actions"><button class="text-button" data-download-list="${escapeHTML(list.id)}">下载</button><button class="text-button manage" data-manage-list="${escapeHTML(list.id)}">管理</button></div></td>
  </tr>`).join("");
}

function renderListManagement() {
  const view = document.querySelector("#listManagementView");
  refreshExpiredListStatuses();
  buildCurrentPostloanDataset();
  const filtered = filteredListRecords();
  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));
  const page = Math.min(Math.max(1, state.listPage), totalPages);
  state.listPage = page;
  const pageRows = filtered.slice((page - 1) * 20, page * 20);
  const visibleLists = state.listRecords.filter(list => belongsToCurrentBank(list.bankName) && (!isBankUser() || list.status !== "已删除"));
  const bankOptions = [...new Set(visibleLists.map(item => item.bankName))];
  const statusSummary = ["有效", "已中止", "失效", "已删除"].map(status => `${status}${visibleLists.filter(item => item.status === status).length}份`).join(" · ");
  const bankScopeClass = isBankUser() ? "hidden-app" : "";
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">Monitor list operations</div><h1>名单管理</h1><p>维护平台内的贷中监控名单。状态为“有效”的名单在每月1日自动运行，中止、终止及已删除状态的名单不参与当月监测；超过停止监测时间的名单自动转为“失效”。</p></div><div class="list-import-actions"><select class="select-input ${bankScopeClass}" id="importBankSelect">${importBankOptions(state.listImportBank)}</select><label class="button primary" for="postloanListFile">＋ 导入贷中名单</label><input id="postloanListFile" type="file" accept=".csv,.txt"/></div></div>
    <div class="panel list-table"><div class="panel-header"><div><h3>贷中名单</h3><p>共 ${visibleLists.length} 份名单 · ${statusSummary} · 按导入时间倒序排列</p></div><div class="list-toolbar"><select class="select-input ${bankScopeClass}" id="listBankFilter"><option value="all">全部导入银行</option>${bankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.listBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><input class="search-input" id="listIdSearch" type="search" placeholder="筛选名单编号" value="${escapeHTML(state.listIdQuery)}"/></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>名单编号</th><th>银行名称</th><th>企业数量</th><th>导入时间</th><th>开始监测时间</th><th>停止监测时间</th><th>操作</th></tr></thead><tbody>${listManagementRows(pageRows)}</tbody></table></div>${paginationMarkup(filtered.length, page, "listPage", 20, false)}</div>`;
  const postloanTemplateButton = document.createElement("button");
  postloanTemplateButton.type = "button";
  postloanTemplateButton.className = "button ghost";
  postloanTemplateButton.id = "downloadPostloanTemplate";
  postloanTemplateButton.textContent = "↓ 下载名单模板";
  postloanTemplateButton.addEventListener("click", () => downloadText("企业名称,组织机构代码\n示例企业有限公司,123456789\n", "贷中监控名单模板.csv"));
  document.querySelector(".list-import-actions").appendChild(postloanTemplateButton);
  document.querySelector("#listBankFilter").addEventListener("change", event => { state.listBankFilter = event.target.value; state.listPage = 1; renderListManagement(); });
  document.querySelector("#listIdSearch").addEventListener("input", event => { state.listIdQuery = event.target.value; state.listPage = 1; renderListManagement(); });
  document.querySelector("#importBankSelect").addEventListener("change", event => {
    if (event.target.value === "__add_bank__") {
      event.target.value = state.listImportBank;
      openInstitutionModal("postloan");
      return;
    }
    state.listImportBank = event.target.value;
  });
  document.querySelector("#postloanListFile").addEventListener("change", handleListUpload);
  document.querySelectorAll("[data-page-key='listPage']").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.listPage = Number(button.dataset.page); renderListManagement(); } }));
  document.querySelectorAll("[data-download-list]").forEach(button => button.addEventListener("click", () => downloadList(button.dataset.downloadList)));
  document.querySelectorAll("[data-manage-list]").forEach(button => button.addEventListener("click", () => openListManageModal(button.dataset.manageList)));
  updateRiskChangeNotification();
}

function filteredRiskChangeAlerts(rows) {
  return rows.filter(row => {
    const bankMatched = state.anomalyBankFilter === "all" || row.bankName === state.anomalyBankFilter;
    const listMatched = state.anomalyListFilter === "all" || row.listId === state.anomalyListFilter;
    const currentLevelMatched = state.anomalyCurrentLevelFilter === "all" || row.level === state.anomalyCurrentLevelFilter;
    const previousLevelMatched = state.anomalyPreviousLevelFilter === "all" || row.previousLevel === state.anomalyPreviousLevelFilter;
    return bankMatched && listMatched && currentLevelMatched && previousLevelMatched;
  });
}

function renderAnomalyAlerts() {
  const view = document.querySelector("#anomalyAlertsView");
  const rows = currentRiskChangeAlerts();
  const filtered = filteredRiskChangeAlerts(rows);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));
  const page = Math.min(Math.max(1, state.anomalyPage), totalPages);
  state.anomalyPage = page;
  const pageRows = filtered.slice((page - 1) * 20, page * 20);
  const bankOptions = [...new Set(rows.map(row => row.bankName).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const listOptions = [...new Set(rows.map(row => row.listId).filter(Boolean))].sort();
  const includeBank = !isBankUser();
  const bankFilter = includeBank ? `<select class="select-input" id="anomalyBankFilter"><option value="all">全部银行机构</option>${bankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.anomalyBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select>` : "";
  const filters = `${bankFilter}<select class="select-input list-filter-input" id="anomalyListFilter"><option value="all">全部名单编号</option>${listOptions.map(listId => `<option value="${escapeHTML(listId)}" ${state.anomalyListFilter === listId ? "selected" : ""}>${escapeHTML(listId)}</option>`).join("")}</select><select class="select-input" id="anomalyCurrentLevelFilter"><option value="all">全部本月风险等级</option><option value="high" ${state.anomalyCurrentLevelFilter === "high" ? "selected" : ""}>高风险</option><option value="medium" ${state.anomalyCurrentLevelFilter === "medium" ? "selected" : ""}>中风险</option></select><select class="select-input" id="anomalyPreviousLevelFilter"><option value="all">全部上月风险等级</option><option value="low" ${state.anomalyPreviousLevelFilter === "low" ? "selected" : ""}>低风险</option><option value="none" ${state.anomalyPreviousLevelFilter === "none" ? "selected" : ""}>无风险</option></select>`;
  const bankHeader = includeBank ? "<th>银行机构</th>" : "";
  const colSpan = includeBank ? 7 : 6;
  const body = pageRows.length ? pageRows.map(row => `<tr><td><strong>${escapeHTML(row.name)}</strong></td><td class="muted-text">${escapeHTML(row.code)}</td><td><span class="list-id table-list-id">${escapeHTML(row.listId)}</span></td>${includeBank ? `<td>${escapeHTML(row.bankName)}</td>` : ""}<td>${riskBadge(row.level)}</td><td>${riskBadge(row.previousLevel)}</td><td><div class="rule-tags">${formatRiskEvents(row.events || [])}</div></td></tr>`).join("") : `<tr><td colspan="${colSpan}"><div class="empty-state">没有符合条件的异常风险变动企业</div></td></tr>`;
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">Risk movement alerts</div><h1>异常提示</h1><p>展示当前月度有效贷中名单中，由上月无风险或低风险上升为本月中风险或高风险的企业。</p></div></div><div class="panel anomaly-panel"><div class="panel-header"><div><h3>当前月度风险异常变动</h3><p>共 ${rows.length} 家企业 · 默认按企业名称升序排列 · 每页最多展示20家</p></div><div class="anomaly-filter-toolbar">${filters}</div></div><div class="table-wrap anomaly-table-wrap"><table class="data-table anomaly-table"><thead><tr><th>企业名称</th><th>组织机构代码</th><th>名单编号</th>${bankHeader}<th>本月风险等级</th><th>上月风险等级</th><th>风险事件</th></tr></thead><tbody>${body}</tbody></table></div>${paginationMarkup(filtered.length, page, "anomalyPage", 20)}</div>`;
  if (includeBank) document.querySelector("#anomalyBankFilter").addEventListener("change", event => { state.anomalyBankFilter = event.target.value; state.anomalyPage = 1; renderAnomalyAlerts(); });
  document.querySelector("#anomalyListFilter").addEventListener("change", event => { state.anomalyListFilter = event.target.value; state.anomalyPage = 1; renderAnomalyAlerts(); });
  document.querySelector("#anomalyCurrentLevelFilter").addEventListener("change", event => { state.anomalyCurrentLevelFilter = event.target.value; state.anomalyPage = 1; renderAnomalyAlerts(); });
  document.querySelector("#anomalyPreviousLevelFilter").addEventListener("change", event => { state.anomalyPreviousLevelFilter = event.target.value; state.anomalyPage = 1; renderAnomalyAlerts(); });
  document.querySelectorAll("[data-page-key='anomalyPage']").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.anomalyPage = Number(button.dataset.page); renderAnomalyAlerts(); } }));
  updateRiskChangeNotification();
}

function downloadList(listId) {
  const list = state.listRecords.find(item => item.id === listId);
  if (!list) return;
  const rows = ["企业名称,组织机构代码"];
  for (let index = 0; index < list.companyCount; index += 1) rows.push(`示例企业${String(index + 1).padStart(4, "0")},${String(360100001 + index).padStart(9, "0")}`);
  downloadText("\uFEFF" + rows.join("\n"), `${list.id}-企业名单.csv`);
  recordLog("下载名单", list.id, list.bankName);
  showToast(`已下载 ${list.id}，共 ${list.companyCount.toLocaleString()} 家企业`);
}

function parseListDate(value) {
  const parts = String(value).split(/[\/-]/).map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function nextMonthlyRunDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function isListEligibleForMonthlyRun(list, runDate = nextMonthlyRunDate()) {
  return list.status === "有效" && parseListDate(list.startDate) <= runDate && parseListDate(list.stopDate) >= runDate;
}

function openListManageModal(listId) {
  refreshExpiredListStatuses();
  const list = state.listRecords.find(item => item.id === listId);
  if (!list || (isBankUser() && (list.status === "已删除" || !belongsToCurrentBank(list.bankName)))) return;
  state.listManageTarget = listId;
  const nextRunDate = nextMonthlyRunDate();
  const nextRunLabel = ["失效", "已删除"].includes(list.status) ? (list.status === "已删除" ? "已删除" : "已失效") : isListEligibleForMonthlyRun(list, nextRunDate) ? `预计于 ${formatDate(nextRunDate)} 自动运行` : `不参与 ${formatDate(nextRunDate)} 自动运行`;
  document.querySelector("#listManageModalTitle").textContent = `管理名单 · ${list.id}`;
  document.querySelector("#listManageModalBody").innerHTML = `<div class="list-detail-grid"><div class="list-detail-item"><span>名单编号</span><strong>${escapeHTML(list.id)}</strong></div><div class="list-detail-item"><span>银行名称</span><strong>${escapeHTML(list.bankName)}</strong></div><div class="list-detail-item"><span>企业数量</span><strong>${list.companyCount.toLocaleString()} 家</strong></div><div class="list-detail-item"><span>当前状态</span><strong>${escapeHTML(list.status)}</strong></div><div class="list-detail-item"><span>开始监测时间</span><strong>${escapeHTML(list.startDate)}</strong></div><div class="list-detail-item"><span>停止监测时间</span><strong>${escapeHTML(list.stopDate)}</strong></div><div class="list-detail-item"><span>下次自动跑批</span><strong>${nextRunLabel}</strong></div></div><div class="ai-summary list-manage-note"><strong>自动跑批规则：</strong>每月1日仅运行状态为“有效”且处于开始、停止监测时间范围内的名单；中止、终止、失效及已删除状态名单不参与当月跑批。银行端删除后名单保留为“已删除”状态，运营端删除后将移除名单及其后续跑数任务。</div>`;
  const stopButton = document.querySelector("#stopListButton");
  const restoreButton = document.querySelector("#restoreListButton");
  const isExpired = list.status === "失效";
  const isDeleted = list.status === "已删除";
  const bankRestricted = isBankUser();
  stopButton.classList.toggle("hidden-app", isExpired || isDeleted || bankRestricted);
  restoreButton.classList.toggle("hidden-app", isExpired || isDeleted || bankRestricted);
  stopButton.disabled = ["已中止", "已终止", "失效", "已删除"].includes(list.status) || bankRestricted;
  restoreButton.disabled = list.status === "有效" || isExpired || isDeleted || bankRestricted;
  document.querySelector("#listManageModal").classList.remove("hidden");
}

function closeListManageModal() { document.querySelector("#listManageModal").classList.add("hidden"); state.listManageTarget = null; }

function openInstitutionModal(target) {
  state.institutionModalTarget = target;
  document.querySelector("#institutionNameInput").value = "";
  document.querySelector("#institutionModal").classList.remove("hidden");
  window.setTimeout(() => document.querySelector("#institutionNameInput").focus(), 0);
}

function closeInstitutionModal() {
  document.querySelector("#institutionModal").classList.add("hidden");
  state.institutionModalTarget = null;
}

function saveInstitution() {
  const name = document.querySelector("#institutionNameInput").value.trim();
  if (!name) { showToast("请输入银行机构名称"); return; }
  const existing = availableBankNames().find(bank => bank.toLowerCase() === name.toLowerCase());
  const selectedBank = existing || name;
  const target = state.institutionModalTarget;
  closeInstitutionModal();
  if (target === "preloan") {
    if (!existing) state.customBankNames.push(name);
    state.preloanBank = selectedBank;
    renderPreloan();
  } else if (target === "postloan") {
    if (!existing) state.customBankNames.push(name);
    state.listImportBank = selectedBank;
    renderListManagement();
  } else if (target === "permission") {
    if (!existing) state.customInstitutionNames.push(name);
    state.permissionInstitutionDraft = selectedBank;
    syncPermissionInstitutionOptions(selectedBank);
  }
  showToast(existing ? `已选择机构：${existing}` : `${target === "permission" ? "机构" : "银行机构"}“${name}”已新增并选中`);
}

function handleListUpload(event) {
  const file = event.target.files[0];
  const bank = isBankUser() ? currentBankInstitution() : document.querySelector("#importBankSelect").value;
  if (!file) return;
  if (!bank) { showToast("请先选择导入银行"); event.target.value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCSV(reader.result);
    if (!rows.length) { showToast("未识别到有效名单，请检查CSV格式"); return; }
    const now = new Date();
    const started = new Date(now.getTime() + 86400000);
    const stopped = new Date(started.getTime() + 86400000 * 365);
    const listId = `ML-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-IMP${String(now.getTime()).slice(-5)}`;
    state.listRecords.unshift({ id: listId, bankName: bank, companyCount: rows.length, importAt: formatDateTime(now), startDate: formatDate(started), stopDate: formatDate(stopped), timestamp: now.getTime(), status: "有效" });
    recordLog("导入名单", listId, bank);
    state.listPage = 1;
    renderListManagement();
    showToast(`名单导入成功，共 ${rows.length} 家企业`);
  };
  reader.readAsText(file, "UTF-8");
}

function stopTargetList() {
  const list = state.listRecords.find(item => item.id === state.listManageTarget);
  if (!list || isBankUser() || ["失效", "已删除"].includes(list.status)) return;
  list.status = "已中止";
  recordLog("中止名单监测", list.id, list.bankName);
  closeListManageModal();
  renderListManagement();
  showToast(`${list.id} 已中止后续月度跑数`);
}

function restoreTargetList() {
  const list = state.listRecords.find(item => item.id === state.listManageTarget);
  if (!list || isBankUser() || ["失效", "已删除"].includes(list.status)) return;
  const now = new Date();
  list.status = "有效";
  list.startDate = formatDate(now);
  if (parseListDate(list.stopDate) <= now) {
    const renewedStopDate = new Date(now);
    renewedStopDate.setFullYear(renewedStopDate.getFullYear() + 1);
    list.stopDate = formatDate(renewedStopDate);
  }
  recordLog("恢复月度跑数", list.id, list.bankName);
  closeListManageModal();
  renderListManagement();
  showToast(`${list.id} 已从当前日期恢复为有效状态`);
}

function deleteTargetList() {
  const list = state.listRecords.find(item => item.id === state.listManageTarget);
  if (!list || (isBankUser() && !belongsToCurrentBank(list.bankName))) return;
  if (!window.confirm(`确认删除名单“${list.id}”及其后续月度跑数任务吗？`)) return;
  if (isBankUser()) {
    list.status = "已删除";
  } else {
    state.listRecords = state.listRecords.filter(item => item.id !== list.id);
    state.batches = state.batches.filter(batch => batch.listId !== list.id);
  }
  recordLog("删除名单", list.id, list.bankName);
  closeListManageModal();
  renderListManagement();
  showToast(isBankUser() ? `${list.id} 已标记为已删除` : `${list.id} 已删除`);
}

function filteredLogRecords() {
  return state.logRecords.filter(log => {
    const bankMatched = state.logBankFilter === "all" || log.bankName === state.logBankFilter;
    const startMatched = !state.logStartDate || log.dateKey >= state.logStartDate;
    const endMatched = !state.logEndDate || log.dateKey <= state.logEndDate;
    return bankMatched && startMatched && endMatched;
  });
}

function logActionClass(action) {
  if (action.includes("登录")) return "login";
  if (action.includes("导入")) return "import";
  if (action.includes("恢复")) return "import";
  if (action.includes("删除")) return "delete";
  if (action.includes("中止")) return "stop";
  if (action.includes("导出") || action.includes("下载")) return "export";
  if (action.includes("账号")) return "import";
  if (action.includes("AI")) return "ai";
  return "view";
}

function logRows(records) {
  if (!records.length) return `<tr><td colspan="6"><div class="empty-state">没有符合条件的操作记录</div></td></tr>`;
  return records.map(log => `<tr>
    <td><strong class="log-date">${escapeHTML(log.date)}</strong><span class="log-id">${escapeHTML(log.id)}</span></td>
    <td><strong>${escapeHTML(log.bankName)}</strong></td>
    <td><strong>${escapeHTML(log.operator)}</strong><span class="log-account">${escapeHTML(log.account)}</span></td>
    <td><span class="log-action ${logActionClass(log.action)}">${escapeHTML(log.action)}</span></td>
    <td class="muted-text">${escapeHTML(log.target)}</td>
    <td><span class="status-badge complete">${escapeHTML(log.result)}</span></td>
  </tr>`).join("");
}

function logPaginationMarkup(total, page) {
  const totalPages = Math.max(1, Math.ceil(total / logPageSize));
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).map(number => `<button class="page-button ${number === page ? "active" : ""}" data-log-page="${number}">${number}</button>`).join("");
  return `<div class="result-pagination"><span>共 ${total} 条操作记录 · 第 ${page}/${totalPages} 页 · 每页 ${logPageSize} 条</span><div class="page-controls"><button class="page-button" data-log-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹</button>${pages}<button class="page-button" data-log-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>›</button></div></div>`;
}

function renderLogs() {
  const view = document.querySelector("#logsView");
  const filtered = filteredLogRecords();
  const totalPages = Math.max(1, Math.ceil(filtered.length / logPageSize));
  const page = Math.min(Math.max(1, state.logPage), totalPages);
  state.logPage = page;
  const pageRows = filtered.slice((page - 1) * logPageSize, page * logPageSize);
  const bankOptions = [...new Set(state.logRecords.map(log => log.bankName))];
  const todayCount = state.logRecords.filter(log => log.dateKey === "2026-08-25").length;
  const importCount = state.logRecords.filter(log => log.action === "导入名单").length;
  const deleteCount = state.logRecords.filter(log => log.action === "删除名单").length;
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">Audit trail / operations</div><h1>日志管理</h1><p>记录银行机构人员登录、名单操作和风险结果使用情况，支持按机构与日期追溯。</p></div><button class="button ghost" id="resetLogFilters">↺ 重置筛选</button></div>
    <div class="log-summary-grid"><div class="log-summary-card"><span class="log-summary-icon blue">▤</span><div><strong>${state.logRecords.length}</strong><small>日志总量</small></div></div><div class="log-summary-card"><span class="log-summary-icon teal">◷</span><div><strong>${todayCount}</strong><small>今日操作</small></div></div><div class="log-summary-card"><span class="log-summary-icon orange">⇧</span><div><strong>${importCount}</strong><small>名单导入</small></div></div><div class="log-summary-card"><span class="log-summary-icon red">×</span><div><strong>${deleteCount}</strong><small>名单删除</small></div></div></div>
    <div class="panel log-panel"><div class="panel-header"><div><h3>操作日志</h3><p>所有记录均保留操作人、操作对象和操作时间</p></div><div class="log-filters"><select class="select-input" id="logBankFilter"><option value="all">全部银行机构</option>${bankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.logBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><label class="date-filter"><span>从</span><input class="date-input" id="logStartDate" type="date" value="${escapeHTML(state.logStartDate)}" /></label><label class="date-filter"><span>至</span><input class="date-input" id="logEndDate" type="date" value="${escapeHTML(state.logEndDate)}" /></label></div></div><div class="table-wrap"><table class="data-table log-table"><thead><tr><th>操作日期</th><th>银行机构</th><th>操作人员 / 账户</th><th>操作类型</th><th>操作对象</th><th>结果</th></tr></thead><tbody>${logRows(pageRows)}</tbody></table></div>${logPaginationMarkup(filtered.length, page)}</div>`;
  document.querySelector("#logBankFilter").addEventListener("change", event => { state.logBankFilter = event.target.value; state.logPage = 1; renderLogs(); });
  document.querySelector("#logStartDate").addEventListener("change", event => { state.logStartDate = event.target.value; state.logPage = 1; renderLogs(); });
  document.querySelector("#logEndDate").addEventListener("change", event => { state.logEndDate = event.target.value; state.logPage = 1; renderLogs(); });
  document.querySelector("#resetLogFilters").addEventListener("click", () => { state.logBankFilter = "all"; state.logStartDate = ""; state.logEndDate = ""; state.logPage = 1; renderLogs(); });
  document.querySelectorAll("[data-log-page]").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.logPage = Number(button.dataset.logPage); renderLogs(); } }));
}

function permissionStatusBadge(status) {
  return `<span class="status-badge ${status === "有效" ? "complete" : "pending"}">${escapeHTML(status)}</span>`;
}

function filteredPermissionAccounts() {
  return state.permissionAccounts.filter(record => {
    const queryMatched = !state.permissionQuery || `${record.account}${record.institution}${record.permission}`.toLowerCase().includes(state.permissionQuery.toLowerCase());
    const typeMatched = state.permissionTypeFilter === "all" || record.type === state.permissionTypeFilter;
    const statusMatched = state.permissionStatusFilter === "all" || record.status === state.permissionStatusFilter;
    return queryMatched && typeMatched && statusMatched;
  }).sort((a, b) => a.account.localeCompare(b.account));
}

function permissionRows(records) {
  if (!records.length) return `<tr><td colspan="7"><div class="empty-state">没有符合条件的账号</div></td></tr>`;
  return records.map(record => `<tr>
    <td><strong class="permission-account">${escapeHTML(record.account)}</strong>${record.builtin ? `<span class="permission-default">默认管理员</span>` : ""}</td>
    <td>${escapeHTML(record.type)}</td>
    <td>${escapeHTML(record.institution)}</td>
    <td><span class="permission-level ${record.permission === "最高权限" ? "highest" : ""}">${escapeHTML(record.permission)}</span></td>
    <td>${permissionStatusBadge(record.status)}</td>
    <td class="muted-text">${escapeHTML(record.createdAt)}</td>
    <td><div class="list-actions">${record.builtin ? `<span class="muted-text permission-protected">系统默认</span>` : canManagePermissionRecord(record) ? `<button class="text-button manage" data-permission-edit="${escapeHTML(record.account)}">修改</button><button class="text-button danger-text" data-permission-delete="${escapeHTML(record.account)}">删除</button>` : `<span class="muted-text permission-protected">无操作权限</span>`}</div></td>
  </tr>`).join("");
}

function permissionPaginationMarkup(total, page, size = 10) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).map(number => `<button class="page-button ${number === page ? "active" : ""}" data-permission-page="${number}">${number}</button>`).join("");
  return `<div class="result-pagination"><span>共 ${total} 个账号 · 第 ${page}/${totalPages} 页 · 每页 ${size} 条</span><div class="page-controls"><button class="page-button" data-permission-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹</button>${pages}<button class="page-button" data-permission-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>›</button></div></div>`;
}

function renderPermissions() {
  if (!state.hasPermissionAdmin) return switchView("dashboard");
  const view = document.querySelector("#permissionsView");
  const filtered = filteredPermissionAccounts();
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, state.permissionPage), totalPages);
  state.permissionPage = page;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const addButton = canAddPermissionAccount() ? `<button class="button primary" id="addPermissionAccount">＋ 新增账号</button>` : "";
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">Access control / administration</div><h1>权限管理</h1><p>默认管理员可维护全部账号；最高权限账号可维护业务操作账号；业务操作运营账号可新增账号。</p></div>${addButton}</div>
    <div class="permission-summary-grid"><div class="permission-summary-card"><span class="permission-summary-icon blue">◎</span><div><strong>${state.permissionAccounts.length}</strong><small>账号总数</small></div></div><div class="permission-summary-card"><span class="permission-summary-icon teal">✓</span><div><strong>${state.permissionAccounts.filter(item => item.status === "有效").length}</strong><small>有效账号</small></div></div><div class="permission-summary-card"><span class="permission-summary-icon orange">◈</span><div><strong>${state.permissionAccounts.filter(item => item.type === "运营账号").length}</strong><small>运营账号</small></div></div><div class="permission-summary-card"><span class="permission-summary-icon red">⌂</span><div><strong>${state.permissionAccounts.filter(item => item.type === "银行机构用户").length}</strong><small>银行机构用户</small></div></div></div>
    <div class="panel permission-panel"><div class="panel-header"><div><h3>账号权限清单</h3><p>最高权限账号可新增、修改、删除其他账号及其权限</p></div><div class="permission-filters"><select class="select-input" id="permissionTypeFilter"><option value="all">全部账号类型</option><option value="运营账号" ${state.permissionTypeFilter === "运营账号" ? "selected" : ""}>运营账号</option><option value="银行机构用户" ${state.permissionTypeFilter === "银行机构用户" ? "selected" : ""}>银行机构用户</option></select><select class="select-input" id="permissionStatusFilter"><option value="all">全部账号状态</option><option value="有效" ${state.permissionStatusFilter === "有效" ? "selected" : ""}>有效</option><option value="无效" ${state.permissionStatusFilter === "无效" ? "selected" : ""}>无效</option></select><input class="search-input" id="permissionQuery" type="search" placeholder="搜索账号或机构" value="${escapeHTML(state.permissionQuery)}" /></div></div><div class="table-wrap"><table class="data-table permission-table"><thead><tr><th>登录账户</th><th>账号类型</th><th>所属机构</th><th>权限级别</th><th>账号状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${permissionRows(pageRows)}</tbody></table></div>${permissionPaginationMarkup(filtered.length, page)}</div>`;
  if (canAddPermissionAccount()) document.querySelector("#addPermissionAccount").addEventListener("click", () => openPermissionModal());
  document.querySelector("#permissionTypeFilter").addEventListener("change", event => { state.permissionTypeFilter = event.target.value; state.permissionPage = 1; renderPermissions(); });
  document.querySelector("#permissionStatusFilter").addEventListener("change", event => { state.permissionStatusFilter = event.target.value; state.permissionPage = 1; renderPermissions(); });
  document.querySelector("#permissionQuery").addEventListener("input", event => { state.permissionQuery = event.target.value; state.permissionPage = 1; renderPermissions(); });
  document.querySelectorAll("[data-permission-page]").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.permissionPage = Number(button.dataset.permissionPage); renderPermissions(); } }));
  document.querySelectorAll("[data-permission-edit]").forEach(button => button.addEventListener("click", () => openPermissionModal(button.dataset.permissionEdit)));
  document.querySelectorAll("[data-permission-delete]").forEach(button => button.addEventListener("click", () => deletePermissionAccount(button.dataset.permissionDelete)));
}

function syncPermissionInstitutionOptions(selected = "") {
  const type = document.querySelector("#permissionType").value;
  const existingInstitutions = state.permissionAccounts.map(item => item.institution);
  const options = type === "operator" ? ["平台运营中心", ...state.customInstitutionNames, ...existingInstitutions.filter(item => item !== "平台运营中心")] : [...bankNames, ...state.customInstitutionNames, ...existingInstitutions];
  const uniqueOptions = [...new Set(options.filter(Boolean))];
  const addOption = state.permissionTargetAccount ? "" : `<option value="__add_institution__">新增机构</option>`;
  document.querySelector("#permissionInstitution").innerHTML = `${uniqueOptions.map(institution => `<option value="${escapeHTML(institution)}" ${selected === institution ? "selected" : ""}>${escapeHTML(institution)}</option>`).join("")}${addOption}`;
}

function openPermissionModal(account = null) {
  const record = account ? state.permissionAccounts.find(item => item.account === account) : null;
  if (record && !canManagePermissionRecord(record)) { showToast("当前账号无权修改该账号"); return; }
  if (!record && !canAddPermissionAccount()) { showToast("当前账号无权新增账号"); return; }
  state.permissionTargetAccount = record ? record.account : null;
  document.querySelector("#permissionModalTitle").textContent = record ? "修改账号权限" : "新增账号";
  const accountInput = document.querySelector("#permissionAccount");
  accountInput.value = record?.account || "";
  accountInput.disabled = Boolean(record?.builtin);
  document.querySelector("#permissionType").value = record?.type === "银行机构用户" ? "bank" : "operator";
  state.permissionInstitutionDraft = record?.institution || "";
  syncPermissionInstitutionOptions(record?.institution || "");
  document.querySelector("#permissionInstitution").disabled = Boolean(record);
  document.querySelector("#permissionLevel").value = record?.permission || "业务操作";
  document.querySelector("#permissionStatus").value = record?.status || "有效";
  document.querySelector("#permissionModal").classList.remove("hidden");
}

function closePermissionModal() {
  document.querySelector("#permissionModal").classList.add("hidden");
  state.permissionTargetAccount = null;
}

function savePermissionAccount() {
  const accountInput = document.querySelector("#permissionAccount");
  const account = accountInput.value.trim();
  const accountKey = account.toLowerCase();
  const type = document.querySelector("#permissionType").value;
  const institution = document.querySelector("#permissionInstitution").value;
  const permission = document.querySelector("#permissionLevel").value;
  const status = document.querySelector("#permissionStatus").value;
  const format = accountFormats.find(item => item.role === type);
  if (!account || !format?.pattern.test(accountKey)) { showToast(type === "operator" ? "运营账号格式应为xxx@jxphzx.com" : "银行机构账号格式应为xxx@XXXbank.com"); return; }
  const duplicate = state.permissionAccounts.some(item => item.account.toLowerCase() === accountKey && item.account.toLowerCase() !== String(state.permissionTargetAccount || "").toLowerCase());
  if (duplicate) { showToast("该登录账户已存在"); return; }
  if (accountKey === state.currentAccount.toLowerCase() && (permission !== "最高权限" || status !== "有效")) { showToast("当前登录管理员不可取消自身最高权限或有效状态"); return; }
  const nextRecord = { account, type: type === "bank" ? "银行机构用户" : "运营账号", institution, permission, status, createdAt: state.permissionTargetAccount ? state.permissionAccounts.find(item => item.account === state.permissionTargetAccount).createdAt : formatDate(new Date()), builtin: state.permissionTargetAccount ? state.permissionAccounts.find(item => item.account === state.permissionTargetAccount).builtin : false };
  const oldAccount = state.permissionTargetAccount;
  const oldRecord = oldAccount ? state.permissionAccounts.find(item => item.account === oldAccount) : null;
  if (oldRecord && !canManagePermissionRecord(oldRecord)) { showToast("当前账号无权修改该账号"); return; }
  if (!oldRecord && !canAddPermissionAccount()) { showToast("当前账号无权新增账号"); return; }
  if (oldAccount) {
    const index = state.permissionAccounts.findIndex(item => item.account === oldAccount);
    state.permissionAccounts[index] = nextRecord;
    if (oldAccount.toLowerCase() !== accountKey) {
      demoAccounts[accountKey] = { ...(demoAccounts[oldAccount.toLowerCase()] || { password: "Password1234" }), role: type, permissionAdmin: permission === "最高权限", enabled: status === "有效" };
      delete demoAccounts[oldAccount.toLowerCase()];
    } else if (demoAccounts[accountKey]) {
      demoAccounts[accountKey].role = type;
      demoAccounts[accountKey].permissionAdmin = permission === "最高权限";
      demoAccounts[accountKey].enabled = status === "有效";
    }
    recordLog("修改账号权限", account, institution);
  } else {
    state.permissionAccounts.push(nextRecord);
    demoAccounts[accountKey] = { password: "Password1234", role: type, permissionAdmin: permission === "最高权限", enabled: status === "有效" };
    recordLog("新增账号", account, institution);
  }
  state.hasPermissionAdmin = canViewPermissionManagement();
  updatePermissionNavVisibility();
  closePermissionModal();
  renderPermissions();
  showToast(`${account} 账号权限已保存`);
}

function deletePermissionAccount(account) {
  const record = state.permissionAccounts.find(item => item.account === account);
  if (!record || !canManagePermissionRecord(record)) { showToast("当前账号无权删除该账号"); return; }
  if (!window.confirm(`确认删除账号“${account}”吗？`)) return;
  state.permissionAccounts = state.permissionAccounts.filter(item => item.account !== account);
  delete demoAccounts[account.toLowerCase()];
  recordLog("删除账号", account, record.institution);
  renderPermissions();
  showToast(`${account} 已删除`);
}

function addPreloanHistory(listId, bankName, results, queryDate = new Date()) {
  state.preloanHistory.unshift({
    listId,
    bankName,
    companyCount: results.length,
    queryAt: formatDateTime(queryDate),
    dateKey: `${queryDate.getFullYear()}-${pad(queryDate.getMonth() + 1)}-${pad(queryDate.getDate())}`,
    timestamp: queryDate.getTime(),
    results: results.map(row => ({ ...row, listId, bankName }))
  });
  prunePreloanHistory(queryDate);
}

function prunePreloanHistory(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - preloanHistoryRetentionMonths);
  state.preloanHistory = state.preloanHistory.filter(record => record.timestamp >= cutoff.getTime()).sort((a, b) => b.timestamp - a.timestamp);
}

function filteredPreloanHistory() {
  prunePreloanHistory();
  return state.preloanHistory.filter(record => {
    const bankScopeMatched = belongsToCurrentBank(record.bankName);
    const bankMatched = state.preloanHistoryBankFilter === "all" || record.bankName === state.preloanHistoryBankFilter;
    const listMatched = state.preloanHistoryListQuery === "all" || !state.preloanHistoryListQuery || record.listId === state.preloanHistoryListQuery;
    const startMatched = !state.preloanHistoryStartDate || record.dateKey >= state.preloanHistoryStartDate;
    const endMatched = !state.preloanHistoryEndDate || record.dateKey <= state.preloanHistoryEndDate;
    return bankScopeMatched && bankMatched && listMatched && startMatched && endMatched;
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function preloanHistoryRows(records) {
  if (!records.length) return `<tr><td colspan="6"><div class="empty-state">没有符合条件的历史查询记录</div></td></tr>`;
  return records.map(record => {
    const counts = preloanRiskCounts([record]);
    return `<tr>
    <td><span class="list-id table-list-id">${escapeHTML(record.listId)}</span></td>
    <td><strong>${record.companyCount.toLocaleString()} 家</strong></td>
    <td>${escapeHTML(record.bankName)}</td>
    <td><span class="risk-badge high">${counts.high}</span><span class="risk-badge medium" style="margin-left:5px">${counts.medium}</span><span class="risk-badge low" style="margin-left:5px">${counts.low}</span><span class="risk-badge none" style="margin-left:5px">${counts.none}</span></td>
    <td class="muted-text">${escapeHTML(record.queryAt)}</td>
    <td><button class="text-button" data-preloan-history-download="${escapeHTML(record.listId)}">下载</button></td>
  </tr>`;
  }).join("");
}

function historyPaginationMarkup(total, page) {
  const totalPages = Math.max(1, Math.ceil(total / preloanHistoryPageSize));
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).map(number => `<button class="page-button ${number === page ? "active" : ""}" data-preloan-history-page="${number}">${number}</button>`).join("");
  return `<div class="result-pagination"><span>共 ${total} 条查询记录 · 第 ${page}/${totalPages} 页 · 每页最多 ${preloanHistoryPageSize} 条</span><div class="page-controls"><button class="page-button" data-preloan-history-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹</button>${pages}<button class="page-button" data-preloan-history-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>›</button></div></div>`;
}

function downloadPreloanHistory(listId) {
  const record = state.preloanHistory.find(item => item.listId === listId);
  if (!record) return;
  exportResults(record.results, `${record.listId}-贷前历史查询记录`, true);
  showToast(`已下载 ${record.listId} 的历史查询记录`);
}

function renderPreloanHistory() {
  const filtered = filteredPreloanHistory();
  const totalPages = Math.max(1, Math.ceil(filtered.length / preloanHistoryPageSize));
  const page = Math.min(Math.max(1, state.preloanHistoryPage), totalPages);
  state.preloanHistoryPage = page;
  const pageRows = filtered.slice((page - 1) * preloanHistoryPageSize, page * preloanHistoryPageSize);
  const bankOptions = [...new Set(state.preloanHistory.map(item => item.bankName))];
  const listOptions = [...new Set(state.preloanHistory.map(item => item.listId).filter(Boolean))];
  return `<div class="panel preloan-history-panel"><div class="panel-header"><div><h3>历史查询</h3><p>仅保留最近六个月的贷前查询记录，按查询时间倒序排列</p></div><div class="preloan-history-filters"><select class="select-input" id="preloanHistoryBankFilter"><option value="all">全部银行机构</option>${bankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.preloanHistoryBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><select class="select-input list-filter-input" id="preloanHistoryListFilter"><option value="all">全部名单编号</option>${listOptions.map(listId => `<option value="${escapeHTML(listId)}" ${state.preloanHistoryListQuery === listId ? "selected" : ""}>${escapeHTML(listId)}</option>`).join("")}</select><label class="date-filter"><span>从</span><input class="date-input" id="preloanHistoryStartDate" type="date" value="${escapeHTML(state.preloanHistoryStartDate)}" /></label><label class="date-filter"><span>至</span><input class="date-input" id="preloanHistoryEndDate" type="date" value="${escapeHTML(state.preloanHistoryEndDate)}" /></label></div></div><div class="table-wrap"><table class="data-table preloan-history-table"><thead><tr><th>名单编号</th><th>企业数量</th><th>银行机构</th><th>风险分布</th><th>查询时间</th><th>操作</th></tr></thead><tbody>${preloanHistoryRows(pageRows)}</tbody></table></div>${historyPaginationMarkup(filtered.length, page)}</div>`;
}

function bindPreloanHistoryEvents() {
  if (isBankUser()) document.querySelector("#preloanHistoryBankFilter").classList.add("hidden-app");
  document.querySelector("#preloanHistoryBankFilter").addEventListener("change", event => { state.preloanHistoryBankFilter = event.target.value; state.preloanHistoryPage = 1; renderPreloan(); });
  document.querySelector("#preloanHistoryListFilter").addEventListener("change", event => { state.preloanHistoryListQuery = event.target.value; state.preloanHistoryPage = 1; renderPreloan(); });
  document.querySelector("#preloanHistoryStartDate").addEventListener("change", event => { state.preloanHistoryStartDate = event.target.value; state.preloanHistoryPage = 1; renderPreloan(); });
  document.querySelector("#preloanHistoryEndDate").addEventListener("change", event => { state.preloanHistoryEndDate = event.target.value; state.preloanHistoryPage = 1; renderPreloan(); });
  document.querySelectorAll("[data-preloan-history-page]").forEach(button => button.addEventListener("click", () => { if (!button.disabled) { state.preloanHistoryPage = Number(button.dataset.preloanHistoryPage); renderPreloan(); } }));
  document.querySelectorAll("[data-preloan-history-download]").forEach(button => button.addEventListener("click", () => downloadPreloanHistory(button.dataset.preloanHistoryDownload)));
}

function renderPreloan() {
  const view = document.querySelector("#preloanView");
  if (isBankUser()) state.preloanBank = currentBankInstitution();
  const currentResults = currentPreloanResults();
  state.preloanResults = currentResults;
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">On-demand screening</div><h1>贷前筛查</h1><p>导入企业名单，单次调用后台数据并即时获取风险识别结果；每次查询自动生成唯一名单编号。</p></div><button class="button ghost" id="downloadTemplate">↓ 下载名单模板</button></div>
    <div class="panel subpage-panel upload-panel"><div class="upload-box"><div class="upload-icon">⇧</div><h3>导入企业名单</h3><p>仅需“企业名称”和“9位组织机构代码”，支持 CSV 文件</p><div class="upload-actions"><select class="select-input" id="preloanBankSelect">${importBankOptions(state.preloanBank)}</select><label class="button primary" for="preloanFile">选择文件</label><input id="preloanFile" type="file" accept=".csv,.txt"/><button class="button teal" id="demoPreloan">使用演示名单</button></div></div><div class="info-box"><h3>筛查说明</h3><div class="info-list"><div><span>查询方式</span><strong>单次导入 · 即时返回</strong></div><div><span>数据范围</span><strong>后台最新可用监测月份</strong></div><div><span>结果形式</span><strong>一家企业一行</strong></div><div><span>风险输出</span><strong>风险事件 · 风险等级</strong></div></div></div></div>
    ${resultTable(currentResults, "preloan", "当前月度查询结果", `本月已查询 ${currentResults.length} 家企业 · 按企业名称升序 · 每页展示 ${pageSize} 家`, true)}
    ${renderPreloanHistory()}`;
  document.querySelector("#downloadTemplate").addEventListener("click", () => downloadText("企业名称,组织机构代码\n示例企业有限公司,123456789\n", "贷前筛查名单模板.csv"));
  document.querySelector("#demoPreloan").insertAdjacentElement("afterend", document.querySelector("#downloadTemplate"));
  document.querySelector("#preloanBankSelect").addEventListener("change", event => {
    if (event.target.value === "__add_bank__") {
      event.target.value = state.preloanBank;
      openInstitutionModal("preloan");
      return;
    }
    state.preloanBank = event.target.value;
  });
  if (isBankUser()) document.querySelector("#preloanBankSelect").classList.add("hidden-app");
  document.querySelector("#demoPreloan").addEventListener("click", () => {
    if (!state.preloanBank) { showToast("请先选择导入银行"); return; }
    const queryDate = new Date();
    const listId = createPreloanListId(queryDate);
    state.preloanResults = buildDemoResults(0, listId, state.preloanBank);
    state.preloanPage = 1;
    state.preloanListFilter = "all";
    state.preloanResultBankFilter = "all";
    state.query = "";
    state.selectedRisk = "all";
    addPreloanHistory(listId, state.preloanBank, state.preloanResults, queryDate);
    recordLog("导入名单", listId, state.preloanBank);
    renderPreloan();
    showToast(`名单筛查完成，已生成 ${listId}，返回 ${state.preloanResults.length} 家企业结果`);
  });
  document.querySelector("#preloanFile").addEventListener("change", handleFileUpload);
  bindResultEvents(currentResults, "preloan");
  bindPreloanHistoryEvents();
}

function renderPostloan() {
  const view = document.querySelector("#postloanView");
  buildCurrentPostloanDataset();
  const currentResults = currentPostloanResults();
  const filteredBatches = state.batches.filter(batch => {
    const batchDateKey = String(batch.range || "").slice(0, 10);
    const startMatched = !state.batchStartDate || batchDateKey >= state.batchStartDate;
    const endMatched = !state.batchEndDate || batchDateKey <= state.batchEndDate;
    const bankScopeMatched = belongsToCurrentBank(batch.bankName);
    const listMatched = state.batchListFilter === "all" || batch.listId === state.batchListFilter;
    const bankMatched = state.batchBankFilter === "all" || batch.bankName === state.batchBankFilter;
    return startMatched && endMatched && bankScopeMatched && listMatched && bankMatched;
  });
  const visibleBatches = state.batches.filter(batch => belongsToCurrentBank(batch.bankName));
  const batchListOptions = [...new Set(visibleBatches.map(batch => batch.listId).filter(Boolean))];
  const batchBankOptions = [...new Set(visibleBatches.map(batch => batch.bankName).filter(Boolean))];
  view.innerHTML = `<div class="page-heading"><div><div class="eyebrow">Monthly monitoring</div><h1>贷中监控</h1><p>平台按月度周期自动跑批：每月1日运行状态为“有效”且处于监测时间范围内的名单，中止或终止状态名单不参与当月监测。</p></div></div>
    <div class="monitor-banner"><div class="monitor-step"><div class="step-num">1</div><div><strong>名单确认</strong><span>当前监测名单企业 ${currentResults.length} 家</span></div></div><div class="monitor-step"><div class="step-num">2</div><div><strong>每月1日自动跑批</strong><span>按名单状态与起止时间执行</span></div></div><div class="monitor-step wait"><div class="step-num">3</div><div><strong>结果发布</strong><span>自动发布，支持导出与AI解读</span></div></div></div>
    ${resultTable(currentResults, "postloan", "当前月度监测结果", `最新已完成月度跑批 · ${currentResults.length} 家企业 · 按企业名称升序`, true)}
    <div class="panel monitor-table"><div class="panel-header"><div><h3>历史监控批次</h3><p>按银行机构、名单编号和监测时间范围查看已发布的监测结果</p></div><div class="batch-filter-toolbar"><select class="select-input" id="batchBankFilter"><option value="all">全部银行机构</option>${batchBankOptions.map(bank => `<option value="${escapeHTML(bank)}" ${state.batchBankFilter === bank ? "selected" : ""}>${escapeHTML(bank)}</option>`).join("")}</select><select class="select-input" id="batchListFilter"><option value="all">全部名单编号</option>${batchListOptions.map(listId => `<option value="${escapeHTML(listId)}" ${state.batchListFilter === listId ? "selected" : ""}>${escapeHTML(listId)}</option>`).join("")}</select><label class="date-filter"><span>从</span><input class="date-input" id="batchStartDate" type="date" value="${escapeHTML(state.batchStartDate)}" /></label><label class="date-filter"><span>到</span><input class="date-input" id="batchEndDate" type="date" value="${escapeHTML(state.batchEndDate)}" /></label><span class="muted-text">共 ${filteredBatches.length} 个批次</span></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>监测月份</th><th>名单编号</th><th>企业数量</th><th>银行机构</th><th>监测区间</th><th>风险分布</th><th>状态</th><th>完成时间</th><th>操作</th></tr></thead><tbody>${filteredBatches.length ? filteredBatches.map(batch => `<tr><td><strong>${batch.month}</strong></td><td><span class="list-id table-list-id">${escapeHTML(batch.listId || "—")}</span></td><td>${batch.total.toLocaleString()} 家</td><td>${escapeHTML(batch.bankName || "—")}</td><td class="muted-text">${batch.range}</td><td><span class="risk-badge high">${batch.high}</span><span class="risk-badge medium" style="margin-left:5px">${batch.medium}</span><span class="risk-badge low" style="margin-left:5px">${batch.low}</span><span class="risk-badge none" style="margin-left:5px">${batch.none}</span></td><td><span class="status-badge complete">${batch.status}</span></td><td class="muted-text">${batch.time}</td><td><button class="text-button" data-batch-export="${batch.month}">导出</button></td></tr>`).join("") : `<tr><td colspan="9"><div class="empty-state">没有符合条件的历史监控批次</div></td></tr>`}</tbody></table></div></div>`;
  if (isBankUser()) document.querySelector("#batchBankFilter").classList.add("hidden-app");
  document.querySelector("#batchListFilter").addEventListener("change", event => { state.batchListFilter = event.target.value; renderPostloan(); });
  document.querySelector("#batchBankFilter").addEventListener("change", event => { state.batchBankFilter = event.target.value; renderPostloan(); });
  document.querySelector("#batchStartDate").addEventListener("change", event => { state.batchStartDate = event.target.value; renderPostloan(); });
  document.querySelector("#batchEndDate").addEventListener("change", event => { state.batchEndDate = event.target.value; renderPostloan(); });
  document.querySelectorAll("[data-batch-export]").forEach(button => button.addEventListener("click", () => exportResults(currentResults, `${button.dataset.batchExport}贷中监控结果`, true)));
  bindResultEvents(currentResults, "postloan");
  updateRiskChangeNotification();
}

function openDashboardEventModal(mode, eventName) {
  const rows = dashboardRiskEventDetailRows(mode, eventName);
  const category = coreRiskEvents.has(eventName) ? "核心风险事件" : "非核心风险事件";
  const categoryClass = coreRiskEvents.has(eventName) ? "core" : "non-core";
  const periodText = mode === "preloan" ? `${monthLabel(currentMonthKey())} · 截至当前日期` : `${monthLabel("2026/07")} · 跑批完成后更新`;
  const includeBank = !isBankUser();
  const bankHeader = includeBank ? "<th>银行机构</th>" : "";
  const colSpan = includeBank ? 5 : 4;
  const body = rows.length ? rows.map(row => `<tr><td><strong>${escapeHTML(row.name)}</strong></td><td class="muted-text">${escapeHTML(row.code)}</td><td><div class="dashboard-event-list-ids">${row.listIds.map(listId => `<span class="list-id table-list-id">${escapeHTML(listId)}</span>`).join("") || "—"}</div></td><td><div class="rule-tags">${formatAiRiskEvents(row.events)}</div></td>${includeBank ? `<td><div class="dashboard-event-bank-list">${row.banks.map(bank => `<span>${escapeHTML(bank)}</span>`).join("") || "—"}</div></td>` : ""}</tr>`).join("") : `<tr><td colspan="${colSpan}"><div class="empty-state">当前没有符合条件的企业</div></td></tr>`;
  const title = document.querySelector("#dashboardEventModalTitle");
  title.textContent = `${category}：${eventName}`;
  title.classList.remove("core", "non-core");
  title.classList.add("risk-event-title", categoryClass);
  document.querySelector("#dashboardEventModalBody").innerHTML = `<div class="dashboard-event-summary"><span class="muted-text">${periodText}</span><strong>${rows.length.toLocaleString()}<small>家企业</small></strong></div><div class="table-wrap dashboard-event-table-wrap"><table class="data-table dashboard-event-table"><thead><tr><th>企业名称</th><th>组织机构代码</th><th>名单编号</th><th>风险事件</th>${bankHeader}</tr></thead><tbody>${body}</tbody></table></div>`;
  document.querySelector("#dashboardEventModal").classList.remove("hidden");
}

function closeDashboardEventModal() {
  document.querySelector("#dashboardEventModal").classList.add("hidden");
}

function openAiModal(row, type = "postloan") {
  if (!row) return;
  state.aiTarget = row;
  const events = row.events || [];
  const eventMarkup = formatAiRiskEvents(events);
  const summary = events.length ? `后台风险策略已将该企业本监测月份的异常表现归集为${events.length}类风险事件：${events.join("、")}。当前风险等级为${levelText[row.level]}，建议结合下方方向开展核查。` : `后台风险策略判断该企业本监测月份为${levelText[row.level]}，当前未触发风险事件，暂无风险。`;
  const directions = events.length ? [...new Set(events.flatMap(event => riskEventDirections[event] || []))] : ["当前暂无风险事件，无需开展专项风险核查，可按日常管理要求持续关注。"];
  const periodLabel = type === "preloan" ? "查询月份" : "监测月份";
  document.querySelector("#aiModalTitle").textContent = `${row.name} · 风险解读`;
  document.querySelector("#aiModalBody").innerHTML = `<div class="ai-summary"><strong>AI归集结论：</strong>${escapeHTML(summary)}</div><div class="ai-section"><h3 class="ai-section-title">基础结果</h3><div class="ai-facts"><div class="ai-fact"><span>风险等级</span><strong>${riskBadge(row.level)}</strong></div><div class="ai-fact"><span>${periodLabel}</span><strong>${escapeHTML(row.month)}</strong></div><div class="ai-fact ai-fact-wide"><span>风险事件</span><div class="rule-tags">${eventMarkup}</div></div></div></div><div class="ai-section"><h3 class="ai-section-title">建议核查方向</h3><ul class="ai-suggest">${directions.map(direction => `<li>${escapeHTML(direction)}</li>`).join("")}</ul></div>`;
  document.querySelector("#aiModal").classList.remove("hidden");
}

function closeModal() { document.querySelector("#aiModal").classList.add("hidden"); state.aiTarget = null; }

function exportResults(results, filename, includeListId = false) {
  const header = ["企业名称", "组织机构代码", ...(includeListId ? ["名单编号"] : []), "监测月份", "风险事件", "风险等级"];
  const lines = [header, ...results.map(row => [row.name, row.code, ...(includeListId ? [row.listId || ""] : []), row.month, (row.events || []).join("；") || "未触发风险事件", levelText[row.level]])].map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","));
  downloadText("\uFEFF" + lines.join("\n"), `${filename}.csv`);
  recordLog("导出结果", filename);
  showToast(`已导出 ${results.length} 家企业结果`);
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}

function parseCSV(text) {
  return text.trim().split(/\r?\n/).slice(1).map(line => line.split(",")).filter(row => row.length >= 2 && row[0].trim() && row[1].trim()).map((row, index) => ({ name: row[0].trim(), code: row[1].trim(), month: "2026-07", events: index % 3 === 0 ? ["交易信息完整性异常"] : [], level: index % 3 === 0 ? "medium" : "none", ai: "已发布" })).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCSV(reader.result);
    if (!rows.length) { showToast("未识别到有效名单，请检查CSV格式"); return; }
    const queryDate = new Date();
    const listId = createPreloanListId(queryDate);
    state.preloanResults = rows.map(row => ({ ...row, listId, bankName: state.preloanBank }));
    state.preloanPage = 1;
    state.preloanListFilter = "all";
    state.preloanResultBankFilter = "all";
    state.query = "";
    state.selectedRisk = "all";
    addPreloanHistory(listId, state.preloanBank, state.preloanResults, queryDate);
    recordLog("导入名单", listId, state.preloanBank);
    renderPreloan();
    showToast(`已完成名单校验，共识别 ${rows.length} 家企业，名单编号 ${listId}`);
  };
  reader.readAsText(file, "UTF-8");
}

function updatePermissionNavVisibility() {
  const accountConfig = demoAccounts[state.currentAccount];
  const isBankUser = accountConfig?.role === "bank";
  state.hasPermissionAdmin = canViewPermissionManagement();
  document.querySelector("#systemManagementSection").classList.toggle("hidden-app", isBankUser);
  document.querySelector("#systemManagementNav").classList.toggle("hidden-app", isBankUser);
  document.querySelector("#permissionsNav").classList.toggle("hidden-app", isBankUser || !state.hasPermissionAdmin);
}

function renderCurrentView() { if (state.currentView === "dashboard") renderDashboard(); if (state.currentView === "preloan") renderPreloan(); if (state.currentView === "postloan") renderPostloan(); if (state.currentView === "listManagement") renderListManagement(); if (state.currentView === "anomalyAlerts") renderAnomalyAlerts(); if (state.currentView === "logs") renderLogs(); if (state.currentView === "permissions") renderPermissions(); }

function switchView(view) {
  if (view === "permissions" && !state.hasPermissionAdmin) { showToast("当前账号暂无权限访问权限管理"); return; }
  state.currentView = view; state.query = ""; state.selectedRisk = "all"; state.preloanListFilter = "all"; state.preloanResultBankFilter = "all"; state.postBankFilter = "all"; state.postListQuery = ""; state.listBankFilter = "all"; state.listIdQuery = ""; state.batchMonthFilter = "all"; state.batchListFilter = "all"; state.batchBankFilter = "all"; state.batchStartDate = ""; state.batchEndDate = ""; state.anomalyPage = 1; state.anomalyBankFilter = "all"; state.anomalyListFilter = "all"; state.anomalyCurrentLevelFilter = "all"; state.anomalyPreviousLevelFilter = "all";
  const parentView = ["listManagement", "anomalyAlerts"].includes(view) ? "postloan" : view;
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === parentView));
  document.querySelectorAll(".nav-subitem").forEach(item => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach(section => section.classList.remove("active-view"));
  document.querySelector(`#${view}View`).classList.add("active-view");
  document.querySelector("#breadcrumbTitle").textContent = { dashboard: "总览", preloan: "贷前筛查", postloan: "贷中监控", listManagement: "名单管理", anomalyAlerts: "异常提示", logs: "日志管理", permissions: "权限管理" }[view];
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) { const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2400); }

function notificationReadStorageKey() {
  return `riskMonitorReadNotifications:${state.currentAccount}`;
}

function readNotificationIds() {
  if (state.currentAccount === "未登录") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(notificationReadStorageKey()) || "[]"));
  } catch (error) {
    localStorage.removeItem(notificationReadStorageKey());
    return new Set();
  }
}

function notificationMessages() {
  if (state.currentAccount === "未登录") return [];
  const count = currentRiskChangeAlerts().length;
  if (!count) return [];
  const scope = isBankUser() ? currentBankInstitution() : "all-banks";
  return [{
    id: `risk-change:v3:2026-08:${scope}`,
    message: `本月有${count}家企业发生异常风险变动。`,
    targetView: "anomalyAlerts"
  }];
}

function markNotificationRead(notificationId) {
  const readIds = readNotificationIds();
  readIds.add(notificationId);
  localStorage.setItem(notificationReadStorageKey(), JSON.stringify([...readIds]));
}

function closeNotificationPopover() {
  const wrap = document.querySelector("#notificationWrap");
  const button = document.querySelector("#riskChangeNotification");
  if (!wrap || !button) return;
  wrap.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
}

function updateRiskChangeNotification() {
  const button = document.querySelector("#riskChangeNotification");
  const dot = document.querySelector("#riskChangeNotificationDot");
  const tip = document.querySelector("#riskChangeNotificationTip");
  if (!button || !dot || !tip) return;
  const readIds = readNotificationIds();
  const unreadMessages = notificationMessages().filter(item => !readIds.has(item.id));
  const hasUnread = unreadMessages.length > 0;
  const accessibleMessage = hasUnread ? `有${unreadMessages.length}条未读消息提示` : "暂无消息提示";
  dot.classList.toggle("hidden-app", !hasUnread);
  button.classList.toggle("has-alerts", hasUnread);
  button.title = accessibleMessage;
  button.setAttribute("aria-label", accessibleMessage);
  tip.innerHTML = hasUnread
    ? unreadMessages.map(item => `<button class="notification-item" type="button" data-notification-id="${escapeHTML(item.id)}" data-target-view="${escapeHTML(item.targetView)}"><span>${escapeHTML(item.message)}</span><span class="notification-item-arrow">›</span></button>`).join("")
    : `<div class="notification-empty">暂无消息提示</div>`;
}

function toggleSidebar(collapsed) {
  state.sidebarCollapsed = collapsed;
  document.querySelector("#appShell").classList.toggle("sidebar-collapsed", collapsed);
  document.querySelector("#sidebarToggle").setAttribute("aria-label", collapsed ? "导航已收起" : "收起导航");
  document.querySelector("#sidebarToggle").title = collapsed ? "导航已收起" : "收起导航";
}

function getDisplayInitial() {
  const name = String(state.customDisplayName || "").trim();
  return name ? Array.from(name)[0] : "无";
}

function updateUserIdentityUI() {
  document.querySelector("#sidebarUserName").textContent = state.currentAccount;
  document.querySelector("#topbarUserName").textContent = state.currentAccount;
  document.querySelector("#sidebarInstitution").textContent = state.currentInstitution;
  document.querySelectorAll(".avatar").forEach(avatar => { avatar.textContent = getDisplayInitial(); });
}

function displayNameStorageKey() {
  return `riskMonitorDisplayName:${state.currentAccount}`;
}

function closeTopbarUserMenu() {
  const menu = document.querySelector("#topbarUserMenu");
  const trigger = document.querySelector("#topbarUser");
  menu.classList.remove("open");
  trigger.setAttribute("aria-expanded", "false");
}

function toggleTopbarUserMenu() {
  const menu = document.querySelector("#topbarUserMenu");
  const trigger = document.querySelector("#topbarUser");
  const isOpen = menu.classList.toggle("open");
  trigger.setAttribute("aria-expanded", String(isOpen));
}

function renameCurrentUser() {
  const enteredName = window.prompt("请输入显示名称（留空可恢复默认头像）", state.customDisplayName || "");
  if (enteredName === null) return;
  state.customDisplayName = enteredName.trim();
  if (state.customDisplayName) localStorage.setItem(displayNameStorageKey(), state.customDisplayName);
  else localStorage.removeItem(displayNameStorageKey());
  recordLog("修改名称", state.customDisplayName || "恢复默认头像");
  updateUserIdentityUI();
  closeTopbarUserMenu();
  showToast(state.customDisplayName ? `已修改显示名称为“${state.customDisplayName}”` : "已恢复默认头像");
}

function logoutPlatform() {
  recordLog("登出平台", "平台账户", state.currentInstitution);
  state.currentView = "dashboard";
  state.currentAccount = "未登录";
  state.currentOperator = "未登录";
  state.currentInstitution = "用户";
  state.customDisplayName = "";
  state.hasPermissionAdmin = false;
  document.querySelector("#appShell").classList.add("hidden-app");
  document.querySelector("#loginView").classList.remove("hidden-app");
  document.querySelectorAll(".view").forEach(section => section.classList.toggle("active-view", section.id === "dashboardView"));
  const rememberedLogin = localStorage.getItem("riskMonitorRememberedLogin");
  if (!rememberedLogin) {
    document.querySelector("#loginAccount").value = "";
    document.querySelector("#loginPassword").value = "";
  }
  updateUserIdentityUI();
  updatePermissionNavVisibility();
  closeTopbarUserMenu();
  closeNotificationPopover();
  updateRiskChangeNotification();
}

function enterPlatform() {
  const account = document.querySelector("#loginAccount");
  const password = document.querySelector("#loginPassword");
  const fields = [account, password];
  fields.forEach(field => field.classList.toggle("invalid", !field.value.trim()));
  if (fields.some(field => !field.value.trim())) {
    showToast("请输入登录账户和登录密码");
    return;
  }
  const accountKey = account.value.trim().toLowerCase();
  const matchedFormat = accountFormats.find(item => item.pattern.test(accountKey));
  if (!matchedFormat) {
    showToast("暂未识别该登录账户格式，请联系平台管理员配置");
    return;
  }
  const accountConfig = demoAccounts[accountKey];
  if (!accountConfig || accountConfig.password !== password.value) {
    showToast("登录账户或密码不正确");
    return;
  }
  if (accountConfig.enabled === false) {
    showToast("该账号当前已失效，请联系管理员");
    return;
  }
  if (accountConfig.role !== matchedFormat.role) {
    showToast("登录账户格式与账号权限不匹配");
    return;
  }
  const rememberPassword = document.querySelector("#rememberPassword");
  if (rememberPassword.checked) {
    localStorage.setItem("riskMonitorRememberedLogin", JSON.stringify({ account: accountKey, password: password.value }));
  } else {
    localStorage.removeItem("riskMonitorRememberedLogin");
  }
  const profile = roleProfiles[matchedFormat.role];
  state.currentAccount = accountKey;
  state.currentOperator = accountKey;
  state.currentInstitution = profile.institution;
  state.hasPermissionAdmin = Boolean(accountConfig.permissionAdmin && accountConfig.enabled);
  state.customDisplayName = localStorage.getItem(displayNameStorageKey()) || "";
  document.querySelector("#loginView").classList.add("hidden-app");
  document.querySelector("#appShell").classList.remove("hidden-app");
  updateUserIdentityUI();
  updatePermissionNavVisibility();
  if (state.currentView === "dashboard") renderDashboard();
  updateRiskChangeNotification();
  recordLog("登录成功", "平台账户", profile.institution);
  showToast(`已以${profile.name}身份进入平台`);
}

document.querySelector("#loginButton").addEventListener("click", enterPlatform);
document.querySelectorAll("#loginAccount, #loginPassword").forEach(input => input.addEventListener("keydown", event => {
  if (event.key === "Enter") { event.preventDefault(); enterPlatform(); }
}));
try {
  const rememberedLogin = JSON.parse(localStorage.getItem("riskMonitorRememberedLogin") || "null");
  if (rememberedLogin && rememberedLogin.account && rememberedLogin.password) {
    document.querySelector("#loginAccount").value = rememberedLogin.account;
    document.querySelector("#loginPassword").value = rememberedLogin.password;
    document.querySelector("#rememberPassword").checked = true;
  }
} catch (error) {
  localStorage.removeItem("riskMonitorRememberedLogin");
}
document.querySelector("#sidebarToggle").addEventListener("click", () => toggleSidebar(true));
document.querySelector("#sidebarExpand").addEventListener("click", () => toggleSidebar(false));
document.querySelector("#topbarUser").addEventListener("click", event => { event.stopPropagation(); toggleTopbarUserMenu(); });
document.querySelector("#riskChangeNotification").addEventListener("click", event => {
  event.stopPropagation();
  if (state.currentAccount === "未登录") return;
  const wrap = document.querySelector("#notificationWrap");
  const isOpen = wrap.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
document.querySelector("#riskChangeNotificationTip").addEventListener("click", event => {
  const item = event.target.closest("[data-notification-id]");
  if (!item || state.currentAccount === "未登录") return;
  event.stopPropagation();
  markNotificationRead(item.dataset.notificationId);
  closeNotificationPopover();
  updateRiskChangeNotification();
  switchView(item.dataset.targetView);
});
document.querySelector("#renameUserButton").addEventListener("click", renameCurrentUser);
document.querySelector("#logoutButton").addEventListener("click", logoutPlatform);
document.addEventListener("click", event => {
  if (!event.target.closest(".topbar-user-wrap")) closeTopbarUserMenu();
  if (!event.target.closest("#notificationWrap")) closeNotificationPopover();
});
document.querySelectorAll(".nav-item, .nav-subitem").forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal));
document.querySelector("#aiModal").addEventListener("click", event => { if (event.target.id === "aiModal") closeModal(); });
document.querySelectorAll("[data-close-dashboard-event-modal]").forEach(button => button.addEventListener("click", closeDashboardEventModal));
document.querySelector("#dashboardEventModal").addEventListener("click", event => { if (event.target.id === "dashboardEventModal") closeDashboardEventModal(); });
document.querySelectorAll("[data-close-list-modal]").forEach(button => button.addEventListener("click", closeListManageModal));
document.querySelector("#listManageModal").addEventListener("click", event => { if (event.target.id === "listManageModal") closeListManageModal(); });
document.querySelectorAll("[data-close-institution-modal]").forEach(button => button.addEventListener("click", closeInstitutionModal));
document.querySelector("#institutionModal").addEventListener("click", event => { if (event.target.id === "institutionModal") closeInstitutionModal(); });
document.querySelector("#saveInstitutionButton").addEventListener("click", saveInstitution);
document.querySelector("#institutionNameInput").addEventListener("keydown", event => { if (event.key === "Enter") saveInstitution(); });
document.querySelector("#stopListButton").addEventListener("click", stopTargetList);
document.querySelector("#restoreListButton").addEventListener("click", restoreTargetList);
document.querySelector("#deleteListButton").addEventListener("click", deleteTargetList);
document.querySelectorAll("[data-close-permission-modal]").forEach(button => button.addEventListener("click", closePermissionModal));
document.querySelector("#permissionModal").addEventListener("click", event => { if (event.target.id === "permissionModal") closePermissionModal(); });
document.querySelector("#permissionType").addEventListener("change", () => syncPermissionInstitutionOptions(state.permissionInstitutionDraft));
document.querySelector("#permissionInstitution").addEventListener("change", event => {
  if (event.target.value === "__add_institution__") {
    event.target.value = state.permissionInstitutionDraft;
    openInstitutionModal("permission");
    return;
  }
  state.permissionInstitutionDraft = event.target.value;
});
document.querySelector("#savePermissionButton").addEventListener("click", savePermissionAccount);
updatePermissionNavVisibility();
renderDashboard();
