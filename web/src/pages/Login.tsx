import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Completa email y contraseña");
    setLoading(true);
    try {
      await login(email, password);
      nav("/profile");
    } catch (e: any) {
      setError(e?.response?.data?.msg || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        // Centrado y empuje para que el footer quede al fondo
        minHeight: "calc(100vh - 240px)", // ajusta si tu header/footer son más altos
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
          ENTRAR
        </h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
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
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ textDecoration: "underline" }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 16,
};
