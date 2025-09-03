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
      await updateMe({
        name,
        email,
        current_password: current_password || undefined,
        new_password: new_password || undefined
      })
      setMsg('Perfil actualizado')
      setCurrentPassword(''); setNewPassword('')
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

  // estilos minimalistas (igual patrón que login/registro)
  const wrapStyle: React.CSSProperties = {
    minHeight: 'calc(100vh - 180px)',
    display: 'grid',
    placeItems: 'center',
    padding: '24px 16px'
  }
  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 480,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: 24
  }
  const formStyle: React.CSSProperties = { display: 'grid', gap: 12 }
  const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 14 }
  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 8,
    outline: 'none'
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 12px' }}>Mi perfil</h2>

        <form onSubmit={onSubmit} style={formStyle}>
          <label style={labelStyle}>
            Nombre
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
          </label>

          <label style={labelStyle}>
            Email
            <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <details>
            <summary>Cambiar contraseña</summary>
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              <input
                style={inputStyle}
                placeholder="Contraseña actual"
                type="password"
                value={current_password}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <input
                style={inputStyle}
                placeholder="Nueva contraseña (min 6)"
                type="password"
                value={new_password}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
          </details>

          {msg && <p style={{ color: 'green', margin: 0 }}>{msg}</p>}
          {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button>Guardar cambios</button>
            <button type="button" onClick={onDelete} style={{ background: '#eee' }}>
              Eliminar cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
