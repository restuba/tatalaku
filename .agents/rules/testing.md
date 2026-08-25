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
