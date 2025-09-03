import React from "react";

function PaymentIcons() {
  const iconStyle: React.CSSProperties = { height: 22, display: "block" };

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      {/* VISA */}
      <svg viewBox="0 0 48 16" role="img" aria-label="Visa" style={iconStyle}>
        <rect x="0" y="0" width="48" height="16" rx="3" fill="#1434CB" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
              fontFamily="system-ui, Arial, sans-serif" fontSize="9" fontWeight="700"
              fill="#fff">VISA</text>
      </svg>

      {/* MasterCard */}
      <svg viewBox="0 0 48 16" role="img" aria-label="MasterCard" style={iconStyle}>
        <rect x="0" y="0" width="48" height="16" rx="3" fill="#111" />
        <circle cx="20" cy="8" r="6" fill="#EB001B" />
        <circle cx="28" cy="8" r="6" fill="#F79E1B" opacity="0.9" />
      </svg>

      {/* PayPal */}
      <svg viewBox="0 0 48 16" role="img" aria-label="PayPal" style={iconStyle}>
        <rect x="0" y="0" width="48" height="16" rx="3" fill="#003087" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
              fontFamily="system-ui, Arial, sans-serif" fontSize="9" fontWeight="700"
              fill="#fff">PayPal</text>
      </svg>

      {/* American Express */}
      <svg viewBox="0 0 48 16" role="img" aria-label="American Express" style={iconStyle}>
        <rect x="0" y="0" width="48" height="16" rx="3" fill="#2E77BB" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
              fontFamily="system-ui, Arial, sans-serif" fontSize="8" fontWeight="700"
              fill="#fff">AMEX</text>
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        /* FULL-BLEED / cubrir márgenes del contenedor padre */
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        boxSizing: "border-box",

        background: "#0a0a0a",
        color: "#f5f5f5",
        padding: "28px 20px",
        marginTop: 48,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 0.2, opacity: 0.9 }}>
            Atención al cliente
          </h3>
          <p style={{ margin: 0, color: "#cfcfcf" }}>
            Lunes a Viernes de <strong>09:00 a 18:00</strong> · Sábados de <strong>10:00 a 14:00</strong>
          </p>
          <p style={{ margin: "6px 0 0", color: "#cfcfcf" }}>
            Mail:{" "}
            <a href="mailto:infosendasuds@gmail.com" style={{ color: "#c7bebe", textDecoration: "underline" }}>
              infosendasuds@gmail.com
            </a>
          </p>
          <p style={{ margin: 0, color: "#cfcfcf" }}>
            WhatsApp:{" "}
            <a href="https://wa.me/34617239077" target="_blank" rel="noreferrer"
               style={{ color: "#c7bebe", textDecoration: "underline" }}>
              +34 617 23 90 77
            </a>
          </p>
        </div>

        <div>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Formas de pago</div>
          <PaymentIcons />
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "18px auto 0",
          borderTop: "1px solid rgba(255,255,255,.08)",
          paddingTop: 12,
          fontSize: 12,
          color: "#bdbdbd",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()}, Senda Suds
      </div>
    </footer>
  );
}
