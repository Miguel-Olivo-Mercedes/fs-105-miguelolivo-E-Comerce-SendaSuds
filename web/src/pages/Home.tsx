import { useMemo, useState } from "react"
import { cardColorsFor } from "../lib/cardPalette"
import { useProducts } from "../context/ProductsContext"
import { API_ORIGIN } from "../api"
import { Link } from "react-router-dom"

export default function Home() {
  const { products, loading, error } = useProducts()
  const [aboutOpen, setAboutOpen] = useState(false)

  // Los cuatro destacados por slug o nombre (fallback)
  const featured = useMemo(() => {
    const want = new Set([
      "carbon-activo",
      "citrico-amanecer",
      "menta-alpina",
      "rosa-mosqueta",
    ])
    const bySlug = products.filter(p => p.slug && want.has(p.slug))
    if (bySlug.length >= 4) return bySlug

    // Fallback por nombre si por lo que sea cambió el slug
    const names = new Set([
      "Carbón Activo",
      "Cítrico Amanecer",
      "Menta Alpina",
      "Rosa Mosqueta",
    ])
    const byName = products.filter(p => names.has(p.name))
    return bySlug.length ? bySlug : byName
  }, [products])

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>
  if (error)   return <div style={{ padding: 24, color: "crimson" }}>Error: {error}</div>

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
          const img =
      const { bg, border, shadow } = cardColorsFor(p.slug, p.name);
            (p as any).image_url ||
            `${API_ORIGIN}/api/static/products/${p.slug}.jpg`

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
                {/* Precio oculto en Home a propósito */}
              </div>
            </Link>
          )
        })}
      </div>

      {/* --- Sobre nosotros (debajo del grid) --- */}
      <section
        aria-labelledby="about-title"
        style={{ maxWidth: 960, margin: "48px auto 0", padding: "0 16px" }}
      >
        <h2 id="about-title" style={{ fontSize: "1.5rem", marginBottom: 8 }}>
          Sobre nosotros
        </h2>

        {/* Este párrafo se oculta cuando el desplegable está abierto */}
        {!aboutOpen && (
          <p style={{ lineHeight: 1.65, color: "#374151", marginBottom: 8 }}>
            En Senda Suds hacemos jabones artesanales con recetas simples, efectivas y
            honestas. Usamos aceites y mantecas vegetales, esencias de origen responsable
            y curado lento en pequeños lotes. Queremos un cuidado cotidiano que huela bien,
            funcione de verdad y deje una huella ligera: sin plásticos, sin añadidos
            innecesarios, y con fórmulas que respetan tu piel y el planeta.
          </p>
        )}

        <details
          open={aboutOpen}
          onToggle={(e) => setAboutOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary style={{ cursor: "pointer", userSelect: "none" }}>
            {aboutOpen ? "-" : "+"}
          </summary>
          <div style={{ marginTop: 12, lineHeight: 1.65, color: "#4B5563" }}>
            <p style={{ margin: 0, marginBottom: 12 }}>
              Senda Suds nace de una idea sencilla: volver a lo esencial. Queríamos
              jabones que cuidaran la piel sin listas interminables de ingredientes y
              que, además, respetaran el entorno. Por eso trabajamos en lotes pequeños,
              con procesos artesanales y fórmulas pensadas para el día a día.
            </p>
            <p style={{ margin: 0, marginBottom: 12 }}>
              Seleccionamos aceites y mantecas de alta calidad (oliva, coco, karité,
              almendra), arcillas y extractos botánicos; evitamos colorantes agresivos y
              añadidos innecesarios. El curado lento asegura barras duraderas, espuma
              cremosa y suavidad real en la piel.
            </p>
            <p style={{ margin: 0 }}>
              Nuestros compromisos: zero plastic en el empaquetado, ingredientes
              mayoritariamente vegetales, proveedores locales cuando es posible y
              transparencia total. Si tu piel es sensible, mixta o seca, aquí encontrarás
              tu “senda” diaria: limpieza, hidratación y bienestar sin complicaciones.
            </p>
          </div>
        </details>
      </section>
    </div>
  )
}
