/* Load as a classic script AFTER app.js (and its persistence initialization).
 * Store contract: notificationArchive[account][YYYY-MM] = message snapshots[];
 * notificationReads[account] = notification id[]. Main persists both fields.
 * This layer never replaces queryPreloanList or the core transaction store.
 */
(() => {
  "use strict";
  if (window.V1UI) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const save = () => window.V1Persistence?.saveSoon();
  function wrap(name, after) {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function (...args) {
      const focus=document.activeElement;
      const focusId=focus?.id, start=focus?.selectionStart, end=focus?.selectionEnd;
      const result = original.apply(this, args);
      after(...args);
      if(focusId && focus?.tagName==='INPUT' && !focus.isConnected) {
        const replacement=document.getElementById(focusId);
        replacement?.focus();if(start!=null)try{replacement?.setSelectionRange(start,end);}catch{}
      }
      return result;
    };
  }
  function button(text, action, className = "button ghost") {
    const node = document.createElement("button");
    node.type = "button";
    node.className = className;
    node.textContent = text;
    node.addEventListener("click", action);
    return node;
  }
  function addReset(toolbar, defaults, pageKey, render, existing) {
    if (!toolbar || $("[data-v1-reset]", toolbar)) return;
    const reset = () => {
      Object.assign(state, defaults);
      if (pageKey) state[pageKey] = 1;
      render();
    };
    const control = existing || button("↺ 重置筛选", reset);
    control.dataset.v1Reset = "true";
    control.style.marginLeft = "0";
    control.style.flexShrink = "0";
    Object.assign(toolbar.style, { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "flex-end", marginLeft: "auto", flex: "0 1 auto" });
    toolbar.append(control);
    const panel = toolbar.closest(".panel, .preloan-list-box");
    if (panel && Object.entries(defaults).some(([key, value]) => state[key] !== value)) {
      $$(".empty-state", panel).forEach(empty => {
        if ($("[data-v1-clear]", empty)) return;
        const clear = button("清空筛选", reset, "text-button");
        clear.dataset.v1Clear = "true";
        clear.style.marginLeft = "12px";
        empty.append(clear);
      });
    }
  }
  function openListInterpretation(scene, id) {
    const record = scene === "preloan"
      ? state.preloanHistory.find(item => item.listId === id && item.queried !== false && belongsToCurrentBank(item.bankName))
      : state.batches.find(item => item.id === id && belongsToCurrentBank(item.bankName));
    if (!record) return;
    $("#listInterpretationTitle").textContent = "AI大模型解读-" + record.listId;
    const modal = $("#listInterpretationModal");
    modal.dataset.scene = scene;
    modal.dataset.recordId = id;
    const rows = scene === "preloan" ? record.results : record.rows;
    const body = $("#listInterpretationBody");
    body.replaceChildren();
    const add = (tag, text, className = "") => {
      const node = document.createElement(tag);
      node.className = className;
      node.textContent = text;
      body.append(node);
    };
    add("p", "模拟解读 · 根据本份名单已保存的结果生成，仅用于页面展示和格式调整，非外部AI接口返回。", "list-ai-demo-note");
    if (!Array.isArray(rows) || !rows.length) {
      add("p", "该批次暂无完整企业结果，暂无法生成名单解读。");
    } else {
      const counts = { high: 0, medium: 0, low: 0, none: 0 };
      const events = new Map();
      rows.forEach(row => {
        if (row.level in counts) counts[row.level]++;
        [...new Set(row.events || [])].forEach(name => events.set(name, (events.get(name) || 0) + 1));
      });
      const ranked = [...events].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
      const focus = counts.high + counts.medium;
      add("p", (scene === "preloan" ? "贷前筛查" : "贷中监控") + " ｜ 数据月份：" + (rows[0].month || record.period || "—") + " ｜ 企业数量：" + rows.length + "家", "list-ai-meta");
      add("h3", "一、名单整体结论");
      add("p", "本份名单共包含" + rows.length + "家企业。已发布结果中，高风险" + counts.high + "家、中风险" + counts.medium + "家、低风险" + counts.low + "家、无风险" + counts.none + "家。" + (focus ? "其中，中高风险企业合计" + focus + "家，建议结合其触发的风险事件开展针对性核查。" : "当前未出现中高风险企业，仍应结合具体业务背景理解本次筛查结果。"));
      add("h3", "二、风险事件归集");
      add("p", ranked.length ? "本份名单共触发" + ranked.length + "类风险事件。同一家企业可能触发多类事件，以下各类企业数量不可直接相加。" : "本次结果未触发风险事件。未触发事件仅表示本次数据和策略范围内未出现相关提示，不代表对企业经营和信用状况作出保证。");
      ranked.forEach(([name, count]) => add("p", name + "：" + count + "家。", "list-ai-event"));
      add("h3", "三、建议核查方向");
      ranked.slice(0, 4).forEach(([name]) => add("p", "针对“" + name + "”，" + (riskEventDirections[name] || "建议结合交易资料与实际业务背景进一步核实。")));
      if (!ranked.length) add("p", "可按既有业务流程核验企业经营资料及资金用途，并持续关注后续监测结果。");
      add("h3", "四、结果使用说明");
      add("p", "上述内容仅对本份名单已发布的风险等级和事件进行归集解释，不新增或调整任何企业的风险等级。风险事件属于核查线索，不直接等同于已确认的虚假流水或欺诈事实；具体业务判断应结合核实材料及机构内部管理要求。");
    }
    modal.classList.remove("hidden");
  }
  function closeListInterpretation() { $("#listInterpretationModal").classList.add("hidden"); }
  $$("[data-close-list-interpretation]").forEach(node => node.addEventListener("click", closeListInterpretation));
  $("#listInterpretationModal").addEventListener("click", event => {
    if (event.target.id === "listInterpretationModal") closeListInterpretation();
  });
  function historyInterpretationActions() {
    for (const [selector, scene, key] of [
      [".preloan-history-panel [data-preloan-history-download]", "preloan", "preloanHistoryDownload"],
      [".monitor-table [data-batch-export]", "postloan", "batchExport"]
    ]) {
      $$(selector).forEach(exportButton => {
        if (exportButton.closest(".history-list-actions")) return;
        const group = document.createElement("div");
        group.className = "history-list-actions";
        const id = exportButton.dataset[key];
        const ai = button("AI解读", () => openListInterpretation(scene, id), "text-button");
        ai.dataset.listInterpretation = id;
        exportButton.textContent = "导出";
        exportButton.before(group);
        group.append(ai, exportButton);
      });
    }
  }
  function filters() {
    historyInterpretationActions();
    document.querySelectorAll('.data-table').forEach(table=>{
      const headers=[...table.querySelectorAll('thead th')];
      const isCurrentResult = table.classList.contains('result-data-table');
      table.classList.toggle('sticky-enterprise', Boolean(headers[0]?.textContent.includes('企业名称')) && !isCurrentResult);
      if(headers.at(-1)?.textContent==='操作')table.classList.add('sticky-actions');
    });
    addReset($(".list-toolbar"), { listBankFilter: "all", listIdQuery: "" }, "listPage", () => renderListManagement());
    addReset($(".anomaly-filter-toolbar"), { anomalyBankFilter: "all", anomalyListFilter: "all", anomalyCurrentLevelFilter: "all", anomalyPreviousLevelFilter: "all" }, "anomalyPage", () => renderAnomalyAlerts());
    addReset($(".log-filters"), { logBankFilter: "all", logStartDate: "", logEndDate: "" }, "logPage", () => renderLogs(), $("#resetLogFilters"));
    addReset($(".permission-filters"), { permissionQuery: "", permissionTypeFilter: "all", permissionStatusFilter: "all" }, "permissionPage", () => renderPermissions());
    addReset($(".preloan-history-filters"), { preloanHistoryBankFilter: "all", preloanHistoryListQuery: "all", preloanHistoryStartDate: "", preloanHistoryEndDate: "" }, "preloanHistoryPage", () => renderPreloan());
    addReset($(".batch-filter-toolbar"), { batchBankFilter: "all", batchListFilter: "all", batchMonthFilter: "all", batchStartDate: "", batchEndDate: "" }, "batchPage", () => renderPostloan());
    for (const type of ["preloan", "postloan"]) {
      addReset($(`#${type}View .result-toolbar`), {
        query: "", selectedRisk: "all", ...(type === "preloan" ? { preloanResultBankFilter: "all", preloanListFilter: "all" } : { postBankFilter: "all", postListQuery: "" })
      }, `${type}Page`, () => type === "preloan" ? renderPreloan() : renderPostloan());
    }
  }

  const quotaDefaults = { quotaAccountFilter: "all", quotaTypeFilter: "all", quotaStartDate: "", quotaEndDate: "" };
  function permittedQuotaRecords() {
    // Match renderQuota's existing authorization boundary, before user filters.
    return isBankUser() ? state.quotaTransactions.filter(record => record.account === quotaAccountKey()) : state.quotaTransactions;
  }
  function matchingQuotaRecords() {
    return permittedQuotaRecords().filter(record => {
      const day = String(record.time || "").slice(0, 10).replaceAll('/','-');
      return (state.quotaAccountFilter === "all" || record.account === state.quotaAccountFilter)
        && (state.quotaTypeFilter === "all" || record.type === state.quotaTypeFilter)
        && (!state.quotaStartDate || day >= state.quotaStartDate)
        && (!state.quotaEndDate || day <= state.quotaEndDate);
    }).slice().sort((a, b) => String(b.time).localeCompare(String(a.time)));
  }
  const csvCell = value => `"${String(value ?? "").replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`;
  function exportQuota() {
    const rows = matchingQuotaRecords();
    const lines = [["相关账户", "操作类型", "额度变动", "操作后余额", "操作时间", "操作说明", "操作人"], ...rows.map(r => [r.account, r.type, r.delta, r.balance, r.time, r.description, r.operator])];
    downloadText("\uFEFF" + lines.map(row => row.map(csvCell).join(",")).join("\r\n"), "额度操作记录.csv");
    recordLog('导出结果',`额度流水 ${rows.length} 条`);
  }
  function quotaUI() {
    const panel = $("#quotaView .quota-ledger-panel");
    if (!panel) return;
    for (const [key, value] of Object.entries(quotaDefaults)) if (state[key] == null) state[key] = value;
    const area = document.createElement("div");
    area.className = "v1-quota-filters";
    area.style.padding = "12px 18px";
    function select(key, label, values) {
      const input = document.createElement("select");
      input.id = key;
      input.className = "select-input";
      input.setAttribute("aria-label", label);
      input.add(new Option(label, "all"));
      [...new Set(values)].filter(Boolean).forEach(value => input.add(new Option(value, value)));
      input.value = state[key];
      input.addEventListener("change", () => { state[key] = input.value; state.quotaPage = 1; renderQuota(); });
      area.append(input);
    }
    const scoped = permittedQuotaRecords();
    select("quotaAccountFilter", "全部相关账户", scoped.map(r => r.account));
    select("quotaTypeFilter", "全部操作类型", scoped.map(r => r.type));
    for (const [key, labelText] of [["quotaStartDate", "从"], ["quotaEndDate", "至"]]) {
      const label = document.createElement("label");
      label.className = "date-filter";
      label.append(document.createTextNode(labelText));
      const input = document.createElement("input");
      input.type = "date";
      input.id = key;
      input.className = "date-input";
      input.setAttribute("aria-label", `${labelText}操作日期`);
      input.value = state[key];
      input.addEventListener("change", () => { state[key] = input.value; state.quotaPage = 1; renderQuota(); });
      label.append(input);
      area.append(label);
    }
    area.append(button("↓ 导出结果", exportQuota));
    $(".panel-header", panel).after(area);
    const records = matchingQuotaRecords();
    const pages = Math.max(1, Math.ceil(records.length / 10));
    state.quotaPage = Math.min(Math.max(1, state.quotaPage), pages);
    $("tbody", panel).innerHTML = quotaTransactionRows(records.slice((state.quotaPage - 1) * 10, state.quotaPage * 10));
    const pagination = $(".quota-pagination", panel);
    pagination.replaceChildren();
    const summary = document.createElement("span");
    summary.textContent = `共 ${records.length} 条操作记录 · 第 ${state.quotaPage}/${pages} 页 · 每页10条`;
    const controls = document.createElement("div");
    controls.className = "page-controls";
    for (const [label, page] of [["‹", state.quotaPage - 1], [String(state.quotaPage), state.quotaPage], ["›", state.quotaPage + 1]]) {
      const control = button(label, () => { state.quotaPage = page; renderQuota(); }, "page-button");
      control.dataset.quotaPage = page;
      control.disabled = page < 1 || page > pages || page === state.quotaPage;
      controls.append(control);
    }
    pagination.append(summary, controls);
    addReset(area, quotaDefaults, "quotaPage", () => renderQuota());
  }

  let historyOpen = false;
  let notificationAccount = null;
  const legacyReads = readNotificationIds;
  function notificationStore() {
    state.notificationArchive ||= {};
    state.notificationReads ||= {};
    const account = state.currentAccount;
    if (!Object.hasOwn(state.notificationArchive, account)) state.notificationArchive[account] = {};
    if (!Object.hasOwn(state.notificationReads, account)) state.notificationReads[account] = [...legacyReads()];
    return { archive: state.notificationArchive[account], reads: state.notificationReads[account] };
  }
  function archiveMessages() {
    if (state.currentAccount === "未登录") return;
    const { archive } = notificationStore();
    let changed = false;
    for (const item of notificationMessages()) {
      const month = String(item.monthKey || item.month || item.id).match(/\d{4}[-/]\d{2}/)?.[0].replace("/", "-") || currentMonthKey().replace("/", "-");
      if (!Object.hasOwn(archive, month)) archive[month] = [];
      const index = archive[month].findIndex(record => record.id === item.id);
      const snapshot = { ...item, monthKey: month };
      if (index < 0) { archive[month].push(snapshot); changed = true; }
      else if (JSON.stringify(archive[month][index]) !== JSON.stringify(snapshot)) { archive[month][index] = snapshot; changed = true; }
    }
    if (changed) save();
  }
  readNotificationIds = function () {
    return state.currentAccount === "未登录" ? new Set() : new Set(notificationStore().reads);
  };
  markNotificationRead = function (id) {
    if (state.currentAccount === "未登录") return;
    archiveMessages();
    const { reads } = notificationStore();
    if (!reads.includes(id)) reads.push(id);
    save();
  };
  const originalNotificationUpdate = updateRiskChangeNotification;
  updateRiskChangeNotification = function () {
    if (notificationAccount !== state.currentAccount) { historyOpen = false; notificationAccount = state.currentAccount; }
    archiveMessages();
    originalNotificationUpdate();
    const tip = $("#riskChangeNotificationTip");
    if (!tip || state.currentAccount === "未登录") return;
    tip.setAttribute("role", "region");
    tip.setAttribute("aria-label", historyOpen ? "已读消息历史" : "未读消息");
    if (historyOpen) {
      tip.replaceChildren();
      const { archive, reads } = notificationStore();
      for (const month of Object.keys(archive).sort().reverse()) {
        const records = archive[month].filter(item => reads.includes(item.id));
        if (!records.length) continue;
        const heading = document.createElement("div");
        heading.className = "notification-empty";
        heading.textContent = month;
        tip.append(heading);
        for (const item of records) {
          const entry = button(item.message, () => {
            closeNotificationPopover();
            if (["dashboard", "preloan", "postloan", "anomalyAlerts", "listManagement", "quota"].includes(item.targetView)) switchView(item.targetView);
          }, "notification-item");
          tip.append(entry);
        }
      }
      if (!tip.children.length) {
        const empty = document.createElement("div");
        empty.className = "notification-empty";
        empty.textContent = "暂无已读消息";
        tip.append(empty);
      }
    }
    const toggle = button(historyOpen ? "返回未读消息" : "已读消息历史", event => {
      event.stopPropagation();
      historyOpen = !historyOpen;
      updateRiskChangeNotification();
      $("[data-v1-history]", tip)?.focus();
    }, "notification-item");
    toggle.dataset.v1History = "true";
    tip.append(toggle);
    Object.assign(tip.style, { maxHeight: "min(480px, 75vh)", overflowY: "auto", maxWidth: "calc(100vw - 24px)" });
  };
  $("#riskChangeNotification")?.addEventListener("click", () => {
    historyOpen = false;
    updateRiskChangeNotification();
  });

  // Observe ONLY visibility classes on static overlay roots. No subtree or style
  // observation: our aria/tabindex/focus changes cannot retrigger this observer.
  const modalClose = {
    listInterpretationModal: closeListInterpretation,
    aiModal: () => closeModal(), dashboardEventModal: () => closeDashboardEventModal(),
    listManageModal: () => closeListManageModal(), institutionModal: () => closeInstitutionModal(),
    permissionModal: () => closePermissionModal(), temporaryPasswordModal: () => closeTemporaryPasswordModal(),
    passwordModal: () => closePasswordModal(), accountValidityModal: () => closeAccountValidityModal()
  };
  const visible = node => node?.isConnected && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden";
  const focusables = root => $$("button, a[href], input, select, textarea, [tabindex]", root).filter(node => !node.disabled && node.tabIndex >= 0 && visible(node));
  let lastFocus = document.activeElement;
  let stack = [];
  const roots = $$(".modal-backdrop").map(node => ({ node, root: node, open: () => !node.classList.contains("hidden"), close: modalClose[node.id] }));
  for (const [selector, content, close] of [["#notificationWrap", "#riskChangeNotificationTip", () => closeNotificationPopover()], ["#topbarUserMenu", "#topbarUserMenu", () => closeTopbarUserMenu()]]) {
    const node = $(selector);
    if (node) roots.push({ node, root: $(content), open: () => node.classList.contains("open"), close });
  }
  function activeOverlay() {
    return stack.find(entry => entry.root.id === "passwordModal" && state.passwordChangeForced) || stack.at(-1);
  }
  function focusInside(entry) {
    entry.root.tabIndex = -1;
    (focusables(entry.root)[0] || entry.root).focus();
  }
  function syncOverlays() {
    const removed = stack.filter(entry => !entry.open());
    stack = stack.filter(entry => entry.open());
    for (const entry of roots) if (entry.open() && !stack.includes(entry)) {
      entry.restore = lastFocus;
      stack.push(entry);
      focusInside(activeOverlay());
    }
    if (removed.length) {
      const active = activeOverlay();
      if (active) focusInside(active);
      else {
        const target = removed[0].restore;
        if (visible(target)) target.focus();
        else $(".nav-item.active, #riskChangeNotification")?.focus();
      }
    }
    lastFocus = document.activeElement;
  }
  const observer = new MutationObserver(syncOverlays);
  roots.forEach(entry => observer.observe(entry.node, { attributes: true, attributeFilter: ["class"] }));
  document.addEventListener("pointerdown", () => { lastFocus = document.activeElement; }, true);
  document.addEventListener("focusin", event => {
    if(document.querySelector('#businessDialog')) return;
    const active = activeOverlay();
    if (active && active.open() && !active.root.contains(event.target)) focusInside(active);
    else lastFocus = event.target;
  });
  document.addEventListener("keydown", event => {
    if(document.querySelector('#businessDialog')) return;
    lastFocus = document.activeElement;
    syncOverlays();
    const active = activeOverlay();
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (active.root.id !== "passwordModal" || !state.passwordChangeForced) active.close?.();
    } else if (event.key === "Tab") {
      const items = focusables(active.root);
      const index = items.indexOf(document.activeElement);
      if (!items.length || index < 0 || (event.shiftKey ? index === 0 : index === items.length - 1)) {
        event.preventDefault();
        (event.shiftKey ? items.at(-1) : items[0])?.focus();
        if (!items.length) active.root.focus();
      }
    }
  }, true);

  function clampTooltip(trigger) {
    const tip = trigger?.nextElementSibling;
    if (!tip?.classList.contains("help-tooltip")) return;
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    Object.assign(tip.style, { position: "fixed", minWidth: "0", width: "max-content", maxWidth: `${Math.max(0, width - 16)}px`, maxHeight: `${Math.max(0, height - 16)}px`, overflow: "auto", transform: "none", left: "8px", top: "8px" });
    [...tip.children].forEach(entry => { entry.style.whiteSpace = "nowrap"; });
    const anchor = trigger.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    tip.style.left = `${Math.max(8, Math.min(anchor.left, width - box.width - 8))}px`;
    tip.style.top = `${Math.max(8, Math.min(anchor.bottom + 8 + box.height <= height - 8 ? anchor.bottom + 8 : anchor.top - box.height - 8, height - box.height - 8))}px`;
  }
  for (const eventName of ["pointerover", "focusin"]) document.addEventListener(eventName, event => {
    const trigger = event.target.closest?.(".help-trigger");
    if (trigger) clampTooltip(trigger);
  });
  const reposition = () => $$(".help-trigger:hover, .help-trigger:focus").forEach(clampTooltip);
  window.addEventListener("resize", reposition);
  document.addEventListener("scroll", reposition, true);

  for (const name of ["renderDashboard", "renderListManagement", "renderAnomalyAlerts", "renderLogs", "renderPermissions", "renderPreloan", "renderPostloan"]) wrap(name, filters);
  wrap("renderQuota", quotaUI);
  window.V1UI = Object.freeze({ refresh: filters, matchingQuotaRecords, exportQuota });
  filters();
  if ($("#quotaView .quota-ledger-panel")) renderQuota();
  updateRiskChangeNotification();
  syncOverlays();
})();
