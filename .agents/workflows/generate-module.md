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
