import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { api } from '../api'
import type { Product } from '../types'

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  refresh: () => void
  getBySlug: (slug: string) => Product | undefined
}

const ProductsCtx = createContext<ProductsState | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchAll = () => {
    setLoading(true)
    setError(null)
    api.get<Product[]>('/products')
      .then(r => setProducts(r.data))
      .catch(e => setError(e?.response?.data?.msg || 'Error cargando productos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchAll()
    }
  }, [])

  const getBySlug = (slug: string) => products.find(p => p.slug === slug)
  const value = useMemo(() => ({ products, loading, error, refresh: fetchAll, getBySlug }), [products, loading, error])
  return <ProductsCtx.Provider value={value}>{children}</ProductsCtx.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsCtx)
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  return ctx
}
