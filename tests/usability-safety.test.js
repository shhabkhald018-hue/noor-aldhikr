'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('privacy page describes the current retrieval-only assistant', () => {
  const privacy = read('privacy.html');
  assert.match(privacy, /نمط استرجاع موثوق فقط/);
  assert.match(privacy, /لا يولّد إجابات دينية حرة/);
  assert.match(privacy, /لا يُرسل السؤال إلى OpenAI أو Gemini أو Claude/);
  assert.doesNotMatch(privacy, /تشغيل نموذج WebGPU محلي اختياري/);
});

test('academy content exposes review and reference quality labels', () => {
  const academy = read('assets/js/v40-24-islamic-academy.js');
  assert.match(academy, /ملخص تعليمي قيد المراجعة/);
  assert.match(academy, /لا تُعد فتوى/);
  assert.match(academy, /مرجع عام/);
  assert.match(academy, /sourceState:cfg\.contentSource==='published'\?'published':'local-draft'/);
  assert.match(academy, /contentSource='published'/);
});

test('academy pages render on navigation instead of inflating the initial DOM', () => {
  const academy = read('assets/js/v40-24-islamic-academy.js');
  assert.match(academy, /const rendered=new Set\(\)/);
  assert.match(academy, /noor:navigation/);
  assert.match(academy, /ensureRendered\(event\.detail\?\.target/);
  assert.doesNotMatch(academy, /Object\.entries\(A\)\.forEach\(\(\[id,cfg\]\)=>render\(id,cfg\)\)/);
});

test('home heading hierarchy and small touch targets are corrected', () => {
  const index = read('index.html');
  const exams = read('exams.html');
  const portal = read('portal.html');
  assert.match(index, /<h1>رفيقك اليومي للذكر والقرآن<\/h1>/);
  assert.match(index, /<h2 id="v38HomeTitle">/);
  assert.doesNotMatch(index, /<h1 id="v38HomeTitle">/);
  assert.match(exams, /\.exam60-top a\{[^}]*min-height:44px/);
  assert.match(portal, /\.login details summary\{min-height:44px/);
  assert.match(portal, /\.login details a\{min-height:44px/);
});

test('V92.1.1 database update is idempotent and non-destructive', () => {
  const sql = read('SUPABASE_V92_1_1_RELEASE_MARKER.sql');
  assert.match(sql, /on conflict \(key\) do update/i);
  assert.match(sql, /create index if not exists knowledge_base_reviewed_by_idx/i);
  assert.match(sql, /revoke all on function public\.owner_portal_diagnostics\(\) from public, anon/i);
  assert.doesNotMatch(sql, /\b(?:drop|truncate|delete\s+from)\b/i);
});
