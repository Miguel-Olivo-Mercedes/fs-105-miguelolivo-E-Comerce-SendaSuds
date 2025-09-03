import { Link } from "react-router-dom"
import { cardColorsFor } from "../lib/cardPalette"
import { useProducts } from "../context/ProductsContext"
import { useCart } from "../context/CartContext"
import { API_ORIGIN } from "../api"

export default function Catalog() {
  const { products, loading, error, refresh } = useProducts()
  const { add } = useCart()

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>
  if (error) return (
    <div style={{ padding: 24, color: "crimson" }}>
      Error: {error} <button onClick={refresh}>Reintentar</button>
    </div>
  )

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: 16 }}>Catálogo</h1>

      <div
        className="catalog-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="catalog-card"
            style={{
              border: `1px solid ${cardColorsFor(p.slug, p.name).border}`,
              borderRadius: 12,
              overflow: "hidden",
              background: cardColorsFor(p.slug, p.name).bg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link to={`/product/${p.slug}`} style={{ display: "block" }}>
              <img
                src={`${API_ORIGIN}${p.image}`}
                alt={p.name}
                style={{ width: "100%", height: 220, objectFit: "cover" }}
              />
            </Link>

            <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
              <Link to={`/product/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>{p.name}</h3>
              </Link>

              <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="catalog-add"
                  aria-label={`Añadir ${p.name} al carrito`}
                  onClick={() => add(p.id, 1)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: "#b87333", // cobre
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
