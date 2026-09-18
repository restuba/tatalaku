# Tatalaku Frontend Engineering & Coding Guideline (`apps/web`)

Dokumen ini adalah acuan standar teknis dan panduan penulisan kode (_coding standard_) untuk pengembangan frontend pada monorepo **Tatalaku** (`apps/web`). Setiap developer wajib mengikuti panduan ini untuk menjaga konsistensi arsitektur, modularitas, keterbacaan kode, serta skalabilitas proyek.

---

## Daftar Isi

1. [Prinsip Desain & Arsitektur](#1-prinsip-desain--arsitektur)
2. [Struktur Direktori & Peletakan File](#2-struktur-direktori--peletakan-file)
3. [Standar & Arsitektur Komponen UI (High Priority)](#3-standar--arsitektur-komponen-ui-high-priority)
   - [Taksonomi Komponen](#a-taksonomi-komponen)
   - [Struktur Folder Komponen](#b-struktur-folder-komponen)
   - [Anatomi Kode Standar](#c-anatomi-kode-standar)
   - [Compound Component Pattern](#d-compound-component-pattern)
   - [Aksesibilitas & Best Practices](#e-aksesibilitas--best-practices)
4. [Pola API Service Layer (Granular Action-Based)](#4-pola-api-service-layer-granular-action-based)
5. [Fetcher Terpusat & Penanganan Error](#5-fetcher-terpusat--penanganan-error)
6. [State Management & Custom Hooks](#6-state-management--custom-hooks)
7. [TypeScript & Gaya Penulisan Kode (Code Style)](#7-typescript--gaya-penulisan-kode-code-style)
8. [Design Tokens & Styling](#8-design-tokens--styling)
9. [Checklist Quality Assurance & Review](#9-checklist-quality-assurance--review)

---

## 1. Prinsip Desain & Arsitektur

1. **Separation of Concerns**: Pisahkan layer presentasi (komponen murni), layer data fetching (services), dan layer state (stores).
2. **Colocation First**: Letakkan kode sedekat mungkin dengan tempat penggunaannya. Komponen/hook yang hanya dipakai pada satu halaman diletakkan di subfolder privat halaman tersebut (`_components/` dan `_hooks/`).
3. **Pure Primitives**: Komponen dasar (_reusable_) wajib bebas dari domain bisnis, tidak melakukan fetch data langsung, dan murni digerakkan oleh _props_.
4. **Predictable Typing**: Strict TypeScript tanpa `any`, pemisahan jelas antara tipe input/output dengan tipe UI.

---

## 2. Struktur Direktori & Peletakan File

Aplikasi `apps/web` dibangun di atas Next.js 15 (App Router). Direktori diatur secara modular di dalam `src/`:

```text
apps/web/
├── src/
│   ├── app/                               # Next.js App Router (Routing & Pages)
│   │   ├── (auth)/                        # Route Group: Otentikasi
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/                        # Route Group: Fitur Utama / Workspace
│   │   │   ├── [workspaceId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── _components/           # Private components khusus workspace ini
│   │   │   │   │   ├── WorkspaceSidebar.tsx
│   │   │   │   │   └── ShareModal.tsx
│   │   │   │   └── _hooks/                # Private hooks khusus workspace ini
│   │   │   ├── layout.tsx                 # Shell utama (Sidebar, Header)
│   │   │   └── page.tsx
│   │   ├── layout.tsx                     # Root Layout (HTML, Fonts, Provider)
│   │   └── not-found.tsx
│   │
│   ├── components/                        # Shared UI Components
│   │   ├── app/                           # Global feedback context (Modal, Notification, Message)
│   │   ├── icons/                         # SVG Icons library dengan IconProps standar
│   │   ├── layout/                        # Shell layout (Header, Drawer, Sidebar)
│   │   ├── reusable/                      # Primitive Design System (Button, Input, Modal, dll)
│   │   └── shared/                        # Domain-aware shared components lintas modul
│   │
│   ├── constants/                         # Nilai statis, tokens, menu navigation
│   │   ├── designTokens.ts                # Token warna, typography, radius
│   │   └── navigation.ts
│   │
│   ├── helpers/                           # Utility murni & HTTP client
│   │   ├── fetcher.ts                     # Core fetcher with token refresh & interceptors
│   │   └── date.ts
│   │
│   ├── hooks/                             # Shared React hooks lintas fitur
│   │   ├── useDebounce.ts
│   │   ├── useQueryState.ts               # URL query param sync untuk table/filter
│   │   └── useCanMutate.ts                # RBAC & permission checking
│   │
│   ├── providers/                         # Context providers global
│   │   └── AppProvider.tsx
│   │
│   ├── services/                          # API Service Layer (Granular Action-Based)
│   │   ├── auth/
│   │   ├── workspace/
│   │   └── page/
│   │
│   ├── stores/                            # Global client state (Zustand)
│   │   ├── useAuthStore.ts
│   │   └── useWorkspaceStore.ts
│   │
│   └── types/                             # Type definitions global (.d.ts)
```

### Aturan Peletakan File:

- **Private Co-location**: Gunakan prefiks underscore `_` untuk folder di dalam route (contoh: `_components/`, `_hooks/`) agar Next.js tidak menganggapnya sebagai route URL.
- **Promosi Komponen**: Komponen baru harus mulai dari `_components/` lokal. Hanya promosikan ke `src/components/shared/` jika sudah terbukti dipakai oleh minimal 2 fitur/halaman berbeda.
- **Isolasi Primitives**: Direktori `src/components/reusable/` HANYA untuk komponen generik tanpa domain bisnis.

---

## 3. Standar & Arsitektur Komponen UI (High Priority)

Komponen UI adalah bagian paling krusial dalam sistem antarmuka Tatalaku.

### A. Taksonomi Komponen

| Kategori                  | Lokasi                        | Karakteristik                                                                                      | Keterikatan Domain        |
| :------------------------ | :---------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------ |
| **Reusable (Primitives)** | `src/components/reusable/`    | Design system primitives (Button, Input, Modal, Table, Tabs, Select). Hanya bergantung pada props. | **Bebas Domain**          |
| **Shared (Domain-Aware)** | `src/components/shared/`      | Komponen bisnis reusable (Breadcrumb, BackButton, ChangeLogTimeline, ViewModeToggle).              | **Terkait Domain Bisnis** |
| **Route-Scoped**          | `app/(main)/.../_components/` | Komposisi khusus satu tampilan tertentu (FilterModal, WorkspaceMemberList).                        | **Privat Halaman**        |
| **Layout & Shell**        | `src/components/layout/`      | Shell navigasi dan tata letak dasar (Header, Drawer, Sidebar, FloatingPanel).                      | **Struktur App**          |
| **Icons**                 | `src/components/icons/`       | Library icon SVG terstandarisasi dengan `IconProps` seragam (`size`, `color`, `className`).        | **Bebas Domain**          |
| **App Feedback Context**  | `src/components/app/`         | Imperative/context feedback UI (`message.success()`, `modal.confirm()`, `notification`).           | **Infrastruktur UI**      |

---

### B. Struktur Folder Komponen

Setiap komponen di `src/components/reusable/` wajib memiliki foldernya sendiri:

```text
src/components/reusable/Tabs/
├── index.tsx         # Entry point utama & compound exports
├── types.ts          # Interface props & types jika > 30 baris
├── useScrollable.ts  # Custom hook lokal khusus komponen ini (opsional)
├── TabButton.tsx     # Sub-komponen internal
├── TabPanel.tsx      # Sub-komponen internal
├── InkBar.tsx        # Sub-komponen internal visual/dekoratif
└── ScrollButton.tsx  # Sub-komponen internal tombol scroll
```

1. **`index.tsx`**: Wajib menjadi entry point ekspor.
2. **Modular Sub-components**: Pecah komponen menjadi sub-komponen kecil jika panjang file mendekati atau melebihi 250 baris.
3. **Local Hook**: Jika komponen memiliki logika stateful kompleks (misal: kalkulasi posisi scroll, keyboard navigation), pisahkan ke dalam hook lokal di folder yang sama.

---

### C. Anatomi Kode Standar

Setiap file komponen wajib mengikuti pola struktur dan sekat penanda berikut:

```tsx
"use client";

import { forwardRef, useState, useRef, useCallback, useImperativeHandle } from "react";
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────

export type InputSize = "small" | "medium" | "large";
export type InputVariant = "outlined" | "filled" | "borderless";
export type InputStatus = "error" | "warning" | undefined;

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange"
> {
  /** Label teks yang ditampilkan di atas input */
  label?: string;
  /** Varian tampilan visual */
  variant?: InputVariant;
  /** Ukuran tinggi dan padding input */
  size?: InputSize;
  /** Status validasi form */
  status?: InputStatus;
  /** Element prefix (icon / label kiri) */
  prefix?: ReactNode;
  /** Element suffix (icon / button kanan) */
  suffix?: ReactNode;
  /** Tampilkan tombol clear teks */
  allowClear?: boolean;
  /** Callback perubahan nilai */
  onChange?: (value: string) => void;
  /** Handler saat tombol Enter ditekan */
  onPressEnter?: () => void;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  input: HTMLInputElement | null;
}

// ─── Style Builders / Dictionaries ──────────────────────────────────

function getSizeClasses(size: InputSize) {
  const map: Record<InputSize, { wrapper: string; input: string }> = {
    small: { wrapper: "h-8 px-2.5 text-sm", input: "text-sm" },
    medium: { wrapper: "h-10 px-3 text-sm", input: "text-sm" },
    large: { wrapper: "h-12 px-3.5 text-base", input: "text-base" },
  };
  return map[size];
}

function getVariantClasses(
  variant: InputVariant,
  status: InputStatus,
  focused: boolean,
  disabled: boolean,
) {
  if (disabled) return "border-border bg-muted text-muted-foreground cursor-not-allowed";

  if (status === "error") {
    return "border-destructive focus:ring-2 focus:ring-destructive/20";
  }

  const map: Record<InputVariant, string> = {
    outlined: focused ? "border-primary shadow-xs" : "border-border hover:border-border-hover",
    filled: focused
      ? "bg-background border-primary"
      : "bg-muted border-transparent hover:bg-muted/80",
    borderless: "border-transparent bg-transparent",
  };
  return map[variant];
}

// ─── Component ──────────────────────────────────────────────────────

const Input = forwardRef<InputRef, InputProps>(
  (
    {
      label,
      variant = "outlined",
      size = "medium",
      status,
      disabled = false,
      value: controlledValue,
      defaultValue,
      allowClear = false,
      prefix,
      suffix,
      className = "",
      onChange,
      onPressEnter,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // Ekspos method imperatif via ref
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      input: inputRef.current,
    }));

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
      },
      [isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onPressEnter?.();
      },
      [onPressEnter],
    );

    const sizeStyles = getSizeClasses(size);
    const variantStyles = getVariantClasses(variant, status, focused, disabled);

    return (
      <div className={className}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
        )}
        <div
          className={`inline-flex w-full items-center gap-2 rounded-lg border transition-all ${sizeStyles.wrapper} ${variantStyles}`}
          onClick={() => inputRef.current?.focus()}
        >
          {prefix && <span className="shrink-0 text-muted-foreground">{prefix}</span>}
          <input
            ref={inputRef}
            value={currentValue}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`min-w-0 flex-1 bg-transparent outline-hidden ${sizeStyles.input} text-foreground`}
            {...rest}
          />
          {allowClear && currentValue && !disabled && (
            <button
              type="button"
              onClick={() => {
                if (!isControlled) setInternalValue("");
                onChange?.("");
                inputRef.current?.focus();
              }}
              className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
          {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
```

---

### D. Compound Component Pattern

Untuk komponen dengan hierarki deklaratif (seperti `Modal`, `Tabs`, `Input.Search`), gunakan pola Compound Component:

```tsx
// Modal/index.tsx
import { createContext, useContext } from "react";
import { createPortal } from "react-dom";

const ModalContext = createContext<{ onClose?: () => void }>({});

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return createPortal(
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg rounded-xl bg-background p-6 shadow-xl">
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
}

function Header({
  children,
  showClose = true,
}: {
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const { onClose } = useContext(ModalContext);
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">{children}</h3>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className="py-4 text-sm text-muted-foreground">{children}</div>;
}

function Action({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 pt-4 border-t border-border">{children}</div>;
}

// ─── Compound Attachment ───
Modal.Header = Header;
Modal.Content = Content;
Modal.Action = Action;

export default Modal;
```

**Penggunaan yang Bersih di Halaman:**

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>Hapus Dokumen</Modal.Header>
  <Modal.Content>
    Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak dapat dibatalkan.
  </Modal.Content>
  <Modal.Action>
    <Button variant="outlined" onClick={() => setIsOpen(false)}>
      Batal
    </Button>
    <Button color="danger" onClick={handleDelete}>
      Hapus
    </Button>
  </Modal.Action>
</Modal>
```

---

### E. Aksesibilitas & Best Practices

1. **Dictionary Objects alih-alih Nested Ternaries**:
   - ❌ _Dilarang:_ `size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-12"`
   - ✅ _Gunakan:_ `const sizeMap: Record<Size, string> = { small: "h-8", medium: "h-10", large: "h-12" }; return sizeMap[size];`
2. **Dukungan Controlled & Uncontrolled**: Seluruh input wajib mendukung mode `value` (controlled) dan `defaultValue` (uncontrolled) secara mulus.
3. **Aksesibilitas (A11y)**:
   - Atribut ARIA wajib disertakan: `aria-busy`, `aria-disabled`, `aria-invalid`, `aria-modal`.
   - Keyboard interaction: Dukung tombol `Escape` untuk dismiss popup/modal, tombol panah untuk menu dropdown/tabs.
4. **Ref Forwarding**: Komponen interaktif wajib dibungkus dengan `forwardRef` dan menyertakan `displayName`.

---

## 4. Pola API Service Layer (Granular Action-Based)

Semua interaksi API backend dipusatkan di `src/services/` dengan pola **satu file per action** (Action-Based Services).

### Struktur File:

```text
src/services/workspace/
├── getWorkspace.ts
├── getListWorkspaces.ts
├── createWorkspace.ts
├── updateWorkspace.ts
└── deleteWorkspace.ts
```

### Format Standar File Service:

```typescript
// src/services/workspace/getWorkspace.ts
import fetcher from "@/helpers/fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type WorkspaceDetail = {
  id: string;
  name: string;
  icon: string | null;
  role: "owner" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
};

export type ResponseGetWorkspace = {
  data: WorkspaceDetail;
  status: boolean;
  message: string;
};

const getWorkspace = async (workspaceId: string): Promise<ResponseGetWorkspace> => {
  const response = await fetcher({
    url: `${BASE_URL}/v1/workspaces/${workspaceId}`,
    method: "GET",
  });

  return response as ResponseGetWorkspace;
};

export default getWorkspace;
```

**Kelebihan:**

- **Optimal Tree-shaking**: Hanya fungsi yang digunakan yang dikemas ke dalam bundle bundle halaman Next.js.
- **Tipe Terisolasi**: Tipe request dan respons didefinisikan berdampingan langsung dengan endpoint terkait.

---

## 5. Fetcher Terpusat & Penanganan Error

Dilarang memanggil `fetch()` atau menginisialisasi `axios` langsung di dalam komponen atau halaman. Seluruh network call wajib melewati `src/helpers/fetcher.ts`.

### Standar Kerja Fetcher:

1. **Otentikasi Otomatis**: Menyisipkan header `Authorization: Bearer <token>` secara otomatis dari cookie auth.
2. **Silent Token Refresh Queue**: Jika menerima HTTP `401 Unauthorized`:
   - Fetcher menahan antrean request.
   - Melakukan call refresh token secara otomatis.
   - Memperbarui session cookie.
   - Me-replay kembali (_retry_) request awal yang sempat gagal tanpa memicu logout user.
   - Jika refresh gagal, arahkan user ke `/login`.
3. **Format Error Terstandarisasi**:
   ```typescript
   export interface APIError extends Error {
     status?: number | null;
     code?: string;
     message: string;
     errors?: unknown[];
   }
   ```

---

## 6. State Management & Custom Hooks

### A. Global State (Zustand)

- Store diletakkan di `src/stores/`, dipisah per domain fitur:
  - `useAuthStore.ts` (User session & profile)
  - `useWorkspaceStore.ts` (Active workspace & page tree)
  - `useEditorStore.ts` (Editor selection & block states)
- **Optimistic Updates**: Untuk aksi cepat (rename dokumen, archive, reorder block), perbarui state lokal secara instan, namun lakukan rollback jika API mengembalikan error.

### B. Shared Custom Hooks

- **`useQueryState`**: Sinkronisasi filter pencarian, pagination, dan tab aktif dengan URL search params (`?page=1&search=xyz`) agar URL dapat dibagikan dan di-bookmark.
- **`useDebounce`**: Wajib dipakai pada search input dan auto-save editor Tiptap (300ms–500ms) untuk menghindari flood request ke backend.
- **`useCanMutate`**: Verifikasi hak akses pengguna (_permission checking_) berdasarkan role sebelum merender tombol aksi kritis.

---

## 7. TypeScript & Gaya Penulisan Kode (Code Style)

### A. Strict TypeScript

- `strict: true`, `noImplicitAny: true`. Dilarang menggunakan `any`.
- Gunakan `import type` untuk semua import tipe:
  ```typescript
  // ✅ Benar
  import type { ReactNode, KeyboardEvent } from "react";
  import type { WorkspaceDetail } from "@/services/workspace/getWorkspace";

  // ❌ Hindari
  import { ReactNode, KeyboardEvent } from "react";
  ```
- Entitas domain bersama (User, Workspace, Page, Block) **wajib di-import dari `packages/shared`** (hasil infer dari Zod schema). Dilarang membuat ulang tipe duplikat.

### B. Urutan Import (Import Ordering)

Kelompokkan import dengan urutan berikut tanpa baris kosong acak:

```typescript
// 1. Built-in modules (Node.js)
import path from "path";

// 2. External packages (React, libraries)
import { forwardRef, useState } from "react";
import Cookies from "js-cookie";

// 3. Internal path aliases (@/...)
import Button from "@/components/reusable/Button";
import fetcher from "@/helpers/fetcher";

// 4. Relative paths (parent, siblings)
import SubComponent from "./SubComponent";

// 5. Explicit type imports
import type { ButtonProps } from "@/components/reusable/Button";
```

### C. Konvensi Penulisan

- **File Naming**: Semua file menggunakan `kebab-case` (contoh: `workspace-sidebar.tsx`, `use-debounce.ts`).
- **Component Naming**: Fungsi komponen di dalam file tetap menggunakan `PascalCase` (contoh: `export function WorkspaceSidebar()`).
- **Self-closing Tag**: Komponen tanpa children wajib self-closing (`<Icon />`).
- **Hindari Curly Braces Redundan**: Gunakan `variant="solid"` daripada `variant={"solid"}`.
- **Early Return**: Dahulukan pengecekan kondisi batas (_guard clauses_) untuk mengurangi indentasi bersarang.

---

## 8. Design Tokens & Styling

- **Dilarang Hardcode Nilai Sembarang**: Jangan pernah menggunakan arbitrary Tailwind values untuk warna, radius, atau bayangan (contoh dilarang: `bg-[#2196F3]`, `rounded-[14px]`).
- **Gunakan Token Resmi**: Semua styling warna harus merujuk pada token CSS variables / Tailwind theme yang terdaftar di `style/globals.css`.
- **Status Colors Pairing**:
  Warna status wajib selalu berpasangan antara _background lembut_ dan _teks kontras_:
  - **Active / Success**: Background hijau lembut (`bg-status-success-subtle`) + Teks hijau tegas (`text-status-success`).
  - **Warning**: Background kuning lembut (`bg-status-warning-subtle`) + Teks oranye tegas (`text-status-warning`).
  - **Error / Danger**: Background merah lembut (`bg-status-error-subtle`) + Teks merah tegas (`text-status-error`).
  - **Inactive / Muted**: Background abu-abu lembut (`bg-muted`) + Teks abu-abu gelap (`text-muted-foreground`).

---

## 9. Checklist Quality Assurance & Review

Sebelum membuat Pull Request atau menyelesaikan task frontend, pastikan setiap poin telah terpenuhi:

- [ ] **Kategori Komponen Sesuai**: Apakah komponen berada di direktori yang benar (`reusable/`, `shared/`, atau `_components/`)?
- [ ] **Struktur Modular**: Jika komponen berada di `reusable/`, apakah sudah memiliki foldernya sendiri dengan `index.tsx` dan `types.ts` (jika kompleks)?
- [ ] **A11y & ForwardRef**: Apakah komponen UI sudah memiliki `forwardRef`, `displayName`, dan atribut ARIA yang tepat?
- [ ] **Dictionary Mapping**: Apakah varian warna/ukuran menggunakan dictionary record alih-alih nested ternaries?
- [ ] **Action-Based Service**: Apakah setiap pemanggilan API baru dibuat sebagai file tersendiri di `services/<domain>/<action>.ts`?
- [ ] **Fetcher Interceptor**: Apakah request API menggunakan `fetcher` standar tanpa raw `fetch()`?
- [ ] **Strict Typing**: Apakah tipe entitas berasal dari `packages/shared` dan seluruh import tipe menggunakan `import type`?
- [ ] **Zero Hardcoded Colors**: Apakah seluruh class warna dan radius memanfaatkan token design system?
- [ ] **Lint & Typecheck**: Menjalankan `pnpm lint` dan `pnpm type-check` tanpa ada error.
