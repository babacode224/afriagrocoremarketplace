# AfriAgroCore Marketplace — Setup Guide for New IDE

## Stack
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui, tRPC client
- **Backend:** Node.js, Express 4, tRPC 11, Drizzle ORM, SQLite (via libsql/Turso), Nodemailer
- **Auth:** Custom JWT (jose), multi-role per email, email verification + password reset
- **Package manager:** pnpm

---

## Project Structure

```
agri_marketplace_manus/
├── client/               ← Frontend (React + Vite)
│   └── src/
│       ├── pages/        ← All page components
│       ├── components/   ← Reusable UI (shadcn/ui + custom)
│       ├── contexts/     ← React contexts (Cart, etc.)
│       ├── hooks/        ← Custom hooks
│       ├── lib/trpc.ts   ← tRPC client binding
│       └── App.tsx       ← Routes
├── server/               ← Backend (Express + tRPC)
│   ├── routers.ts        ← All tRPC procedures (auth, products, orders, etc.)
│   ├── db.ts             ← Database query helpers
│   ├── schema.ts         ← (in drizzle/) Drizzle ORM schema
│   ├── email.ts          ← Nodemailer email helper
│   ├── storage.ts        ← S3 file storage helper
│   └── _core/            ← Framework plumbing (do not edit)
├── drizzle/
│   └── schema.ts         ← Database schema (61 columns in users table)
├── shared/               ← Shared types/constants
├── package.json
├── vite.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

---

## Environment Variables Required

Create a `.env` file in the project root with:

```env
# Database (SQLite via Turso or local)
DATABASE_URL=file:./local.db

# JWT signing secret (any random string)
JWT_SECRET=your-secret-here

# Manus OAuth (leave blank if not using Manus platform)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=

# S3 / File storage (optional)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=

# SMTP Email (optional — falls back to console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM=AfriAgroCore <noreply@afriagrocore.com>
```

---

## Installation & Running

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server (runs both frontend + backend)
pnpm dev
```

The app runs on `http://localhost:3000` by default.

---

## Key Architecture Notes

### Multi-Role Authentication
- Same email can register for multiple roles (Farmer, Buyer, Logistics Partner, Farm Input Supplier, Machinery Dealer, Storage Partner)
- `openId` is generated as `md5(email + ":" + role)` — unique per user+role combination
- At login, if an email has multiple roles, a role-selector screen is shown
- JWT payload contains: `{ id, openId, role, appId, name }`

### Profile Completion Gate
- After signup, users are redirected to `/complete-profile`
- Dashboard is blocked until all role-specific required fields are filled
- Tracked via `profileCompleted` boolean in the database

### Role-Specific Required Fields
| Role | Required Fields |
|------|----------------|
| Farmer | farmName, farmerType, country, district |
| Buyer | name, country, district |
| Machinery Dealer | companyName, serviceType, country, district |
| Farm Input Supplier | companyName, productCategories, country, district |
| Logistics Partner | companyName, servicesOffered, serviceArea |
| Storage Partner | facilityName, facilityType, capacity, country, district |

### Database
- SQLite via Drizzle ORM
- `users` table has 61 columns including all role-specific fields
- Column names use camelCase (e.g., `farmName`, `farmerType`, `profileCompleted`)

---

## Running Tests

```bash
pnpm test
```

13 tests across 3 test files — all should pass.

---

## Pending Tasks (from todo.md)
- [ ] Add product image upload (replace URL input with S3 file picker)
- [ ] Wire SMTP secrets for real email sending
- [ ] Public seller profile pages
- [ ] Order tracking system
