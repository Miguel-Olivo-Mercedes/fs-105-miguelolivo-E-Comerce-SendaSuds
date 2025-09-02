import { Route, Routes, Link, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, logout } = useAuth()
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><h1>Senda de Suds</h1></Link>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Catálogo</Link>
          <Link to="/cart">Carrito</Link>
          {user ? (
            <>
              <Link to="/profile">Perfil</Link>
              <button onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Registro</Link>
            </>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </div>
  )
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth()
  if (loading) return <p>Cargando…</p>
  if (!token) return <Navigate to="/login" replace />
  return children
}
