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
