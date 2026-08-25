# Rules — Code Style

## TypeScript

- Strict mode wajib di semua workspace (`strict: true`, `noImplicitAny`, `noUncheckedIndexedAccess`).
- Tidak boleh ada `any`. Kalau benar-benar terpaksa, kasih komentar yang menjelaskan alasannya.
- Tipe entitas domain (User, Workspace, Page, Block, dll) hanya didefinisikan sekali di `packages/shared`, di-infer dari Zod schema (`z.infer<typeof schema>`). Jangan duplikasi definisi tipe di `apps/web` atau `apps/api`.

## Lint & Format

- Ikuti ESLint & Prettier config yang sudah ada di root — jangan override rule tanpa alasan jelas yang disebutkan ke saya dulu.
- Jalankan `pnpm lint` setelah perubahan kode, sebelum menganggap task selesai.
- Husky + lint-staged sudah aktif — jangan bypass dengan `--no-verify` kecuali saya minta eksplisit.
- **Semua warna, radius, dan shadow WAJIB pakai token Codex yang sudah didefinisikan — dilarang keras hardcode warna/radius dalam bentuk apa pun, termasuk arbitrary value Tailwind.**

## Penamaan & Konvensi Umum

- Penamaan file: **kebab-case secara ketat untuk SEMUA file** (termasuk komponen React seperti `block-editor.tsx`).
- Nama variabel komponen React di dalam file tetap menggunakan **PascalCase** (contoh: `export function BlockEditor()`).
- Gunakan file `index.ts` atau `index.tsx` untuk mengekspor komponen utama dari sebuah folder agar impor dari luar folder lebih bersih.
- Commit message dalam Bahasa Inggris, format singkat: `feat: ...`, `fix: ...`, `refactor: ...`.
- Komentar kode dalam Bahasa Inggris.
