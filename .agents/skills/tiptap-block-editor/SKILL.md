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
