import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import "../styles.css"

export default function Header() {
  const { token, logout } = useAuth()
  const { items } = useCart()
  const totalQty = (items || []).reduce((sum: number, it: any) => sum + (it.qty || 0), 0)

  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container header-bar">
        <Link to="/" className="brand">Senda Suds</Link>

        <nav className="nav-right">
          {/* Catálogo (texto subrayable tipo pestaña) */}
          <NavLink
            to="/catalog"
            className={({ isActive }) => "link" + (isActive ? " active" : "")}
          >
            Catálogo
          </NavLink>

          {/* Carrito (icono + contador) */}
          <Link to="/cart" className="icon-btn" aria-label="Carrito" style={{ position: "relative" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#404553" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalQty > 0 && <span className="badge">{totalQty}</span>}
          </Link>

          {/* Perfil (icono con dropdown) */}
          <div className="dropdown-wrap">
            <button
              className="icon-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#404553" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21a8 8 0 1 0-16 0"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {open && (
              <div className="dropdown" role="menu" onMouseLeave={() => setOpen(false)}>
                {token ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)}>Perfil</Link>
                    <button onClick={() => { logout(); setOpen(false) }}>Salir</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>Iniciar sesión</Link>
                    <Link to="/register" onClick={() => setOpen(false)}>Crear cuenta</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
