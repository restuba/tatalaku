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
