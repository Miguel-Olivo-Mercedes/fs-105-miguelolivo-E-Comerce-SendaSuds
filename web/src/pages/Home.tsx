import { useMemo, useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { API_ORIGIN } from "../api";
import { Link } from "react-router-dom";
import { cardColorsFor } from "../lib/cardPalette";

export default function Home() {
  const { products, loading, error } = useProducts();
  const [showMore, setShowMore] = useState(false);

  // Cuatro destacados por slug/nombre
  const featured = useMemo(() => {
    const want = new Set(["carbon-activo", "citrico-amanecer", "menta-alpina", "rosa-mosqueta"]);
    const bySlug = products.filter(p => p.slug && want.has(p.slug));
    if (bySlug.length >= 4) return bySlug.slice(0, 4);

    const names = new Set(["Carbón Activo", "Cítrico Amanecer", "Menta Alpina", "Rosa Mosqueta"]);
    const byName = products.filter(p => names.has(p.name));
    return (bySlug.length ? bySlug : byName).slice(0, 4);
  }, [products]);

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>Error: {String(error)}</div>;

  return (
    <div style={{ padding: "24px 32px 48px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 20px" }}>Destacados</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {featured.map(p => {
          const { bg, border, shadow } = cardColorsFor(p.slug, p.name);
          const img =
            (p as any).image_url ||
            `${API_ORIGIN}/api/static/products/${p.slug}.jpg`;

          return (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              style={{
                border: `1px solid ${border}`,
                borderRadius: 12,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                boxShadow: `0 6px 18px ${shadow}, 0 1px 2px rgba(0,0,0,.03)`,
                background: bg,
                transition: "transform .15s ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/10",
                  overflow: "hidden",
                  background: "transparent",
                }}
              >
                <img
                  src={img}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>

              <div style={{ padding: "12px 14px 16px" }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {p.name}
                </h3>
                {/* Precio oculto en Home */}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Sobre nosotros con desplegable */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Sobre nosotros</h2>
        <p style={{ margin: 0, color: "#555", maxWidth: 760 }}>
          Nacimos con una idea sencilla: jabones honestos, hechos a mano y con ingredientes que respetan tu piel y el planeta.
        </p>
        {showMore && (
          <p style={{ marginTop: 12, color: "#666", maxWidth: 760 }}>
            Empezamos en un taller pequeño y hoy seguimos formulando lotes reducidos para asegurar frescura y calidad.
            Trabajamos con aceites vegetales, fragancias suaves y empaques reciclables.
            Cada pastilla cuenta una historia: de cuidado, de calma y de rutinas más conscientes.
          </p>
        )}
        <button
          onClick={() => setShowMore(v => !v)}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          aria-expanded={showMore}
        >
          {showMore ? "Leer menos ▲" : "Leer más ▼"}
        </button>
      </section>
    </div>
  );
}
