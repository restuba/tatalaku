# Tatalaku

Tatalaku adalah aplikasi web produktivitas dan kolaborasi dokumen (Notion-like workspace) berbasis block editor.

---

## 🏛️ Arsitektur Monorepo

Project ini menggunakan arsitektur monorepo dengan **pnpm workspaces**:

```text
tatalaku/
├── apps/
│   ├── web/               # Next.js 15 (App Router), Tailwind CSS, Zustand, Tiptap
│   └── api/               # Express, TypeScript, Mongoose (MongoDB)
├── packages/
│   └── shared/            # Tipe TypeScript & Zod schemas bersama (FE & BE)
├── .agents/               # Workflow & AI Pair Programming Rules
├── .husky/                # Git hooks (lint-staged)
└── package.json           # Root workspace configuration
```

---

## 🛠️ Tech Stack

- **Frontend (`apps/web`)**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, Tiptap.
- **Backend (`apps/api`)**: Express, TypeScript, Mongoose (MongoDB), Zod, JWT.
- **Shared (`packages/shared`)**: TypeScript, Zod.
- **Tooling & Quality**: pnpm, ESLint 9 (Flat Config), Prettier, Husky, lint-staged, Vitest.

---

## 📋 Prasyarat

Sebelum menjalankan project, pastikan environment Anda telah terinstall:

1. **Node.js**: `v20.x` atau lebih baru
2. **pnpm**: `v9.x` atau lebih baru (`corepack enable && corepack prepare pnpm@latest --activate`)
3. **MongoDB**: Instance MongoDB lokal aktif di `mongodb://localhost:27017` atau MongoDB Atlas.

---

## 🚀 Cara Menjalankan

### 1. Install Dependencies

Jalankan perintah berikut di root folder project:

```bash
pnpm install
```

### 2. Setup Environment Variables

Salin template konfigurasi environment untuk masing-masing aplikasi:

**Backend (`apps/api`):**

```bash
cp apps/api/.env.example apps/api/.env
```

_Sesuaikan nilai `MONGODB_URI` dan `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` jika diperlukan._

**Frontend (`apps/web`):**

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 3. Menjalankan Mode Development

Jalankan seluruh workspace secara bersamaan:

```bash
pnpm dev
```

Atau jalankan aplikasi secara terpisah:

```bash
# Menjalankan Web saja (http://localhost:3000)
pnpm --filter @tatalaku/web dev

# Menjalankan API saja (http://localhost:5000)
pnpm --filter @tatalaku/api dev

# Menjalankan Shared watch build
pnpm --filter @tatalaku/shared dev
```

---

## 📦 Build & Production

Build seluruh workspace:

```bash
pnpm build
```

Menjalankan API server hasil build:

```bash
pnpm --filter @tatalaku/api start
```

---

## 🧪 Linting, Formatting, & Type-Checking

```bash
# Type-check seluruh workspace
pnpm type-check

# Jalankan ESLint di seluruh workspace
pnpm lint

# Format kode dengan Prettier
pnpm format

# Cek kesesuaian format tanpa menulis ulang
pnpm format:check
```

---

## 📐 Konvensi Proyek

- **Backend Modules**: Mengikuti arsitektur domain-driven di `apps/api/src/modules/<domain>/` yang terdiri dari `controller`, `service`, `model`, `routes`, dan `validation`.
- **Frontend Features**: Terisolasi per fitur di `apps/web/src/features/<domain>/`.
- **Shared Schemas**: Semua tipe domain didefinisikan sekali di `packages/shared` menggunakan Zod (`z.infer`).
- **Git Hooks**: Pre-commit hook otomatis memformat kode yang di-stage dengan Prettier menggunakan Husky dan `lint-staged`.
