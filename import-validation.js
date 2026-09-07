/* V1 import contract: async parse(ArrayBuffer | ArrayBufferView | string, filename).
 * total counts nonblank data records; error.row is a 1-based source row (0 = file).
 * Any error discards all rows. CSV is UTF-8 (optional BOM); XLSX requires one
 * nonempty worksheet. Headers may be reordered but must be exactly the three below.
 * Browser: load vendor/sheetjs-0.20.3/xlsx.full.min.js before this file.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(() => require('./vendor/sheetjs-0.20.3/xlsx.full.min.js'));
  } else {
    root.V1Import = factory(() => root.XLSX);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (getXLSX) {
  'use strict';
  const HEADERS = ['企业名称', '组织机构代码', '机构编码'];
  const FIELDS = ['name', 'code', 'institutionCode'];
  const MAX_ROWS = 10000;
  const trim = value => String(value == null ? '' : value).trim();
  const blank = cells => cells.every(cell => !cell || (cell.f == null && cell.F == null && !trim(cell.v)));
  const error = (row, field, value, message) => ({ row, field, value: String(value == null ? '' : value), message });

  function bytes(input) {
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    throw new Error('请输入文件文本或二进制数据');
  }

  // Strict RFC-style CSV scanner. Embedded CR/LF and escaped quotes are preserved.
  function csv(text) {
    const records = [];
    let cells = [], value = '', state = 'start', line = 1, start = 1;
    const cell = () => { cells.push({ t: 's', v: value }); value = ''; state = 'start'; };
    const record = () => { cell(); records.push({ row: start, cells }); cells = []; };
    text = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (state === 'quoted') {
        if (ch === '"') {
          if (text[i + 1] === '"') { value += '"'; i++; }
          else state = 'closed';
        } else {
          value += ch;
          if (ch === '\n' || (ch === '\r' && text[i + 1] !== '\n')) line++;
        }
        continue;
      }
      if (ch === ',') { cell(); continue; }
      if (ch === '\r' || ch === '\n') {
        record();
        if (ch === '\r' && text[i + 1] === '\n') i++;
        start = ++line;
        continue;
      }
      if (state === 'closed') {
        throw Object.assign(new Error('CSV 引号关闭后只能接逗号或换行'), { row: line });
      }
      if (ch === '"') {
        if (state !== 'start') throw Object.assign(new Error('CSV 字段中的引号必须转义'), { row: line });
        state = 'quoted';
      } else { value += ch; state = 'plain'; }
    }
    if (state === 'quoted') throw Object.assign(new Error('CSV 引号未闭合'), { row: start });
    if (cells.length || value || state !== 'start') record();
    return records;
  }

  function xlsx(input) {
    const lib = getXLSX();
    if (!lib) throw new Error('未加载本地 SheetJS 组件');
    const data = bytes(input);
    if (data[0] !== 0x50 || data[1] !== 0x4b || data[2] !== 3 || data[3] !== 4) {
      throw new Error('文件不是有效的 XLSX 工作簿');
    }
    const book = lib.read(data, { type: 'array', cellNF: true, cellFormula: true, cellText: false, sheetStubs: true });
    const sheets = book.SheetNames.map(name => {
      const sheet = book.Sheets[name];
      const rows = new Map();
      // Visit actual cells, never an untrusted and potentially enormous !ref range.
      for (const address of Object.keys(sheet)) {
        if (!/^[A-Z]+[1-9][0-9]*$/.test(address)) continue;
        const cell = sheet[address];
        if (blank([cell])) continue;
        const pos = lib.utils.decode_cell(address);
        if (!rows.has(pos.r)) rows.set(pos.r, []);
        rows.get(pos.r)[pos.c] = cell;
      }
      return Array.from(rows, ([row, cells]) => ({ row: row + 1, cells }))
        .sort((a, b) => a.row - b.row);
    }).filter(records => records.length);
    if (sheets.length !== 1) throw new Error('XLSX 必须包含且仅包含一个非空工作表');
    return sheets[0];
  }

  function readCell(cell, width) {
    if (!cell) return '';
    if (cell.f != null || cell.F != null) throw new Error('不允许公式，请提供原始文本值');
    if (cell.t === 's' || cell.t === 'str' || cell.t === 'inlineStr') return trim(cell.v);
    if (cell.t === 'z' || cell.v == null) return '';
    if (cell.t === 'n' && width && Number.isSafeInteger(cell.v) && cell.v >= 0 && String(cell.v).length === width) {
      return String(cell.v);
    }
    if (cell.t === 'n' && width && cell.z === '0'.repeat(width) &&
        Number.isSafeInteger(cell.v) && cell.v >= 0 && String(cell.v).length <= width) {
      return String(cell.v).padStart(width, '0');
    }
    throw new Error(width ? '编码无法准确读取：请检查长度、前导零或数值精度；也可将原始编码按文本重新填写' : '企业名称必须为文字内容');
  }

  async function parse(input, filename) {
    let total = 0;
    try {
      const extension = String(filename || '').split('.').pop().toLowerCase();
      let records;
      if (extension === 'csv') {
        records = csv(typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(bytes(input)));
      } else if (extension === 'xlsx') records = xlsx(input);
      else throw new Error('仅支持 .csv 或 .xlsx 文件');
      records = records.filter(record => !blank(record.cells));
      if (!records.length) throw new Error('文件为空，请提供表头和数据');
      const header = records.shift();
      total = records.length;
      const errors = [];
      const headings = Array.from(header.cells, cell => {
        try { return readCell(cell); } catch (err) {
          errors.push(error(header.row, 'header', cell && cell.v, err.message)); return '';
        }
      });
      if (headings.length !== 3 || new Set(headings).size !== 3 || HEADERS.some(h => !headings.includes(h))) {
        errors.push(error(header.row, 'header', headings.join(','), '表头必须且只能包含：' + HEADERS.join('、')));
      }
      if (!total) errors.push(error(0, 'file', '', '至少需要一条企业数据'));
      if (total > MAX_ROWS) errors.push(error(0, 'file', total, '最多允许导入 10000 条数据'));
      if (errors.length) return { rows: [], errors, total };
      const columns = HEADERS.map(h => headings.indexOf(h));
      const names = new Map(), codes = new Map(), rows = [];
      for (const record of records) {
        const result = {};
        if (record.cells.length > 3 || (extension === 'csv' && record.cells.length !== 3)) {
          errors.push(error(record.row, 'row', '', '数据列数必须与三个表头一致'));
        }
        FIELDS.forEach((field, index) => {
          const cell = record.cells[columns[index]];
          let value;
          try { value = readCell(cell, index === 1 ? 9 : index === 2 ? 14 : undefined); }
          catch (err) { errors.push(error(record.row, field, cell && cell.v, err.message)); result[field] = ''; return; }
          const asciiCode = /^[a-zA-Z0-9]+$/.test(value);
          if (index) value = value.toUpperCase();
          result[field] = value;
          if (!value) errors.push(error(record.row, field, value, HEADERS[index] + '不能为空'));
          else if (index && (!asciiCode || !(index === 1 ? /^[A-Z0-9]{9}$/ : /^[A-Z0-9]{14}$/).test(value))) {
            errors.push(error(record.row, field, value, HEADERS[index] + '必须为' + (index === 1 ? 9 : 14) + '位英文字母或数字'));
          }
        });
        for (const [field, seen] of [['name', names], ['code', codes]]) {
          const value = result[field];
          if (!value) continue;
          if (seen.has(value)) errors.push(error(record.row, field, value, '与第 ' + seen.get(value) + ' 行重复'));
          else seen.set(value, record.row);
        }
        rows.push(result);
      }
      return { rows: errors.length ? [] : rows, errors, total };
    } catch (err) {
      return { rows: [], errors: [error(err.row || 0, 'file', '', err.message || '文件解析失败')], total };
    }
  }

  // Browser downloads; Node returns the same XLSX bytes without filesystem writes.
  function downloadTemplate() {
    const lib = getXLSX();
    if (!lib) throw new Error('未加载本地 SheetJS 组件');
    const sheet = lib.utils.aoa_to_sheet([HEADERS, ['示例企业有限公司', '00123456A', '001234567890AB']]);
    for (const address of ['A1', 'B1', 'C1', 'A2', 'B2', 'C2']) sheet[address].z = '@';
    sheet['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 24 }];
    const book = lib.utils.book_new();
    lib.utils.book_append_sheet(book, sheet, '企业导入模板');
    const data = lib.write(book, { bookType: 'xlsx', type: 'array' });
    if (typeof document !== 'undefined') {
      const url = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = '企业导入模板.xlsx';
      try { document.body.appendChild(anchor); anchor.click(); }
      finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    }
    return data;
  }

  return Object.freeze({ parse, downloadTemplate });
});
