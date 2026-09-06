/* SECTIONS: About / Experience / Showreel / Certificate */
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

function SectionHead({ eyebrow, title, kicker, right }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: right ? "1fr auto" : "1fr", gap: 24, alignItems: "end", marginBottom: 48 }}>
      <div>
        {kicker && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>{kicker}</div>}
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h-section">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function About() {
  /* Ficha técnica: lo que un promotor necesita verificar de un vistazo. */
  const spec = [
    { k: "Base",            v: "LATAM / Global" },
    { k: "Géneros",         v: "Reggaeton · Latin urban · House · Tech house · Afro · EDM" },
    { k: "Formatos",        v: "Discoteca · Privado · Boda · Universidad · Beach · Corporate" },
    { k: "Duración de set", v: "Hasta 4h, curado por bloques" },
    { k: "Equipo",          v: "Pioneer CDJ / DDJ + mixer" },
    { k: "Formación",       v: "DJ Profesional · ShowRots, 2024" },
    { k: "Idiomas",         v: "Español / Inglés" },
    { k: "Disponibilidad",  v: "2026 — early 2027", live: true },
  ];
  return (
    <section className="section shell" id="about">
      <SectionHead
        kicker="01 / Sobre"
        eyebrow="Quién es Compostela"
        title="DJ profesional, abierto a cualquier pista de baile que respire."
      />
      <div className="about">
        <div className="about__copy reveal">
          <p className="lead">
            Compostela es un DJ contemporáneo especializado en música urbana latina y electrónica, construyendo sets que mueven a multitudes con la misma intensidad en una discoteca de mil personas que en una boda de cien.
          </p>
          <p>
            El enfoque es simple: leer al público, respetar la curaduría del cliente y entregar una experiencia sonora premium — con la energía justa para cada momento de la noche.
          </p>
        </div>

        <figure className="booth reveal">
          <img src="assets/booth.jpg" alt="Consola Pioneer de Compostela iluminada durante un set" loading="lazy" width="440" height="293"/>
          <figcaption className="booth__tag">Booth · Live set</figcaption>
        </figure>
      </div>

      <dl className="spec reveal-stagger">
        {spec.map((r, i) => (
          <div className="spec__row" key={i}>
            <dt className="spec__key">{r.k}</dt>
            <dd className={"spec__val" + (r.live ? " spec__val--live" : "")}>{r.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const EXP_FILTERS = ["TODOS", "DISCOTECA", "PRIVADO", "FESTIVAL", "UNIVERSIDAD", "BEACH"];

function Showreel({ items }) {
  const stripRef = useRefS(null);
  const [nav, setNav] = useStateS({ inicio: true, fin: false, avance: 0 });

  /* Estado de la tira: donde estamos y si quedan tarjetas a cada lado. */
  const medir = () => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setNav({
      inicio: el.scrollLeft <= 2,
      fin: max <= 2 || el.scrollLeft >= max - 2,
      avance: max > 0 ? el.scrollLeft / max : 0,
    });
  };

  useEffectS(() => {
    const el = stripRef.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [items]);

  /* Desplaza exactamente una tarjeta, sea cual sea su ancho responsive. */
  const mover = (dir) => {
    const el = stripRef.current;
    if (!el) return;
    const card = el.querySelector(".reel__card");
    const paso = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * paso, behavior: "smooth" });
  };

  return (
    <section className="section shell" id="showreel">
      <div className="reel__head reveal">
        <div>
          <span className="eyebrow">Showreel · Media</span>
          <h2 className="h-section">Sets, edits, momentos.</h2>
        </div>
        <div className="reel__tools">
          <button
            type="button"
            className="reel__arrow"
            onClick={() => mover(-1)}
            disabled={nav.inicio}
            aria-label="Ver anteriores"
          >
            <Arrow size={13}/>
          </button>
          <button
            type="button"
            className="reel__arrow reel__arrow--next"
            onClick={() => mover(1)}
            disabled={nav.fin}
            aria-label="Ver siguientes"
          >
            <Arrow size={13}/>
          </button>
          <a href="#" className="btn btn--ghost">Ver canal de YouTube <Arrow/></a>
        </div>
      </div>

      <div className="reel__strip reveal" ref={stripRef}>
        {items.map((it, i) => (
          <a href="#" className="reel__card" key={i}>
            <div className="photo">
              <img src={it.img} alt={it.title} loading="lazy"/>
            </div>
            <div className="reel__duration">{it.duration}</div>
            <div className="reel__play"><IconPlay/></div>
            <div className="reel__meta">
              <div>
                <div className="reel__title">{it.title}</div>
                <div className="reel__tag" style={{ marginTop: 4 }}>{it.tag}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="reel__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.08, nav.avance || 0.08)})` }}></span>
      </div>
    </section>
  );
}

function Certificate() {
  return (
    <section className="section shell" id="certificate">
      <div className="cert">
        <div className="cert__frame reveal">
          <div className="cert__ribbon">Certified · 2024</div>
          <image-slot id="certificate" placeholder="Diploma ShowRots"></image-slot>
          <div className="cert__seal">
            <span className="logo logo--mark cert__seal-ring"></span>
            <div className="cert__seal-inner">DJ</div>
          </div>
        </div>
        <div className="cert__info reveal">
          <span className="eyebrow">Credenciales</span>
          <h2 className="h-section">Certificado profesional<br/>de DJ — ShowRots.</h2>
          <p>
            Formación profesional en mezcla, beatmatching, harmonic mixing, manejo de consolas Pioneer y producción aplicada a sets en vivo. Programa completo dictado por la academia ShowRots.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Más allá del título, este programa fundamentó la disciplina técnica que sostiene cada set: equipos calibrados, transiciones limpias y lectura precisa de pista.
          </p>
          <dl className="cert__meta">
            <div><dt>Academia</dt><dd>ShowRots</dd></div>
            <div><dt>Año</dt><dd>2024</dd></div>
            <div><dt>Programa</dt><dd>DJ Profesional</dd></div>
            <div><dt>Estado</dt><dd>Graduado</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

window.About = About;
window.Showreel = Showreel;
window.Certificate = Certificate;
window.SectionHead = SectionHead;
