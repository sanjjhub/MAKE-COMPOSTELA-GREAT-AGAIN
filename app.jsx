/* APP — main composer */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

/* Tweakable defaults */
const ACCENT_OPTIONS = [
  ["#ff00ff", "#ff7bff"],   // magenta → magenta claro  (marca)
  ["#ff00ff", "#ffffff"],   // magenta → blanco
  ["#ffffff", "#ff00ff"],   // blanco → magenta
];

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#ff00ff", "#ff7bff"],
  "theme": "dark",
  "type": "grotesk"
}/*EDITMODE-END*/;

const TYPE_MAP = {
  grotesk: { d: "'Space Grotesk', sans-serif", b: "'Manrope', sans-serif" },
  serif:   { d: "'Fraunces', serif",          b: "'Manrope', sans-serif" },
  mono:    { d: "'JetBrains Mono', monospace", b: "'Manrope', sans-serif" },
};

function CustomCursor() {
  const dotRef = useRefA(null);
  const ringRef = useRefA(null);
  useEffectA(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top = my + "px";
      }
    };
    let raf;
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const t = e.target.closest("a, button, [role='button'], .reel__card, .exp__row");
      if (ringRef.current) ringRef.current.classList.toggle("hover", !!t);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <React.Fragment>
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={ringRef} className="cursor-ring"></div>
    </React.Fragment>
  );
}

function useScrollReveal() {
  useEffectA(() => {
    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}


const SHOWREEL_DATA = [
  { title: "Lazy Eye Records · Night Session", tag: "Club · Reel", duration: "01:14", img: "assets/image4.jpg" },
  { title: "Summer Pool Session", tag: "Beach · 60min", duration: "60:24", img: "assets/image.jpg" },
  { title: "Rooftop Skyline · Sunset Set", tag: "Open Air", duration: "45:12", img: "assets/image2.jpg" },
  { title: "Terrace Live · Open Format", tag: "Private · Reel", duration: "00:48", img: "assets/image3.jpg" },
  { title: "Sunlit Mixes · Showreel", tag: "Festival · Reel", duration: "01:00", img: "assets/foto6.jpg" },
];

function ThemeToggle({ value, onChange }) {
  return (
    <button className="theme-toggle" onClick={onChange} aria-label="Toggle theme">
      {value === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
      )}
    </button>
  );
}

function App() {
  const [introDone, setIntroDone] = useStateA(false);
  const [t, setT] = useTweaks(TWEAKS_DEFAULTS);
  const setTweak = (k, v) => setT({ [k]: v });

  // Apply tweaks to CSS vars
  useEffectA(() => {
    const root = document.documentElement;
    const acc = Array.isArray(t.accent) ? t.accent : ACCENT_OPTIONS[0];
    root.style.setProperty("--accent", acc[0]);
    root.style.setProperty("--accent-2", acc[1] || acc[0]);
    root.style.setProperty("--accent-glow", `color-mix(in oklch, ${acc[0]} 35%, transparent)`);
    const ty = TYPE_MAP[t.type] || TYPE_MAP.grotesk;
    root.style.setProperty("--font-display", ty.d);
    root.style.setProperty("--font-body", ty.b);
    root.setAttribute("data-theme", t.theme);
  }, [t.accent, t.theme, t.type]);

  useScrollReveal();

  return (
    <React.Fragment>
      <CustomCursor/>
      {!introDone && <IntroLoader onDone={() => setIntroDone(true)}/>}
      <Nav/>

      <main style={{ opacity: introDone ? 1 : 0, transition: "opacity .6s ease" }}>
        <Hero/>

        <Marquee words={[
          "OPEN FORMAT",
          "LATIN URBAN",
          "ELECTRONIC",
          "REGGAETON",
          "HOUSE",
          "TECH HOUSE",
          "AFRO",
          "EDM",
          "BOOK 2026",
        ]}/>

        <About/>
        <Showreel items={SHOWREEL_DATA}/>
        <Session/>
        <Certificate/>
        <Services/>
        <Pricing/>
        <Testimonials/>
        <Social/>
      </main>

      <Footer/>

      <ThemeToggle value={t.theme} onChange={() => setTweak("theme", t.theme === "light" ? "dark" : "light")}/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Aesthetic">
          <TweakColor
            label="Accent"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={ACCENT_OPTIONS}
          />
          <TweakRadio
            label="Theme"
            value={t.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
          />
          <TweakSelect
            label="Typography"
            value={t.type}
            onChange={(v) => setTweak("type", v)}
            options={[
              { label: "Space Grotesk (default)", value: "grotesk" },
              { label: "Fraunces (editorial)", value: "serif" },
              { label: "JetBrains Mono (technical)", value: "mono" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
