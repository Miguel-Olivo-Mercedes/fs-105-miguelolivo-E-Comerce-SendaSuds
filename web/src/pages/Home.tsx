import { useMemo, useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { API_ORIGIN } from "../api";
import { Link } from "react-router-dom";
import { cardColorsFor } from "../lib/cardPalette";

export default function Home() {
  const { products, loading, error } = useProducts();
  const [showMore, setShowMore] = useState(false);

  // Cuatro destacados por slug/nombre
  const featured = useMemo(() => {
    const want = new Set(["carbon-activo", "citrico-amanecer", "menta-alpina", "rosa-mosqueta"]);
    const bySlug = products.filter(p => p.slug && want.has(p.slug));
    if (bySlug.length >= 4) return bySlug.slice(0, 4);

    const names = new Set(["Carbón Activo", "Cítrico Amanecer", "Menta Alpina", "Rosa Mosqueta"]);
    const byName = products.filter(p => names.has(p.name));
    return (bySlug.length ? bySlug : byName).slice(0, 4);
  }, [products]);

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>Error: {String(error)}</div>;

  return (
    <div style={{ padding: "24px 32px 48px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 20px" }}>Destacados</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {featured.map(p => {
          const { bg, border, shadow } = cardColorsFor(p.slug, p.name);
          const img =
            (p as any).image_url ||
            `${API_ORIGIN}/api/static/products/${p.slug}.jpg`;

          return (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              style={{
                border: `1px solid ${border}`,
                borderRadius: 12,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                boxShadow: `0 6px 18px ${shadow}, 0 1px 2px rgba(0,0,0,.03)`,
                background: bg,
                transition: "transform .15s ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/10",
                  overflow: "hidden",
                  background: "transparent",
                }}
              >
                <img
                  src={img}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>

              <div style={{ padding: "12px 14px 16px" }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {p.name}
                </h3>
                {/* Precio oculto en Home */}
              </div>
            </Link>
          );
        })}
      </div>

                       {/* Sobre nosotros (centrado) */}
      <section
        style={{
          maxWidth: 820,
          margin: "36px auto 0",  // centra el bloque
          paddingInline: 8,
          textAlign: "center",     // centra el título y el botón
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Sobre nosotros</h2>

        {/* Intro breve */}
        <p style={{ margin: "0 auto", color: "#555", maxWidth: 760, textAlign: "left" }}>
          Senda Suds nace de una idea sencilla: cuidar la piel sin descuidar el planeta. Empezamos
          elaborando jabones en pequeños lotes y descubrimos que mucha gente buscaba lo mismo que
          nosotros: fórmulas honestas, aromas naturales y resultados que se sienten desde el primer uso.
        </p>

        {showMore && (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 12,
              color: "#666",
              maxWidth: 760,
              marginInline: "auto",
              textAlign: "left", // el cuerpo se lee mejor alineado a la izquierda
            }}
          >
            <p style={{ margin: 0 }}>
              Trabajamos con <strong>saponificación en frío</strong>, un proceso artesanal que preserva
              las propiedades de los aceites y mantecas vegetales. Cada lote cura entre <strong>4 y 6 semanas</strong>,
              dando como resultado jabones más suaves, duraderos y con una espuma cremosa.
            </p>

            <p style={{ margin: 0 }}>
              Elegimos ingredientes que entendemos y en los que confiamos: <strong>aceite de oliva</strong>,
              <strong> aceite de coco</strong>, <strong>manteca de karité</strong>, <strong>aceite de almendras</strong> y
              aditivos naturales como <strong>arcillas</strong>, <strong>carbón activado</strong> u <strong>avena coloidal</strong>.
              Para perfumar, preferimos <strong>aceites esenciales</strong>. Nuestros jabones están libres de
              sulfatos agresivos y parabenos; muchos son aptos para pieles sensibles.
            </p>

            <p style={{ margin: 0 }}>
              También nos mueve la coherencia ecológica: priorizamos <strong>proveedores locales</strong>,
              usamos <strong>envases reciclables o compostables</strong> y evitamos el sobre-empaquetado.
              No buscamos la producción masiva: preferimos <strong>pequeños lotes</strong> que garanticen
              frescura y control de calidad.
            </p>

            <p style={{ margin: 0 }}>
              La <strong>mariposa</strong> de nuestro sello simboliza una <strong>transformación suave</strong>.
              Creemos en rituales cotidianos que te devuelven al presente: el aroma que te gusta, la espuma justa,
              y una limpieza que no reseca. Si una fórmula no nos convence, no sale: probamos, anotamos, ajustamos y volvemos a probar.
            </p>
          </div>
        )}

        <button
          onClick={() => setShowMore(v => !v)}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          aria-expanded={showMore}
        >
          {showMore ? "-" : "+"}
        </button>
      </section>

      <section style={{maxWidth:820,margin:"36px auto 0",paddingInline:8}}>
  <h3 style={{textAlign:"center",margin:"0 0 12px"}}>¿Por qué elegir Senda Suds?</h3>
  <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
    <div style={{border:"1px solid #eee",borderRadius:12,padding:16}}>
      <div style={{fontSize:24,marginBottom:6}}>🧼</div>
      <strong>Suave con tu piel</strong>
      <p style={{margin:"6px 0 0",color:"#555"}}>Sin sulfatos agresivos ni parabenos. Ideal para pieles sensibles.</p>
    </div>
    <div style={{border:"1px solid #eee",borderRadius:12,padding:16}}>
      <div style={{fontSize:24,marginBottom:6}}>🌿</div>
      <strong>Ingredientes honestos</strong>
      <p style={{margin:"6px 0 0",color:"#555"}}>Aceites vegetales, arcillas y esencias naturales.</p>
    </div>
    <div style={{border:"1px solid #eee",borderRadius:12,padding:16}}>
      <div style={{fontSize:24,marginBottom:6}}>♻️</div>
      <strong>Menos residuo</strong>
      <p style={{margin:"6px 0 0",color:"#555"}}>Empaques reciclables y lotes pequeños para máxima frescura.</p>
    </div>
  </div>
</section>

<section style={{maxWidth:820,margin:"28px auto 0",paddingInline:8,textAlign:"center"}}>
  <h3 style={{margin:"0 0 12px"}}>Ingredientes clave</h3>
  <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
    {["Aceite de oliva","Aceite de coco","Manteca de karité","Avena coloidal","Carbón activado","Arcillas naturales","Aceites esenciales"].map(tag=>(
      <span key={tag} style={{border:"1px solid #eee",borderRadius:999,padding:"6px 12px",fontSize:14,color:"#444"}}>{tag}</span>
    ))}
  </div>
</section>

{/* === Guía: cómo elegir + ritual (sin logística) === */}
<section style={{ maxWidth: 1100, margin: "32px auto 0", paddingInline: 8 }}>
  <h3 style={{ textAlign: "center", margin: "0 0 16px" }}>Guía rápida</h3>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16
  }}>
    {/* Cómo elegir (solo producto) */}
    <article style={{
      border: "1px solid rgba(178,107,69,.25)",
      borderRadius: 14,
      padding: "16px 18px",
      background: "rgba(255,186,122,.16)",
      boxShadow: "0 1px 2px rgba(0,0,0,.03)"
    }}>
      <h4 style={{ margin: "0 0 10px", color: "#3d2a21" }}>Cómo elegir tu jabón</h4>
      <ul style={{ margin: 0, paddingLeft: 18, color: "#553e33", lineHeight: 1.85 }}>
        <li><strong>Energizante:</strong> Cítricos / menta (mañanas).</li>
        <li><strong>Calmante:</strong> Avena / karité (piel sensible).</li>
        <li><strong>Purificante:</strong> Carbón activado (mixta/grasa).</li>
        <li><strong>Nutritivo:</strong> Karité + aceites (piel seca).</li>
        <li><strong>Sin perfume:</strong> Fórmula neutra.</li>
        <li><strong>Cabello sólido:</strong> Espumar en manos y aplicar.</li>
        <li><strong>Regalo seguro:</strong> Florales suaves o pack mixto.</li>
      </ul>
    </article>

    {/* Ritual (uso/cuidado, nada de envíos ni pagos) */}
    <article style={{
      border: "1px solid rgba(178,107,69,.25)",
      borderRadius: 14,
      padding: "16px 18px",
      background: "rgba(255,186,122,.16)",
      boxShadow: "0 1px 2px rgba(0,0,0,.03)"
    }}>
      <h4 style={{ margin: "0 0 10px", color: "#3d2a21" }}>Ritual de uso</h4>
      <ol style={{ margin: 0, paddingLeft: 18, color: "#553e33", lineHeight: 1.85 }}>
        <li>Humedece la piel y la pastilla.</li>
        <li>Genera espuma entre las manos.</li>
        <li>Masajea suavemente y enjuaga.</li>
        <li>Deja secar en jabonera con drenaje.</li>
      </ol>
      <p style={{ margin: "10px 0 0", color: "#553e33" }}>
        <strong>Tip:</strong> Bien drenado, suele durar <em>4–6 semanas</em>.
      </p>
    </article>
  </div>
</section>

{/* === FAQ de servicio (envíos, pagos, cuenta) === */}
<section
  style={{
    maxWidth: 860,
    margin: "36px auto 0",
    padding: "0 8px",
    textAlign: "center",
  }}
>
  <h3 style={{ margin: "0 0 12px" }}>Preguntas frecuentes</h3>

  {/* Contenedor centrado; texto interno alineado a la izquierda para legibilidad */}
  <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "left" }}>
    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Cuánto tarda el envío?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        24–72h laborables (según destino). Recibirás seguimiento por email.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Puedo devolver mi pedido?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Sí, escríbenos dentro de 14 días naturales y te ayudamos con el proceso.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Qué métodos de pago aceptáis?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Tarjeta (Visa/Mastercard/Amex) y PayPal.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Necesito cuenta para comprar?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Puedes comprar como invitado. Crear cuenta te da historial, ofertas y envíos más rápidos.
      </p>
    </details>

    {/* Extras sin solapar con la Guía */}
    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Hacéis envíos internacionales?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        De momento España peninsular y Baleares. Si necesitas otro destino, contáctanos y buscamos opción.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Cómo sigo mi pedido?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Al enviarse, te mandamos un correo con el número de seguimiento y enlace del transportista.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Puedo cambiar la dirección después de comprar?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Si aún no ha salido, escríbenos lo antes posible a <a href="mailto:infosendasuds@gmail.com">infosendasuds@gmail.com</a>.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>Mi pedido llegó dañado</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Lamentamos lo ocurrido. Envíanos fotos y número de pedido y lo resolvemos rápidamente.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Tenéis cupones o descuentos?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        A veces ofrecemos 10% en primera compra al registrarte. Consulta el banner o el email de bienvenida.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
      <summary><strong>¿Emitís factura?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Sí. Indícalo en notas al finalizar compra o escríbenos con tu NIF y datos de facturación.
      </p>
    </details>

    <details style={{ border: "1px solid #eee", borderRadius: 12, padding: "10px 14px" }}>
      <summary><strong>¿Es seguro pagar?</strong></summary>
      <p style={{ margin: "8px 0 0", color: "#555" }}>
        Sí, operamos con pasarela certificada (Stripe/PayPal). Tus datos se transmiten cifrados.
      </p>
    </details>
  </div>
</section>




    </div>
  );
}
