import { describe, expect, it, vi } from 'vitest'
import { convertAvatarData } from './converter'
import { SAMPLE_DATA } from './sample'
import golden from './__fixtures__/golden.json'

type GoldenCase = { name: string; input: string; lineStat: string; charStat: string; lua: string }

describe('convertAvatarData: snapshot output template universal', () => {
  // Diam-kan console.error dari jalur blob JSON rusak agar log tes tetap bersih.
  vi.spyOn(console, 'error').mockImplementation(() => {})

  it.each(golden as GoldenCase[])('$name', ({ input, lineStat, charStat, lua }) => {
    const result = convertAvatarData(input)
    expect(result.lua).toBe(lua)
    expect(result.lineStat).toBe(lineStat)
    expect(result.charStat).toBe(charStat)
  })
})

describe('ringkasan hasil deteksi', () => {
  it('menghitung bagian tubuh, pakaian, dan aksesori dari data contoh', () => {
    const { status, summary } = convertAvatarData(SAMPLE_DATA)
    expect(status).toBe('ok')
    expect(summary).toEqual({
      bodyParts: { found: 6, total: 6 },
      skinTone: '#F2D7CD',
      classic: { found: 3, total: 3 },
      layered: 2,
      accessories: 2,
    })
  })

  it('kosong tidak menghasilkan ringkasan', () => {
    const result = convertAvatarData('')
    expect(result.status).toBe('empty')
    expect(result.summary).toBeNull()
  })
})

describe('perilaku token', () => {
  it('membaca TShirt dalam tiga variasi penulisan', () => {
    for (const text of ['TShirt: 1', 'T-Shirt: 1', 'Tshirt: 1']) {
      expect(convertAvatarData(text).lua).toContain('TShirt = 1,')
    }
  })

  it('token yang tidak ditemukan bernilai 0 dan slot kosong diisi AssetId = 0', () => {
    const { lua } = convertAvatarData('hello')
    expect(lua).toContain('Head = 0,')
    expect(lua).toContain('{ AssetId = 0, AccessoryType = "Face" },')
  })
})

/** Template universal dari pengguna (indentasi dan baris kosong diabaikan saat membandingkan). */
const UNIVERSAL_TEMPLATE = `return {
IsData = true,
IsUserId = false,
UserId = 0,
Body = {
Head = 0,
Torso = 0,
LeftArm = 0,
RightArm = 0,
LeftLeg = 0,
RightLeg = 0,
},
Scaling = {
BodyType = 0,
Depth = 0,
Height = 0,
Width = 0,
Head = 0,
Proportions = 0,
},
SkinTone = "Pastel orange",
Face = 0,
Clothes = {
Classic = {
Pants = 0,
Shirt = 0,
TShirt = 0,
},
Layered = {
{ AssetId = 0, AccessoryType = "LeftShoe" },
{ AssetId = 0, AccessoryType = "LeftShoe" },
{ AssetId = 0, AccessoryType = "RightShoe" },
{ AssetId = 0, AccessoryType = "RightShoe" },
{ AssetId = 0, AccessoryType = "TShirt" },
{ AssetId = 0, AccessoryType = "TShirt" },
{ AssetId = 0, AccessoryType = "TShirt" },
{ AssetId = 0, AccessoryType = "Shirt" },
{ AssetId = 0, AccessoryType = "Shirt" },
{ AssetId = 0, AccessoryType = "Shirt" },
{ AssetId = 0, AccessoryType = "Pants" },
{ AssetId = 0, AccessoryType = "Pants" },
{ AssetId = 0, AccessoryType = "Pants" },
{ AssetId = 0, AccessoryType = "Shorts" },
{ AssetId = 0, AccessoryType = "Shorts" },
{ AssetId = 0, AccessoryType = "Shorts" },
{ AssetId = 0, AccessoryType = "DressSkirt" },
{ AssetId = 0, AccessoryType = "DressSkirt" },
{ AssetId = 0, AccessoryType = "DressSkirt" },
{ AssetId = 0, AccessoryType = "Sweater" },
{ AssetId = 0, AccessoryType = "Sweater" },
{ AssetId = 0, AccessoryType = "Sweater" },
{ AssetId = 0, AccessoryType = "Jacket" },
{ AssetId = 0, AccessoryType = "Jacket" },
{ AssetId = 0, AccessoryType = "Jacket" },
{ AssetId = 0, AccessoryType = "Jacket" },
},
},
Accessories = {
{ AssetId = 0, AccessoryType = "Hat" },
{ AssetId = 0, AccessoryType = "Hat" },
{ AssetId = 0, AccessoryType = "Hat" },
{ AssetId = 0, AccessoryType = "Hair" },
{ AssetId = 0, AccessoryType = "Hair" },
{ AssetId = 0, AccessoryType = "Hair" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Face" },
{ AssetId = 0, AccessoryType = "Front" },
{ AssetId = 0, AccessoryType = "Front" },
{ AssetId = 0, AccessoryType = "Front" },
{ AssetId = 0, AccessoryType = "Neck" },
{ AssetId = 0, AccessoryType = "Neck" },
{ AssetId = 0, AccessoryType = "Neck" },
{ AssetId = 0, AccessoryType = "Back" },
{ AssetId = 0, AccessoryType = "Back" },
{ AssetId = 0, AccessoryType = "Back" },
{ AssetId = 0, AccessoryType = "Shoulder" },
{ AssetId = 0, AccessoryType = "Shoulder" },
{ AssetId = 0, AccessoryType = "Shoulder" },
{ AssetId = 0, AccessoryType = "Waist" },
{ AssetId = 0, AccessoryType = "Waist" },
{ AssetId = 0, AccessoryType = "Waist" },
},
}`

const normalize = (lua: string) =>
  lua
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

/** Baris `AssetId` pada satu tipe, sesuai urutan kemunculan. */
const idsOf = (lua: string, type: string): string[] =>
  [...lua.matchAll(new RegExp(`AssetId = (\\S+), AccessoryType = "${type}"`, 'g'))].map((m) => m[1])

describe('template universal', () => {
  it('input yang tidak berisi ID menghasilkan template persis seperti yang ditentukan', () => {
    expect(normalize(convertAvatarData('hello').lua)).toEqual(normalize(UNIVERSAL_TEMPLATE))
  })

  it('ID mengisi slot dari atas dan sisa slot tetap AssetId = 0', () => {
    const { lua } = convertAvatarData('Hat: 11')
    expect(idsOf(lua, 'Hat')).toEqual(['11', '0', '0'])
  })

  it('ID berlebih ditambahkan sebagai baris baru di bagian yang sama', () => {
    const { lua, summary } = convertAvatarData('Hat: 1, 2, 3, 4, 5')
    expect(idsOf(lua, 'Hat')).toEqual(['1', '2', '3', '4', '5'])
    expect(idsOf(lua, 'Hair')).toEqual(['0', '0', '0']) // bagian lain tidak terganggu
    expect(summary?.accessories).toBe(5)
  })

  it('pakaian berlapis dari blob juga bertambah di bagian yang sama saat melebihi slot', () => {
    const blob = Array.from({ length: 6 }, (_, i) => ({ AssetId: 100 + i, AccessoryType: 'Jacket' }))
    const { lua, summary } = convertAvatarData(`AccessoryBlob Data: ${JSON.stringify(blob)}`)
    expect(idsOf(lua, 'Jacket')).toEqual(['100', '101', '102', '103', '104', '105'])
    expect(idsOf(lua, 'Sweater')).toEqual(['0', '0', '0'])
    expect(summary?.layered).toBe(6)
  })

  it('item blob bertipe aksesori digabung ke bagian yang sama dengan daftar token', () => {
    const blob = [
      { AssetId: 3, AccessoryType: 'Hat' },
      { AssetId: 4, AccessoryType: 'Hat' },
    ]
    const { lua } = convertAvatarData(`Hat: 1, 2\nAccessoryBlob Data: ${JSON.stringify(blob)}`)
    expect(idsOf(lua, 'Hat')).toEqual(['1', '2', '3', '4'])
  })

  it('tipe aksesori yang tidak ada di template dibuatkan bagian baru setelah Waist', () => {
    const blob = [
      { AssetId: 7, AccessoryType: 'Eyebrow' },
      { AssetId: 8, AccessoryType: 'Eyelash' },
      { AssetId: 9, AccessoryType: 'Eyebrow' },
    ]
    const { lua, summary } = convertAvatarData(`AccessoryBlob Data: ${JSON.stringify(blob)}`)
    expect(idsOf(lua, 'Eyebrow')).toEqual(['7', '9'])
    expect(idsOf(lua, 'Eyelash')).toEqual(['8'])
    expect(lua.indexOf('AccessoryType = "Waist"')).toBeLessThan(lua.indexOf('AccessoryType = "Eyebrow"'))
    expect(summary?.accessories).toBe(3)
  })

  it('ID yang sama dalam satu bagian hanya ditulis sekali', () => {
    const blob = [{ AssetId: 1, AccessoryType: 'Hat' }]
    const { lua } = convertAvatarData(`Hat: 1, 2\nAccessoryBlob Data: ${JSON.stringify(blob)}`)
    expect(idsOf(lua, 'Hat')).toEqual(['1', '2', '0'])
  })
})

/** Jumlah slot per tipe, dibaca langsung dari template di atas (bukan dari kode converter). */
const slotsOf = (section: string): [string, number][] => {
  const counts = new Map<string, number>()
  for (const m of section.matchAll(/AccessoryType = "(\w+)"/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1)
  return [...counts]
}
const [layeredPart, accessoryPart] = UNIVERSAL_TEMPLATE.split('Accessories = {')
const LAYERED_SLOTS = slotsOf(layeredPart)
const ACCESSORY_SLOTS = slotsOf(accessoryPart)
const ALL_SLOTS = [...LAYERED_SLOTS, ...ACCESSORY_SLOTS]
const ACCESSORY_START = (lua: string) => lua.indexOf('Accessories = {')
const lineCount = (lua: string) => (lua.match(/\{ AssetId = /g) ?? []).length
const makeIds = (base: number, n: number) => Array.from({ length: n }, (_, i) => base + i)
const blobOf = (type: string, ids: number[]) => ids.map((AssetId) => ({ AssetId, AccessoryType: type }))
const tokenOf = (type: string) => (type === 'Hat' ? 'Hat' : `${type}Accessory`)

describe('template: nilai default', () => {
  it('Scaling bernilai 0 semua dan warna kulit bawaan Pastel orange', () => {
    const { lua } = convertAvatarData('hello')
    for (const key of ['BodyType', 'Depth', 'Height', 'Width', 'Head', 'Proportions']) {
      expect(lua).toContain(`\t\t${key} = 0,\n`)
    }
    expect(lua).toContain('SkinTone = "Pastel orange",')
  })

  it('warna kulit dari data tetap mengalahkan nilai bawaan', () => {
    expect(convertAvatarData('Body Color: 1,2,3 (#aabbcc)').lua).toContain('SkinTone = "#AABBCC",')
  })
})

describe('ID melebihi slot: baris baru sesuai tipe', () => {
  it('template acuan memuat 9 tipe berlapis dan 8 tipe aksesori', () => {
    expect(LAYERED_SLOTS).toHaveLength(9)
    expect(ACCESSORY_SLOTS).toHaveLength(8)
  })

  it.each(LAYERED_SLOTS)('berlapis %s (slot %i): slot+2 ID dari blob', (type, slots) => {
    const ids = makeIds(1000, slots + 2)
    const { lua, summary } = convertAvatarData(`AccessoryBlob Data: ${JSON.stringify(blobOf(type, ids))}`)
    expect(idsOf(lua, type)).toEqual(ids.map(String)) // semua ID ada, urutan terjaga, tipe sama
    expect(lineCount(lua)).toBe(lineCount(convertAvatarData('x').lua) + 2) // hanya bertambah 2 baris
    expect(lua.lastIndexOf(`AccessoryType = "${type}"`)).toBeLessThan(ACCESSORY_START(lua)) // tetap di Layered
    expect(summary?.layered).toBe(slots + 2)
  })

  it.each(ACCESSORY_SLOTS)('aksesori %s (slot %i): slot+2 ID dari token', (type, slots) => {
    const ids = makeIds(2000, slots + 2)
    const { lua, summary } = convertAvatarData(`${tokenOf(type)}: ${ids.join(', ')}`)
    expect(idsOf(lua, type)).toEqual(ids.map(String))
    expect(lineCount(lua)).toBe(lineCount(convertAvatarData('x').lua) + 2)
    expect(lua.indexOf(`AccessoryType = "${type}"`)).toBeGreaterThan(ACCESSORY_START(lua)) // tetap di Accessories
    expect(summary?.accessories).toBe(slots + 2)
  })

  it.each(ACCESSORY_SLOTS)('aksesori %s (slot %i): slot+2 ID dari blob', (type, slots) => {
    const ids = makeIds(3000, slots + 2)
    const { lua } = convertAvatarData(`AccessoryBlob Data: ${JSON.stringify(blobOf(type, ids))}`)
    expect(idsOf(lua, type)).toEqual(ids.map(String))
    expect(lineCount(lua)).toBe(lineCount(convertAvatarData('x').lua) + 2)
  })

  it.each(ACCESSORY_SLOTS)('aksesori %s (slot %i): token + blob digabung lalu melebihi slot', (type, slots) => {
    const fromToken = makeIds(4000, slots) // memenuhi semua slot
    const fromBlob = makeIds(5000, 2) // 2 tambahan
    const raw = `${tokenOf(type)}: ${fromToken.join(', ')}\nAccessoryBlob Data: ${JSON.stringify(blobOf(type, fromBlob))}`
    expect(idsOf(convertAvatarData(raw).lua, type)).toEqual([...fromToken, ...fromBlob].map(String))
  })

  it('semua tipe melebihi slot sekaligus, ditambah tipe baru: jumlah baris dan letaknya tepat', () => {
    const blob: { AssetId: number; AccessoryType: string }[] = []
    let next = 10_000
    for (const [type, slots] of ALL_SLOTS) blob.push(...blobOf(type, makeIds((next += 100), slots + 1)))
    blob.push(...blobOf('Eyebrow', makeIds(90_000, 2)), ...blobOf('Eyelash', makeIds(91_000, 1)))

    const { lua } = convertAvatarData(`AccessoryBlob Data: ${JSON.stringify(blob)}`)
    const totalSlots = ALL_SLOTS.reduce((sum, [, n]) => sum + n, 0)
    expect(lineCount(lua)).toBe(totalSlots + ALL_SLOTS.length + 3) // +1 per tipe, +3 tipe baru
    for (const [type, slots] of ALL_SLOTS) expect(idsOf(lua, type)).toHaveLength(slots + 1)
    expect(idsOf(lua, 'Eyebrow')).toEqual(['90000', '90001'])
    expect(idsOf(lua, 'Eyelash')).toEqual(['91000'])
  })
})
