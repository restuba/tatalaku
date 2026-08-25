#!/bin/bash
# Jalankan script ini di ROOT folder project "tatalaku"
# Cara pakai: bash setup-agents.sh

set -e
mkdir -p .agents/rules .agents/workflows .agents/skills/tiptap-block-editor

cat > "AGENTS.md" << 'FILE_EOF'
# AGENTS.md — Tatalaku

## Project Context
Tatalaku — aplikasi web mirip Notion. Monorepo (pnpm workspaces):
- `apps/web` — Next.js 15 (App Router), TypeScript, Tailwind, Zustand
- `apps/api` — Express, TypeScript, Mongoose (MongoDB)
- `packages/shared` — tipe & schema Zod yang dipakai bersama FE-BE

Editor block-based pakai Tiptap. Auth pakai JWT (access + refresh token, refresh disimpan httpOnly cookie).

## Detail Aturan
Aturan lengkap dipecah per topik di `.agents/rules/` — baca semua sebelum mengubah kode:
- `.agents/rules/backend.md` — pola modul, service layer, authorization
- `.agents/rules/frontend.md` — struktur features/, state management
- `.agents/rules/code-style.md` — TypeScript, error handling, lint
- `.agents/rules/testing.md` — kapan wajib test, cara jalankan

## Sebelum Membuat Perubahan
- Jelaskan dulu rencana (implementation plan: file yang akan diubah, dependency baru jika ada) sebelum mengeksekusi perubahan besar (>1 file atau menyentuh schema).
- Jangan ubah schema di `packages/shared` tanpa menyebutkan modul mana saja di FE/BE yang akan terdampak.
- Untuk task kecil (fix typo, satu field), langsung eksekusi tanpa planning panjang.

## Setelah Membuat Perubahan
- Jalankan `pnpm lint` dan pastikan tidak ada error sebelum menganggap task selesai.
- Untuk perubahan di backend (service/controller), sertakan atau update unit test terkait jika sudah ada test suite untuk modul itu.
- Laporkan ringkas — tampilkan log detail hanya kalau ada yang gagal.

## Preferensi
- Bahasa komentar kode & commit message: Bahasa Inggris.
- Bahasa penjelasan/diskusi ke saya: Bahasa Indonesia.
FILE_EOF

cat > ".agents/rules/backend.md" << 'FILE_EOF'
# Rules — Backend (apps/api)

## Struktur Modul (WAJIB, jangan buat pola baru)
Setiap domain punya folder sendiri di `apps/api/src/modules/<domain>/`, berisi:
- `<domain>.controller.ts` — hanya parsing request & panggil service. Tidak boleh ada business logic di sini.
- `<domain>.service.ts` — seluruh business logic, termasuk authorization check.
- `<domain>.model.ts` — Mongoose schema, tipe merujuk ke `packages/shared`.
- `<domain>.routes.ts` — definisi endpoint, daftarkan ke `app.ts`.
- `<domain>.validation.ts` — Zod schema untuk validasi input.

## Aturan Wajib
- Validasi semua input request dengan Zod schema dari `.validation.ts`. Jangan percaya input mentah dari client.
- Authorization check (misal: cek kepemilikan workspace, cek membership) dilakukan di **service layer**, bukan hanya di middleware/controller.
- Soft delete untuk data user-facing (pakai flag `isArchived`). Jangan hard delete kecuali diminta eksplisit oleh saya.
- `src/app.ts` (Express app + middleware) harus terpisah dari `src/server.ts` (yang menjalankan `.listen()`), supaya `app.ts` bisa dites tanpa port aktif.
- Query MongoDB yang sering dipakai harus punya index yang sesuai. Kalau menambah query baru pada field yang belum diindeks, ingatkan saya untuk menambah index — jangan diam-diam dilewati.
- Error dari service layer dilempar sebagai custom Error class yang konsisten, ditangani oleh error handler terpusat di middleware. Jangan bocorkan detail internal (stack trace, query mentah) ke response client.

## Environment & Config
- Semua environment variable divalidasi lewat Zod di `src/config/env.ts` saat startup — fail fast kalau ada yang tidak lengkap, jangan biarkan aplikasi jalan dengan config tidak valid.
FILE_EOF

cat > ".agents/rules/frontend.md" << 'FILE_EOF'
# Rules — Frontend (apps/web)

## Struktur Folder
- Logic per domain/fitur (editor, workspace, auth) di `src/features/<domain>/`.
- Komponen UI generic/reusable (bukan spesifik satu fitur) di `src/components/`.
- API client & utils di `src/lib/`.
- State global pakai Zustand, satu store per domain di `src/stores/`.
- Tipe & schema selalu import dari `packages/shared`, jangan definisikan ulang tipe entitas (User, Workspace, Page, Block) di frontend.

## Aturan Wajib
- Gunakan App Router (Next.js 15) — routes di `src/app/`, bukan Pages Router.
- Semua request ke backend lewat API client di `src/lib/api.ts` yang sudah punya interceptor auto-refresh token — jangan fetch langsung di komponen tanpa lewat client ini.
- Middleware Next.js menangani redirect ke `/login` untuk halaman yang butuh autentikasi — jangan duplikasi logic redirect ini di tiap halaman.
- Update state via optimistic update untuk aksi cepat (rename, archive, reorder block) supaya UX terasa instan, tapi tetap rollback kalau request ke backend gagal.
- Perubahan pada editor (block content) di-debounce sebelum dikirim ke backend — jangan request per keystroke.

## Styling
- Tailwind CSS untuk styling utama, shadcn/ui untuk komponen dasar (button, dialog, dropdown, dll) — jangan bikin komponen dasar dari nol kalau shadcn/ui sudah punya.
FILE_EOF

cat > ".agents/rules/code-style.md" << 'FILE_EOF'
# Rules — Code Style

## TypeScript
- Strict mode wajib di semua workspace (`strict: true`, `noImplicitAny`, `noUncheckedIndexedAccess`).
- Tidak boleh ada `any`. Kalau benar-benar terpaksa, kasih komentar yang menjelaskan alasannya.
- Tipe entitas domain (User, Workspace, Page, Block, dll) hanya didefinisikan sekali di `packages/shared`, di-infer dari Zod schema (`z.infer<typeof schema>`). Jangan duplikasi definisi tipe di `apps/web` atau `apps/api`.

## Lint & Format
- Ikuti ESLint & Prettier config yang sudah ada di root — jangan override rule tanpa alasan jelas yang disebutkan ke saya dulu.
- Jalankan `pnpm lint` setelah perubahan kode, sebelum menganggap task selesai.
- Husky + lint-staged sudah aktif — jangan bypass dengan `--no-verify` kecuali saya minta eksplisit.

## Penamaan & Konvensi Umum
- Penamaan file: kebab-case untuk file, PascalCase untuk komponen React, camelCase untuk fungsi/variabel.
- Commit message dalam Bahasa Inggris, format singkat: `feat: ...`, `fix: ...`, `refactor: ...`.
- Komentar kode dalam Bahasa Inggris.
FILE_EOF

cat > ".agents/rules/testing.md" << 'FILE_EOF'
# Rules — Testing

## Kapan Wajib Menulis/Update Test
- Setiap kali menambah atau mengubah logic di service layer backend (`*.service.ts`), tambahkan atau update unit test terkait di file yang sama namanya dengan suffix `.test.ts`.
- Fitur auth, authorization, dan validasi input wajib punya test — ini area kritis yang paling mahal kalau ada bug lolos ke production.
- Perubahan kecil (typo, styling, copy text) tidak perlu test baru.

## Cara Menjalankan
- Test runner: Vitest.
- Jalankan test hanya untuk modul yang berubah dulu (`pnpm test <nama-modul>`) sebelum jalankan full test suite, supaya lebih cepat dan hemat output.
- Laporkan hasil test secara ringkas — tampilkan detail/log penuh hanya kalau ada test yang gagal.

## Cakupan
- Backend: fokus unit test di service layer (business logic), bukan controller (yang isinya cuma routing tipis).
- Integration test (Supertest) untuk endpoint kritis: auth, dan operasi yang menyentuh authorization (akses workspace/page).
FILE_EOF

cat > ".agents/workflows/generate-module.md" << 'FILE_EOF'
---
description: Generate modul backend baru sesuai pola project (controller, service, model, routes, validation)
---
## Steps

### 1. Konfirmasi Nama Domain
Kalau nama domain/modul belum disebutkan di prompt, tanyakan dulu sebelum lanjut.

### 2. Buat Struktur File
Buat folder `apps/api/src/modules/<nama>/` berisi 5 file, ikuti pola persis dari modul `pages` yang sudah ada sebagai referensi:
- `<nama>.controller.ts`
- `<nama>.service.ts`
- `<nama>.model.ts`
- `<nama>.routes.ts`
- `<nama>.validation.ts`

### 3. Definisikan Tipe di Shared
Kalau entitas baru ini belum ada tipenya di `packages/shared`, tambahkan Zod schema dan tipe di sana dulu sebelum implementasi model Mongoose.

### 4. Daftarkan Routes
Tambahkan routes baru ke `apps/api/src/app.ts`.

### 5. Verifikasi
Jalankan `pnpm lint` pada workspace `apps/api`, laporkan ringkas hasilnya.
FILE_EOF

cat > ".agents/workflows/pre-commit-check.md" << 'FILE_EOF'
---
description: Jalankan lint dan test sebelum commit
---
## Steps

### 1. Lint
Jalankan `pnpm lint` di seluruh workspace. Kalau ada error, perbaiki sebelum lanjut.

### 2. Test
Jalankan `pnpm test` untuk modul yang berubah di commit ini.

### 3. Laporkan
Tampilkan ringkasan status (pass/fail per workspace). Tampilkan log detail hanya untuk yang gagal.

### 4. Konfirmasi
Kalau semua pass, tanyakan apakah saya ingin lanjut commit, jangan commit otomatis tanpa konfirmasi.
FILE_EOF

cat > ".agents/skills/tiptap-block-editor/SKILL.md" << 'FILE_EOF'
---
description: Panduan teknis menambah atau memodifikasi block type di editor Tiptap (paragraph, heading, todo, toggle, code, dll). Gunakan skill ini saat mengerjakan apa pun terkait editor block-based di apps/web/src/features/editor.
---
# Skill: Tiptap Block Editor

## Konteks
Editor Tatalaku pakai Tiptap sebagai fondasi block-based editor mirip Notion. Setiap block type (paragraph, heading, bulletList, todo, toggle, code, quote, divider, image) adalah custom Tiptap Node/Extension.

## Aturan Menambah Block Type Baru
1. Definisikan block type baru di `packages/shared` dulu (tambah ke union type `BlockType`), supaya backend dan frontend konsisten.
2. Buat Tiptap Node extension baru di `apps/web/src/features/editor/extensions/<nama-block>.ts`.
3. Daftarkan extension ke editor config utama.
4. Tambahkan opsi block baru ke slash command menu.
5. Pastikan serialisasi/deserialisasi konten block cocok dengan struktur `content` di schema Block (lihat Fase 1 blueprint) — jangan buat format JSON baru yang tidak konsisten dengan block lain.

## Sinkronisasi ke Backend
- Perubahan struktur `content` suatu block type harus tercermin di validasi Zod block tersebut di `packages/shared`.
- Endpoint `PATCH /pages/:id/blocks` menerima batch update — pastikan payload dari frontend match dengan validation schema di backend, jangan kirim field yang tidak terdefinisi di schema.

## Performa
- Perubahan konten di-debounce (lihat rules frontend) sebelum dikirim ke backend.
- Reorder block (drag handle) hanya update field `order`, jangan kirim ulang seluruh konten block yang tidak berubah.
FILE_EOF

echo "Selesai. Struktur .agents/ dan AGENTS.md sudah dibuat."
find . -path ./node_modules -prune -o -name "*.md" -newer /dev/null -print 2>/dev/null | grep -E "AGENTS.md|.agents/" || true
