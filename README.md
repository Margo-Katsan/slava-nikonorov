# Слава Ніконоров — Next.js admin authentication integration kit

Includes server-side admin guarding, 2FA TOTP, backup codes, /login, /login/setup-2fa, /admin, and one protected API endpoint.

## Assumptions

- Your existing site uses Next.js App Router, TypeScript, Tailwind CSS, `src/` directory and `@/*` alias to `src/*`.
- Postgres database, Prisma 7 and Node 22.12+.
- This is an integration kit, **not a fully tested drop-in deployment**. The dependencies could not be installed in the file-building environment; test against your actual versions.

## 1. Install dependencies in the project root

```bash
npm install better-auth @better-auth/prisma-adapter @prisma/client@7 @prisma/adapter-pg dotenv pg react-qr-code server-only
npm install -D prisma@7 tsx @types/pg
```

## 2. Merge files

Copy the included `src` files into your project. If Prisma is already set up, do not overwrite its schema or Prisma config: merge the settings and keep any existing models. If there is no Prisma yet, copy `prisma/schema.prisma` and `prisma.config.ts` too.

**Important:** If your app doesn't use `src/`, adjust imports, Prisma Client output path, and aliases.

## 3. Configure .env

Use `.env.example` as a reference. Set DATABASE_URL, BETTER_AUTH_URL and BETTER_AUTH_SECRET in `.env` (do not commit it). Generate the auth secret with `npx auth@latest secret` or `openssl rand -base64 48`. Set BETTER_AUTH_URL to the actual HTTPS domain in production. Keep ADMIN_BOOTSTRAP unset in running app.

**Note:** Prisma's `prisma.config.ts` loads `.env`; if you use only `.env.local`, adapt that file to load `.env.local` as well, or use `.env` for local development.

## 4. Schema and migration

```bash
npx prisma generate
npx auth@latest generate --config src/lib/auth.ts
npx prisma migrate dev --name admin-auth-two-factor
npx prisma generate
```

If the CLI reports that generated Prisma Client doesn't exist, first generate the placeholder client from the starter schema. Inspect the generated schema before migrating; it must include your `role`, `mfaVerified`, TOTP and rate-limit fields. Never erase existing project models.

## 5. Bootstrap the first admin (only on a new empty database)

Run locally after migration:

```bash
ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-strong-unique-password-14-plus-chars" npx tsx scripts/bootstrap-admin.ts
```

The bootstrap script refuses to run in production Node mode or when accounts already exist. It explicitly enables sign-up **only in that CLI process**, never on your running web app. Do not save ADMIN_PASSWORD in version control, shell history or logs; use a temporary environment or secret manager if possible.

## 6. First login

- Start your site (`npm run dev`).
- Open `/login` and enter your email and password.
- You will be sent to `/login/setup-2fa` because admin pages require a completed MFA session.
- Scan the local QR code (not through a third-party QR API), securely save recovery codes and enter the app code.
- The app signs you out. Sign in again with password plus TOTP and open `/admin`.

`/admin` and `/api/admin/status` verify role against the database, that TOTP is enabled, and `session.mfaVerified` is true. Session MFA evidence is only set by the server for `/two-factor/verify-*` sessions. This protects against use of password-only pre-enrollment sessions.

## Security notes

- There is no public sign-up page and registration is disabled when Next.js runs normally.
- No social-login or passwordless bypass is configured.
- Device trust isn't offered (`trustDevice:false`).
- Database-backed rate limiting; on large/high-traffic deployments consider Redis / edge WAF limits too.
- Built-in TOTP failed-attempt lockouts; use HTTPS in production, monitor auth logs, update dependencies, take encrypted DB backups, and protect database/2FA secret.
- Do not expose `BETTER_AUTH_SECRET`, `DATABASE_URL`, admin credentials, backup codes or TOTP URI to logs/analytics.
- Bootstrap the account in a trusted environment and set up 2FA immediately. A password-only account is always weaker before the first enrollment.
- Backup codes are single-use. Store offline or in a password manager.
- This starter does not yet provide a content editor, password reset email, audit logs, email notifications, passkeys, or organization/team management.
- Every future `/api/admin/*` handler and server action must call a server-side admin authorization helper, **not** just rely on the frontend or middleware.
- `prisma generate` and Better Auth CLI may evolve; confirm against installed versions before publishing.
