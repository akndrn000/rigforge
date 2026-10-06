import { Icon } from './Icon'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__in">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <div className="site-footer__brandrow">
              <span className="brand__mark" aria-hidden="true">
                <Icon name="brackets" size={16} />
              </span>
              <p className="site-footer__name">RigForge</p>
            </div>
            <p className="site-footer__tag">
              Konverter Avatar Roblox ke Lua untuk Roblox Studio
            </p>
          </div>

          <p className="site-footer__text">
            Alat independen — tidak berafiliasi dengan Roblox Corporation. Roblox adalah merek
            dagang Roblox Corporation.
          </p>

          <p className="site-footer__text">
            Data yang Anda tempel diproses langsung di browser — tanpa server, tanpa analytics,
            tanpa pelacak.
          </p>
        </div>
        <div className="site-footer__bar">
          <span>&copy; 2026 RigForge</span>
          <span>diproses lokal di browser</span>
        </div>
      </div>
    </footer>
  )
}
