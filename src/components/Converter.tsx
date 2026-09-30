import { useEffect, useMemo, useRef, useState } from 'react'
import { convertAvatarData, type ConversionResult } from '../lib/converter'
import { SAMPLE_DATA } from '../lib/sample'
import { Icon, type IconName } from './Icon'

/** Nama file unduhan (sama seperti versi HTML asli). */
const DOWNLOAD_FILENAME = 'AvatarConfig.lua'

/** Jeda sebelum konversi berjalan: paste besar tidak menahan render tiap ketikan,
 *  dan "Memproses…" punya waktu tampil dengan jujur (konversinya sinkron). */
const DEBOUNCE_MS = 200

/** Badge status di statusbar. Teks status converter (lineStat/charStat) tidak diubah. */
const STATUS_BADGE: Record<ConversionResult['status'], { cls: string; icon: IconName; label: string }> = {
  empty: { cls: 'badge badge--empty', icon: 'info', label: 'Kosong' },
  ok: { cls: 'badge badge--ok', icon: 'check', label: 'Siap' },
  error: { cls: 'badge badge--err', icon: 'alert', label: 'Gagal' },
}

export function Converter() {
  // Seperti versi asli: saat halaman dimuat, data contoh langsung terisi.
  const [raw, setRaw] = useState<string>(SAMPLE_DATA)
  // Nilai yang sudah dikonversi; selisih dengan raw = masih memproses.
  const [doneRaw, setDoneRaw] = useState<string>(SAMPLE_DATA)
  // Naik setiap kali "Generate Paksa" ditekan, memaksa konversi dijalankan ulang.
  const [forceRun, setForceRun] = useState(0)
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (raw === doneRaw) return
    const id = window.setTimeout(() => setDoneRaw(raw), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [raw, doneRaw])

  const pending = raw !== doneRaw
  const result = useMemo(() => convertAvatarData(doneRaw), [doneRaw, forceRun])

  useEffect(() => {
    if (forceRun === 0) return
    setFlash(true)
    const id = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(id)
  }, [forceRun])

  /** Terapkan nilai sekaligus (Contoh Data / Reset): hasil muncul tanpa jeda debounce. */
  const applyRaw = (value: string) => {
    setRaw(value)
    setDoneRaw(value)
  }

  const loadSample = () => applyRaw(SAMPLE_DATA)
  const clearInput = () => applyRaw('')
  const generateNow = () => {
    setDoneRaw(raw) // Generate tidak boleh tertahan debounce
    setForceRun((n) => n + 1)
  }

  /** Hasil terbaru untuk aksi salin/unduh, walau debounce belum jalan. */
  const currentResult = (): ConversionResult => (raw === doneRaw ? result : convertAvatarData(raw))

  const copyOutput = async () => {
    const lua = currentResult().lua
    if (!lua) return
    try {
      await navigator.clipboard.writeText(lua)
    } catch {
      // Cadangan untuk browser/konteks tanpa Clipboard API
      const el = outputRef.current
      if (!el) return
      el.select()
      document.execCommand('copy')
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const downloadLua = () => {
    const lua = currentResult().lua
    if (!lua) return
    const blob = new Blob([lua], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = DOWNLOAD_FILENAME
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const { summary } = result
  const badge = STATUS_BADGE[result.status]
  const skinIsHex = summary ? /^#[0-9A-F]{6}$/i.test(summary.skinTone) : false

  return (
    <>
      <div className="statusbar">
        <div className="container statusbar__in">
          <div className="statusbar__badges">
            <span className="badge">{result.lineStat}</span>
            <span className="badge hide-xs">{result.charStat}</span>
            {pending ? (
              <span className="badge badge--pending" aria-live="polite">
                <span className="badge__dot" aria-hidden="true" />
                Memproses…
              </span>
            ) : (
              <span className={badge.cls} aria-live="polite">
                <Icon name={badge.icon} />
                {badge.label}
              </span>
            )}
            {summary && (
              <span className="badge">
                {summary.bodyParts.found} dari {summary.bodyParts.total} bagian tubuh
              </span>
            )}
          </div>
          <button type="button" className="btn btn--primary statusbar__run" onClick={generateNow}>
            <Icon name="refresh" />
            <span>Generate Paksa</span>
          </button>
        </div>
      </div>

      <section className="section section--tool" aria-label="Konverter data avatar ke script Lua">
        <div className="container">
          <div className="bench">
            <div className="bench__seam" aria-hidden="true">
              <Icon name="arrow" />
            </div>

            <section className="pane pane--input" aria-label="Data mentah">
              <div className="pane__head">
                <label htmlFor="inputData" className="pane__title">
                  <Icon name="prompt" />
                  <span>Data mentah</span>
                </label>
                <div className="pane__tools">
                  <button
                    type="button"
                    className="btn btn--sm btn--sample"
                    onClick={loadSample}
                    aria-label="Contoh Data"
                  >
                    <Icon name="sample" />
                    <span className="hide-sm">Contoh Data</span>
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm btn--danger" onClick={clearInput} aria-label="Reset">
                    <Icon name="trash" />
                    <span className="hide-sm">Reset</span>
                  </button>
                </div>
              </div>

              <p className="pane__note">
                Satu token per baris <code>Token: id1, id2</code>, atau tempel blob{' '}
                <code>AccessoryBlob Data</code>.
              </p>

              <div className="editor">
                <textarea
                  id="inputData"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  spellCheck={false}
                  placeholder={
                    'Tempel data mentah avatar di sini...\n\ncontoh:\nHead: 78735857422004\nTShirt: 74448624601125\nBody Color: 242,215,205 (#F2D7CD)'
                  }
                />
              </div>
            </section>

            <section className="pane pane--output" aria-label="Hasil Lua">
              <div className="pane__head">
                <div className="pane__title">
                  <Icon name="brackets" />
                  <span>Hasil Lua</span>
                </div>
                <div className="pane__tools">
                  <button type="button" className="btn btn--sm" onClick={downloadLua} aria-label="Unduh .lua">
                    <Icon name="download" />
                    <span className="hide-sm">Unduh .lua</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm btn--copy"
                    onClick={copyOutput}
                    aria-live="polite"
                  >
                    {copied ? (
                      <>
                        <Icon name="check" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Icon name="copy" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={flash ? 'editor editor--flash' : 'editor'}>
                <textarea
                  ref={outputRef}
                  id="outputData"
                  value={result.lua}
                  readOnly
                  spellCheck={false}
                  aria-label="Output Script Lua"
                  placeholder="Hasil Lua muncul di sini..."
                />
              </div>
            </section>
          </div>

          {summary && (
            <dl className="summary" aria-label="Ringkasan hasil deteksi">
              <div className="summary__item">
                <dt>Bagian tubuh</dt>
                <dd>
                  {summary.bodyParts.found} dari {summary.bodyParts.total} terdeteksi
                </dd>
              </div>
              <div className="summary__item">
                <dt>Warna kulit</dt>
                <dd>
                  {skinIsHex && <span className="swatch" style={{ background: summary.skinTone }} aria-hidden="true" />}
                  <span className="mono">{summary.skinTone}</span>
                </dd>
              </div>
              <div className="summary__item">
                <dt>Pakaian klasik</dt>
                <dd>
                  {summary.classic.found} dari {summary.classic.total} terdeteksi
                </dd>
              </div>
              <div className="summary__item">
                <dt>Pakaian berlapis</dt>
                <dd>{summary.layered} item dari blob</dd>
              </div>
              <div className="summary__item">
                <dt>Aksesori</dt>
                <dd>{summary.accessories} item</dd>
              </div>
            </dl>
          )}
          {summary && (
            <p className="summary__note">
              Bagian yang tidak ditemukan berisi <code>0</code> atau <code>AssetId = 0</code>.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
