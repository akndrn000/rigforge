import { useTheme } from '../hooks/useTheme'
import { Icon } from './Icon'

export function Header() {
  const { theme, toggle } = useTheme()
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
          className="icon-btn"
          onClick={toggle}
          aria-label={`Ganti ke tema ${next}`}
          title={`Ganti ke tema ${next}`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
    </header>
  )
}
