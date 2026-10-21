/*!
 * meetingdey-native.js — thin bridge between the MeetingDey web app and the
 * Android/iOS shell (Capacitor). Serve it from the backend and include it on
 * every page:   <script src="/js/meetingdey-native.js" defer></script>
 *
 * In a normal browser it does nothing (MeetingDeyNative.isApp === false), so
 * it is safe to ship to everyone. Inside the app it exposes:
 *
 *   MeetingDeyNative.isApp            true inside the Android/iOS app
 *   MeetingDeyNative.platform         'android' | 'ios' | 'web'
 *   MeetingDeyNative.edition          'meetingdey' | 'mtn' (from the User-Agent)
 *   MeetingDeyNative.registerPush({ endpoint, csrfToken })   → Promise<token|null>
 *   MeetingDeyNative.takePhoto({ source: 'camera'|'photos'|'prompt' }) → Promise<File|null>
 *   MeetingDeyNative.appLock.enable({ timeoutMinutes }) / .disable() / .isEnabled()
 *   MeetingDeyNative.appLock.verify(reason)                    → Promise<boolean>
 *
 * Events dispatched on window:
 *   'meetingdey:deeplink'  detail: { url, path, query }   e.g. after MoMo approval
 *   'meetingdey:network'   detail: { connected, type }
 *   'meetingdey:push'      detail: { notification, tapped }
 */
(function () {
  'use strict';
  var Cap = window.Capacitor;
  var isApp = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var ua = navigator.userAgent || '';
  var m = ua.match(/MeetingDeyApp\/\d+ \(edition=([a-z0-9_-]+)\)/i);

  var api = {
    isApp: isApp,
    platform: isApp ? Cap.getPlatform() : 'web',
    edition: m ? m[1] : null,
    registerPush: function () { return Promise.resolve(null); },
    takePhoto: function () { return Promise.resolve(null); },
    appLock: {
      enable: function () { return Promise.resolve(false); },
      disable: function () { return Promise.resolve(); },
      isEnabled: function () { return Promise.resolve(false); },
      verify: function () { return Promise.resolve(true); },
    },
  };
  window.MeetingDeyNative = api;
  if (!isApp) return;

  var P = Cap.Plugins;
  function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail: detail })); }
  function safe(p) { return p && p.catch ? p.catch(function (e) { console.warn('[native]', e); }) : p; }

  document.documentElement.classList.add('is-native-app', 'platform-' + api.platform);
  if (api.edition) document.documentElement.classList.add('edition-' + api.edition);

  // Splash: hide once the page has rendered.
  if (P.SplashScreen) {
    var hide = function () { safe(P.SplashScreen.hide()); };
    if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  }

  // Android back button: go back in history, or leave the app from the first page.
  if (P.App) {
    P.App.addListener('backButton', function (ev) {
      if (document.querySelector('.modal.show, [role="dialog"][open]')) {
        // Let the page close its own dialog (most modals already listen for Escape).
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } else if (ev.canGoBack) {
        window.history.back();
      } else {
        P.App.exitApp();
      }
    });

    // meetingdey://pay/return?ref=...  (or meetingdeymtn://...)
    P.App.addListener('appUrlOpen', function (ev) {
      try {
        var u = new URL(ev.url);
        var routePath = '/' + [u.host, u.pathname.replace(/^\//, '')].filter(Boolean).join('/');
        var detail = { url: ev.url, path: routePath, query: Object.fromEntries(u.searchParams) };
        emit('meetingdey:deeplink', detail);
      } catch (e) { console.warn('[native] bad deep link', ev.url); }
    });
  }

  // Network status banner hook.
  if (P.Network) {
    P.Network.addListener('networkStatusChange', function (s) {
      document.documentElement.classList.toggle('is-offline', !s.connected);
      emit('meetingdey:network', { connected: s.connected, type: s.connectionType });
    });
  }

  // Push notifications --------------------------------------------------
  // Needs Firebase (Android: google-services.json) / APNs (iOS) set up in the
  // shell. Without them, registration fails and this resolves to null.
  api.registerPush = function (opts) {
    opts = opts || {};
    if (!P.PushNotifications) return Promise.resolve(null);
    var PN = P.PushNotifications;
    return PN.checkPermissions().then(function (perm) {
      return perm.receive === 'prompt' ? PN.requestPermissions() : perm;
    }).then(function (perm) {
      if (perm.receive !== 'granted') return null;
      return new Promise(function (resolve) {
        var done = false;
        PN.addListener('registration', function (t) {
          if (done) return; done = true;
          if (opts.endpoint) {
            fetch(opts.endpoint, {
              method: 'POST', credentials: 'include',
              headers: Object.assign({ 'Content-Type': 'application/json' },
                opts.csrfToken ? { 'X-CSRF-Token': opts.csrfToken } : {}),
              body: JSON.stringify({ token: t.value, platform: api.platform, edition: api.edition }),
            }).catch(function (e) { console.warn('[native] push token upload failed', e); });
          }
          resolve(t.value);
        });
        PN.addListener('registrationError', function (e) {
          if (done) return; done = true; console.warn('[native] push unavailable', e); resolve(null);
        });
        PN.addListener('pushNotificationReceived', function (n) { emit('meetingdey:push', { notification: n, tapped: false }); });
        PN.addListener('pushNotificationActionPerformed', function (a) {
          emit('meetingdey:push', { notification: a.notification, tapped: true });
          var link = a.notification && a.notification.data && a.notification.data.link;
          if (link && link.charAt(0) === '/') window.location.assign(link);
        });
        safe(PN.register());
      });
    }).catch(function (e) { console.warn('[native] push', e); return null; });
  };

  // Camera (KYC documents, receipts) -------------------------------------
  // Plain <input type="file" accept="image/*"> already works in the app; use
  // this when you want a direct "Take photo" button.
  api.takePhoto = function (opts) {
    opts = opts || {};
    if (!P.Camera) return Promise.resolve(null);
    var source = { camera: 'CAMERA', photos: 'PHOTOS', prompt: 'PROMPT' }[opts.source || 'prompt'];
    return P.Camera.getPhoto({
      quality: opts.quality || 80, width: opts.width || 2000, correctOrientation: true,
      resultType: 'dataUrl', source: source, saveToGallery: false,
    }).then(function (photo) {
      return fetch(photo.dataUrl).then(function (r) { return r.blob(); }).then(function (b) {
        return new File([b], (opts.name || 'photo') + '.' + (photo.format || 'jpeg'), { type: b.type });
      });
    }).catch(function (e) {
      if (!/cancel/i.test(String(e && e.message))) console.warn('[native] camera', e);
      return null;
    });
  };

  // Biometric app lock --------------------------------------------------
  var BIO = P.NativeBiometric, PREF = P.Preferences;
  var LOCK_KEY = 'md_app_lock', lockState = { enabled: false, timeoutMinutes: 5 }, pausedAt = 0, overlay = null;

  function loadLock() {
    if (!PREF) return Promise.resolve();
    return PREF.get({ key: LOCK_KEY }).then(function (r) {
      if (r && r.value) { try { lockState = JSON.parse(r.value); } catch (e) {} }
    });
  }
  function saveLock() { return PREF ? PREF.set({ key: LOCK_KEY, value: JSON.stringify(lockState) }) : Promise.resolve(); }

  api.appLock.verify = function (reason) {
    if (!BIO) return Promise.resolve(true);
    return BIO.isAvailable({ useFallback: true }).then(function (r) {
      if (!r.isAvailable) return true; // no biometrics/passcode on device: don't lock people out
      return BIO.verifyIdentity({
        reason: reason || 'Unlock MeetingDey',
        title: 'MeetingDey', subtitle: reason || 'Unlock',
        negativeButtonText: 'Cancel',
        useFallback: true, // iOS: allow device passcode
      }).then(function () { return true; }, function () { return false; });
    }).catch(function () { return true; });
  };
  api.appLock.isEnabled = function () { return loadLock().then(function () { return !!lockState.enabled; }); };
  api.appLock.enable = function (o) {
    return api.appLock.verify('Turn on app lock').then(function (ok) {
      if (!ok) return false;
      lockState = { enabled: true, timeoutMinutes: (o && o.timeoutMinutes) || 5 };
      return saveLock().then(function () { return true; });
    });
  };
  api.appLock.disable = function () { lockState.enabled = false; return saveLock(); };

  function showLock() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'App locked');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;gap:16px;background:var(--md-lock-bg,#0B2545);color:#fff;font:600 17px system-ui';
    overlay.innerHTML = '<div>MeetingDey</div><button type="button" style="padding:12px 28px;border:0;border-radius:10px;' +
      'font:600 16px system-ui;background:var(--md-lock-accent,#C9A227);color:#0B2545">Unlock · Déverrouiller</button>';
    overlay.querySelector('button').addEventListener('click', tryUnlock);
    document.body.appendChild(overlay);
    tryUnlock();
  }
  function tryUnlock() {
    api.appLock.verify('Unlock MeetingDey').then(function (ok) {
      if (ok && overlay) { overlay.remove(); overlay = null; }
    });
  }
  if (P.App) {
    loadLock().then(function () { if (lockState.enabled) showLock(); }); // cold start
    P.App.addListener('appStateChange', function (s) {
      if (!s.isActive) { pausedAt = Date.now(); return; }
      if (lockState.enabled && pausedAt && Date.now() - pausedAt > lockState.timeoutMinutes * 60000) showLock();
    });
  }
})();
