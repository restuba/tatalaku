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
