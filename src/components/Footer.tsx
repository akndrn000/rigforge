export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="brand__name">RigForge</span>
          <p>Ubah data avatar Roblox jadi script Lua siap pakai.</p>
        </div>

        <p className="site-footer__legal">
          Alat independen, tidak berafiliasi dengan Roblox Corporation. Roblox adalah merek dagang Roblox
          Corporation.
        </p>

        <p className="site-footer__legal">
          Tanpa analytics dan tanpa pelacak. Data yang Anda tempel diproses di browser Anda saja dan tidak
          dikirim ke mana-mana.
        </p>
      </div>
      <div className="container site-footer__bar">
        <span>&copy; {new Date().getFullYear()} RigForge</span>
        <span className="mono-note">diproses lokal di browser</span>
      </div>
    </footer>
  )
}
