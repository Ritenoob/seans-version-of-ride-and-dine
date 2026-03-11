# Ride & Dine Customer (Capacitor)

This app wraps the web customer experience.

## Local dev (live web)
- Ensure the web app is running on `http://localhost:3002`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:sync`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:run:android`.
- Run `CAP_SERVER_URL=http://localhost:3002 pnpm cap:run:ios` (macOS required).

## Production build (hosted web)
- Set `CAP_SERVER_URL` to your hosted customer web URL.
- Run `CAP_SERVER_URL=https://your-domain.com pnpm cap:sync:prod`.
- Then run `pnpm cap:run:android` or `pnpm cap:run:ios`.
