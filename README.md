<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8bbbfb79-d48c-40f1-9cbe-61f01aa56ff0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## Build and Package

### Windows (Electron)
1. Install dependencies: `npm ci`
2. Build and package: `npm run package:windows`
3. Resulting installer will be in `dist/` or as artifact from CI.

### Android (Capacitor)
1. Build web assets: `npm run build:web`
2. Prepare Capacitor: `npm run prepare:capacitor`
3. Open Android project: `npm run open:android`
4. In Android Studio build a signed bundle or run `./gradlew bundleRelease`
