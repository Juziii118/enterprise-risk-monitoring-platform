const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const XLSX = require('../vendor/sheetjs-0.20.3/xlsx.full.min.js');
const api = require('../import-validation.js');
const headers = ['企业名称', '组织机构代码', '机构编码'];
const sample = ['甲企业', '00123456a', '001234567890ab'];
const csv = (...rows) => [headers, ...rows].map(row => row.join(',')).join('\r\n');
function workbook(rows, edit) {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, '导入');
  if (edit) edit(sheet, book);
  return XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
}
function rejected(result, field) {
  assert.deepEqual(result.rows, []);
  assert.ok(result.errors.length);
  if (field) assert.ok(result.errors.some(e => e.field === field), JSON.stringify(result));
  result.errors.forEach(e => assert.deepEqual(Object.keys(e), ['row', 'field', 'value', 'message']));
}

test('pinned library and CSV normalization; buffer views respect offsets', async () => {
  assert.equal(XLSX.version, '0.20.3');
  const input = Buffer.from('\uFEFF' + csv([' 甲企业 ', ' 00123456a ', ' 001234567890ab ']));
  const padded = Buffer.concat([Buffer.from('junk'), input, Buffer.from('junk')]);
  const result = await api.parse(padded.subarray(4, -4), 'DATA.CSV');
  assert.deepEqual(result, { rows: [{ name: '甲企业', code: '00123456A', institutionCode: '001234567890AB' }], errors: [], total: 1 });
});

test('quoted comma, escaped quote, embedded CRLF and physical error rows', async () => {
  const good = headers.join(',') + '\r\n"甲,""乙""\r\n公司",00123456A,001234567890AB\r\n';
  const result = await api.parse(good, 'a.csv');
  assert.equal(result.rows[0].name, '甲,"乙"\r\n公司');
  const bad = await api.parse(good + '乙企业,,001234567890AB', 'a.csv');
  rejected(bad, 'code');
  assert.equal(bad.errors[0].row, 4);
  assert.equal(bad.total, 2);
});

test('malformed CSV rejects rather than repairing quotes', async () => {
  for (const row of ['"unclosed,a,b', 'bad"quote,a,b', '"closed"oops,a,b']) {
    rejected(await api.parse(headers.join(',') + '\n' + row, 'a.csv'), 'file');
  }
});

test('headers can be reordered; missing, duplicate and extra headers fail', async () => {
  const result = await api.parse('机构编码, 企业名称 ,组织机构代码\n001234567890ab,甲,00123456a', 'a.csv');
  assert.equal(result.rows[0].code, '00123456A');
  for (const header of ['企业名称,组织机构代码', '企业名称,组织机构代码,组织机构代码', headers.join(',') + ',额外']) {
    rejected(await api.parse(header + '\n' + sample.join(','), 'a.csv'), 'header');
  }
});

test('required fields, ASCII lengths, no scientific notation or Unicode expansion', async () => {
  for (const [index, values] of [[0, ['', '  ']], [1, ['', '12345678', '1234567890', '1234567-9', '1234567ß', '１２３４５６７８９', '1.2345E+8']], [2, ['', '123', '123456789012345']]]) {
    for (const value of values) {
      const row = [...sample]; row[index] = value;
      rejected(await api.parse(csv(row), 'a.csv'), ['name', 'code', 'institutionCode'][index]);
    }
  }
});

test('duplicate trimmed names OR case-normalized codes discard every row', async () => {
  for (const row of [[' 甲企业 ', '123456789', sample[2]], ['乙企业', '00123456A', sample[2]]]) {
    const result = await api.parse(csv(sample, row), 'a.csv');
    rejected(result);
    assert.equal(result.total, 2);
    assert.equal(result.errors[0].row, 3);
    assert.match(result.errors[0].message, /第 2 行/);
  }
});

test('blanks ignored, column mismatches rejected, empty input rejected', async () => {
  assert.equal((await api.parse('\n' + csv(sample) + '\n,,\n', 'a.csv')).total, 1);
  for (const row of [[...sample, 'extra'], sample.slice(0, 2)]) rejected(await api.parse(csv(row), 'a.csv'), 'row');
  for (const text of ['', '\n,,\n', headers.join(',')]) rejected(await api.parse(text, 'a.csv'));
});

test('exactly 10000 accepted, 10001 rejected atomically', async () => {
  const rows = Array.from({ length: 10000 }, (_, i) => ['企业' + i, String(i).padStart(9, '0'), sample[2]]);
  assert.equal((await api.parse(csv(...rows), 'a.csv')).rows.length, 10000);
  rows.push(['超额', '999999999', sample[2]]);
  const result = await api.parse(csv(...rows), 'a.csv');
  rejected(result, 'file'); assert.equal(result.total, 10001);
});

test('XLSX preserves text codes and rejects unsafe numeric representations', async () => {
  const good = await api.parse(workbook([sample]), 'a.xlsx');
  assert.equal(good.rows[0].code, '00123456A');
  for (const [v, z] of [[123, '0'], [123, '000000000;000000000'], [1.5, '000000000'], [-1, '000000000'], [9007199254740992, '000000000'], [1234567890, '000000000']]) {
    rejected(await api.parse(workbook([sample], s => { s.B2 = { t: 'n', v, z }; }), 'a.xlsx'), 'code');
  }
  const safe = await api.parse(workbook([sample], s => {
    s.B2 = { t: 'n', v: 123, z: '000000000' };
    s.C2 = { t: 'n', v: 42, z: '00000000000000' };
  }), 'a.xlsx');
  assert.equal(safe.rows[0].code, '000000123');
  assert.equal(safe.rows[0].institutionCode, '00000000000042');
  for(const z of ['General','@','0.00E+00']) {
    const numeric=await api.parse(workbook([sample],s=>{s.B2={t:'n',v:123456789,z};s.C2={t:'n',v:12345678901234,z};}),'a.xlsx');
    assert.equal(numeric.rows[0].code,'123456789');
    assert.equal(numeric.rows[0].institutionCode,'12345678901234');
  }
});

test('XLSX formula cells, including cached strings, and typed nontext values fail', async () => {
  for (const cell of [{ t: 's', v: '00123456A', f: '"00123456A"' }, { t: 'n', v: 123, f: '100+23', z: '000000000' }, { t: 'b', v: true }, { t: 'e', v: 7 }]) {
    rejected(await api.parse(workbook([sample], s => { s.B2 = cell; }), 'a.xlsx'), 'code');
  }
  rejected(await api.parse(workbook([sample], s => { s.A1.f = '"企业名称"'; }), 'a.xlsx'), 'header');
});

test('XLSX missing cells, far-away rows and extra populated sheets are not silently lost', async () => {
  rejected(await api.parse(workbook([sample], s => { delete s.C2; }), 'a.xlsx'), 'institutionCode');
  const far = await api.parse(workbook([sample], s => {
    s.A100000 = { t: 's', v: '末行企业' }; s['!ref'] = 'A1:C100000';
  }), 'a.xlsx');
  rejected(far); assert.equal(far.total, 2); assert.equal(far.errors[0].row, 100000);
  rejected(await api.parse(workbook([sample], (s, b) => {
    XLSX.utils.book_append_sheet(b, XLSX.utils.aoa_to_sheet([headers, sample]), '第二表');
  }), 'a.xlsx'), 'file');
});

test('bad extensions, malformed ZIP, disguised CSV and invalid UTF-8 fail with structured errors', async () => {
  for (const [input, name] of [[csv(sample), 'a.xls'], [Buffer.from(csv(sample)), 'a.xlsx'], [Buffer.from([80, 75, 3, 4]), 'a.xlsx'], [Buffer.from([0xff]), 'a.csv'], [null, 'a.csv']]) {
    rejected(await api.parse(input, name), 'file');
  }
});

test('template roundtrips as text with preserved leading zeros', async () => {
  const data = api.downloadTemplate();
  const book = XLSX.read(data, { type: 'array', cellNF: true });
  const sheet = book.Sheets[book.SheetNames[0]];
  for (const address of ['A1', 'B1', 'C1', 'A2', 'B2', 'C2']) {
    assert.equal(sheet[address].t, 's'); assert.equal(sheet[address].z, '@');
  }
  assert.equal((await api.parse(data, 'template.xlsx')).rows.length, 1);
});

test('browser global loads and download creates, clicks, removes and revokes a local URL', async () => {
  const calls = [];
  const anchor = { click() { calls.push('click'); }, remove() { calls.push('remove'); } };
  const context = vm.createContext({ XLSX, ArrayBuffer, Uint8Array, TextDecoder, Blob,
    document: { createElement: () => anchor, body: { appendChild() { calls.push('append'); } } },
    URL: { createObjectURL: () => 'blob:template', revokeObjectURL: url => calls.push(url) },
    setTimeout: fn => fn()
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../import-validation.js'), 'utf8'), context);
  assert.equal(typeof context.V1Import.parse, 'function');
  assert.equal((await context.V1Import.parse(csv(sample), 'a.csv')).rows.length, 1);
  context.V1Import.downloadTemplate();
  assert.equal(anchor.download, '企业导入模板.xlsx');
  assert.deepEqual(calls, ['append', 'click', 'remove', 'blob:template']);
});
