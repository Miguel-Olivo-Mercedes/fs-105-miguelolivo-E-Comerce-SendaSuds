// web/src/pages/Success.tsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Success() {
  const q = new URLSearchParams(useLocation().search);
  const id = q.get("session_id");

  const { clear } = useCart();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await clear();         // limpia carrito (invitado o logueado)
      } catch {
        setErr("No se pudo vaciar el carrito automáticamente.");
      } finally {
        setDone(true);
      }
    })();
  }, [clear]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 240px)",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>¡Pago completado!</h2>

        {id ? (
          <p style={{ marginTop: 0 }}>
            Tu sesión de pago es: <code>{id}</code>
          </p>
        ) : (
          <p style={{ marginTop: 0 }}>Gracias por tu compra.</p>
        )}

        <p style={{ color: "#555", marginTop: 8 }}>
          {done
            ? "Hemos vaciado tu carrito."
            : "Procesando…"}
        </p>

        {err && (
          <p style={{ color: "crimson", marginTop: 8 }}>
            {err}
          </p>
        )}

        <div style={{ marginTop: 14 }}>
          <Link to="/catalog" style={{ textDecoration: "underline" }}>
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
