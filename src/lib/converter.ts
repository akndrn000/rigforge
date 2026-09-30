/**
 * Parser + generator Lua.
 *
 * Parser (aturan pencocokan token) berasal dari fungsi `autoConvert` pada versi HTML asli
 * dan tidak diubah. Generator memakai TEMPLATE UNIVERSAL: setiap bagian punya jumlah slot
 * minimum (lihat `LAYERED_GROUPS` dan `ACCESSORY_GROUPS`).
 *
 *  - ID mengisi slot dari atas ke bawah; slot yang tidak terpakai tetap `AssetId = 0`.
 *  - Jika ID melebihi jumlah slot, baris baru otomatis ditambahkan ke bagian yang sama.
 *  - Tipe aksesori yang tidak ada di template dibuatkan bagian baru di akhir `Accessories`.
 *  - ID yang sama dalam satu bagian hanya ditulis sekali.
 */

export interface AvatarSummary {
  /** Bagian tubuh yang ID-nya ditemukan (Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg). */
  bodyParts: { found: number; total: number }
  /** Warna kulit: kode hex (mis. "#F2D7CD"), teks Body Color, atau "Pastel orange". */
  skinTone: string
  /** Pakaian klasik yang ditemukan (Pants, Shirt, TShirt). */
  classic: { found: number; total: number }
  /** Jumlah item pakaian berlapis yang datang dari blob. */
  layered: number
  /** Jumlah aksesori (daftar token + blob). */
  accessories: number
}

export interface ConversionResult {
  status: 'empty' | 'ok' | 'error'
  /** Isi panel output. */
  lua: string
  /** Teks penghitung baris pada panel input, mis. "3 baris". */
  lineStat: string
  /** Teks penghitung karakter pada panel output, mis. "2655 karakter tersusun". */
  charStat: string
  /** Ringkasan hasil deteksi (null jika kosong atau gagal). */
  summary: AvatarSummary | null
}

type AssetId = string | number

const BODY_EMPTY_LABEL = '0 karakter tersusun'

function assetLine(indent: string, id: AssetId, type: string): string {
  return `${indent}{ AssetId = ${id}, AccessoryType = "${type}" },\n`
}

interface SlotGroup {
  /** Nilai `AccessoryType` pada baris Lua. */
  type: string
  /** Jumlah slot minimum di template (slot yang tidak terpakai berisi `AssetId = 0`). */
  slots: number
}

interface AccessoryGroup extends SlotGroup {
  /** Nama token pada teks mentah, mis. `HairAccessory`. */
  token: string
}

/** Warna kulit bawaan jika tidak ada hex maupun teks `Body Color` pada data mentah. */
const DEFAULT_SKIN_TONE = 'Pastel orange'

/** Nilai tetap blok `Scaling` pada template. */
const SCALING: ReadonlyArray<readonly [string, number]> = [
  ['BodyType', 0],
  ['Depth', 0],
  ['Height', 0],
  ['Width', 0],
  ['Head', 0],
  ['Proportions', 0],
]

/** Urutan dan jumlah slot pada `Clothes.Layered`. */
const LAYERED_GROUPS: SlotGroup[] = [
  { type: 'LeftShoe', slots: 2 },
  { type: 'RightShoe', slots: 2 },
  { type: 'TShirt', slots: 3 },
  { type: 'Shirt', slots: 3 },
  { type: 'Pants', slots: 3 },
  { type: 'Shorts', slots: 3 },
  { type: 'DressSkirt', slots: 3 },
  { type: 'Sweater', slots: 3 },
  { type: 'Jacket', slots: 4 },
]

/** Urutan dan jumlah slot pada `Accessories`. */
const ACCESSORY_GROUPS: AccessoryGroup[] = [
  { type: 'Hat', slots: 3, token: 'Hat' },
  { type: 'Hair', slots: 3, token: 'HairAccessory' },
  { type: 'Face', slots: 7, token: 'FaceAccessory' },
  { type: 'Front', slots: 3, token: 'FrontAccessory' },
  { type: 'Neck', slots: 3, token: 'NeckAccessory' },
  { type: 'Back', slots: 3, token: 'BackAccessory' },
  { type: 'Shoulder', slots: 3, token: 'ShoulderAccessory' },
  { type: 'Waist', slots: 3, token: 'WaistAccessory' },
]

/** Menambahkan ID ke daftar, dilewati jika ID yang sama sudah ada di daftar itu. */
function pushUnique(list: AssetId[], id: AssetId): void {
  if (!list.some((existing) => String(existing) === String(id))) list.push(id)
}

function uniqueIds(ids: AssetId[]): AssetId[] {
  const out: AssetId[] = []
  ids.forEach((id) => pushUnique(out, id))
  return out
}

function sumLengths(lists: Iterable<AssetId[]>): number {
  let total = 0
  for (const list of lists) total += list.length
  return total
}

/**
 * Menulis satu bagian template: ID mengisi slot dari atas, sisa slot berisi `AssetId = 0`,
 * dan jika ID lebih banyak dari slot, baris baru ditambahkan di bagian yang sama.
 */
function renderGroup(indent: string, ids: AssetId[], type: string, slots: number): string {
  const total = Math.max(ids.length, slots)
  let out = ''
  for (let i = 0; i < total; i++) out += assetLine(indent, i < ids.length ? ids[i] : 0, type)
  return out
}

export function convertAvatarData(raw: string): ConversionResult {
  const lines = raw.split('\n').length
  const lineStat = lines + (lines === 1 ? ' baris' : ' baris')

  try {
    if (!raw.trim()) {
      return { status: 'empty', lua: '', lineStat, charStat: BODY_EMPTY_LABEL, summary: null }
    }

    // Parser khusus TShirt untuk menangkap berbagai variasi penulisan (TShirt, T-Shirt, Tshirt)
    const getNumberStrict = (key: string): string => {
      let regex: RegExp
      if (key === 'TShirt') {
        regex = /(?:^|[^a-zA-Z])(?:T-?Shirt|Tshirt)\s*:\s*([0-9]+)/i
      } else {
        regex = new RegExp('(?:^|[^a-zA-Z])' + key + '\\s*:\\s*([0-9]+)', 'i')
      }
      const match = raw.match(regex)
      return match ? match[1] : '0'
    }

    const getList = (key: string): string[] => {
      const regex = new RegExp('(?:^|[^a-zA-Z])' + key + '\\s*:\\s*([0-9, \\n\\r]+)', 'i')
      const match = raw.match(regex)
      if (!match) return []
      return match[1]
        .split(/[,|\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !isNaN(s as unknown as number))
    }

    const head = getNumberStrict('DynamicHead') !== '0' ? getNumberStrict('DynamicHead') : getNumberStrict('Head')
    const torso = getNumberStrict('Torso')
    const leftArm = getNumberStrict('LeftArm')
    const rightArm = getNumberStrict('RightArm')
    const leftLeg = getNumberStrict('LeftLeg')
    const rightLeg = getNumberStrict('RightLeg')

    const skinToneMatch = raw.match(/\(#([A-Fa-f0-9]{6})\)/)
    const skinTone = skinToneMatch
      ? '#' + skinToneMatch[1].toUpperCase()
      : raw.match(/Body Color:\s*([^\n]+)/i)?.[1]?.trim() || DEFAULT_SKIN_TONE

    const pantsClass = getNumberStrict('Pants')
    const shirtClass = getNumberStrict('Shirt')
    const tshirtClass = getNumberStrict('TShirt')

    // Wadah ID per bagian template. Urutan ID: daftar token dulu, lalu item blob.
    const layered = new Map<string, AssetId[]>(LAYERED_GROUPS.map((g) => [g.type, []]))
    const accessories = new Map<string, AssetId[]>(ACCESSORY_GROUPS.map((g) => [g.type, uniqueIds(getList(g.token))]))
    // Tipe aksesori yang tidak ada di template: dibuatkan bagian baru (urutan kemunculan).
    const extraGroups = new Map<string, AssetId[]>()

    const blobMatch = raw.match(/AccessoryBlob Data:\s*(\[.*\])/s)
    if (blobMatch) {
      try {
        const blobJson: unknown = JSON.parse(blobMatch[1])
        if (Array.isArray(blobJson)) {
          // `any` disengaja: item yang bukan objek harus memicu error yang sama seperti versi asli.
          blobJson.forEach((item: any) => {
            const type = item.AccessoryType
            const id = item.AssetId

            const bucket = layered.get(type) ?? accessories.get(type)
            if (bucket) {
              pushUnique(bucket, id)
            } else {
              const key = String(type)
              if (!extraGroups.has(key)) extraGroups.set(key, [])
              pushUnique(extraGroups.get(key)!, id)
            }
          })
        }
      } catch (e) {
        console.error('Gagal memparsing JSON Blob', e)
      }
    }

    let lua = `return {\n`
    lua += `\tIsData = true,\n`
    lua += `\tIsUserId = false,\n`
    lua += `\tUserId = 0,\n\n`

    lua += `\tBody = {\n`
    lua += `\t\tHead = ${head},\n`
    lua += `\t\tTorso = ${torso},\n`
    lua += `\t\tLeftArm = ${leftArm},\n`
    lua += `\t\tRightArm = ${rightArm},\n`
    lua += `\t\tLeftLeg = ${leftLeg},\n`
    lua += `\t\tRightLeg = ${rightLeg},\n`
    lua += `\t},\n\n`

    lua += `\tScaling = {\n`
    SCALING.forEach(([key, value]) => {
      lua += `\t\t${key} = ${value},\n`
    })
    lua += `\t},\n\n`

    lua += `\tSkinTone = "${skinTone}",\n\n`
    lua += `\tFace = 0,\n\n`

    lua += `\tClothes = {\n`
    lua += `\t\tClassic = {\n`
    lua += `\t\t\tPants = ${pantsClass},\n`
    lua += `\t\t\tShirt = ${shirtClass},\n`
    lua += `\t\t\tTShirt = ${tshirtClass},\n`
    lua += `\t\t},\n\n`

    lua += `\t\tLayered = {\n`
    lua += LAYERED_GROUPS.map((g) => renderGroup('\t\t\t', layered.get(g.type)!, g.type, g.slots)).join('\n')
    lua += `\t\t},\n`
    lua += `\t},\n\n`

    lua += `\tAccessories = {\n`
    const accessoryBlocks = [
      ...ACCESSORY_GROUPS.map((g) => renderGroup('\t\t', accessories.get(g.type)!, g.type, g.slots)),
      ...[...extraGroups].map(([type, ids]) => renderGroup('\t\t', ids, type, 0)),
    ]
    lua += accessoryBlocks.join('\n')
    lua += `\t},\n`
    lua += `}\n`

    const bodyIds = [head, torso, leftArm, rightArm, leftLeg, rightLeg]
    const classicIds = [pantsClass, shirtClass, tshirtClass]
    const summary: AvatarSummary = {
      bodyParts: { found: bodyIds.filter((v) => v !== '0').length, total: bodyIds.length },
      skinTone,
      classic: { found: classicIds.filter((v) => v !== '0').length, total: classicIds.length },
      layered: sumLengths(layered.values()),
      accessories: sumLengths(accessories.values()) + sumLengths(extraGroups.values()),
    }

    return { status: 'ok', lua, lineStat, charStat: lua.length + ' karakter tersusun', summary }
  } catch (error) {
    const message = (error as Error).message
    const lua = `-- [SISTEM ERROR]\n-- Terjadi kesalahan saat memproses data Anda.\n-- Error Detail: ${message}`
    console.error('Konversi gagal:', error)
    return { status: 'error', lua, lineStat, charStat: 'Gagal dikonversi', summary: null }
  }
}
