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
