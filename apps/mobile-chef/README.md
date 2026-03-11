# Ride & Dine Chef (Capacitor)

This app wraps the chef experience from the web app.

## Local dev (live web)
- Ensure the web app is running on `http://localhost:3002`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:sync`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:run:android`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:run:ios` (macOS required).

## Production build (hosted web)
- Set `CAP_SERVER_URL` to your hosted chef web URL.
- Run `CAP_SERVER_URL=https://chef.your-domain.com pnpm cap:sync:prod`.
- Then run `pnpm cap:run:android` or `pnpm cap:run:ios`.
