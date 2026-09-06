/* HERO + MARQUEE */
const { useState, useEffect, useRef } = React;

function Arrow({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="arr">
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 2L12 7L3 12Z"/>
    </svg>
  );
}

function IntroLoader({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2200);
    const t2 = setTimeout(() => onDone && onDone(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div className={"intro " + (out ? "is-out" : "")}>
      <div className="intro__inner">
        <div className="intro__meta">
          <span>SET / 001</span>
          <span>2026 / PRESS KIT</span>
        </div>
        <div className="logo logo--mark intro__logo-mark" aria-label="Compostela mark"></div>
        <div className="logo logo--word intro__wordmark" aria-label="COMPOSTELA"></div>
        <div className="intro__bar"></div>
        <div className="intro__meta">
          <span>OPEN FORMAT · LATIN · ELECTRONIC</span>
          <span>LOADING SESSION...</span>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 200 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={"nav " + (hidden ? "is-hidden" : "")}>
      <a href="#top" className="nav__brand">
        <span className="nav__brand-wm">
          <span className="logo logo--mark"></span>
          <span className="logo logo--word"></span>
        </span>
      </a>
      <div className="nav__links">
        <a href="#about">Sobre</a>
        <a href="#showreel">Showreel</a>
        <a href="#services">Servicios</a>
        <a href="#pricing">Booking</a>
      </div>
      <a href="#pricing" className="nav__cta">Reservar fecha →</a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__photo-bg">
        <img src="assets/hero.jpg" alt=""/>
      </div>
      <div className="hero__bg">
        <div className="hero__glow hero__glow--1"></div>
        <div className="hero__glow hero__glow--2"></div>
      </div>
      <div className="logo logo--mark hero__watermark hero__watermark--mark" aria-hidden="true"></div>

      <div className="hero__top">
        <div className="hero__loc">
          <div><strong>BASED IN</strong> · LATAM / GLOBAL</div>
          <div style={{ marginTop: 8 }}>AVAILABLE FOR BOOKING · 2026</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", display: "inline-block", boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent)" }}></span>
            <span>STATUS — ON TOUR</span>
          </div>
        </div>
      </div>

      <h1 className="hero__title">
        <span className="hero__title-sr">Compostela</span>
        <span className="hero__logo" aria-hidden="true">
          <span className="logo logo--word-tight hero__logo-mark"></span>
        </span>
      </h1>

      <div className="hero__sub">
        <span>DJ</span><span className="dot"></span>
        <span>Open Format</span><span className="dot"></span>
        <span>Latin Urban</span><span className="dot"></span>
        <span>Electronic</span>
      </div>

      <div className="hero__actions">
        <a href="#pricing" className="btn">Book Now <Arrow/></a>
        <a href="#showreel" className="btn btn--ghost"><IconPlay/> Watch Set</a>
        <a href="#" className="btn btn--icon" aria-label="Instagram"><IconInstagram/></a>
      </div>
    </section>
  );
}

function Marquee({ words }) {
  const content = [...words, ...words, ...words];
  return (
    <div className="marquee">
      <div className="marquee__track">
        {content.map((w, i) => <span key={i}>{w}</span>)}
      </div>
    </div>
  );
}

window.Hero = Hero;
window.Marquee = Marquee;
window.Nav = Nav;
window.IntroLoader = IntroLoader;
window.Arrow = Arrow;
window.IconPlay = IconPlay;
