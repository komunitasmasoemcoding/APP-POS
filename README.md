# APP POS

APP POS adalah aplikasi Point of Sale untuk kebutuhan kasir dan dashboard admin. Project ini terdiri dari dua bagian utama:

- `client`: frontend React, Vite, TypeScript, Tailwind CSS, dan shadcn/ui.
- `server`: backend Express, Prisma, PostgreSQL, JWT, RBAC, dan REST API.

Project ini dirancang untuk alur operasional cafe atau toko kecil, dengan dukungan produk bervarian, stok, member, order, struk, dan analytics.

## Fitur Utama

- Login dan proteksi route berbasis JWT.
- Role dan permission untuk membedakan akses cashier dan admin.
- Halaman POS untuk kasir.
- Pencarian produk dan scan barcode.
- Produk dengan varian ukuran dan suhu.
- Sinkronisasi stok per varian.
- Keranjang dengan pilihan varian.
- Checkout dengan konfirmasi item.
- Toast sukses checkout dan recent notification.
- Modal struk setelah checkout.
- Riwayat order dan detail struk.
- Manajemen produk, kategori, member, stok, order, dan user.
- Soft delete produk.
- Dashboard overview dengan summary, chart penjualan, dan top product.
- UI berbasis shadcn/ui.

## Struktur Project

```text
APP-POS-main/
  client/               Frontend React dan Vite
  server/               Backend Express dan Prisma
  README.md             Dokumentasi utama project
  LICENSE
```

## Teknologi

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- TanStack React Query
- Axios
- React Router
- Recharts
- Sonner
- Lucide React

Backend:

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Joi validation
- Multer upload
- Jest dan Supertest
- ESLint

## Prasyarat

Pastikan sudah tersedia:

- Node.js
- npm
- PostgreSQL atau Docker
- Git

Jika ingin memakai database dari Docker, gunakan file `server/docker-compose.yaml`.

## Setup Database

Masuk ke folder server:

```bash
cd server
```

Jalankan PostgreSQL dengan Docker:

```bash
docker compose up -d
```

Konfigurasi default di `server/docker-compose.yaml`:

```text
POSTGRES_USER=muggle
POSTGRES_PASSWORD=password
POSTGRES_DB=app-pos
PORT=5432
```

Contoh `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://muggle:password@localhost:5432/app-pos?schema=public"
```

## Environment Server

Buat file `.env` di folder `server`:

```bash
DATABASE_URL="postgresql://muggle:password@localhost:5432/app-pos?schema=public"
JWT_SECRET="isi_dengan_secret"
JWT_REFRESH_SCREET="isi_dengan_refresh_secret"
JWT_REFRESH_EXPIRES_IN="86400s"
PORT=3600
```

Catatan: nama environment `JWT_REFRESH_SCREET` mengikuti kode server yang ada saat ini.

## Setup Server

Masuk ke folder server:

```bash
cd server
```

Install dependency:

```bash
npm install
```

Push schema Prisma ke database:

```bash
npx prisma db push
```

Jalankan seed bila diperlukan:

```bash
npx prisma db seed
```

Jalankan server development:

```bash
npm run dev
```

Server berjalan di:

```bash
http://localhost:3600
```

API utama berada di:

```bash
http://localhost:3600/api
```

## Environment Client

Buat file `.env` di folder `client` jika ingin mengubah alamat API:

```bash
VITE_API_URL=http://localhost:3600/api
```

Jika tidak dibuat, client akan memakai default `http://localhost:3600/api`.

## Setup Client

Masuk ke folder client:

```bash
cd client
```

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Client biasanya berjalan di:

```bash
http://localhost:5173
```

Jika port sudah digunakan, Vite akan memilih port lain.

## Script Penting

Client:

```bash
cd client
npm run dev
npm run lint
npm run build
npm run preview
```

Server:

```bash
cd server
npm run dev
npm run lint
npm run test
```

Prisma:

```bash
cd server
npx prisma db push
npx prisma db seed
npx prisma studio
```

## Alur Penggunaan

1. Jalankan database PostgreSQL.
2. Jalankan server.
3. Jalankan client.
4. Login melalui halaman `/login`.
5. Gunakan halaman `/` untuk POS.
6. Gunakan halaman `/dashboard` untuk admin dashboard.

## Modul Client

Halaman utama:

- `client/src/pages/Login.tsx`
- `client/src/pages/POS.tsx`
- `client/src/pages/Dashboard.tsx`

Komponen penting:

- `client/src/components/AdminDataTable.tsx`
- `client/src/components/Modal.tsx`
- `client/src/components/ConfirmDialog.tsx`
- `client/src/components/ReceiptModal.tsx`
- `client/src/components/ui/`

Dokumentasi client lebih detail tersedia di:

```text
client/README.md
```

## Modul Server

Controller utama:

- `server/src/controller/product.controller.js`
- `server/src/controller/category.controller.js`
- `server/src/controller/member.controller.js`
- `server/src/controller/order.controller.js`
- `server/src/controller/stock.controller.js`
- `server/src/controller/analytics.controller.js`
- `server/src/controller/user.controller.js`

Route utama:

- `/api/products`
- `/api/categories`
- `/api/members`
- `/api/orders`
- `/api/stock`
- `/api/analytics`
- `/api/users`
- `/api/roles`

Schema database:

```text
server/prisma/schema.prisma
```

## Design System

Frontend menggunakan shadcn/ui sebagai dasar komponen. Komponen tersedia di:

```text
client/src/components/ui/
```

Panduan umum:

- Gunakan komponen shadcn/ui sebelum membuat komponen custom baru.
- Gunakan `lucide-react` untuk icon.
- Gunakan `cn` dari `client/src/lib/utils.ts` untuk komposisi className.
- Beberapa area memakai `rounded-none` agar tampilan lebih tegas dan cocok untuk aplikasi operasional.
- Hindari perubahan global token jika hanya ingin mengubah satu halaman.

## Validasi

Sebelum melanjutkan perubahan besar atau membuat commit, jalankan:

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm run lint
npm run test
```

## Catatan Development

- Jangan menghapus perubahan yang tidak dibuat sendiri tanpa konfirmasi.
- Jaga sinkronisasi antara varian produk, stok, dan keranjang.
- Untuk produk minuman, ukuran dan suhu berasal dari varian yang tersimpan di database.
- Checkout harus mengurangi stok melalui backend.
- Pembatalan order harus mengembalikan stok sesuai logic server.
- Produk menggunakan soft delete melalui `deletedAt`.
- Upload gambar produk disimpan melalui endpoint server dan folder upload publik.

## Lisensi

Lihat file `LICENSE`.
