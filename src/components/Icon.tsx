import type { ReactNode } from 'react'

/** Set ikon sendiri: stroke 1.6 dan sudut membulat, dipakai untuk judul panel,
 *  tombol aksi, serta status di footer panel. */
export type IconName =
  | 'moon' | 'prompt' | 'brackets' | 'trash' | 'download' | 'copy' | 'sample' | 'refresh'
  | 'info' | 'arrow' | 'arrow-right' | 'check' | 'shield' | 'sun' | 'target'
  | 'file' | 'layers' | 'chevron' | 'user' | 'alert'

const PATHS: Record<IconName, ReactNode> = {
  moon: (
    <>
      <path d="M20.4 13.8A8.6 8.6 0 1 1 10.2 3.6a6.7 6.7 0 0 0 10.2 10.2z" />
      <circle cx="18.4" cy="5.6" r="1.9" />
    </>
  ),
  // Bingkai bulat berisi caret + garis bawah, merujuk pada panel "data mentah".
  prompt: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="4" />
      <path d="M7 10.2l3 2.3-3 2.3" />
      <line x1="12" y1="15.3" x2="15.5" y2="15.3" />
    </>
  ),
  // Kurung sudut ganda untuk "kode hasil", digambar tidak simetris dan renggang.
  brackets: (
    <>
      <path d="M9.5 5.5L4 12l5.5 6.5" />
      <path d="M14.5 5.5L20 12l-5.5 6.5" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7.5h14" />
      <path d="M9 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 5.8v1.7" />
      <path d="M6.5 7.5l.9 11.2a2 2 0 0 0 2 1.8h5.2a2 2 0 0 0 2-1.8l.9-11.2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4.5 18.5v1.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-1.2" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2H8" />
    </>
  ),
  // Dua garis pendek + satu panjang: melambangkan "baris contoh", bukan petir/keajaiban.
  sample: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="15" y2="12" />
      <line x1="4" y1="17" x2="18" y2="17" />
    </>
  ),
  // Panah melingkar untuk "proses ulang", menggantikan ikon tongkat sihir.
  refresh: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.6 5.5" />
      <path d="M17.2 3.8v3.4h-3.4" />
      <path d="M6.8 20.2v-3.4h3.4" />
    </>
  ),
  info: (<><circle cx="12" cy="12" r="9" /><line x1="12" y1="15.5" x2="12" y2="11" /><circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none" /></>),
  // Segitiga berisi seru: status gagal, dipakai pill di footer panel output.
  alert: (
    <>
      <path d="M12 4.2L21 19.4H3z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  arrow: (<><line x1="4.5" y1="12" x2="18" y2="12" /><path d="M13.5 6.5L19 12l-5.5 5.5" /></>),
  'arrow-right': (<><line x1="4.5" y1="12" x2="18" y2="12" /><path d="M13.5 6.5L19 12l-5.5 5.5" /></>),
  check: <path d="M4.5 12.5l4.5 4.5L19.5 7" />,
  shield: (
    <>
      <path d="M12 3.2l7.2 2.7v6.2c0 5-3 7.9-7.2 9.7-4.2-1.8-7.2-4.7-7.2-9.7V5.9z" />
      <path d="M8.8 12l2.3 2.3 4.1-4.3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.8v2.1M12 19.1v2.1M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" strokeDasharray="0 4.2" strokeLinecap="round" />
    </>
  ),
  target: (<><circle cx="12" cy="12" r="9" strokeDasharray="2 4.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></>),
  file: (<><path d="M13.5 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.2z" /><path d="M13.5 3v3.8a1 1 0 0 0 1 1H18" /><line x1="8.6" y1="13" x2="15.4" y2="13" /><line x1="8.6" y1="16.4" x2="13" y2="16.4" /></>),
  layers: (<><path d="M12 3.5l8.2 4.5L12 12.5 3.8 8z" /><path d="M4.5 12.2L12 16.3l7.5-4.1" /><path d="M4.5 15.9L12 20l7.5-4.1" /></>),
  chevron: <path d="M6.5 9.5L12 15l5.5-5.5" />,
  user: (<><path d="M19 20.5v-1.8a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1.8" /><circle cx="12" cy="7.5" r="3.6" /></>),
}

interface IconProps {
  name: IconName
  size?: number
  /** Isi solid (dipakai untuk logo bulan). */
  filled?: boolean
  className?: string
}

export function Icon({ name, size = 16, filled = false, className }: IconProps) {
  return (
    <svg
      className={['icon', filled ? 'icon--filled' : '', className ?? ''].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
