#!/usr/bin/env node
// Applies an edition (editions/<name>.json) to the native projects:
// bundle/application id, display name, URL scheme, icons + splash, and the
// www/edition.json the offline page reads. Idempotent — safe to run repeatedly.
//
//   node scripts/apply-edition.mjs mtn
//   node scripts/apply-edition.mjs meetingdey --skip-assets
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2] || process.env.EDITION || 'meetingdey';
const skipAssets = process.argv.includes('--skip-assets');
const edFile = path.join(root, 'editions', `${name}.json`);
if (!fs.existsSync(edFile)) {
  console.error(`Unknown edition "${name}". Available: ${fs.readdirSync(path.join(root, 'editions')).map(f => f.replace('.json', '')).join(', ')}`);
  process.exit(1);
}
const ed = JSON.parse(fs.readFileSync(edFile, 'utf8'));

const rel = p => path.join(root, p);
function patch(file, edits) {
  const full = rel(file);
  if (!fs.existsSync(full)) { console.warn(`  skip ${file} (not found)`); return; }
  let s = fs.readFileSync(full, 'utf8');
  for (const [re, rep, label] of edits) {
    if (!re.test(s)) throw new Error(`${file}: pattern for ${label} not found — template changed?`);
    s = s.replace(re, rep);
  }
  fs.writeFileSync(full, s);
  console.log(`  patched ${file}`);
}
const xmlEsc = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, "\\'");

console.log(`Applying edition "${ed.edition}" → ${ed.appId} (${ed.appName})`);

// Android ----------------------------------------------------------------
// namespace stays com.setl.meetingdey (Java package); only applicationId changes.
patch('android/app/build.gradle', [
  [/applicationId "[^"]+"/, `applicationId "${ed.appId}"`, 'applicationId'],
]);
patch('android/app/src/main/res/values/strings.xml', [
  [/(<string name="app_name">)[^<]*(<\/string>)/, `$1${xmlEsc(ed.appName)}$2`, 'app_name'],
  [/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${xmlEsc(ed.appName)}$2`, 'title_activity_main'],
  [/(<string name="package_name">)[^<]*(<\/string>)/, `$1${ed.appId}$2`, 'package_name'],
  [/(<string name="custom_url_scheme">)[^<]*(<\/string>)/, `$1${ed.urlScheme}$2`, 'custom_url_scheme'],
]);

// iOS --------------------------------------------------------------------
patch('ios/App/App.xcodeproj/project.pbxproj', [
  [/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${ed.appId};`, 'bundle id'],
]);
patch('ios/App/App/Info.plist', [
  [/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${ed.appName}$2`, 'display name'],
  [/(<key>CFBundleURLName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${ed.appId}$2`, 'url name'],
  [/(<key>CFBundleURLSchemes<\/key>\s*<array>\s*<string>)[^<]*(<\/string>)/, `$1${ed.urlScheme}$2`, 'url scheme'],
]);

// Web fallback ------------------------------------------------------------
fs.writeFileSync(rel('www/edition.json'), JSON.stringify({
  edition: ed.edition, appName: ed.appName, serverUrl: ed.serverUrl, colors: ed.colors,
}, null, 2) + '\n');
console.log('  wrote www/edition.json');

// Icons + splash ----------------------------------------------------------
if (!skipAssets) {
  const assetDir = `assets/${ed.edition}`;
  if (fs.existsSync(rel(assetDir))) {
    console.log(`  generating icons/splash from ${assetDir}`);
    execFileSync('npx', [
      'capacitor-assets', 'generate', '--android', '--ios',
      '--assetPath', assetDir,
      '--iconBackgroundColor', ed.colors.splashBackground,
      '--iconBackgroundColorDark', ed.colors.splashBackground,
      '--splashBackgroundColor', ed.colors.splashBackground,
      '--splashBackgroundColorDark', ed.colors.splashBackground,
    ], { cwd: root, stdio: 'inherit', env: { ...process.env, EDITION: ed.edition } });
  } else {
    console.warn(`  no ${assetDir}/ — keeping current icons`);
  }
}

console.log(`Done. Next: EDITION=${ed.edition} npx cap sync`);
