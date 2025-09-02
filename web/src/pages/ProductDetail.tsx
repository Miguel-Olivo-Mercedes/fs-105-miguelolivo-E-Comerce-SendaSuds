import { useParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { API_ORIGIN } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, loading, error } = useProducts();
  const { add } = useCart();

  if (loading) return <main style={{ padding: 24 }}>Cargando…</main>;
  if (error) return <main style={{ padding: 24, color: "crimson" }}>Error: {String(error)}</main>;

  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <main style={{ padding: 24 }}>
        <p>No encontramos este producto.</p>
        <Link to="/catalog" style={{ color: "#0ea5e9" }}>← Volver al catálogo</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <Link to="/catalog" style={{ color: "#0ea5e9", display: "inline-block", marginBottom: 12 }}>
        ← Volver
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <img
          src={`${API_ORIGIN}${product.image}`}
          alt={product.name}
          style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 12 }}
        />

        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            €{Number(product.price).toFixed(2)}
          </div>
          <p style={{ marginBottom: 16 }}>{product.short_description}</p>

          <button
            onClick={() => add(product.id, 1)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Añadir al carrito
          </button>

          <hr style={{ margin: "20px 0" }} />

          <dl style={{ margin: 0, lineHeight: 1.6 }}>
            <dt style={{ fontWeight: 700 }}>Uso</dt>
            <dd style={{ margin: "0 0 12px 0" }}>{product.usage}</dd>
            <dt style={{ fontWeight: 700 }}>Advertencias</dt>
            <dd style={{ margin: 0 }}>{product.warnings}</dd>
          </dl>
        </div>
      </div>
    </main>
  );
}
