# CivicTrack Backend

REST API for the CivicTrack municipal issue reporting portal. Built with Node.js, Express, MongoDB/Mongoose, JWT in an HTTP-only cookie, and bcrypt password hashing.

## Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas database

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`: set `MONGODB_URI`, a random `JWT_SECRET` with at least 32 characters, and `CLIENT_ORIGIN` to your frontend origin. Start MongoDB first, then:

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`.

## Authentication
- `POST /api/auth/register` — citizen-only public registration; accepts `{ name, fullName, email, phone, password, confirmPassword }`.
- `POST /api/auth/login` — accepts `{ email, password }`; sets an HTTP-only cookie.
- `POST /api/auth/logout` — clears the cookie.
- `GET /api/auth/me` — returns the current authenticated user.

Staff accounts are not self-registered. Create an admin/officer via the admin account or use the intentionally opt-in seed script for initial local setup. For the first admin only, set `SEED_DEMO_USERS=true` and strong seed passwords in `.env`, then run `npm run seed:users`; turn the flag back off afterward.

## API routes
All endpoints return JSON. Protected routes require the auth cookie (the API accepts a Bearer token for API clients as well).

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Citizen registration |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Public | Logout |
| GET | `/api/auth/me` | Authenticated | Current user |
| GET | `/api/issues` | Authenticated | List/filter issues; `mine=true`, `assigned=true`, `status`, `category`, `ward`, `search`, `page`, `limit` |
| POST | `/api/issues` | Citizen | Create issue |
| GET | `/api/issues/:id` | Authenticated | Issue details |
| POST | `/api/issues/:id/comments` | Authenticated | Add comment |
| POST | `/api/issues/:id/upvote` | Citizen | Toggle upvote |
| PATCH | `/api/issues/:id/status` | Admin or assigned officer | Update status |
| PATCH | `/api/issues/:id/assign` | Admin | Assign officer |
| GET | `/api/issues/officers` | Admin | List active officers |
| GET | `/api/issues/stats` | Authenticated | Role-scoped issue counts |
| GET | `/api/notifications` | Authenticated | List notifications and unread count |
| PATCH | `/api/notifications/read-all` | Authenticated | Mark all read |
| PATCH | `/api/notifications/:id/read` | Authenticated | Mark one read |
| GET | `/api/admin/analytics` | Admin | Aggregated metrics |
| GET | `/api/admin/users` | Admin | Search/list users |
| POST | `/api/admin/users` | Admin | Create officer/admin account |
| PATCH | `/api/admin/users/:id` | Admin | Update user/role/active state |
| DELETE | `/api/admin/issues/:id` | Admin | Delete issue and linked notifications |

## Notes / current scope
- Public registration always creates a `citizen`; a client cannot choose an elevated role.
- Issue images currently accept URLs. Multipart image upload/storage needs a storage provider decision and is not yet implemented.
- The frontend still needs an API client and form integration. Until that is done, its mock data and demo navigation remain in use.
- Before public deployment, configure HTTPS, production secrets, a real database, backups, and stricter deployment-specific CORS. Review status-transition rules and add automated tests before treating the system as production-ready.
