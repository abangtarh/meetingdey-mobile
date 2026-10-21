#!/usr/bin/env node
// Sanity checks run in CI before building: every edition is complete, ids and
// schemes are unique, and the native projects match the edition being built.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] || process.env.EDITION || 'meetingdey';
const errors = [];
const required = ['edition', 'appId', 'appName', 'urlScheme', 'serverUrl', 'allowNavigation', 'colors', 'statusBarStyle'];

const editions = fs.readdirSync(path.join(root, 'editions')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(root, 'editions', f), 'utf8')));

for (const ed of editions) {
  for (const k of required) if (ed[k] == null) errors.push(`${ed.edition}: missing ${k}`);
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(ed.appId)) errors.push(`${ed.edition}: bad appId ${ed.appId}`);
  if (!/^https:\/\//.test(ed.serverUrl)) errors.push(`${ed.edition}: serverUrl must be https`);
  if (!/^[a-z][a-z0-9+.-]*$/.test(ed.urlScheme)) errors.push(`${ed.edition}: bad urlScheme`);
  if (!fs.existsSync(path.join(root, 'assets', ed.edition, 'logo.png'))) errors.push(`${ed.edition}: assets/${ed.edition}/logo.png missing`);
}
for (const k of ['appId', 'urlScheme']) {
  const seen = new Set();
  for (const ed of editions) { if (seen.has(ed[k])) errors.push(`duplicate ${k} ${ed[k]}`); seen.add(ed[k]); }
}

const ed = editions.find(e => e.edition === target);
if (!ed) errors.push(`unknown edition ${target}`);
else {
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  const expect = (cond, msg) => { if (!cond) errors.push(`${target}: ${msg} (run npm run edition:${target})`); };
  expect(read('android/app/build.gradle').includes(`applicationId "${ed.appId}"`), 'android applicationId mismatch');
  expect(read('ios/App/App.xcodeproj/project.pbxproj').includes(`PRODUCT_BUNDLE_IDENTIFIER = ${ed.appId};`), 'iOS bundle id mismatch');
  const cfgPath = 'android/app/src/main/assets/capacitor.config.json';
  if (fs.existsSync(path.join(root, cfgPath))) {
    const cfg = JSON.parse(read(cfgPath));
    expect(cfg.appId === ed.appId && cfg.server?.url === ed.serverUrl, 'synced capacitor.config.json mismatch');
  }
}

if (errors.length) { console.error('✗ ' + errors.join('\n✗ ')); process.exit(1); }
console.log(`✓ ${editions.length} editions valid; native projects match "${target}"`);
