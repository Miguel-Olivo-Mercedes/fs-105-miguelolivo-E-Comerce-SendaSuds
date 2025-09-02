import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { api } from '../api'
import type { CartResponse } from '../types'
import { useAuth } from './AuthContext'

type CartState = {
  items: CartResponse['items']
  subtotal: number
  loading: boolean
  load: () => Promise<void>
  add: (product_id: number, qty?: number) => Promise<void>
  setQty: (item_id: number, qty: number) => Promise<void>
  remove: (item_id: number) => Promise<void>
  clear: () => Promise<void>
}

const CartCtx = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<CartResponse['items']>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!token) { setItems([]); setSubtotal(0); return }
    setLoading(true)
    try {
      const { data } = await api.get<CartResponse>('/cart')
      setItems(data.items); setSubtotal(data.subtotal)
    } finally {
      setLoading(false)
    }
  }

  const add = async (product_id: number, qty = 1) => {
    if (!token) throw new Error('login-required')
    await api.post('/cart', { product_id, qty })
    await load()
  }

  const setQty = async (item_id: number, qty: number) => {
    await api.put(`/cart/${item_id}`, { qty })
    await load()
  }

  const remove = async (item_id: number) => {
    await api.delete(`/cart/${item_id}`)
    await load()
  }

  const clear = async () => {
    await api.delete('/cart')
    await load()
  }

  useEffect(() => { load().catch(() => {}) }, [token])

  const value = useMemo(() => ({ items, subtotal, loading, load, add, setQty, remove, clear }), [items, subtotal, loading])
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
