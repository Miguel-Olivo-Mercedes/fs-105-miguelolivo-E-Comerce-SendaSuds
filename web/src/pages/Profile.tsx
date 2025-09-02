import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refreshMe, updateMe, deleteMe } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [current_password, setCurrentPassword] = useState('')
  const [new_password, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { refreshMe().catch(() => {}) }, [])
  useEffect(() => { setName(user?.name || ''); setEmail(user?.email || '') }, [user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null); setError(null)
    try {
      await updateMe({ name, email, current_password: current_password || undefined, new_password: new_password || undefined })
      setMsg('Perfil actualizado'); setCurrentPassword(''); setNewPassword('')
    } catch (e: any) {
      setError(e?.response?.data?.msg || 'Error al actualizar')
    }
  }

  const onDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return
    try { await deleteMe() } catch (e: any) {
      setError(e?.response?.data?.msg || 'Error al eliminar la cuenta')
    }
  }

  return (
    <div>
      <h2>Mi perfil</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <label>Nombre <input value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Email <input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <details>
          <summary>Cambiar contraseña</summary>
          <input placeholder="Contraseña actual" type="password" value={current_password} onChange={e => setCurrentPassword(e.target.value)} />
          <input placeholder="Nueva contraseña (min 6)" type="password" value={new_password} onChange={e => setNewPassword(e.target.value)} />
        </details>
        {msg && <p style={{ color: 'green' }}>{msg}</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button>Guardar cambios</button>
          <button type="button" onClick={onDelete} style={{ background: '#eee' }}>Eliminar cuenta</button>
        </div>
      </form>
    </div>
  )
}
