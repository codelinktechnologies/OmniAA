<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/49e9545b-d5f8-4e9f-a7b2-f123d6129cf4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local environment file:
   - Copy `.env.example` to `.env`.
   - Set `GEMINI_API_KEY` in `.env` to your Gemini API key.
   - Optional: set `GITHUB_PAT` in `.env` if you need GitHub API access from local scripts.
3. Run the app:
   `npm run dev`
