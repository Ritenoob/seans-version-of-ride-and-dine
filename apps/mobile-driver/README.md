# Ride & Dine Driver (Capacitor)

This app wraps the driver web experience.

## Local dev (live web)
- Ensure the driver app is running on `http://localhost:3004`.
- Run `CAP_SERVER_URL=http://localhost:3004 pnpm cap:sync`.
- Run `CAP_SERVER_URL=http://localhost:3004 pnpm cap:run:android`.
- Run `CAP_SERVER_URL=http://localhost:3004 pnpm cap:run:ios` (macOS required).

## Production build (hosted web)
- Set `CAP_SERVER_URL` to your hosted driver web URL.
- Run `CAP_SERVER_URL=https://driver.your-domain.com pnpm cap:sync:prod`.
- Then run `pnpm cap:run:android` or `pnpm cap:run:ios`.
