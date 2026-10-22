# Tatalaku Design System — Warm Editorial

Satu bahasa visual (Warm Editorial) dengan tiga tema warna: **Parchment** (default), **Clarity**, dan **Nocturne**. Layout, tipografi, spacing, radius, komponen, dan perilaku interaksi identik di ketiga tema — tema hanya mengganti token warna.

Sumber kebenaran: `apps/web/src/app/globals.css`. Halaman referensi hidup: `/design-tokens`.

## Prinsip

1. Kenyamanan membaca nomor satu: kolom baca ±70 karakter, body 17px / 1.7.
2. Konten di atas dekorasi: tanpa gradient, glassmorphism, glow, atau animasi ambient di area kerja.
3. Navigasi jelas tapi tenang: hairline, fill tipis untuk hover/selected.
4. State tidak pernah hanya warna: selalu ada ikon, teks, bobot font, atau posisi (switch).
5. Kontras WCAG 2.2 AA di semua tema (diverifikasi per pasangan token).

## Tipografi

| Peran                    | Font                             | Ukuran / line-height                    |
| ------------------------ | -------------------------------- | --------------------------------------- |
| Display (greeting, hero) | Fraunces 400                     | 36 → 48px / 1.1                         |
| Judul halaman            | Fraunces 500                     | 36 → 42px / 1.15                        |
| H1 / H2 dokumen          | Fraunces 560                     | 1.76em / 1.41em                         |
| H3 dokumen               | Inter 600                        | 1.12em                                  |
| Body dokumen             | Inter 400                        | `--reading-size` (16 / 17 / 19px) / 1.7 |
| Quote                    | Fraunces italic                  | 1.06em / 1.6                            |
| Kode                     | system monospace                 | 0.82em / 1.65                           |
| Tabel                    | Inter                            | 0.9em / 1.55                            |
| UI, sidebar, tombol      | Inter 400–500                    | 14px                                    |
| Label kecil (`eyebrow`)  | Inter 500, caps, tracking 0.08em | 12px                                    |
| Waktu & metadata         | Inter 400, tabular, huruf biasa  | 12px (`text-xs tabular-nums`)           |

- Font di-self-host (`apps/web/src/app/fonts/`, OFL), subset latin — mencakup Bahasa Indonesia.
- Ukuran dokumen memakai `em` sehingga Appearance → Text size menskalakan seluruh dokumen.
- Ukuran teks minimum 12px (`text-xs`).

## Layout

- Sidebar 240px (drawer 288px di bawah 768px), top bar 48px (56px di touch).
- Kolom konten `max-w-3xl`; opsi Full width per perangkat untuk tabel/diagram lebar.
- Target sentuh 44px pada `pointer-coarse`.
- Radius: `rounded-codex-sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `2xl` 16px; tombol utama `rounded-full`.
- Shadow hanya untuk lapisan elevated: `shadow-codex-sm` (kartu hover), `surface-popover` (menu, popover, toast), `surface-dialog` (dialog).

## Token semantik

Gunakan kelas `codex-*` (aturan di `.agents/rules/frontend.md`).

| Token                                           | Dipakai untuk                                                   |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `background`                                    | kanvas halaman                                                  |
| `sidebar`                                       | kolom navigasi                                                  |
| `surface-secondary`                             | well: code block, header tabel, track                           |
| `elevated`                                      | kartu, menu, popover, dialog, input                             |
| `hover` / `selected`                            | fill transparan untuk baris hover / item aktif                  |
| `border` / `border-strong`                      | hairline / batas kontrol                                        |
| `foreground` / `muted` / `faint`                | teks utama / sekunder (≥4.5:1) / placeholder & dekoratif (≥3:1) |
| `accent` / `accent-hover` / `accent-soft`       | aksi utama, link, fokus, checkbox / hover / tint terpilih       |
| `accent-secondary`                              | penekanan terpilih (teks besar, ikon, indikator saja)           |
| `danger`, `success`, `warning`, `info` (+`-bg`) | status                                                          |
| `scrim`                                         | latar belakang dialog                                           |

Token turunan (`hover`, `selected`, `accent-soft`, `*-bg`, `scrim`, shadow) dihitung dengan `color-mix` dari palet, sehingga palet cukup mendefinisikan warna dasar.

## Palet

| Token                       | Parchment             | Clarity               | Nocturne              |
| --------------------------- | --------------------- | --------------------- | --------------------- |
| background                  | `#F5F0E7`             | `#F7F8F8`             | `#222320`             |
| sidebar / surface-secondary | `#EDE6D8`             | `#EEF0F2`             | `#292A27`             |
| elevated                    | `#FBF8F2`             | `#FFFFFF`             | `#30312D`             |
| foreground                  | `#29271F`             | `#252B30`             | `#EAE7DF`             |
| muted                       | `#615E55`             | `#5C656D`             | `#B1B0A6`             |
| faint                       | `#868072`             | `#808991`             | `#83827A`             |
| success / warning           | `#40603A` / `#7A5212` | `#2D714D` / `#8A5B00` | `#9BBE8E` / `#DDB66E` |
| border                      | `#DDD5C8`             | `#E0E4E7`             | `#41423C`             |
| accent                      | `#5E6A4F`             | `#46607A`             | `#A5AA8C`             |
| accent-secondary            | `#B07250`             | `#7B8894`             | `#C7B486`             |

Beberapa nilai digelapkan dari usulan awal agar lolos AA, mis. muted Parchment (`#706D63` → `#615E55`, sebelumnya 4.17:1 di sidebar) dan accent Clarity (`#667F98` → `#46607A`, sebelumnya 3.9:1 untuk label tombol). Hasil audit axe: muted Nocturne dinaikkan (`#AAA99F` → `#B1B0A6`, sebelumnya 4.2:1 di baris terpilih), success/warning Parchment digelapkan agar tetap 4.5:1 di atas fill status-nya.

- `faint` (≥ 3:1) hanya untuk teks disabled, placeholder berukuran besar (judul halaman), dan tanda dekoratif. Placeholder berukuran body memakai `muted`, karena tetap teks dan butuh 4.5:1.

Nama variabel `--color-ink`, `--color-surface`, `--color-accent`, `--color-danger`, `--color-success`, `--color-info` tersimpan di konten dokumen (warna teks/sel) — jangan diganti namanya.

## Tema

- Definisi & logika: `apps/web/src/lib/themes.ts`; store: `apps/web/src/stores/theme-store.ts` (localStorage `tatalaku-theme`).
- Pilihan: Parchment, Clarity, Nocturne, atau Match system (Parchment terang / Nocturne gelap).
- Diganti dari Settings → Appearance (tombol Settings di sidebar) atau command palette (⌘K → "theme"). Top bar sengaja hanya berisi aksi halaman.
- `lib/prepaint.ts` memasang `data-theme`, `data-motion`, dan `data-reading-size` sebelum paint pertama; `ThemeSync` menerapkan perubahan tanpa reload dan menyinkronkan antar tab.
- Ganti tema hanya mengubah atribut pada `<html>` — editor tidak di-remount.
- Subtree dengan `data-theme="…"` dirender dengan palet tema tersebut (dipakai preview di Settings dan landing).

## Komponen bersama

`Button`, `Input`, `Modal` (focus trap), `DropdownMenu` (navigasi panah, Escape, kembalikan fokus), `Switch`, `Kbd`, `Badge`, `EmptyState`, `Breadcrumb`, `UserAvatar`, `ThemeSwatch`, `ThemePreview`, `Logo`.

## Motion

Tween pendek (160–220ms), opacity sebelum posisi, tanpa animasi saat mengetik. Preferensi Motion (System/On/Off) dan `prefers-reduced-motion` dihormati.
