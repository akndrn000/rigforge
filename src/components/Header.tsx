import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Icon } from './Icon'

export function Header() {
  const { theme, toggle } = useTheme()
  const action = theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'
  // Lapisan gerak saja: putaran ikon saat ganti tema.
  const [swapping, setSwapping] = useState(false)
  const swapTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(swapTimer.current), [])

  const onToggle = () => {
    toggle()
    setSwapping(true)
    window.clearTimeout(swapTimer.current)
    swapTimer.current = window.setTimeout(() => setSwapping(false), 350)
  }

  return (
    <header className="site-header">
      <div className="container site-header__in">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="brackets" size={26} />
          </span>
          <div className="brand__text">
            <h1 className="brand__name">RigForge</h1>
          </div>
          <span className="deco-zig" aria-hidden="true">
            <svg width="44" height="16" viewBox="0 0 44 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M2 12 L10 4 L18 12 L26 4 L34 12 L42 4" stroke="var(--c-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={action}
          title={action}
          className={swapping ? 'icon-btn is-swapping' : 'icon-btn'}
          onClick={onToggle}
        >
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={24} />
        </button>
      </div>
    </header>
  )
}
