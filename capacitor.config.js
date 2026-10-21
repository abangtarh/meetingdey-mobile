// Edition-aware Capacitor config.
// Pick the edition with the EDITION env var (default: meetingdey):
//   EDITION=mtn npx cap sync
// Native identifiers (bundle id, display name, icons) are applied separately by
// scripts/apply-edition.mjs, which `npm run edition:<name>` runs before syncing.
const fs = require('fs');
const path = require('path');

const edition = process.env.EDITION || 'meetingdey';
const file = path.join(__dirname, 'editions', `${edition}.json`);
if (!fs.existsSync(file)) {
  throw new Error(`Unknown edition "${edition}" — no ${file}`);
}
const ed = JSON.parse(fs.readFileSync(file, 'utf8'));

/** @type {import('@capacitor/cli').CapacitorConfig} */
module.exports = {
  appId: ed.appId,
  appName: ed.appName,
  webDir: 'www',
  // Lets the backend recognise the native app and its edition:
  //   User-Agent: ... MeetingDeyApp/1 (edition=mtn)
  appendUserAgent: `MeetingDeyApp/1 (edition=${ed.edition})`,
  backgroundColor: ed.colors.splashBackground,
  server: {
    url: ed.serverUrl,
    cleartext: false,
    allowNavigation: ed.allowNavigation,
    // Shown when the server can't be reached (no data, server down).
    errorPath: 'offline.html',
  },
  android: {
    allowMixedContent: false,
    // webContentsDebuggingEnabled left unset: Capacitor enables chrome://inspect
    // for debug builds only, never for release builds.
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: ed.colors.splashBackground,
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: ed.colors.statusBar,
      style: ed.statusBarStyle,
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
