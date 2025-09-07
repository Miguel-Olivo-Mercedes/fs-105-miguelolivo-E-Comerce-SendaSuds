import { useParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { API_ORIGIN } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, loading, error } = useProducts();
  const { add } = useCart();

  if (loading) return <main style={{ padding: 24 }}>Cargando…</main>;
  if (error)
    return (
      <main style={{ padding: 24, color: "crimson" }}>
        Error: {String(error)}
      </main>
    );

  const product = products.find((p) => p.slug === slug);
  if (!product) {
    return (
      <main className="container" style={{ padding: "24px 16px" }}>
        <p>No encontramos este producto.</p>
        <Link to="/catalog" style={{ color: "#0ea5e9" }}>
          ← Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "24px 16px" }}>
      <Link
        to="/catalog"
        style={{ color: "#0ea5e9", display: "inline-block", marginBottom: 12 }}
      >
        ← Volver
      </Link>

      <div className="two-col product-detail">
        <img
          src={`${API_ORIGIN}${product.image}`}
          alt={product.name}
          className="product-hero-img"
        />

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-sub">{product.short_description}</p>

          <dl className="product-meta">
            <dt>Uso</dt>
            <dd>{product.usage}</dd>
            <dt>Advertencias</dt>
            <dd>{product.warnings}</dd>
          </dl>

          <div className="price-row">
            <div className="price">€{Number(product.price).toFixed(2)}</div>
            <button className="add-btn" onClick={() => add(product.id, 1)}>
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
