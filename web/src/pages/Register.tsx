import { FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name || !email || !password) return setError('Completa todos los campos')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(name, email, password)
      nav('/profile')
    } catch (e: any) {
      setError(e?.response?.data?.msg || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button disabled={loading}>{loading ? 'Creando…' : 'Crear cuenta'}</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Entrar</Link></p>
    </div>
  )
}
