# MeetingDey Mobile

Android and iOS apps for MeetingDey, built with [Capacitor](https://capacitorjs.com) as a native shell around the live web app (`app.meetingdey.com`). One codebase produces two **editions**:

| Edition | App id | Name | URL scheme |
|---|---|---|---|
| `meetingdey` | `com.setl.meetingdey` | MeetingDey | `meetingdey://` |
| `mtn` | `com.setl.meetingdey.mtn` | MeetingDey MTN *(name to confirm)* | `meetingdeymtn://` |

Both can be installed side by side on the same phone.

## How it fits together

```
 Phone app (this repo)                       Server (MeetingDey backend repo)
 ┌──────────────────────────────┐            ┌──────────────────────────────────┐
 │ Native shell (Capacitor)     │  HTTPS     │ app.meetingdey.com               │
 │  • WebView → serverUrl  ─────┼──────────► │  • detects app via User-Agent:   │
 │  • offline.html fallback     │            │    "MeetingDeyApp/1 (edition=mtn)"│
 │  • push, camera, biometrics, │ ◄──────────┼─ • serves web-bridge script      │
 │    deep links, status bar    │  JS bridge │    (meetingdey-native.js)        │
 └──────────────────────────────┘            └──────────────────────────────────┘
```

- The app loads the live site, so **web fixes reach the apps without a store release**. A new app build is only needed for native changes (plugins, icons, permissions, ids).
- `web-bridge/meetingdey-native.js` belongs on the **server**: copy it into the backend's static JS and include it on every page. In a normal browser it does nothing; inside the app it exposes `window.MeetingDeyNative` (push registration, camera, biometric app lock, deep-link and network events). The header of the file documents the API.
- Existing `<input type="file">` uploads (KYC documents, receipts) already work in the app with camera and gallery. No changes are needed for those.

## Editions

Each edition is one file in `editions/` plus a logo in `assets/<edition>/logo.png` (1024×1024, transparent background, artwork inside the central ~60%).

```bash
npm run edition:mtn          # apply ids, name, scheme, icons, splash + cap sync
npm run edition:meetingdey   # back to the default (what's committed)
npm run check                # validate editions; confirm native projects match
```

To add a new telco or white-label edition, copy `editions/mtn.json`, then give it a unique `appId` and `urlScheme`, add `assets/<name>/logo.png`, and add the name to the `matrix.edition` list in both workflows.

**MTN edition — still placeholders:** the app name, `serverUrl` (switch to the MTN-facing host once the backend edition layer is live), the colours, and `assets/mtn/logo.png` (replace it with artwork from MTN's official brand pack).

## Builds (GitHub Actions)

Every push to `main` builds both editions:

- **Android** (`android.yml`) produces a debug APK per edition. It also produces a signed release APK and AAB (Play Store) once the release keystore secrets exist.
- **iOS** (`ios.yml`) compiles an unsigned simulator build per edition. This catches iOS breakage early without a Mac.

You can also start a build by hand from **Actions → Android build → Run workflow** and pick an edition. Download the APK from the run's **Artifacts** section.

### Installing the test APK (sideload)

1. Download the artifact zip on your computer or phone, then unzip it.
2. Copy `MeetingDey-<edition>-…-debug.apk` to the phone and open it. Allow "Install unknown apps" for the file manager or browser when asked.
3. Later debug builds install straight over earlier ones. They share the committed `android/app/debug.keystore`.

### Release signing (Android)

Create the upload key once, keep it safe and **back it up**, because losing it complicates Play updates:

```bash
keytool -genkeypair -v -keystore meetingdey-release.jks -alias meetingdey \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 meetingdey-release.jks   # macOS: base64 -i meetingdey-release.jks
```

Add these repository secrets (**Settings → Secrets and variables → Actions**):
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Never commit the `.jks` file. The `.gitignore` already blocks it.

### iOS signing and TestFlight

This step needs the Apple Developer Program account (99 USD/year). Once it exists, we add a signed archive job using App Store Connect API keys stored as secrets, and upload to TestFlight from CI. No Mac is required.

## Push notifications

The plugins are installed. Push stays inactive until these are set up:

- **Android:** create a Firebase project and add an Android app per `appId`. Put `google-services.json` in `android/app/`. For CI, store it as a secret and write it out before the build.
- **iOS:** create an APNs key in the Apple Developer account and upload it to Firebase, or send through APNs directly.
- **Backend:** add an endpoint that stores device tokens (`POST /api/devices/register` in the bridge example). Then extend the existing NotificationService to send to them.

Until then, `MeetingDeyNative.registerPush()` resolves to `null` and nothing breaks.

## Deep links (MoMo return)

`meetingdey://pay/return?ref=ABC` (or `meetingdeymtn://…`) opens the app and fires a `meetingdey:deeplink` event with `{ path: '/pay/return', query: { ref: 'ABC' } }`. The web app decides where to navigate. Verified `https://` app links (Android App Links / iOS Universal Links) can be added later. They need `assetlinks.json` and `apple-app-site-association` files served from the domain.

## Local development (optional)

You need Node 22+. For Android, add Android Studio with JDK 21; for iOS, Xcode on a Mac.

```bash
npm ci
npm run edition:meetingdey
npx cap open android        # run on a device/emulator from Android Studio
```

To point a local build at a test server, temporarily change `serverUrl` in the edition file. Use an `https://` URL.

## Store-review note

Apple rejects apps that are only a website in a frame (guideline 4.2). This app qualifies as more than that through its native features: push notifications, camera capture for KYC, biometric app lock, an offline screen and deep links. Make sure those features are switched on in the web app, through the bridge, before submitting.

## Repository layout

```
editions/            per-edition settings (ids, name, server, colours)
assets/<edition>/    source logo for icons + splash
scripts/             apply-edition.mjs, check.mjs
www/                 offline fallback page shipped inside the app
web-bridge/          meetingdey-native.js — to be served by the backend
android/, ios/       native projects (generated by Capacitor, then customised)
.github/workflows/   CI builds
```
