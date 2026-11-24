'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('exam start controls remain disabled until handlers are attached', () => {
  const source = read('assets/js/v43-academy-exams.js');
  assert.match(source, /v58-start-subject[^>]+disabled aria-busy="true"/);
  assert.match(source, /id="v58FinalStart"[^>]+disabled aria-busy="true"/);
  assert.match(source, /button\.disabled=false/);
  assert.match(source, /button\.setAttribute\('aria-busy','false'\)/);
  assert.match(source, /noor:v58-exams-ready/);
});

test('exam initialization is idempotent and provides a recoverable error state', () => {
  const source = read('assets/js/v43-academy-exams.js');
  assert.match(source, /let initStarted=false,initFinished=false/);
  assert.match(source, /if\(initStarted\|\|initFinished\)return/);
  assert.match(source, /id="v58RetryLoad"/);
});

test('assistant shell is unavailable until the highest runtime on the page is ready', () => {
  const source = read('assets/js/v66-ai-assistant.js');
  assert.match(source, /function assistantReady\(\)/);
  assert.match(source, /v90-ai-runtime\.js/);
  assert.match(source, /v89-ai-runtime\.js/);
  assert.match(source, /textarea[^>]+disabled aria-busy="true"/);
  assert.match(source, /data-ready-label="إرسال" disabled aria-busy="true"/);
  assert.match(source, /if\(!assistantReady\(\)\)\{setReadyState\(false\);return\}/);
  assert.match(source, /noor:v90-ready/);
  assert.match(source, /noor:v89-ai-status/);
});

test('V89 and V90 form handlers preserve the readiness guard', () => {
  const v89 = read('assets/js/v89-ai-ui.js');
  const v90 = read('assets/js/v90-ai-ui.js');
  assert.match(v89, /function setReadyState\(\)/);
  assert.match(v89, /expectsV90=.*v90-ai-runtime\.js/);
  assert.match(v89, /ready=expectsV90\?!!window\.NOOR_V90_AI:!!window\.NOOR_V89_AI/);
  assert.match(v89, /if\(!setReadyState\(\)\)return/);
  assert.match(v90, /function setReadyState\(ready=!!window\.NOOR_V90_AI\)/);
  assert.match(v90, /if\(!setReadyState\(\)\)return/);
  assert.match(v90, /جاري البحث…/);
});

