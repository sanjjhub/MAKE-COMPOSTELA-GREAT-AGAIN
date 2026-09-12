/* Services / Pricing / Social / Footer */

/* Enlaces reales. Sin cifras de seguidores: un press kit con numeros
   inflados se desmonta en cuanto el promotor abre el perfil. */
const WHATSAPP = "https://wa.me/50763887908";
const EMAIL = "djcompostela@gmail.com";

const { useState: useStateP, useEffect: useEffectP } = React;

/* Tramos de presupuesto para el formulario de cotizacion — nunca un numero
   exacto (política de precios: el número se conversa por chat, lo cierra
   Miguel). Esto es lo que reemplaza la cifra pública: deja calificar al
   lead sin publicar tarifa. */
const BUDGET_TIERS = [
  "Menos de $150",
  "$150 – $300",
  "$300 – $500",
  "Más de $500",
];

/* ---------- SERVICE ICONS (simple geometric, original) ---------- */
function IconDisco() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="20" cy="20" r="11"/>
      <circle cx="20" cy="20" r="5"/>
      <path d="M9 20H4M36 20H31M20 9V4M20 36V31"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 32S6 24 6 14.5C6 10 9.5 7 13 7c2.7 0 5.3 1.7 7 4 1.7-2.3 4.3-4 7-4 3.5 0 7 3 7 7.5C34 24 20 32 20 32Z"/>
    </svg>
  );
}
function IconCake() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="6" y="18" width="28" height="14" rx="2"/>
      <path d="M6 25H34"/>
      <path d="M14 18V12M20 18V10M26 18V12"/>
      <circle cx="14" cy="9" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="26" cy="9" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function IconRings() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="15" cy="22" r="8"/>
      <circle cx="25" cy="22" r="8"/>
      <path d="M11 12L15 7L19 12"/>
      <path d="M21 12L25 7L29 12"/>
    </svg>
  );
}
function IconCap() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 16L20 9L36 16L20 23Z"/>
      <path d="M11 19V27C11 27 14 30 20 30S29 27 29 27V19"/>
      <path d="M33 18V25"/>
    </svg>
  );
}
function IconWave() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 26C8 20 12 20 16 26S24 32 28 26S36 20 36 26"/>
      <path d="M6 32H34"/>
      <circle cx="30" cy="10" r="3"/>
    </svg>
  );
}
function IconCorporate() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="6" y="10" width="28" height="22" rx="1"/>
      <path d="M12 16H17M12 21H17M12 26H17M23 16H28M23 21H28M23 26H28"/>
    </svg>
  );
}
function IconMix() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="13" cy="20" r="7"/>
      <circle cx="27" cy="20" r="7"/>
      <path d="M13 20V13M27 20V13"/>
      <circle cx="13" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="27" cy="20" r="1.5" fill="currentColor"/>
    </svg>
  );
}

const SERVICES = [
  { i: <IconDisco/>, t: "Discotecas", d: "Residencias y nights con energía sostenida toda la noche." },
  { i: <IconHeart/>, t: "Eventos Privados", d: "Curaduría a medida según el invitado y el ambiente." },
  { i: <IconCake/>, t: "Cumpleaños", d: "Del coro de feliz cumpleaños al peak hour, sin perder el público." },
  { i: <IconRings/>, t: "Bodas", d: "Cocktail, ceremonia, pista. Sets diseñados por bloques." },
  { i: <IconCap/>, t: "Eventos Universitarios", d: "Fiestas, semanas culturales y lanzamientos juveniles." },
  { i: <IconMix/>, t: "Open Format Sessions", d: "Sets versátiles para públicos diversos." },
  { i: <IconWave/>, t: "Beach Parties", d: "Sunset hasta after — house, afro y latin urban." },
  { i: <IconCorporate/>, t: "Corporate Events", d: "Sets ambient + dance con curaduría profesional." },
];

function Services() {
  return (
    <section className="section shell" id="services">
      <SectionHead
        kicker="02 / Servicios"
        eyebrow="Donde toca Compostela"
        title="Ocho formatos, una sola filosofía: la pista no se baja."
      />
      <div className="svc__grid reveal-stagger">
        {SERVICES.map((s, i) => (
          <div className="svc__card" key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="svc__icon">{s.i}</div>
              <div className="svc__num">/ {String(i + 1).padStart(2, "0")}</div>
            </div>
            <h3 className="svc__title">{s.t}</h3>
            <p className="svc__desc">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
const PRICE_TABS = [
  { id: "format", label: "Por formato" },
  { id: "scale", label: "Por tamaño de evento" },
  { id: "extras", label: "Extras & adicionales" },
];

const PRICE_DATA = {
  format: [
    {
      cat: "Esencial", name: "Solo DJ", desc: "Compostela mezclando sobre tu equipo existente. Ideal para venues con sonido propio.",
      price: "Consultar", currency: "USD / hora", feat: false,
      list: ["Set en vivo de hasta 4h", "Curaduría previa por bloques", "Pendrive backup y consola requerimientos"],
      obs: "Aplica si la venue cuenta con consola Pioneer y sistema de sonido.",
    },
    {
      cat: "Más solicitado", name: "DJ + Consola", desc: "Equipo profesional incluido. Compostela llega listo a montar y conectar.",
      price: "Consultar", currency: "USD / evento", feat: true,
      list: ["Consola Pioneer DDJ/CDJ + Mixer", "Audífonos pro & cabling", "Setup en venue ≤ 45 min", "Backup técnico"],
      obs: "Recomendado para eventos privados sin equipo propio.",
    },
    {
      cat: "Premium", name: "DJ + Sonido", desc: "Sistema de sonido escalable según público y locación.",
      price: "Consultar", currency: "USD / evento", feat: false,
      list: ["Line array para 50–300+ personas", "Subwoofers + monitores", "Técnico de sonido in-situ", "Consola + cabinas DJ"],
      obs: "Cotiza según aforo y locación.",
    },
    {
      cat: "Visual", name: "DJ + Luces", desc: "Diseño lumínico sincronizado con el set y la energía del público.",
      price: "Consultar", currency: "USD / evento", feat: false,
      list: ["Heads móviles + wash + strobe", "Programación DMX por bloques", "Hazer / fog opcional", "Operador lumínico"],
      obs: "Compatible con paquete DJ + Sonido.",
    },
          ],
  scale: [
    {
      cat: "Hasta 80 personas", name: "Evento pequeño", desc: "Cumpleaños, reuniones íntimas, recepciones cerradas.",
      price: "Consultar", currency: "USD / 3h base", feat: false,
      list: ["DJ + consola compacta", "Audio para 80 pax", "Curaduría open format", "1h adicional disponible"],
      obs: "Set base 3h, escalable.",
    },
    {
      cat: "80 – 250 personas", name: "Evento mediano", desc: "Bodas, eventos universitarios, fiestas privadas amplias.",
      price: "Consultar", currency: "USD / 4h base", feat: true,
      list: ["DJ + sonido escalable", "Luces básicas incluidas", "Coordinación con maestro de ceremonia", "Reunión previa de curaduría"],
      obs: "El más solicitado para bodas y eventos universitarios.",
    },
    {
      cat: "250 – 1000+ personas", name: "Evento grande", desc: "Discotecas, festivales, lanzamientos corporativos y conciertos.",
      price: "Consultar", currency: "USD / evento", feat: false,
      list: ["Full production disponible", "Rider técnico personalizado", "Equipo de soporte completo", "Visuales LED opcionales"],
      obs: "Cotización a medida tras briefing.",
    },
  ],
  extras: [
    {
      cat: "Extras", name: "Horas adicionales", desc: "Hora extra sobre el set contratado, sin pérdida de energía.",
      price: "Consultar", currency: "USD / hora", feat: false,
      list: ["Mismo equipo técnico", "Sin recargo nocturno hasta 03:00", "Posterior a 03:00 aplica +20%"],
      obs: "Solicitar idealmente con 24h de anticipación.",
    },
    {
      cat: "Logística", name: "Viajes fuera de ciudad", desc: "Cobertura nacional e internacional con logística completa.",
      price: "Consultar", currency: "USD + travel", feat: false,
      list: ["Transporte ida y vuelta", "Alojamiento si aplica", "Per diem técnico", "Cobertura de equipo extra"],
      obs: "Cotización por destino y duración.",
    },
    {
      cat: "Add-on", name: "Sesión grabada", desc: "Set grabado en audio y/o video para redes y portfolio.",
      price: "Consultar", currency: "USD / set", feat: false,
      list: ["Audio profesional master 16-bit", "Video multicámara opcional", "Edit para reels (15 / 30 / 60s)", "Licencia de uso compartido"],
      obs: "Producto entregable en 7–10 días hábiles.",
    },
  ],
};

function IconWhatsapp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 002 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-3-.2-.3a8.2 8.2 0 1113.2-6.5 8.2 8.2 0 01-8.2 8.4zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1-1-.4-2-1.2c-.8-.6-1.3-1.5-1.5-1.7s0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4 0-.2 0-.3-.1-.4l-.6-1.5c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.5 4 3.5.5.2 1 .3 1.3.4.6.2 1 .2 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.5-.3z"/>
    </svg>
  );
}

/* ---------- QUOTE MODAL ----------
   Se abre al pedir cotización de un paquete. No cotiza ningún número: solo
   califica el lead (los 5 datos de la política de precios + presupuesto)
   y arma un mensaje de WhatsApp para Miguel. Estética tomada del EPK PDF:
   panel negro fijo, wordmark, barra magenta, etiquetas mono en mayúscula. */
function QuoteModal({ pkg, onClose }) {
  const [form, setForm] = useStateP({
    nombre: "", fecha: "", ubicacion: "", aforo: "", horario: "",
    referencia: "", presupuesto: "",
  });

  useEffectP(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const listo = form.fecha && form.ubicacion && form.aforo && form.horario && form.referencia;

  const enviar = (e) => {
    e.preventDefault();
    const lineas = [
      `Hola! Quiero cotizar *${pkg.name}* (${pkg.cat}).`,
      "",
      `Nombre: ${form.nombre || "-"}`,
      `Fecha: ${form.fecha}`,
      `Ubicación: ${form.ubicacion}`,
      `Aforo estimado: ${form.aforo}`,
      `Horario y duración: ${form.horario}`,
      `Referencia musical: ${form.referencia}`,
      `Presupuesto: ${form.presupuesto || "No especificado"}`,
    ];
    const msg = encodeURIComponent(lineas.join("\n"));
    window.open(`${WHATSAPP}?text=${msg}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="qm__overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="qm__panel">
        <button className="qm__close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="qm__head">
          <span className="logo logo--word qm__logo" style={{ color: "#fff" }} aria-label="COMPOSTELA"></span>
          <div className="qm__bar"></div>
          <div className="qm__eyebrow">Cotización personalizada</div>
          <h3 className="qm__title">{pkg.name}</h3>
          <p className="qm__sub">{pkg.cat} · Respuesta en menos de 24 horas</p>
        </div>

        <form onSubmit={enviar} className="qm__form">
          <label className="qm__field">
            <span>Nombre</span>
            <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="¿Cómo te llamas?"/>
          </label>
          <label className="qm__field">
            <span>Fecha del evento *</span>
            <input type="date" value={form.fecha} onChange={set("fecha")} required/>
          </label>
          <label className="qm__field">
            <span>Ubicación *</span>
            <input type="text" value={form.ubicacion} onChange={set("ubicacion")} placeholder="Venue o zona" required/>
          </label>
          <label className="qm__field">
            <span>Aforo estimado *</span>
            <input type="text" value={form.aforo} onChange={set("aforo")} placeholder="Ej. 80 personas" required/>
          </label>
          <label className="qm__field">
            <span>Horario y duración *</span>
            <input type="text" value={form.horario} onChange={set("horario")} placeholder="Ej. 9pm – 1am" required/>
          </label>
          <label className="qm__field">
            <span>Referencia musical *</span>
            <input type="text" value={form.referencia} onChange={set("referencia")} placeholder="Ej. Reggaeton + house, sin tropical" required/>
          </label>
          <label className="qm__field">
            <span>Rango de presupuesto</span>
            <select value={form.presupuesto} onChange={set("presupuesto")}>
              <option value="">Prefiero no decir</option>
              {BUDGET_TIERS.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
          </label>

          <button type="submit" className="qm__submit" disabled={!listo}>
            <IconWhatsapp/> <span>Enviar por WhatsApp</span>
          </button>
          <p className="qm__note">* Campos requeridos por la política de cotización — sin ellos no podemos armar un precio preciso.</p>
        </form>
      </div>
    </div>
  );
}

function Pricing() {
  const [tab, setTab] = useStateP("format");
  const [quotePkg, setQuotePkg] = useStateP(null);
  const data = PRICE_DATA[tab];
  return (
    <section className="section shell" id="pricing">
      <div className="price__intro reveal">
        <div>
          <span className="eyebrow">Booking · Cotización</span>
          <h2 className="h-section">Tarifas claras, ajustadas al evento.</h2>
        </div>
        <p>
          Cada show es distinto. Estos son los formatos base — todos los precios se ajustan según fecha, duración, equipo, locación y aforo. Selecciona la categoría que más se aproxime a tu evento y solicita una cotización personalizada.
        </p>
      </div>

      <div className="price__tabs reveal">
        {PRICE_TABS.map(t => (
          <button key={t.id} className={"price__tab " + (tab === t.id ? "is-active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="price__grid reveal-stagger" key={tab}>
        {data.map((p, i) => (
          <div className={"price__card " + (p.feat ? "is-feat" : "")} key={i}>
            {p.feat && <div className="price__badge">Más solicitado</div>}
            <div className="price__cat">{p.cat}</div>
            <h3 className="price__name">{p.name}</h3>
            <p className="price__desc">{p.desc}</p>
            <div className="price__price">
              <span className="price__amount-num" contentEditable suppressContentEditableWarning>{p.price}</span>
              <span className="price__amount-cur">{p.currency}</span>
            </div>
            <ul className="price__list">
              {p.list.map((l, j) => <li key={j} contentEditable suppressContentEditableWarning>{l}</li>)}
            </ul>
            <div className="price__obs" contentEditable suppressContentEditableWarning>★ {p.obs}</div>
            <button className="price__cta" onClick={() => setQuotePkg(p)}>
              <span>Solicitar cotización</span>
              <Arrow size={12}/>
            </button>
          </div>
        ))}
      </div>

      {quotePkg && <QuoteModal pkg={quotePkg} onClose={() => setQuotePkg(null)}/>}

      <div className="book reveal">
        <div className="book__photo">
          <img src="assets/booking.jpg" alt="" loading="lazy"/>
        </div>
        <div className="book__copy">
          <h3>¿Listo para asegurar tu fecha?</h3>
          <p>Cuéntanos del evento. Aforo, ubicación, fecha, horario y referencia musical. Te responderemos con una cotización personalizada en menos de 24 horas.</p>
        </div>
        <div className="book__actions">
          <a href="#contact" className="btn">Solicitar cotización <Arrow/></a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn--ghost"><IconWhatsapp/> WhatsApp</a>
        </div>
      </div>
    </section>
  );
}


/* ---------- SOCIAL ---------- */
const SOCIALS = [
  { plat: "Instagram",  handle: "@compostela.pty",       url: "https://www.instagram.com/compostela.pty/" },
  { plat: "TikTok",     handle: "@compostela.ptyy",      url: "https://www.tiktok.com/@compostela.ptyy" },
  { plat: "YouTube",    handle: "@djcompostela",         url: "https://www.youtube.com/@djcompostela" },
  { plat: "SoundCloud", handle: "/compostela",           url: "https://soundcloud.com/compostela-103016286" },
  { plat: "WhatsApp",   handle: "+507 6388-7908",        url: WHATSAPP },
  { plat: "Email",      handle: "djcompostela@gmail.com", url: "mailto:djcompostela@gmail.com" },
];

function Social() {
  return (
    <section className="section shell" id="social">
      <div className="soc reveal">
        <div>
          <span className="eyebrow">Redes</span>
          <h2 className="h-section">Sigue el show.</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, margin: 0, maxWidth: "50ch" }}>
          Reels semanales, fragmentos de sets, playlists curadas y anuncios de fechas. La forma más rápida de saber dónde toca Compostela esta semana.
        </p>
      </div>
      <div className="soc__grid reveal-stagger">
        {SOCIALS.map((s, i) => (
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="soc__card" key={i}>
            <div className="soc__plat">{s.plat}</div>
            <div className="soc__arr"><Arrow size={12}/></div>
            <div>
              <div className="soc__handle">{s.handle}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="footer" id="contact">
      <span className="logo logo--mark footer__watermark-mark" aria-hidden="true"></span>
      <div className="footer__big-logo" role="img" aria-label="COMPOSTELA"></div>
      <div className="footer__grid">
        <div>
          <p className="footer__quote">
            “La música nunca se interrumpe — solo cambia de habitación. Te llevo a la siguiente.”
          </p>
        </div>
        <div className="footer__col">
          <h5>Contacto</h5>
          <ul>
            <li><a href={"mailto:" + EMAIL}>{EMAIL}</a></li>
            <li><a href="tel:+50763887908">+507 6388-7908</a></li>
            <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp directo</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h5>Press kit</h5>
          <ul>
            <li><a href="press/compostela-epk.pdf" download>EPK · PDF</a></li>
            <li><a href="press/compostela-fotos.zip" download>Foto pack hi-res</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h5>Sígueme</h5>
          <ul>
            {SOCIALS.filter(x => x.plat !== "WhatsApp").map((x, i) => (
              <li key={i}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.plat}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Compostela · All rights reserved</span>
        <span>Panamá · Booking 2026</span>
      </div>
    </footer>
  );
}

window.Services = Services;
window.Pricing = Pricing;
window.Social = Social;
window.Footer = Footer;
