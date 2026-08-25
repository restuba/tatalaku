# Rules — Frontend (apps/web)

## Struktur Folder

- Komponen UI generic/reusable (yang dipakai di lebih dari satu fitur) diletakkan di `src/components/`.
- Jika komponen hanya dipakai spesifik pada satu halaman (_page_), letakkan sejajar dengan halaman tersebut dalam folder `_components/` (contoh: `src/app/workspace/_components/sidebar/`).
- Jika ada _hooks_ khusus yang hanya digunakan pada satu halaman, letakkan sejajar dengan halamannya dalam folder `_hooks/`.
- **Komponen React WAJIB menggunakan penamaan file `kebab-case.tsx` (contoh: `block-editor.tsx`).**
- **Kelompokkan komponen yang saling berhubungan dalam foldernya masing-masing dan gunakan `index.ts` atau `index.tsx` sebagai entry point agar impor lebih rapi.**
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
- **Semua warna, radius, dan shadow WAJIB pakai token Codex yang sudah didefinisikan — dilarang keras hardcode warna/radius dalam bentuk apa pun, termasuk arbitrary value Tailwind.**
