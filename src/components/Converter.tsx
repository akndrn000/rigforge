import { useEffect, useMemo, useRef, useState } from 'react'
import { convertAvatarData, type ConversionResult } from '../lib/converter'
import { SAMPLE_DATA } from '../lib/sample'
import { Icon } from './Icon'

/** Jeda sebelum konversi berjalan: paste besar tidak menahan render tiap ketikan. */
const DEBOUNCE_MS = 200

export function Converter() {
  // Seperti versi asli: saat halaman dimuat, data contoh langsung terisi.
  const [raw, setRaw] = useState<string>(SAMPLE_DATA)
  // Nilai yang sudah dikonversi; selisih dengan raw = masih memproses.
  const [doneRaw, setDoneRaw] = useState<string>(SAMPLE_DATA)
  // Naik setiap kali "Generate Paksa" ditekan, memaksa konversi dijalankan ulang.
  const [forceRun, setForceRun] = useState(0)
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState(false)
  // Lapisan gerak saja: putaran ikon Generate selama jendela visual.
  const [spinning, setSpinning] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)
  // Ref visual (lepas-pasang class tanpa render ulang, tanpa konversi).
  const benchRef = useRef<HTMLDivElement>(null)
  const outPaneRef = useRef<HTMLElement>(null)
  const firstResult = useRef(true)
  const spinTimer = useRef<number | undefined>(undefined)
  const copyTimer = useRef<number | undefined>(undefined)
  const shakeTimer = useRef<number | undefined>(undefined)

  /* Bersihkan timer visual saat lepas. */
  useEffect(() => () => {
    window.clearTimeout(spinTimer.current)
    window.clearTimeout(copyTimer.current)
    window.clearTimeout(shakeTimer.current)
  }, [])

  useEffect(() => {
    if (raw === doneRaw) return
    const id = window.setTimeout(() => setDoneRaw(raw), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [raw, doneRaw])

  const result = useMemo(() => convertAvatarData(doneRaw), [doneRaw, forceRun])

  /* Setiap hasil baru tampil dari atas: kembalikan scroll editor output
     ke 0 supaya tidak ada posisi scroll nyasar (khususnya horizontal). */
  useEffect(() => {
    const el = outputRef.current
    if (!el) return
    el.scrollTop = 0
    el.scrollLeft = 0
  }, [result.lua])

  useEffect(() => {
    if (forceRun === 0) return
    setFlash(true)
    const id = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(id)
  }, [forceRun])

  /* Kedip lembut sekali tiap hasil berubah (visual saja): lepas-pasang
     class sehingga animasi selalu mulai ulang; lewati render pertama
     (sudah tercakup animasi masuk). Tidak memicu konversi tambahan. */
  useEffect(() => {
    if (firstResult.current) {
      firstResult.current = false
      return
    }
    const el = outPaneRef.current
    if (!el) return
    el.classList.remove('editor--pulse')
    void el.offsetWidth
    el.classList.add('editor--pulse')
  }, [result.lua])

  /** Terapkan nilai sekaligus (Contoh Data / Reset): hasil muncul tanpa jeda debounce. */
  const applyRaw = (value: string) => {
    setRaw(value)
    setDoneRaw(value)
  }

  const loadSample = () => applyRaw(SAMPLE_DATA)
  const clearInput = () => {
    // Bergetar hanya bila ada isi yang dihapus (visual saja).
    if (raw !== '') {
      const bench = benchRef.current
      if (bench) {
        bench.classList.remove('is-shaking')
        void bench.offsetWidth
        bench.classList.add('is-shaking')
        window.clearTimeout(shakeTimer.current)
        shakeTimer.current = window.setTimeout(() => bench.classList.remove('is-shaking'), 300)
      }
    }
    applyRaw('')
  }
  const generateNow = () => {
    setDoneRaw(raw) // Generate tidak boleh tertahan debounce
    setForceRun((n) => n + 1)
    // Ikon berputar selama jendela visual 500ms; konversi sendiri sinkron.
    window.clearTimeout(spinTimer.current)
    setSpinning(true)
    spinTimer.current = window.setTimeout(() => setSpinning(false), 500)
  }

  /** Hasil terbaru untuk aksi salin, walau debounce belum jalan. */
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
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  const hasOutput = Boolean(result.lua)
  const hasError = result.status === 'error'

  return (
    <>
      <section className="section section--tool" aria-label="Konverter data avatar ke script Lua">
        <div className="container">
          <div className="bench" ref={benchRef}>
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
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={clearInput}
                    aria-label="Reset"
                  >
                    <Icon name="trash" />
                    <span className="hide-sm">Reset</span>
                  </button>
                </div>
              </div>

              <div className="editor">
                <textarea
                  id="inputData"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  spellCheck={false}
                  placeholder={
                    'Tempel data mentah avatar di sini...\n\nContoh:\nHead: 78735857422004\nTShirt: 74448624601125\nBody Color: 242,215,205 (#F2D7CD)'
                  }
                />
              </div>
            </section>

            <section className="pane pane--output" aria-label="Hasil Lua" ref={outPaneRef}>
              <span className="deco-burst" aria-hidden="true">
                <svg width="38" height="38" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
                  <polygon points="50.0,2.0 59.8,13.3 74.0,8.4 76.9,23.1 91.6,26.0 86.7,40.2 98.0,50.0 86.7,59.8 91.6,74.0 76.9,76.9 74.0,91.6 59.8,86.7 50.0,98.0 40.2,86.7 26.0,91.6 23.1,76.9 8.4,74.0 13.3,59.8 2.0,50.0 13.3,40.2 8.4,26.0 23.1,23.1 26.0,8.4 40.2,13.3" fill="var(--c-orange)" stroke="var(--c-black)" strokeWidth="4" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="pane__head">
                <div className="pane__title">
                  <Icon name="brackets" />
                  <span>Hasil Lua</span>
                </div>
                <div className="pane__tools">
                  <button
                    type="button"
                    className={
                      spinning
                        ? 'btn btn--primary btn--sm is-spinning'
                        : 'btn btn--primary btn--sm'
                    }
                    onClick={generateNow}
                    aria-label="Generate Paksa"
                  >
                    <Icon name="refresh" />
                    <span>Generate Paksa</span>
                  </button>
                  <button
                    type="button"
                    className={
                      copied ? 'btn btn--sm btn--copy btn--copied' : 'btn btn--sm btn--copy'
                    }
                    onClick={copyOutput}
                    disabled={!hasOutput}
                  >
                    {copied ? (
                      <Icon name="check" className="icon--pop" />
                    ) : (
                      <Icon name="copy" />
                    )}
                    <span>Salin Kode</span>
                  </button>
                  <span className="sr-only" role="status">
                    {copied ? 'Kode Lua berhasil disalin.' : ''}
                  </span>
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
              {hasError && (
                <p className="pane__error" role="alert">
                  {result.charStat}
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
