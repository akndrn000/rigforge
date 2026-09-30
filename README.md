# RigForge

Konverter data mentah avatar Roblox menjadi script Lua untuk Roblox Studio. Semua proses berjalan di browser, tanpa server dan tanpa login. Satu halaman, satu alat: tempel data di kiri, salin hasil Lua di kanan.

**Parser tidak diubah** (aturan pencocokan token, `DynamicHead`, varian TShirt, dan seterusnya). **Generator memakai template universal**:

- Setiap bagian punya jumlah slot minimum (mis. `Hat` 3, `Face` 7, `Jacket` 4). Lihat `LAYERED_GROUPS` dan `ACCESSORY_GROUPS` di `src/lib/converter.ts`.
- ID mengisi slot dari atas ke bawah, sisa slot tetap `AssetId = 0`.
- Jika ID melebihi jumlah slot, baris baru otomatis ditambahkan **di bagian yang sama**.
- Tipe aksesori yang tidak ada di template dibuatkan **bagian baru** di akhir `Accessories`.
- Item blob bertipe aksesori (`Hat`, `Hair`, dst.) digabung dengan daftar token yang sama. ID identik dalam satu bagian hanya ditulis sekali.

Tes di `src/lib/converter.test.ts` mengunci perilaku ini, termasuk bahwa input tanpa ID menghasilkan template persis seperti yang ditentukan (26 kasus snapshot di `src/lib/__fixtures__/golden.json`).

## Isi halaman

Situs ini hanya punya satu halaman tanpa routing (tidak ada hash URL, tidak ada library routing):

- **Statusbar** tipis di bawah header: badge baris data, karakter hasil, status konversi (Siap/Kosong/Gagal/Memproses), deteksi bagian tubuh, dan tombol utama **Generate Paksa**.
- Input data mentah + tombol **Contoh Data** (dari `src/lib/sample.ts`); keterangan format singkat ada di dalam panel ("satu token per baris `Token: id1, id2`, atau tempel blob `AccessoryBlob Data`").
- Panel output Lua dengan tombol **Salin Kode** dan **Unduh .lua**.
- Ringkasan hasil deteksi (bagian tubuh, warna kulit, pakaian, aksesori) di bawah panel.
- Footer latar gelap dengan border kuning tebal: disclaimer merek dagang Roblox dan catatan privasi.

Tema terang/gelap bisa ditukar lewat tombol di header dan tersimpan di `localStorage`. Kedua mode memakai token warna yang sama per peran (lihat `src/styles/tokens.css`).

## Teknologi

- Vite + React 19 + TypeScript
- CSS biasa dengan design token, gaya neobrutalism (border tebal, hard shadow tanpa blur, aksen kuning)
- Font di-host sendiri lewat Fontsource (tanpa Google Fonts)
- Vitest untuk tes logika

## Menjalankan di komputer

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tes logika konversi
npm run build      # hasil di folder dist
npm run preview    # coba hasil build di http://localhost:4173
```

## Deploy ke Vercel

**Lewat GitHub (disarankan)**

1. Buat repository baru di GitHub, lalu push isi folder ini.
2. Buka <https://vercel.com/new> dan impor repository tersebut.
3. Vercel mendeteksi Vite otomatis (`vercel.json` sudah mengatur build dan header keamanan). Klik **Deploy**.

**Lewat Vercel CLI**

```bash
npx vercel          # deploy pratinjau
npx vercel --prod   # deploy produksi
```

### Domain sendiri

Tambahkan domain di **Project > Settings > Domains**. Agar canonical, Open Graph, `robots.txt`, dan `sitemap.xml` memakai domain itu, tambahkan environment variable:

```
SITE_URL = https://domainkamu.com
```

Tanpa variable ini, build otomatis memakai URL produksi dari Vercel (`VERCEL_PROJECT_PRODUCTION_URL`). `robots.txt` dan `sitemap.xml` dibuat saat build oleh plugin di `vite.config.ts`.

## Struktur proyek

```
src/
  App.tsx               Susunan halaman tunggal: Header + Converter + Footer
  components/
    Converter.tsx       Alat utama: input, output, tombol aksi, ringkasan
    Header.tsx          Nama produk + tagline + tombol tema
    Footer.tsx          Disclaimer merek dagang + catatan privasi
    Icon.tsx            Set ikon SVG sendiri
  hooks/useTheme.ts     Tema terang/gelap (tersimpan di localStorage)
  lib/
    converter.ts        Parser + generator Lua (inti; ubah jumlah slot di LAYERED_GROUPS / ACCESSORY_GROUPS)
    converter.test.ts   Tes snapshot + tes perilaku template universal
    __fixtures__/golden.json   Snapshot 26 kasus uji (input, output Lua)
    sample.ts           Data contoh (tombol "Contoh Data")
  styles/               tokens.css (warna dan font), base.css, site.css
public/                 favicon, ikon iOS, gambar Open Graph
```

## Kustomisasi

- **Warna dan font:** `src/styles/tokens.css`. Semua kotak (input, tombol, panel) memakai `--bw`/`--bw-lg` untuk ketebalan border dan `--shadow*` untuk hard shadow; varian terang dan gelap diatur di blok `:root` dan `[data-theme='dark']`.
- **Teks halaman:** `src/components/Converter.tsx`, `Header.tsx`, `Footer.tsx`.
- **Nilai Scaling di Lua** (BodyType, Depth, Height, dan seterusnya) dan warna kulit bawaan (`Pastel orange`) ditulis tetap di `converter.ts` (konstanta `SCALING` dan `DEFAULT_SKIN_TONE`). Jika diubah, perbarui `golden.json` karena outputnya ikut berubah.
- **Gambar pratinjau link** (`public/og-image.png`, 1200x630) bisa diganti dengan desain sendiri.

## Catatan

- Nama "Roblox" adalah merek dagang Roblox Corporation, dipakai hanya untuk menjelaskan fungsi alat. Footer memuat pernyataan bahwa situs ini tidak berafiliasi.
- Situs tidak memakai analytics atau pelacak apa pun. Data yang ditempel tidak dikirim ke mana-mana.
