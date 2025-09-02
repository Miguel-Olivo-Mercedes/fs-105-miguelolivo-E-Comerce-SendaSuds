import { FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) return setError('Completa email y contraseña')
    setLoading(true)
    try {
      await login(email, password)
      nav('/profile')
    } catch (e: any) {
      setError(e?.response?.data?.msg || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  )
}
