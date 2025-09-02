import { API_ORIGIN } from '../api'
import { useProducts } from '../context/ProductsContext'

export default function Catalog() {
  const { products, loading, error, refresh } = useProducts()

  if (loading) return <p>Cargando…</p>
  if (error) return (
    <div>
      <p style={{ color: 'crimson' }}>{error}</p>
      <button onClick={refresh}>Reintentar</button>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {products.map(p => (
        <article key={p.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
          {p.image && (
            <img
              src={`${API_ORIGIN}${p.image}`}
              alt={p.name}
              style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}
            />
          )}
          <h3 style={{ marginTop: 8 }}>{p.name}</h3>
          <p style={{ opacity: 0.8 }}>{p.short_description}</p>
          <strong>CHF {p.price.toFixed(2)}</strong>
        </article>
      ))}
    </div>
  )
}
