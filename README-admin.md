# MENANCE Admin Panel — Production Guide

The **MENANCE Admin Panel** is a dense, keyboard-friendly operations cockpit tailored for a modern Gen Z apparel brand. Built on **Next.js 15 App Router**, **Cloudflare D1**, **Drizzle ORM**, **Clerk RBAC**, and **TanStack Table**.

---

## 🔑 1. Seeding Your First Admin

Access to `/admin/*` requires either the `admin` or `staff` role.

### Method A: Instant Bootstrap via Environment Variable (Fastest)
Add your Clerk account email to the `ADMIN_EMAILS` variable:
```bash
ADMIN_EMAILS="your-email@example.com,zamin@menance.store"
```
Users signing in with this email are automatically granted full `admin` permissions on all routes and server actions.

### Method B: Clerk Dashboard Metadata
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/) → **Users**.
2. Click on your user account.
3. Scroll to **Public Metadata**.
4. Set:
```json
{
  "role": "admin"
}
```
5. Save. Your role will now be verified on every request.

---

## 🗄️ 2. Cloudflare D1 Database Setup & Migrations

### Create D1 Database
In your Cloudflare dashboard (or terminal):
```bash
npx wrangler d1 create menance-db
```
Copy the `database_id` returned and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "menance-db"
database_id = "your-d1-database-id-here"
```

### Apply Initial Migration & Seeds
Run the included SQL migration to create all tables and seed Drop 001 with the 6 authentic Menance tees, variant matrices, and discount codes:
```bash
# Apply to remote Cloudflare D1
npx wrangler d1 execute menance-db --remote --file=src/lib/db/migrations/0001_init.sql

# Or apply locally for Wrangler dev
npx wrangler d1 execute menance-db --local --file=src/lib/db/migrations/0001_init.sql
```

---

## 📦 3. Cloudflare R2 Storage (Product Imagery)

1. In Cloudflare Dashboard, go to **R2 Object Storage** → **Create bucket**.
2. Name the bucket `menance-assets`.
3. In bucket settings, enable **Public Access** or connect a custom domain (e.g. `https://assets.menance.store`).
4. In `wrangler.toml`, ensure the binding is set:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "menance-assets"
```

---

## ⚡ 4. Keyboard Shortcuts & Speed Navigation

The admin panel is designed for fast, keyboard-first operations:

| Shortcut | Action | Destination |
|---|---|---|
| `Cmd + K` / `Ctrl + K` | Open Command Palette | Global Modal |
| `G` then `P` | Jump to Products | `/admin/products` |
| `G` then `O` | Jump to Orders | `/admin/orders` |
| `G` then `D` | Jump to Dashboard | `/admin` |
| `G` then `C` | Jump to Customers | `/admin/customers` |
| `Esc` | Close Palette / Dialogs | Any Modal |

---

## 🛡️ 5. Access Control Matrix

| Route / Capability | Customer | Staff | Admin |
|---|:---:|:---:|:---:|
| `/` & `/shop` Storefront | ✅ | ✅ | ✅ |
| `/account` Member Portal | ✅ | ✅ | ✅ |
| `/admin` Dashboard | ❌ (Redirect to /account) | ✅ | ✅ |
| `/admin/orders` Order List & Detail | ❌ (404 Stealth) | ✅ (View + Ship) | ✅ (Full + Refund) |
| `/admin/customers` Directory | ❌ (404 Stealth) | ✅ (View) | ✅ (Full) |
| `/admin/products` Catalog & CRUD | ❌ (404 Stealth) | ❌ (404 Stealth) | ✅ (Full Access) |
| `/admin/inventory` Stock Steppers | ❌ (404 Stealth) | ❌ (404 Stealth) | ✅ (Full Access) |
| `/admin/discounts` Promo Codes | ❌ (404 Stealth) | ❌ (404 Stealth) | ✅ (Full Access) |
| `/admin/analytics` Telemetry | ❌ (404 Stealth) | ✅ (View) | ✅ (Full Access) |
| `/admin/settings` Store & Staff Roles | ❌ (404 Stealth) | ❌ (404 Stealth) | ✅ (Full Access) |

---

## 🚀 6. Testing Locally

Run the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000/admin`. The dual-mode database client will automatically provide in-memory/local SQLite fallback with real Menance catalog data!
