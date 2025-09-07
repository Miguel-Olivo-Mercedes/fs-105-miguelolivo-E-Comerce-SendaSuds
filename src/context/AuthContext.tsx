import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { api } from '../api'

type User = { name: string; email: string }

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
  updateMe: (payload: { name?: string; email?: string; current_password?: string; new_password?: string }) => Promise<void>
  deleteMe: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t) {
      setToken(t)
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    }
    if (u) setUser(JSON.parse(u))
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.access_token)
    setUser({ name: data.name, email: data.email })
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
  }

  const register = async (name: string, email: string, password: string) => {
    await api.post('/auth/register', { name, email, password })
    await login(email, password)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const refreshMe = async () => {
    if (!token) return
    const { data } = await api.get('/me')
    setUser({ name: data.name, email: data.email })
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
  }

  const updateMe = async (payload: { name?: string; email?: string; current_password?: string; new_password?: string }) => {
    await api.put('/me', payload)
    await refreshMe()
  }

  const deleteMe = async () => {
    await api.delete('/me')
    logout()
  }

  const value = useMemo(() => ({
    user, token, loading, login, register, logout, refreshMe, updateMe, deleteMe
  }), [user, token, loading])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
