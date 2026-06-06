# Client APP POS

Frontend untuk aplikasi Point of Sale berbasis React, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, dan Axios.

## Ringkasan

Folder ini berisi aplikasi client untuk:

- Halaman login.
- Halaman utama POS/kasir.
- Dashboard admin.
- Manajemen produk, kategori, member, order, stok, dan user.
- Tampilan struk, riwayat order, notifikasi checkout, dan analytics overview.

Client berkomunikasi dengan server melalui REST API. Secara default API diarahkan ke:

```bash
http://localhost:3600/api
```

Nilai tersebut bisa diubah melalui environment variable `VITE_API_URL`.

## Teknologi Utama

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- TanStack React Query
- Axios
- React Router
- Recharts
- Sonner
- Lucide React

## Instalasi

Jalankan dari folder `client`:

```bash
npm install
```

## Environment

Buat file `.env` di folder `client` bila perlu mengubah alamat API:

```bash
VITE_API_URL=http://localhost:3600/api
```

Jika file `.env` tidak dibuat, aplikasi akan memakai default `http://localhost:3600/api`.

## Menjalankan Development Server

```bash
npm run dev
```

Vite biasanya berjalan di:

```bash
http://localhost:5173
```

Jika port tersebut sudah dipakai, Vite akan memilih port lain.

## Script

```bash
npm run dev
```

Menjalankan aplikasi dalam mode development.

```bash
npm run build
```

Melakukan type-check TypeScript dan build production.

```bash
npm run lint
```

Menjalankan ESLint.

```bash
npm run preview
```

Menjalankan preview hasil build production.

## Struktur Folder

```text
src/
  api/
    api.ts               Konfigurasi Axios dan wrapper API
  components/
    ui/                  Komponen shadcn/ui
    tabs/                Komponen tab dashboard admin
    AdminDataTable.tsx   Tabel admin reusable
    ConfirmDialog.tsx    Dialog konfirmasi
    Modal.tsx            Wrapper dialog modal
    ReceiptModal.tsx     Modal struk
  hooks/
    useAuth.ts           Helper auth, token, user, permission
    use-mobile.ts        Hook responsive dari shadcn/ui
  lib/
    utils.ts             Helper cn untuk className
  pages/
    Login.tsx            Halaman login
    POS.tsx              Halaman utama kasir
    Dashboard.tsx        Dashboard admin
  types/
    index.ts             TypeScript type untuk domain app
  utils/
    error.ts             Helper pesan error
```

## Routing

Routing utama didefinisikan di `src/App.tsx`.

- `/login`: halaman login.
- `/`: halaman POS, butuh token valid.
- `/dashboard`: dashboard admin, butuh token valid.

Jika token tidak valid, user akan diarahkan ke `/login`.

## Auth

Auth menggunakan JWT yang disimpan di `localStorage`.

Key yang dipakai:

- `token`
- `user`

Axios interceptor di `src/api/api.ts` otomatis menambahkan header:

```http
Authorization: Bearer <token>
```

Jika server mengembalikan status `401`, client akan menghapus data auth dan mengarahkan user ke `/login`.

## UI dan Design System

Project ini memakai shadcn/ui sebagai basis komponen.

Komponen shadcn berada di:

```text
src/components/ui/
```

Beberapa area penting yang sudah memakai komponen reusable:

- Sidebar dashboard memakai `Sidebar`.
- Tabel admin memakai `Table`, `Input`, `Select`, dan `Button`.
- Form memakai `Input`, `Textarea`, `Select`, `Field`, dan `Button`.
- Dialog memakai `Dialog` dan `AlertDialog`.
- Toast checkout memakai `Sonner`.
- Chart overview memakai `ChartContainer` dan Recharts.
- Halaman POS memakai `Card`, `AspectRatio`, `Tabs`, `ToggleGroup`, `ScrollArea`, `DropdownMenu`, dan `Empty`.

Catatan styling:

- Beberapa komponen sengaja diberi `rounded-none` agar tampilan lebih tegas dan konsisten dengan arah desain aplikasi operasional.
- Hindari membuat komponen custom baru jika komponen shadcn/ui yang sesuai sudah tersedia.
- Untuk ikon, gunakan `lucide-react`.

## Data Fetching

Data fetching menggunakan TanStack React Query.

Contoh pola umum:

```tsx
const { data = [], isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => productsApi.getAll().then(r => r.data),
});
```

Setelah mutasi data, gunakan invalidation:

```tsx
queryClient.invalidateQueries({ queryKey: ['products'] });
```

## API Wrapper

Wrapper API berada di `src/api/api.ts`.

Wrapper yang tersedia:

- `authApi`
- `productsApi`
- `categoriesApi`
- `membersApi`
- `ordersApi`
- `stockApi`
- `analyticsApi`
- `usersApi`

Untuk upload gambar produk, gunakan `FormData` karena endpoint produk memakai `multipart/form-data`.

## POS

Halaman POS berada di `src/pages/POS.tsx`.

Fitur utama:

- Cari produk.
- Scan barcode.
- Filter kategori.
- Tambah produk ke keranjang.
- Pilih varian ukuran dan suhu.
- Pilih member.
- Pilih metode pembayaran.
- Konfirmasi checkout.
- Toast sukses checkout.
- Recent notification checkout.
- Modal struk setelah checkout berhasil.

## Dashboard

Halaman dashboard berada di `src/pages/Dashboard.tsx`.

Tab yang tersedia:

- Overview
- Produk
- Kategori
- Member
- Order
- Stok
- User

Tab `User` hanya ditampilkan untuk admin atau user dengan permission yang sesuai.

## Validasi Sebelum Commit

Sebelum menyimpan perubahan besar, jalankan:

```bash
npm run lint
npm run build
```

Keduanya harus berhasil sebelum perubahan dianggap aman.

## Catatan Pengembangan

- Jangan menghapus komponen shadcn/ui yang belum dipakai, karena bisa dipakai untuk refactor berikutnya.
- Untuk style tabel, form, dialog, sidebar, toast, dan chart, prioritaskan komponen dari `src/components/ui`.
- Jaga logic checkout dan variant selection tetap sinkron dengan stok dari backend.
- Hindari perubahan global design token kecuali memang ingin mengubah seluruh tampilan aplikasi.
