import React from "react";

export default function PaymentIcons() {
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
