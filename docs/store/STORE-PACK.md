# MeetingDey: store submission pack

Copy-paste material for Google Play Console and App Store Connect. No passwords in this file: put the reviewer sign-in only in the store consoles' private review fields.

## 1. URLs to enter in both stores

| Field | Value |
|---|---|
| Privacy policy URL | https://app.meetingdey.com/privacy |
| Account deletion URL (Google Play, required) | https://app.meetingdey.com/close-account |
| Support URL (Apple) | a page that shows your support e-mail or phone (use https://meetingdey.com if it has one; I could not confirm that app.meetingdey.com/support is public) |
| Marketing URL (optional) | https://meetingdey.com |
| Support e-mail | set in the console, Policies tab (Contact e-mail) and use the same address here |

The policy and closure pages exist in English and French (`?lang=fr`). Deploy rev-206-m8 first: it adds the mobile-app section and the "deleted / kept" list the stores look for. If your Policies tab already has edited text, press "Reset to default" for both languages (or paste the new section 9 by hand), otherwise the old text stays.

In the app: **Privacy and my account → Request to close my account** (Apple guideline 5.1.1(v) needs deletion to be startable inside the app: it is).

## 2. Identity

| | Google Play | Apple |
|---|---|---|
| App id | com.meetingdey.app | com.meetingdey.app |
| Name (max 30) | MeetingDey: Njangi & Savings | MeetingDey |
| Subtitle (Apple, max 30) | n/a | Njangi, tontine and loans |
| Category | Finance | Finance |
| Age rating | 3+ / Everyone (no user-generated public content) | 4+ |
| Price | Free | Free |
| Countries | Cameroon first; add others as needed | same |

## 3. Listing text: English

**Google short description (max 80):**
Run your njangi, tontine or savings group: contributions, loans, meetings.

**Apple promotional text (max 170):**
Contributions, savings, loans, payouts and meetings for your njangi or cooperative, with mobile money payments and a clear record every member can trust.

**Full description (both stores):**

MeetingDey is the app for njangis, tontines, savings groups and cooperatives. Your group keeps one clear record of who paid, who owes and who is next, and every member can see their own position at any time.

For members
- See your contributions, savings, shares and loan balances.
- Pay or deposit with mobile money (MTN MoMo, Orange Money) or other methods your group enables.
- Apply for a loan and follow its approval and repayments.
- Join meetings, vote in polls and read minutes.
- Get reminders and receipts.

For officers
- Approve payments, loans and withdrawals, with a second officer for sensitive actions.
- Manage members, roles, rounds, payouts, fines and dividends.
- Reports and an audit trail of who changed what.

Safe by design
- Optional fingerprint or face unlock for the app.
- Every sensitive action is logged; corrections are added as new entries, never overwritten.
- You can ask to close your account from the app at any time.

MeetingDey works with the group you belong to: ask your group's administrator for your group code and sign-in. English and French.

**Keywords (Apple, max 100):**
njangi,tontine,savings,cooperative,loans,mobile money,MoMo,contributions,group,meetings,Cameroon

## 4. Listing text: Français

**Description courte Google (max 80):**
Gérez votre njangi ou tontine : cotisations, prêts, réunions et paiements.

**Texte promotionnel Apple (max 170):**
Cotisations, épargne, prêts, tours de rôle et réunions de votre njangi ou coopérative, avec paiement par mobile money et un suivi clair auquel tous les membres peuvent se fier.

**Description complète :**

MeetingDey est l'application des njangis, tontines, groupes d'épargne et coopératives. Votre groupe tient un seul registre clair de qui a payé, qui doit et qui est le prochain, et chaque membre peut voir sa propre situation à tout moment.

Pour les membres
- Consultez vos cotisations, votre épargne, vos parts et vos soldes de prêt.
- Payez ou déposez par mobile money (MTN MoMo, Orange Money) ou par les autres moyens activés par votre groupe.
- Demandez un prêt et suivez son approbation et ses remboursements.
- Participez aux réunions, votez aux sondages et lisez les procès-verbaux.
- Recevez des rappels et des reçus.

Pour les responsables
- Approuvez paiements, prêts et retraits, avec un second responsable pour les actions sensibles.
- Gérez membres, rôles, tours, versements, amendes et dividendes.
- Rapports et journal d'audit de qui a modifié quoi.

Sûr par conception
- Déverrouillage facultatif par empreinte ou visage.
- Chaque action sensible est journalisée ; les corrections s'ajoutent sous forme de nouvelles écritures, sans jamais écraser.
- Vous pouvez demander la clôture de votre compte depuis l'application à tout moment.

MeetingDey fonctionne avec le groupe auquel vous appartenez : demandez à l'administrateur de votre groupe votre code de groupe et vos identifiants. Disponible en français et en anglais.

**Mots-clés (max 100) :**
njangi,tontine,épargne,coopérative,prêt,mobile money,MoMo,cotisation,groupe,réunion,Cameroun

## 5. Google Play: Data safety form

Data collected is encrypted in transit (HTTPS). Users can request deletion: **Yes**, via https://app.meetingdey.com/close-account.

| Data type | Collected | Shared | Purpose | Optional |
|---|---|---|---|---|
| Name | Yes | No | App functionality, account management | No |
| User IDs | Yes | No | App functionality, account management | No |
| Phone number | Yes | With payment provider only when a payment is made | App functionality | Yes |
| E-mail address | Yes | No | App functionality, communications | Yes |
| Financial info: payments history, loans, savings | Yes | No | App functionality | No |
| Photos (ID document, receipts) | Yes, only when the user uploads | No | App functionality (KYC) | Yes |
| Device or other IDs (push token) | Yes, only if notifications are on and push is enabled | No | App functionality (notifications) | Yes |
| App activity and diagnostics (sign-in times, logs) | Yes | No | Security, fraud prevention | No |

Answer **No** to: location, contacts, calendar, audio/video recordings (unless live meetings with camera are enabled for the group, then tick Audio/Video, not stored), advertising, analytics for ads, sale of data.

Payment providers (MTN, Orange) are the user's own chosen channel and act on the user's instruction; Google treats that as not "shared". If you prefer to be conservative, mark phone number as shared with "payment processing".

Other Play declarations
- Ads: **No**. Target audience: **18+** (adults).
- Financial features declaration: **Personal loans = No** (the app records a group's own loans; it does not lend), **Banking / mobile money = records only**. If the form pushes you to declare a loan app, describe it as "group record keeping, no lending by the developer".
- Government app: No. News app: No. Health: No.

## 6. Apple: App Privacy ("nutrition label")

Tracking: **No** (no data used to track across other apps and sites).

Data linked to the user, not used for tracking:
- Contact info: name, e-mail, phone number
- Financial info: payment info (history of payments, loans, savings)
- User content: photos (ID documents, receipts)
- Identifiers: user ID, device ID (push token)
- Usage data / diagnostics: security logs only

Purpose for all: App functionality (and security). Nothing for advertising or analytics.

Encryption: the app uses only standard HTTPS: answer "uses encryption" and "exempt (standard encryption)" in export compliance. Add `ITSAppUsesNonExemptEncryption = NO` to Info.plist if you want to skip the question each upload.

## 7. Reviewer notes (paste into both consoles' private review fields)

> MeetingDey is a record-keeping and payments app for savings groups (njangi/tontine). Accounts belong to a group: there is no public sign-up inside the app. Please sign in with the demo account below (group code DEMO-2026).
> Account: [enter the demo member user ID]  Password: [enter the demo password]
> Native features: camera and gallery for KYC documents and receipts, fingerprint/face app lock, push notifications, offline screen, deep links for the mobile-money return (meetingdey://).
> Money movement uses MTN Mobile Money and Orange Money run by the group; the app does not sell digital goods or subscriptions, so in-app purchase does not apply.
> Account deletion: Menu → Privacy and my account → Request to close my account. Public page for people who cannot sign in: https://app.meetingdey.com/close-account

Check before submitting: the demo account works against production, has sample data (contributions, a loan), and is not an administrator.

**Apple 4.2 (minimum functionality):** make sure push, camera capture, biometric lock and the offline screen are working in the build you submit.
**Apple 3.1.1 / Play payments:** the app only moves money between members and the group, not for digital content, which is outside in-app purchase rules. Keep it that way in the store screens (no "premium" upgrade wording inside the app).

## 8. Screenshots

- Google: 2 to 8 phone screenshots (min 320 px, max 3840 px, 16:9 to 9:16). Feature graphic 1024 x 500.
- Apple: 6.9" (1320 x 2868) required, 6.5" (1284 x 2778) accepted; 3 to 10 images.
- Suggested set (member view, French and English): Home, Pay now, My money, Loan application, Meetings, Account closure ("Privacy and my account"). Use the DEMO-2026 data, never real members.

## 9. What you still do yourself

Android
1. Create the upload key and add the four `ANDROID_*` secrets (README, "Release signing"). Back up the .jks and its passwords in two places.
2. Run **Actions → Android build**; download the signed `.aab` from the artifacts.
3. Play Console → Create app → complete App content (privacy policy, Data safety, Ads, Target audience, Financial features) → Internal testing first → Production.
4. Personal accounts created after Nov 2023 must run a closed test with 12 testers for 14 days before production access. Organisation accounts do not.

iPhone
1. Apple Developer: register App ID `com.meetingdey.app` (Push Notifications capability on) and create an App Store Connect app.
2. Create an App Store Connect API key (Users and Access → Integrations) and send its three values to the repo as secrets so CI can archive and upload to TestFlight (I will add that job once the secrets exist).
3. TestFlight internal test, then submit for review with section 7 notes.

Both
- Push: Firebase project (`google-services.json`), APNs key uploaded to Firebase, and the backend endpoint that stores device tokens. Until then, switch push off in the review notes and do not tick "device ID" in the forms.
- When the push endpoint is added, make closure also delete the stored device tokens (the privacy policy then needs no change).
