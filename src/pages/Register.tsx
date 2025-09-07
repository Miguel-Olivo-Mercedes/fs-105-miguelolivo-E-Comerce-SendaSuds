import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

/* ==== Iconos minimal para mostrar/ocultar contraseña ==== */
function EyeOpen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7zm0 2C8.6 7 5.7 9.4 4.3 12 5.7 14.6 8.6 17 12 17s6.3-2.4 7.7-5C18.3 9.4 15.4 7 12 7zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z"/>
    </svg>
  );
}
function EyeClosed() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M2 3.3 3.3 2l18.7 18.7-1.3 1.3-3-3A12.6 12.6 0 0 1 12 19c-5 0-9-4.5-10-7a18 18 0 0 1 5.5-6.2L2 3.3Zm14.2 12.9-2.1-2.1a3.5 3.5 0 0 1-4.5-4.5L7.7 7.6C5.8 8.8 4.3 10.4 3.4 12c1.4 2.6 4.3 5 8.6 5 2 0 3.7-.5 5.2-1.3ZM12 7c.7 0 1.4.1 2 .3l-1.6 1.6A2.5 2.5 0 0 0 9.9 11l-1.6 1.6A3.5 3.5 0 0 1 12 7Z"/>
    </svg>
  );
}

/* ==== Input de contraseña con botón “ojo” ==== */
function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  setShow,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  setShow: (v: boolean) => void;
  autoComplete?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, paddingRight: 44 }}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        style={eyeBtnStyle}
      >
        {show ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirm) {
      return setError("Completa todos los campos");
    }
    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }
    if (password !== confirm) {
      return setError("Las contraseñas no coinciden");
    }

    setLoading(true);
    try {
      await register(name, email, password);
      nav("/profile");
    } catch (e: any) {
      setError(e?.response?.data?.msg || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 240px)",
        padding: "32px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          padding: 24,
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 24, textAlign: "center" }}>
          REGISTRO
        </h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            autoComplete="name"
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
          />

          <PasswordInput
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            show={showPass}
            setShow={setShowPass}
            autoComplete="new-password"
          />

          <PasswordInput
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            setShow={setShowConfirm}
            autoComplete="new-password"
          />

          {error && (
            <div
              style={{
                background: "#ffeef0",
                color: "#b00020",
                border: "1px solid #ffd4d9",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              border: "none",
              borderRadius: 10,
              background: "#000",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: 0.6,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ textDecoration: "underline" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ==== estilos reutilizados ==== */
const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 16,
};

const eyeBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid #e7e7e7",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};
