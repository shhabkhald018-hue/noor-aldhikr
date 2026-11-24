'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CRITICAL_HTML = [
  'index.html',
  'portal.html',
  'mushaf.html',
  'exams.html',
  'reset-password.html',
  'privacy.html',
  'terms.html',
  '404.html',
  'offline.html',
  'clear-cache.html',
  'supabase-check.html'
];

const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(directory, entry.name);
  if (entry.name === '.git') return [];
  return entry.isDirectory() ? walk(full) : [full];
});

function localTarget(value) {
  const clean = String(value || '').trim();
  if (!clean || clean.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|blob:|javascript:|about:)/i.test(clean)) return null;
  return clean.split(/[?#]/, 1)[0];
}

test('critical pages contain no duplicate ids', () => {
  for (const file of CRITICAL_HTML) {
    const ids = [...read(file).matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    assert.deepEqual(duplicates, [], `${file}: duplicate ids ${duplicates.join(', ')}`);
  }
});

test('critical page references are relative and resolve to existing files', () => {
  for (const file of CRITICAL_HTML) {
    const html = read(file);
    for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const target = localTarget(match[1]);
      if (!target) continue;
      assert.equal(target.startsWith('/'), false, `${file}: root-absolute path breaks GitHub Pages: ${target}`);
      const resolved = path.resolve(ROOT, path.dirname(file), target);
      assert.equal(resolved.startsWith(ROOT), true, `${file}: path escapes release root: ${target}`);
      assert.equal(fs.existsSync(resolved), true, `${file}: missing referenced file ${target}`);
    }
  }
});

test('stylesheet url references resolve when local', () => {
  const cssFiles = walk(path.join(ROOT, 'assets', 'css')).filter(file => file.endsWith('.css'));
  const missing = [];
  for (const file of cssFiles) {
    const css = fs.readFileSync(file, 'utf8');
    for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      const target = localTarget(match[1]);
      if (!target || target.startsWith('/')) continue;
      const resolved = path.resolve(path.dirname(file), target);
      if (!fs.existsSync(resolved)) missing.push(`${path.relative(ROOT, file)} -> ${target}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('all JavaScript files parse successfully', () => {
  const scripts = walk(ROOT).filter(file => file.endsWith('.js'));
  const failures = [];
  for (const file of scripts) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) failures.push(`${path.relative(ROOT, file)}\n${result.stderr || result.stdout}`);
  }
  assert.deepEqual(failures, []);
});

test('inline scripts on critical pages parse successfully', () => {
  const failures = [];
  for (const file of CRITICAL_HTML) {
    const html = read(file);
    let index = 0;
    for (const match of html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      index += 1;
      const code = match[1].trim();
      if (!code) continue;
      try { new vm.Script(code, { filename: `${file}#inline-${index}` }); }
      catch (error) { failures.push(String(error)); }
    }
  }
  assert.deepEqual(failures, []);
});

test('manifest and central release metadata match V92.1', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.match(manifest.name, /نور الذكر/);
  const version = read('assets/js/version.js');
  assert.match(version, /semver:\s*'92\.1\.0'/);
  assert.match(version, /noor-aldhikr-v92-1-trusted-content/);
  assert.match(read('sw.js'), /assets\/js\/version\.js/);
});

test('release does not contain server-side or paid-provider secrets', () => {
  const textFiles = walk(ROOT).filter(file => /\.(?:html?|js|json|webmanifest|txt|md|sql|css)$/i.test(file));
  const forbidden = [
    /\bsb_secret_[A-Za-z0-9_-]+/,
    /\bservice_role\b\s*[:=]\s*["'][^"']+/i,
    /\bsk-[A-Za-z0-9_-]{20,}/,
    /\bAIza[0-9A-Za-z_-]{30,}/,
    /\bsk-ant-[A-Za-z0-9_-]{20,}/
  ];
  const hits = [];
  for (const file of textFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) if (pattern.test(content)) hits.push(`${path.relative(ROOT, file)}: ${pattern}`);
  }
  assert.deepEqual(hits, []);
});
