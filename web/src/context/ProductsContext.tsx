import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { api } from '../api'
import type { Product } from '../types'

type ProductsState = {
  products: Product[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ProductsCtx = createContext<ProductsState | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.get<Product[]>('/products')
      setProducts(data)
    } catch (e: any) {
      setError(e?.response?.data?.msg || 'No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const value = useMemo(() => ({ products, loading, error, refresh: load }), [products, loading, error])
  return <ProductsCtx.Provider value={value}>{children}</ProductsCtx.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsCtx)
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  return ctx
}
