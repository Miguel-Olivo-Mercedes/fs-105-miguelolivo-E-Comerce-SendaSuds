import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useRef, useState } from "react";

/* Iconos inline (sin dependencias) */
function IconCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 21a8 8 0 0 0-16 0"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

export default function NavBar() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { items = [] } = useCart?.() || { items: [] as any[] };
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al clickar fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const count = useMemo(() => {
    try {
      // si el item tiene qty, sumamos qty; si no, 1 por item
      return items.reduce((acc: number, it: any) => acc + (Number(it.qty) || 1), 0);
    } catch { return 0; }
  }, [items]);

  const linkBase: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#111",
    lineHeight: 1,
  };

  const iconBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    position: "relative"
  };

  return (
    <nav
      style={{
        marginLeft: "auto",          // empuja todo el grupo a la derecha
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Catálogo (texto) */}
      <NavLink
        to="/catalog"
        style={({ isActive }) => ({
          ...linkBase,
          textDecoration: isActive ? "underline" : "none",
        })}
      >
        Catálogo
      </NavLink>

      {/* Carrito (icono + badge) */}
      <NavLink
        to="/cart"
        aria-label="Carrito"
        title="Carrito"
        style={{ textDecoration: "none" }}
      >
        <span style={iconBtn as React.CSSProperties}>
          <IconCart />
          {count > 0 && (
            <span
              aria-label={`${count} artículos en el carrito`}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: "#ef4444",
                color: "white",
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
                border: "2px solid white",
              }}
            >
              {count}
            </span>
          )}
        </span>
      </NavLink>

      {/* Perfil (icono). Si no hay token -> /login; si hay token -> dropdown */}
      {!token ? (
        <NavLink to="/login" aria-label="Login" title="Login" style={{ textDecoration: "none" }}>
          <span style={iconBtn}><IconUser /></span>
        </NavLink>
      ) : (
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            aria-haspopup="menu"
            aria-expanded={open}
            title="Perfil"
            onClick={() => setOpen(v => !v)}
            style={iconBtn}
          >
            <IconUser />
          </button>

          {open && (
            <div
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                minWidth: 200,
                padding: 8,
                boxShadow: "0 14px 40px rgba(0,0,0,.08)",
                zIndex: 1000
              }}
            >
              <NavLink
                to="/profile"
                style={{
                  ...linkBase,
                  display: "block",
                  padding: "10px 12px",
                  color: "#111",
                }}
                onClick={() => setOpen(false)}
              >
                Ver perfil
              </NavLink>
              <button
                onClick={() => {
                  try { logout(); } catch {}
                  setOpen(false);
                  navigate("/");
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "#111",
                }}
              >
                Salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
