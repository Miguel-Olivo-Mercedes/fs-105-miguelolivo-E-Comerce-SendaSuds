import { Link } from 'react-router-dom'
import { API_ORIGIN } from '../api'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, loading, setQty, remove, clear } = useCart()

  if (loading) return <p>Cargando carrito…</p>
  if (!items.length) return (
    <div>
      <h2>Tu carrito está vacío</h2>
      <Link to="/">Ir al catálogo</Link>
    </div>
  )

  return (
    <div>
      <h2>Tu carrito</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {items.map(it => (
          <li key={it.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', border: '1px solid #eee', borderRadius: 12, padding: 8 }}>
            {it.product.image && <img src={`${API_ORIGIN}${it.product.image}`} alt={it.product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
            <div>
              <strong>{it.product.name}</strong>
              <div>CHF {it.product.price.toFixed(2)} ×
                <input
                  type="number" min={1} value={it.qty}
                  onChange={e => setQty(it.id, Math.max(1, Number(e.target.value)||1))}
                  style={{ width: 64, marginLeft: 8 }}
                />
              </div>
              <div style={{ opacity: .7 }}>Subtotal ítem: CHF {it.line_total.toFixed(2)}</div>
            </div>
            <button onClick={() => remove(it.id)} style={{ background: '#eee' }}>Eliminar</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button onClick={clear} style={{ background: '#eee' }}>Vaciar carrito</button>
        <strong>Total: CHF {subtotal.toFixed(2)}</strong>
      </div>
      <div style={{ marginTop: 16 }}>
        <button disabled>Continuar al pago (Stripe pronto)</button>
      </div>
    </div>
  )
}
