import { useTheme } from '../hooks/useTheme'
import { Icon } from './Icon'

export function Header() {
  const { theme, toggle } = useTheme()
  const label = theme === 'dark' ? 'gelap' : 'terang'
  const next = theme === 'dark' ? 'terang' : 'gelap'

  return (
    <header className="site-header">
      <div className="container site-header__in">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="brackets" size={20} />
          </span>
          <div className="brand__text">
            <h1 className="brand__name">RigForge</h1>
            <span className="brand__tag">Ubah data avatar Roblox jadi script Lua siap pakai.</span>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={`Tema ${label}`}
          title={`Ganti ke tema ${next}`}
          className="icon-btn icon-btn--wide"
          onClick={toggle}
        >
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} />
          <span className="hide-xs">{label}</span>
        </button>
      </div>
    </header>
  )
}
