# Digital Asset Links (`assetlinks.json`)

`assetlinks.json` binds the Android app `io.wellmate.app` to the `wellmate.app` domain so
the `https://wellmate.app/reset-password` App Link verifies (`android:autoVerify="true"`) and
opens the in-app RESET_CONFIRM screen instead of a browser.

## OPERATOR PREREQUISITE — fill in the real fingerprint

`sha256_cert_fingerprints` currently holds the placeholder
`REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT`. Before this works you must replace it with
the **Play App Signing** certificate SHA-256 (Play Console → App integrity → App signing).
If the upload key differs, list **both** fingerprints.

Local extraction alternative:
`keytool -list -v -keystore <release-or-upload.jks> -alias <alias>` → copy the SHA-256.

## Hosting

Express already serves `public/` statically, so this file is reachable at
`/.well-known/assetlinks.json` with no route change. **`wellmate.app` must be fronted by this
`wellmate.io` deployment** (or the file hosted wherever `https://wellmate.app/.well-known/assetlinks.json`
resolves). Verify after deploy + app install: `adb shell pm get-app-links io.wellmate.app`
(the `wellmate.app` domain must show `verified`).
