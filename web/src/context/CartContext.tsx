import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { api } from '../api'
import { useAuth } from './AuthContext'
import type { Product } from '../types'

export type CartLine = {
  product: Product
  qty: number
}

type CartState = {
  items: CartLine[]
  subtotal: number
  totalQty: number
  loading: boolean
  add: (productId: number, qty: number) => Promise<void>           // incrementa qty (delta)
  update: (productId: number, qty: number) => Promise<void>        // setea qty absoluta
  remove: (productId: number) => Promise<void>
  clear: () => Promise<void>
  refresh: (opts?: { silent?: boolean }) => Promise<void>
}

const CartCtx = createContext<CartState | undefined>(undefined)

/* ---------------------- Guest (localStorage) helpers ---------------------- */
const GKEY = 'cart_guest_v1'

// cache simple de productos para el modo invitado
let _productsCache: Product[] | null = null
async function loadProductsOnce(): Promise<Product[]> {
  if (_productsCache) return _productsCache
  const { data } = await api.get<Product[]>('/products')
  _productsCache = data
  return data
}

type GuestLine = { product_id: number, qty: number }

function readGuestRaw(): GuestLine[] {
  try { return JSON.parse(localStorage.getItem(GKEY) || '[]') } catch { return [] }
}
function writeGuestRaw(lines: GuestLine[]) {
  localStorage.setItem(GKEY, JSON.stringify(lines))
}

/* ------------------------------ CartProvider ------------------------------ */
export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<CartLine[]>([])
  const [loading, setLoading] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, l) => sum + Number(l.product?.price || 0) * Number(l.qty || 0), 0),
    [items]
  )
  const totalQty = useMemo(
    () => items.reduce((sum, l) => sum + Number(l.qty || 0), 0),
    [items]
  )

  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  /* ------------------------------- REFRESH ------------------------------- */
  const refresh = async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent
    if (!silent) setLoading(true)
    try {
      if (!token) {
        // Invitado: mapear desde localStorage -> CartLine con productos del catálogo
        const raw = readGuestRaw()
        if (raw.length === 0) { setItems([]); return }
        const prods = await loadProductsOnce()
        const map = new Map<number, Product>(prods.map(p => [p.id, p]))
        const lines: CartLine[] = raw
          .map(r => {
            const p = map.get(r.product_id)
            if (!p) return null
            return { product: p, qty: Math.max(0, Number(r.qty || 0)) }
          })
          .filter(Boolean) as CartLine[]
        setItems(lines)
        return
      }

      // Autenticado: pedir al backend
      const { data } = await api.get('/cart', auth)
      const lines: CartLine[] = Array.isArray(data?.items)
        ? data.items.map((it: any) => ({ product: it.product, qty: Number(it.qty || 0) }))
        : []
      setItems(lines)
    } catch {
      // silenciar
    } finally {
      if (!silent) setLoading(false)
    }
  }

  /* ------------------------------ OPERACIONES ----------------------------- */

  // ADD: incrementa qty (delta). Invitado manipula localStorage. Autenticado usa POST /cart (incremental)
  const add = async (productId: number, delta: number) => {
    if (delta === 0) return

    if (!token) {
      // Invitado
      const raw = readGuestRaw()
      const idx = raw.findIndex(r => r.product_id === productId)
      if (idx >= 0) raw[idx].qty = Math.max(1, Number(raw[idx].qty || 0) + delta)
      else raw.push({ product_id: productId, qty: Math.max(1, delta) })
      writeGuestRaw(raw)
      await refresh({ silent: true })
      return
    }

    // Autenticado: POST /cart incrementa qty (UI optimista)
    const prev = items
    const next = [...items]
    const i = next.findIndex(l => l.product.id === productId)
    if (i >= 0) {
      next[i] = { ...next[i], qty: next[i].qty + delta }
    } else {
      // si no está, recupera el producto para pintarlo optimista
      try {
        const prods = await loadProductsOnce()
        const p = prods.find(p => p.id === productId)
        if (p) next.push({ product: p, qty: Math.max(1, delta) })
      } catch {}
    }
    setItems(next)
    try {
      await api.post('/cart', { product_id: productId, qty: delta }, auth)
      await refresh({ silent: true })
    } catch {
      setItems(prev) // revertir si falla
    }
  }

  // UPDATE: setea qty absoluta. Invitado -> localStorage. Autenticado -> PUT /cart/<item_id> (o POST si no existe)
  const update = async (productId: number, qtyAbs: number) => {
    const qty = Math.max(0, Math.floor(Number(qtyAbs || 0)))

    if (!token) {
      // Invitado
      const raw = readGuestRaw()
      const idx = raw.findIndex(r => r.product_id === productId)
      if (idx < 0 && qty > 0) raw.push({ product_id: productId, qty })
      else if (idx >= 0) {
        if (qty <= 0) raw.splice(idx, 1)
        else raw[idx].qty = qty
      }
      writeGuestRaw(raw)
      await refresh({ silent: true })
      return
    }

    // Autenticado
    try {
      // Necesitamos item_id del backend para este productId
      const { data } = await api.get('/cart', auth)
      const item = (data?.items || []).find((it: any) => it?.product_id === productId)

      const prev = items
      const next = items.map(l => l.product.id === productId ? ({ ...l, qty }) : l)
      setItems(next) // optimista

      if (!item) {
        if (qty > 0) {
          // si no existía, POST con qty absoluta (delta = qty)
          await api.post('/cart', { product_id: productId, qty }, auth)
        }
        await refresh({ silent: true })
        return
      }

      if (qty <= 0) {
        await api.delete(`/cart/${item.id}`, auth)
      } else {
        await api.put(`/cart/${item.id}`, { qty }, auth)
      }
      await refresh({ silent: true })
    } catch {
      await refresh({ silent: true }) // vuelve al estado de servidor si falla
    }
  }

  const remove = async (productId: number) => {
    if (!token) {
      const raw = readGuestRaw().filter(r => r.product_id !== productId)
      writeGuestRaw(raw)
      await refresh({ silent: true })
      return
    }
    try {
      const { data } = await api.get('/cart', auth)
      const item = (data?.items || []).find((it: any) => it?.product_id === productId)
      if (item) await api.delete(`/cart/${item.id}`, auth)
    } finally {
      await refresh({ silent: true })
    }
  }

  const clear = async () => {
    if (!token) {
      writeGuestRaw([])
      await refresh({ silent: true })
      return
    }
    try {
      await api.delete('/cart', auth)
    } finally {
      await refresh({ silent: true })
    }
  }

  useEffect(() => { refresh() }, [token])

  const value: CartState = { items, subtotal, totalQty, loading, add, update, remove, clear, refresh }
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
