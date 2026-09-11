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
    { k: "Base",            v: "Panamá · disponible para viajar" },
    { k: "Géneros",         v: "Reggaeton · Latin urban · House · Tech house · Afro · EDM" },
    { k: "Formatos",        v: "Discoteca · Privado · Boda · Universidad · Beach · Corporate" },
    { k: "Duración de set", v: "Hasta 4h, curado por bloques" },
    { k: "Equipo",          v: "Pioneer CDJ / DDJ + mixer" },
    { k: "Formación",       v: "DJ Profesional · ShowRoots, 2026" },
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
          <a href="https://www.youtube.com/@djcompostela" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">Ver canal de YouTube <Arrow/></a>
        </div>
      </div>

      <div className="reel__strip reveal" ref={stripRef}>
        {items.map((it, i) => (
          <a href={it.url || "https://www.youtube.com/@djcompostela"} target="_blank" rel="noopener noreferrer" className="reel__card" key={i}>
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

/* ÚLTIMA SESIÓN — miniatura + texto sobre un video de fondo desenfocado.
   TODO: sustituir por los datos reales de la sesion. */
const SESSION = {
  eyebrow: "Última sesión",
  titulo: "Random Rec #1 · Summer Edition",
  texto: "Una sesión diseñada para capturar la esencia del verano: calor, energía y pura " +
         "vibra. Desde reggaetón hasta sonidos tropicales y ritmos que obligan a moverse, " +
         "un viaje sin pausas grabado en azotea.",
  fecha: "Mayo 2026",
  lugar: "Ciudad de Panamá",
  duracion: "49 min",
  direccion: "Dir. Linder Romero",
  enlace: "https://youtu.be/1um4NTRpCF8",
  /* Loop de fondo. Mientras no exista, el fondo cae en la miniatura desenfocada. */
  video: "assets/session-loop.mp4",
  miniatura: "assets/session-thumb.jpg",
};


/* Traduce la posicion de la seccion en la pantalla a un numero 0..1 que el
   CSS usa para levantarla. Va por rAF: el scroll dispara muchisimo y leer
   getBoundingClientRect en cada evento provoca tirones. */
function useSubidaAlScroll(ref) {
  useEffectS(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--avance", "1");
      return;
    }
    let raf = 0;
    const calcular = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      /* 0 cuando el borde superior asoma por abajo; 1 cuando ya subio del todo */
      const p = (vh - r.top) / (vh * 0.72);
      el.style.setProperty("--avance", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const alScroll = () => { if (!raf) raf = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

function Session() {
  const videoRef = useRefS(null);
  const seccionRef = useRefS(null);
  const [hayVideo, setHayVideo] = useStateS(false);

  useSubidaAlScroll(seccionRef);

  useEffectS(() => {
    const v = videoRef.current;
    if (!v) return;
    /* React no siempre refleja `muted` en el DOM y sin eso el navegador
       bloquea la reproduccion automatica. */
    v.muted = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }

    /* Reproducir un video de fondo falla por tres motivos distintos y hay que
       cubrir los tres: al montar todavia no hay datos, la pestana puede estar
       en segundo plano, y el navegador suspende lo que no se ve. */
    let enPantalla = false;

    const intentar = () => {
      if (!enPantalla || document.hidden) return;
      const r = v.play();
      if (r && r.catch) r.catch(() => {});
    };

    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          enPantalla = e.isIntersecting;
          if (enPantalla) intentar();
          else v.pause();
        });
      },
      { threshold: 0.01 }
    );
    io.observe(v);

    /* Reintentos: cuando llegan datos y cuando la pestana vuelve al frente. */
    const alVolver = () => intentar();
    v.addEventListener("canplay", intentar);
    v.addEventListener("loadeddata", intentar);
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      io.disconnect();
      v.removeEventListener("canplay", intentar);
      v.removeEventListener("loadeddata", intentar);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);

  return (
    <section className="section session" id="session" ref={seccionRef}>
      <div className="session__bg" aria-hidden="true">
        <img
          className="session__bg-fallback"
          src={SESSION.miniatura}
          alt=""
          style={{ opacity: hayVideo ? 0 : 1 }}
        />
        <video
          ref={videoRef}
          className="session__bg-video"
          poster={SESSION.miniatura}
          autoPlay
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setHayVideo(true)}
          style={{ opacity: hayVideo ? 1 : 0 }}
        >
          <source src={SESSION.video} type="video/mp4"/>
        </video>
      </div>

      <div className="session__inner">
        <a className="session__card" href={SESSION.enlace} target="_blank" rel="noopener noreferrer">
          <img src={SESSION.miniatura} alt={SESSION.titulo} loading="lazy"/>
          <span className="session__play"><IconPlay/></span>
          <span className="session__duracion">{SESSION.duracion}</span>
        </a>

        <div className="session__copy">
          <span className="eyebrow">{SESSION.eyebrow}</span>
          <h2 className="session__titulo">{SESSION.titulo}</h2>
          <p className="session__texto">{SESSION.texto}</p>
          <div className="session__datos">
            <span>{SESSION.fecha}</span>
            <span>{SESSION.lugar}</span>
            <span>{SESSION.duracion}</span>
            <span>{SESSION.direccion}</span>
          </div>
          <a href={SESSION.enlace} target="_blank" rel="noopener noreferrer" className="btn session__cta">
            Ver sesión completa <Arrow/>
          </a>
        </div>
      </div>
    </section>
  );
}

function Certificate() {
  return (
    <section className="section shell" id="certificate">
      <div className="cert">
        <div className="cert__frame reveal">
          <div className="cert__ribbon">Certified · 2026</div>
          <image-slot id="certificate" placeholder="Diploma ShowRoots" src="assets/certificado-showroots.png"></image-slot>
          <div className="cert__seal">
            <span className="logo logo--mark cert__seal-ring"></span>
            <div className="cert__seal-inner">DJ</div>
          </div>
        </div>
        <div className="cert__info reveal">
          <span className="eyebrow">Credenciales</span>
          <h2 className="h-section">Certificado profesional<br/>de DJ — ShowRoots.</h2>
          <p>
            Formación profesional en mezcla, beatmatching, harmonic mixing, manejo de consolas Pioneer y producción aplicada a sets en vivo. Programa completo dictado por la academia ShowRoots.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Más allá del título, este programa fundamentó la disciplina técnica que sostiene cada set: equipos calibrados, transiciones limpias y lectura precisa de pista.
          </p>
          <dl className="cert__meta">
            <div><dt>Academia</dt><dd>ShowRoots</dd></div>
            <div><dt>Año</dt><dd>2026</dd></div>
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
window.Session = Session;
window.Certificate = Certificate;
window.SectionHead = SectionHead;
