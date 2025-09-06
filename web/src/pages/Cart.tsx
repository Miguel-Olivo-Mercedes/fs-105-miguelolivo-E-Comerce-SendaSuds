/// <reference types="vite/client" />
import React from "react";
import PaymentIcons from "../components/PaymentIcons";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_ORIGIN } from "../api";

/* ====== Estilos en JS (declarados antes de usarlos) ====== */
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

const summaryBadge: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(255,184,150,.16)", // peachSoft
  border: "1px solid rgba(255,184,150,.35)",
  borderRadius: 10,
  padding: "6px 12px",
  margin: "0 0 12px",
};

function fmt(n: number) {
  return Number(n || 0).toFixed(2);
}

export default function Cart() {
  const cart = useCart() as any;
  const { items = [], subtotal = 0, remove, clear, loading } = cart;
  const { token } = useAuth();

  const totalQty: number = Array.isArray(items)
    ? items.reduce((s: number, l: any) => s + (l?.qty || 0), 0)
    : 0;

  const update = (id: number, qty: number) => {
    if (typeof cart.update === "function") return cart.update(id, qty);
    if (typeof cart.setQty === "function") return cart.setQty(id, qty);
    if (typeof cart.set === "function") return cart.set(id, qty);

    if (typeof cart.add === "function") {
      const current = items.find((l: any) => l?.product?.id === id)?.qty || 0;
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

  return (
    <div className="container cart-grid">
      {/* Columna izquierda: listado */}
      <div>
        <h1 style={{ fontSize: 48, margin: "8px 0 24px" }}>Carrito</h1>

        {items.length === 0 ? (
          <>
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
                      {fmt(line.product.price)} €
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
                        type="button"
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
                        type="button"
                        onClick={() => update(line.product.id, line.qty + 1)}
                        aria-label="incrementar"
                        style={qtyBtn}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line.product.id)}
                        style={{
                          marginLeft: 12,
                          background: "none",
                          border: "none",
                          color: "#b00",
                          cursor: "pointer",
                        }}
                        aria-label={`Quitar ${line.product.name}`}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div style={{ fontWeight: 600 }}>
                    {(Number(line.product.price) * Number(line.qty)).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => clear()}
                disabled={items.length === 0}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  padding: "10px 16px",
                  cursor: items.length ? "pointer" : "not-allowed",
                  opacity: items.length ? 1 : 0.6,
                }}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>

      {/* Columna derecha: botón + TOTAL centrado + ayuda + pagos */}
      <div>
        <button
          type="button"
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
          TOTAL ({totalQty} {totalQty === 1 ? "Producto" : "Productos"}) {fmt(subtotal)} €
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
