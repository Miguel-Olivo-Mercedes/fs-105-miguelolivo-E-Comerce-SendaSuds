import React from "react";
import PaymentIcons from "../components/PaymentIcons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_ORIGIN } from "../api";

export default function Cart() {
  // Usamos "any" para ser resilientes a diferencias de tipado/props del contexto
  const cart = useCart() as any;
  const { items = [], subtotal = 0, remove, clear, loading } = cart;
  const { token } = useAuth();
  const navigate = useNavigate();

  // Derivado local: total de unidades en el carrito
  const totalQty: number = Array.isArray(items)
    ? items.reduce((s: number, l: any) => s + (l?.qty || 0), 0)
    : 0;

  // Updater compatible con varios nombres/métodos posibles del contexto
  const update = (id: number, qty: number) => {
    if (typeof cart.update === "function") return cart.update(id, qty);
    if (typeof cart.setQty === "function") return cart.setQty(id, qty);
    if (typeof cart.set === "function") return cart.set(id, qty);

    // Fallback con add/removeQty si existen
    if (typeof cart.add === "function") {
      const current =
        items.find((l: any) => l?.product?.id === id)?.qty || 0;
      const diff = qty - current;
      if (diff > 0) return cart.add(id, diff);
      if (diff < 0 && typeof cart.removeQty === "function")
        return cart.removeQty(id, -diff);
    }
  };

  const handleCheckout = async () => {
    if (!totalQty) return;

    const success_url =
      window.location.origin + "/success?session_id={CHECKOUT_SESSION_ID}";
    const cancel_url = window.location.origin + "/cart";

    if (!token) {
      // Invitado: creamos sesión con items del carrito
      const payload = {
        items: (items || []).map((l: any) => ({
          product_id: l?.product?.id,
          qty: l?.qty || 0,
        })),
        success_url,
        cancel_url,
      };

      try {
        const res = await fetch(
          import.meta.env.VITE_API_BASE + "/checkout/session_guest",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          alert(data?.msg || "No se pudo iniciar el checkout invitado");
        }
      } catch {
        alert("Error de red en checkout invitado");
      }
      return;
    }

    // Usuario autenticado
    try {
      const res = await fetch(
        import.meta.env.VITE_API_BASE + "/checkout/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ success_url, cancel_url }),
        }
      );
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.msg || "No se pudo iniciar el checkout");
      }
    } catch {
      alert("Error de red en checkout");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando carrito…</div>;

  // Estilos reutilizables
  const summaryBadge: React.CSSProperties = {
    display: "inline-block",
    background: "var(--peachSoft, rgba(255,184,150,.16))",
    border: "1px solid rgba(255,184,150,.35)",
    borderRadius: 10,
    padding: "6px 12px",
    margin: "0 0 12px",
  };

  const totalRight: React.CSSProperties = {
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #eee",
    textAlign: "right",
    fontWeight: 700,
    color: "#8a8a8a", // gris pastel
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        padding: "0 16px",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 40,
      }}
    >
      {/* Columna izquierda: listado (sin TOTAL abajo ya) */}
      <div>
        <h1 style={{ fontSize: 48, margin: "8px 0 24px" }}>Carrito</h1>

        {items.length === 0 ? (
          <>
            {/* Título con fondo armonizado */}
            <div style={summaryBadge}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Resumen del pedido</h2>
            </div>

            <p style={{ color: "#555" }}>No hay más artículos en su carrito</p>

            <Link
              to="/catalog"
              style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                padding: "18px 28px",
                letterSpacing: 2,
                marginTop: 16,
                textDecoration: "none",
              }}
            >
              CONTINUAR COMPRANDO
            </Link>

            {/* PROMO debajo del botón */}
            <div style={promoBox}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                🎁 10% de descuento
              </div>
              <div>
                Hazte usuario y, además, recibe tu{" "}
                <strong>primer envío a coste cero</strong>.{" "}
                <Link to="/register" style={{ textDecoration: "underline" }}>
                  Crear cuenta
                </Link>{" "}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Título con fondo armonizado */}
            <div style={summaryBadge}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Resumen del pedido</h2>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
              {items.map((line: any) => (
                <div
                  key={line.product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "96px 1fr auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <img
                    alt={line.product.name}
                    src={`${API_ORIGIN}${line.product.image}`}
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: "cover",
                      borderRadius: 8,
                      background: "#f6f6f6",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{line.product.name}</div>
                    <div style={{ color: "#555", fontSize: 14 }}>
                      {line.product.price.toFixed(2)} €
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <button
                        onClick={() =>
                          update(line.product.id, Math.max(0, line.qty - 1))
                        }
                        aria-label="decrementar"
                        style={qtyBtn}
                      >
                        −
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center" }}>
                        {line.qty}
                      </span>
                      <button
                        onClick={() => update(line.product.id, line.qty + 1)}
                        aria-label="incrementar"
                        style={qtyBtn}
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(line.product.id)}
                        style={{
                          marginLeft: 12,
                          background: "none",
                          border: "none",
                          color: "#b00",
                          cursor: "pointer",
                        }}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {(line.product.price * line.qty).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => clear()}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>

      {/* Columna derecha: botón + TOTAL en gris pastel + ayuda + pagos */}
      <div>
        <button
          disabled={items.length === 0}
          onClick={handleCheckout}
          style={{
            width: "100%",
            background: "#000",
            color: "#fff",
            padding: "18px 0",
            letterSpacing: 2,
            cursor: items.length ? "pointer" : "not-allowed",
            opacity: items.length ? 1 : 0.6,
          }}
        >
          Tramitar Pedido
        </button>

    {/* TOTAL centrado justo bajo el botón */}
    <div style={totalCenter}>
      TOTAL ({totalQty} {totalQty === 1 ? "Producto" : "Productos"}) {subtotal.toFixed(2)} €
    </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>¿Necesitas ayuda?</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              color: "#666",
              lineHeight: 1.9,
            }}
          >
            <li>¿Cuándo llegará mi pedido?</li>
            <li>¿Puedo devolver mi pedido?</li>
            <li>¿Necesito una cuenta para hacer pedidos?</li>
          </ul>
        </div>

        <div style={{ marginTop: 32 }}>
          <div
            style={{
              fontSize: 14,
              letterSpacing: 2,
              color: "#333",
              marginBottom: 12,
            }}
          >
            FORMAS DE PAGO
          </div>
          <PaymentIcons />
        </div>
      </div>
    </div>
  );
}

/* ====== Estilos en JS ====== */

const qtyBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  lineHeight: "26px",
  textAlign: "center",
  fontSize: 16,
};


const totalCenter: React.CSSProperties = {
  marginTop: 8,
  textAlign: "center",
  fontWeight: 700,
  color: "#8a8a8a", // gris pastel
};

const promoBox: React.CSSProperties = {
  marginTop: 16,
  padding: "14px 18px",
  background: "#f7f7ff",
  border: "1px solid #e6e6ff",
  borderRadius: 10,
  color: "#333",
  maxWidth: 520,
};
