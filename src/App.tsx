import { useRef } from 'react'
import { Converter } from './components/Converter'
import { Footer } from './components/Footer'
import { Header } from './components/Header'

export default function App() {
  const mainRef = useRef<HTMLElement>(null)

  return (
    <>
      <a
        className="skip-link"
        href="#konten"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Lewati ke konten
      </a>
      <Header />
      <main id="konten" ref={mainRef} tabIndex={-1}>
        <Converter />
      </main>
      <Footer />
    </>
  )
}
