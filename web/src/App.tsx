import { Route, Routes, Link } from 'react-router-dom'
import Catalog from './pages/Catalog'

export default function App() {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><h1>Senda de Suds</h1></Link>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Catálogo</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Catalog />} />
      </Routes>
    </div>
  )
}
