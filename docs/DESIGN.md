# RigForge — Skala Desain

Satu sumber kebenaran untuk konsistensi visual RigForge (neobrutalism).
Nilai teknis ada di `src/styles/tokens.css`; file ini menjelaskan **peran**
tiap nilai dan aturan memakainya. Kalau menambah komponen baru, ikuti tabel
di sini — jangan memakai angka baru di luar skala.

Prinsip: **satu nilai per aspek per peran.** Tidak ada warna, ukuran, atau
jarak hardcode di `src/components/*` dan `src/styles/site.css` /
`base.css`; semuanya lewat `var(--…)`.

---

## 1. Border — hanya dua ketebalan

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--bw` | `3px` | Segala kotak biasa: panel, badge, kartu ringkasan, tombol biasa, kepala panel, header, footer, chip status, ikon coret (swatch), kode inline |
| `--bw-strong` | `4px` | Elemen yang ditekankan: tombol aksi utama (**Generate Paksa**, **Salin Kode** + status `Tersalin!`) dan cincin fokus keyboard (`:focus-visible`) |

Aturan:

- Tidak ada nilai border lain (`1px`, `2px`, `5px`, …) di mana pun.
- Tombol `--danger` (Reset) dan `--sample` (Contoh Data) memakai `--bw`;
  hanya aksi utama yang naik ke `--bw-strong`.
- `box-shadow` offset (`4px 4px 0`) bukan border — tetap `--shadow`.
- Cincin fokus: `outline: var(--bw-strong) solid var(--focus)`,
  `outline-offset: var(--bw)`; di dalam textarea offset-nya negatif
  (`calc(var(--bw) * -1)`) agar tidak terpotong tepi panel.

## 2. Radius — satu nilai

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--radius` | `0` | Semua kotak, **tanpa terkecuali** — termasuk titik sambungan dua panel (`bench__seam`) yang memang sengaja persegi. |

Kotak tanpa `border-radius` di CSS = radius 0 = konsisten. Jangan menambah
sudut membulat di komponen baru.

## 3. Font — satu tingkat per peran

| Token | Nilai | Peran |
| --- | --- | --- |
| `--fs-sm` | 13px | Label kecil / meta / badge status, hint, catatan (`summary__note`), label footer, tag brand, teks tombol `--sm` |
| `--fs-md` | 15px | Body normal (`body`), paragraf footer, tombol normal, `font: inherit` kontrol |
| `--fs-lg` | 17px | Judul panel (**Data mentah** / **Hasil Lua**) **dan** nilai statistik kartu ringkasan (`dd`) |
| `--fs-xl` | 22px | Judul sekunder: nama brand di footer, nama brand header di mobile (≤640px) |
| `--fs-2xl` | 26px | Nama brand utama (header desktop) |
| `--fs-code` | 14px | Isi area kode (textarea) |

Aturan:

- Peran sama → tingkat sama. Badge status = label = `--fs-sm`; judul panel =
  nilai kartu = `--fs-lg`.
- Tidak ada `font-size` literal di komponen (semua sudah dipindah ke token).
- Label kecil memakai `font-family: var(--font-mono)` + `font-weight: 600`
  (badge, `dt`, catatan); judul/nilai memakai `--font-display` + `800`.
- Letter-spacing display: −0.02em (judul panel/kartu) s/d −0.035em (brand);
  jangan di bawah −0.04em.

## 4. Spasi — kelipatan 4px

| Token | Nilai |
| --- | --- |
| `--s1` | 4px |
| `--s2` | 8px |
| `--s3` | 12px |
| `--s4` | 16px |
| `--s5` | 24px |
| `--s6` | 32px |
| `--s7` | 48px |

Set padding baku per komponen:

| Komponen | Padding |
| --- | --- |
| Badge status | `--s2 --s3` (8/12) |
| Tombol normal `.btn` | `--s2 --s4` (8/16) |
| Tombol kecil `.btn--sm` | `--s2 --s3` (8/12) |
| Ikon-tombol `.icon-btn` | `--s3` inline |
| Kepala panel `.pane__head` | `--s2 --s3` (8/12) |
| Kartu ringkasan | `--s3 --s4` (12/16) |
| Area editor textarea | `--s4 --s5` (16/24) |
| Container | `--s5` (24) / `--s4` (16, ≤640px) |
| Skip link | `--s2 --s4` (8/16, sama dengan `.btn`) |

Ritme antar-bagian halaman (semua jatuh di skala):

| Dari → ke | Jarak |
| --- | --- |
| Header → baris badge | 16px (`--s4`, padding atas statusbar) |
| Baris badge → bangku kerja (panel) | 48px (16px statusbar + 32px `section--tool`); di mobile 32px (16+16) |
| Panel → kartu ringkasan | 24px (`--s5`) |
| Kartu ringkasan → catatan | 16px (`--s4`) |
| Catatan / kartu → footer | 48px desktop / 32px mobile (`--s7` / `--s6`) |
| Dalam kepala panel (judul ↔ alat) | 12px (`--s3`) |
| Antar badge | 8px (`--s2`) |
| Dalam kartu (label → nilai) | 4px (`--s1`) |
| Grid footer (kolom) | 32px (`--s6`) |

## 5. Tinggi & ukuran elemen

| Token/nilai | Makna |
| --- | --- |
| `--tap` 44px | Tinggi semua tombol (`.btn`, `.icon-btn`) **di segala breakpoint**, tinggi baris alat panel (`.pane__tools`), lebar minimum ikon-tombol, dan target sentuh minimum. Kepala panel = `--tap + --s4` (60px) sehingga **kedua kepala selalu sama tinggi**. |
| Ikon 16px | Ikon inline bawaan (`Icon` default): judul panel, tombol, badge, seam. |
| Ikon 20px | Ikon di dalam kotak brand (logo header, sakelar tema). |
| Swatch warna 18px | Kotak contoh warna kulit di kartu ringkasan (khusus elemen ini). |
| `--header-h` 75px | Tinggi header (min-height `--header-h - --bw` + border 3px). |

## 6. Kontras (WCAG AA)

Wajib di **kedua tema** (terang & gelap):

- Teks normal ≥ **4.5:1**, teks besar/UI ≥ **3:1**.
- Teks di atas kuning (`--accent`) selalu `--accent-ink` (#0f0f0f) → ±13,4:1.
  Jangan pernah menaruh `--muted` di atas `--accent`.
- Chip `--ok` / `--danger` selalu dengan `--ok-ink` / `--danger-ink`.
- Area kode: slab `--code-bg` (= `--surface-2`, satu tingkat dari badan
  panel `--surface`) di kedua tema — bukan negatif/inversi. Teks dan garis
  kode memakai token halaman (`--ink` / `--muted` / `--line` lewat `--code-*`)
  sehingga kontras terjaga otomatis mengikuti tema. Garis di dalam panel
  output memakai `--code-line` (seam token yang saat ini = `--line`), bukan
  nilai garis tersendiri.
- Garis pemisah footer `--footer-line` = campuran 40% → ±3,5:1.
- Border/fokus/kontur interaktif ≥ 3:1 terhadap latar terdekatnya.

## 7. Layout panel

- `.bench` = grid 1 baris, `align-items: stretch`, tinggi
  `clamp(520px, 72dvh, 700px)` → **kedua panel selalu sama tinggi**.
- Di ≤767px panel ditumpuk; keduanya memakai `clamp(300px, 46vh, 420px)`
  yang sama → tetap sejajar; border bawah panel input jadi satu-satunya
  garis pemisah (panel output `border-top: 0`).
- Kartu ringkasan: grid 5 kolom → 2 kolom (≤900px, kartu terakhir
  `span 2`) → 1 kolom (≤640px); baris grid meregangkan kartu sehingga
  tinggi seragam per baris.

## 8. Daftar perbaikan audit (ringkasan)

Lihat riwayat commit untuk detail; versi singkat:

1. Border dikerem ke dua nilai (`--bw` / `--bw-strong`), termasuk cincin fokus.
2. Skala font dipakai penuh: body 15px dari token, judul panel 17px tetap
   (hilang `clamp`), brand mobile 22px (bukan 20px), tombol `--sm` 13px
   (bukan 14px).
3. Padding off-scale (6/10px badge, 10px tombol, 6px kode) diganti token.
4. Ritme halaman disamakan: 16 / 48 / 24 / 16 / 48 (desktop) dan
   16 / 32 / 24 / 16 / 32 (mobile).
5. Tinggi kontrol diseragamkan ke `--tap` 44px → kepala kedua panel
   identik, baris statusbar dan baris alat panel presisi.
6. Garis pemisah kepala panel output diperbaiki (`--code-line`, dulu
   `--line` ≈1,05:1 = tak terlihat).
7. Garis footer dinaikkan ke 40% campuran (±3,5:1, dulu ±2,7:1).
8. Ukuran ikon dikerem ke 16/20px (dulu 15/16/17/18/20).
9. Panel output disatukan dengan panel input: `--code-bg` = `--surface-2`
    (satu tingkat dari `--surface`) di kedua tema — dulu negatif/inversi
    total (terminal gelap di tema terang, kertas krem di tema gelap).
    Teks/garis kode mengikuti token halaman, jadi kontras ikut terjaga.
