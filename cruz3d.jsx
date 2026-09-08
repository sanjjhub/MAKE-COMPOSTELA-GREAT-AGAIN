/* CRUZ 3D — la cruz de Santiago del logo, extruida, con los cantos cromados.

   La cruz que hace de T en COMPOSTELA se saca del wordmark (el PNG
   logo-wordmark-nocross.png ya viene sin ella) y la dibuja este canvas en su
   hueco exacto. En reposo el resultado es identico al logo plano: la
   extrusion queda de canto, no se ve ni un lateral, y la cara frontal sale
   justo en el color del logo. De ahi arrancan dos movimientos:

     - el cursor, de arriba abajo de la pantalla: una vuelta entera;
     - el scroll, mientras el hero se va: otra vuelta, y ademas la cruz se
       inclina, crece y se queda rezagada respecto a la pagina.

   Los dos van enganchados (a la posicion del cursor, a la barra de scroll),
   no disparados: se recorren en los dos sentidos, como el scrub de
   ScrollTrigger. En tactil no hay cursor, asi que alli manda solo el scroll.

   Las tapas siguen siendo la cara del logo, planas y en su color. Los cantos
   son metal: no se iluminan, reflejan un entorno de estudio. Ver `entorno`.

   El contorno y la posicion vienen de cruz-forma.js, que genera
   tools/generar_cruz.py a partir de los PNG del logo.

   No hay libreria 3D. La cruz es un prisma: dos tapas planas y una tira de
   cuadrilateros que las une. Con 193 puntos de contorno son unos 200 poligonos
   por fotograma, que Canvas 2D dibuja de sobra, y ahorra los 600 KB de
   three.js en una pagina cuyo bundle entero son 76. */

const CRUZ_GROSOR = 0.13;   // fondo de la extrusion, en alturas de cruz
const CRUZ_MARGEN = 0.55;   // aire alrededor: al girar y al crecer se sale de su caja
const CRUZ_CAMARA = 3.4;    // distancia de la camara, en alturas de cruz
const CRUZ_TAU = Math.PI * 2;

/* Lo que hace el scroll mientras el hero se va: una vuelta mas, la cruz se
   inclina, crece y se queda rezagada respecto a la pagina. Va enganchado al
   scroll, no disparado por el: se puede recorrer hacia delante y hacia atras
   con la rueda, como el scrub de ScrollTrigger. */
const CRUZ_SCROLL_ALTO = 0.85;   // fraccion de pantalla que dura el recorrido
const CRUZ_SCROLL_GIRO = CRUZ_TAU;
const CRUZ_SCROLL_INCLINA = 0.34;
const CRUZ_SCROLL_ESCALA = 0.34;
const CRUZ_SCROLL_REZAGO = 0.30;  // parallax, en alturas de cruz

// Luz principal, blanca y casi de frente: con este vector la cara frontal sin
// girar recibe exactamente el color del logo, que es lo que hace que la cruz
// en reposo se confunda con el wordmark.
const CRUZ_LUZ = [-0.30, -0.46, 0.84];
// Luz de acento, por detras y a la derecha. Solo prende en los cantos que la
// miran de lleno, nunca en la cara frontal en reposo: es un filo de color, no
// un tinte. Pasarse aqui vuelve morada media cruz.
const CRUZ_RIM = [0.80, -0.30, -0.52];
const CRUZ_SUELO_TAPA = 0.55;   // lo mas oscura que llega a estar una tapa
const CRUZ_FUERZA_RIM = 0.15;

function cruzNormaliza(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}

/* Los colores salen de las variables CSS, asi la cruz sigue al tema claro /
   oscuro y al acento que se elija en el panel de tweaks. */
function cruzColor(texto, porDefecto) {
  const s = (texto || "").trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const h = m[1];
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  }
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) {
    const h = m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (p.length >= 3 && p.every((n) => !isNaN(n))) return [p[0], p[1], p[2]];
  }
  return porDefecto;
}

function crearCruz3D(canvas, forma) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { destruir() {} };

  const pts = forma.puntos;
  const n = pts.length;
  const g = CRUZ_GROSOR / 2;
  const luz = cruzNormaliza(CRUZ_LUZ);
  const rim = cruzNormaliza(CRUZ_RIM);
  // Con este divisor, la cara frontal de canto a la camara da intensidad 1.
  const refFrontal = luz[2];

  // Normal exterior de cada arista. El contorno viene en sentido horario con
  // la y hacia abajo, asi que girar la arista -90 grados apunta hacia fuera.
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  const nx = new Float64Array(n);
  const ny = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    px[i] = pts[i][0];
    py[i] = pts[i][1];
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = px[j] - px[i];
    const dy = py[j] - py[i];
    const L = Math.hypot(dx, dy) || 1;
    nx[i] = dy / L;
    ny[i] = -dx / L;
  }

  // Vertices rotados (antes de proyectar) y ya proyectados a pixeles.
  const FX = new Float64Array(n), FY = new Float64Array(n), FZ = new Float64Array(n);
  const BX = new Float64Array(n), BY = new Float64Array(n), BZ = new Float64Array(n);
  const fu = new Float64Array(n), fv = new Float64Array(n);
  const bu = new Float64Array(n), bv = new Float64Array(n);
  const zMedio = new Float64Array(n);
  const visibles = new Int32Array(n);
  const tono = new Float64Array(n);
  const brillo = new Float64Array(n);

  let base = [255, 255, 255];
  let fondo = [0, 0, 0];
  let acento = [255, 0, 255];
  const cacheColor = new Map();

  function leerColores() {
    const cs = getComputedStyle(document.documentElement);
    base = cruzColor(cs.getPropertyValue("--logo"), [255, 255, 255]);
    fondo = cruzColor(cs.getPropertyValue("--bg"), [0, 0, 0]);
    acento = cruzColor(cs.getPropertyValue("--accent"), [255, 0, 255]);
    cacheColor.clear();
  }

  /* i: cuanto del color del logo (0 = fondo, 1 = logo). r: cuanto acento.
     Canvas solo acepta colores como texto, asi que se cachean redondeados a
     un paso de 1/255 para no generar basura en cada fotograma. */
  function tinta(i, r) {
    const a = i < 0 ? 0 : i > 1 ? 255 : (i * 255) | 0;
    const b = r < 0 ? 0 : r > 1 ? 255 : (r * 255) | 0;
    const clave = a * 256 + b;
    let c = cacheColor.get(clave);
    if (c === undefined) {
      const ii = a / 255;
      const rr = b / 255;
      const canal = (k) => {
        const v = fondo[k] + (base[k] - fondo[k]) * ii + acento[k] * rr;
        return v < 0 ? 0 : v > 255 ? 255 : v | 0;
      };
      c = "rgb(" + canal(0) + "," + canal(1) + "," + canal(2) + ")";
      cacheColor.set(clave, c);
    }
    return c;
  }

  function acentoDe(ax, ay, az) {
    const d = ax * rim[0] + ay * rim[1] + az * rim[2];
    // Al cubo, para que el acento se quede en los cantos mas rasantes.
    return d > 0 ? d * d * d * CRUZ_FUERZA_RIM : 0;
  }

  /* Reflejo del entorno, para los cantos. Un metal no se ilumina: refleja, y
     eso es justo lo que separa el cromado del gris plano. Aqui el entorno es
     un estudio de tres franjas -- suelo oscuro, foco a la altura del horizonte
     y cielo claro -- que se consulta con el rayo reflejado.

     Como el contorno es plano y se extruye en linea recta, las normales de los
     cantos barren los 360 grados del plano de la cruz: los de arriba reflejan
     cielo y los de abajo suelo. De ahi salen las bandas del cromado.

     `arriba` es la componente vertical del reflejo (+1 mirando al cielo) y
     `lado` la horizontal, que rompe la simetria entre el brazo izquierdo y el
     derecho. */
  function entorno(arriba, lado) {
    let e = 0.13 + 0.44 * (arriba * 0.5 + 0.5);
    // El foco va un poco por encima del horizonte a proposito: los cantos
    // verticales -- que son casi toda la hoja del sable -- caen en su ladera y
    // no en el centro, asi la hoja queda modelada y no como un bloque blanco.
    e += 0.40 * Math.exp(-Math.pow((arriba - 0.20) / 0.10, 2));
    e += 0.15 * Math.exp(-Math.pow((arriba + 0.62) / 0.24, 2));   // rebote del suelo
    e += 0.09 * lado;
    return e;
  }

  // Tamano en pixeles fisicos. S es cuantos pixeles mide una altura de cruz.
  let W = 0, H = 0, S = 0, ox = 0, oy = 0;
  function medir() {
    const caja = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(caja.width * dpr));
    const h = Math.max(1, Math.round(caja.height * dpr));
    if (w === W && h === H) return;
    W = canvas.width = w;
    H = canvas.height = h;
    // El canvas mide la cruz mas el margen por arriba y por abajo, y el modelo
    // viene normalizado a altura 1: de ahi salen los pixeles por unidad.
    S = H / (1 + 2 * CRUZ_MARGEN);
    ox = W / 2;
    oy = H / 2;
  }

  function tapa(u, v, orden, color) {
    ctx.beginPath();
    ctx.moveTo(u[orden[0]], v[orden[0]]);
    for (let k = 1; k < n; k++) ctx.lineTo(u[orden[k]], v[orden[k]]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // El mismo color como borde tapa la costura de medio pixel que deja el
    // antialias entre la tapa y los laterales.
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  const ordenDirecto = new Int32Array(n);
  for (let i = 0; i < n; i++) ordenDirecto[i] = i;

  function dibujar(giro, inclina, luzX, escala, alzado) {
    if (!W) medir();
    ctx.clearRect(0, 0, W, H);

    // El scroll agranda la cruz y la deja rezagada: escala sobre el centro y
    // luego desplaza.
    const Se = S * escala;
    const oyE = oy + alzado * S;

    const cy = Math.cos(giro), sy = Math.sin(giro);
    const cx = Math.cos(inclina), sx = Math.sin(inclina);

    // La luz clave se desplaza con el cursor en horizontal: el brillo barre la
    // cruz al moverse de lado.
    const lx = luz[0] + luzX * 0.45;
    const ln = Math.hypot(lx, luz[1], luz[2]) || 1;
    const L0 = lx / ln, L1 = luz[1] / ln, L2 = luz[2] / ln;

    // Las tapas no son metalicas: son la cara del logo, y tienen que seguir
    // leyendose como el logo. Por eso caen poco -- de 1 a CRUZ_SUELO_TAPA -- en
    // vez de apagarse hasta el fondo: al lado de unos cantos cromados, una cara
    // gris oscura ensucia la pieza entera.
    function intensidadCon(ax, ay, az) {
      const d = ax * L0 + ay * L1 + az * L2;
      const i = CRUZ_SUELO_TAPA + (1 - CRUZ_SUELO_TAPA) * (d > 0 ? d / refFrontal : 0);
      return i > 1 ? 1 : i;
    }

    for (let i = 0; i < n; i++) {
      const x = px[i], y = py[i];
      const xa = x * cy, z1a = -x * sy;
      // Cara frontal (z = +g) y trasera (z = -g).
      let X = xa + g * sy, Z1 = z1a + g * cy;
      let Y = y * cx - Z1 * sx;
      let Z = y * sx + Z1 * cx;
      FX[i] = X; FY[i] = Y; FZ[i] = Z;
      let p = CRUZ_CAMARA / (CRUZ_CAMARA - Z);
      fu[i] = ox + X * Se * p;
      fv[i] = oyE + Y * Se * p;

      X = xa - g * sy; Z1 = z1a - g * cy;
      Y = y * cx - Z1 * sx;
      Z = y * sx + Z1 * cx;
      BX[i] = X; BY[i] = Y; BZ[i] = Z;
      p = CRUZ_CAMARA / (CRUZ_CAMARA - Z);
      bu[i] = ox + X * Se * p;
      bv[i] = oyE + Y * Se * p;
    }

    // Laterales: se descartan los que dan la espalda a la camara y el resto se
    // pinta de lejos a cerca.
    let nv = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const ax = nx[i], ay = ny[i];
      const AX = ax * cy, Z1 = -ax * sy;
      const AY = ay * cx - Z1 * sx;
      const AZ = ay * sx + Z1 * cx;
      const mx = (FX[i] + FX[j] + BX[i] + BX[j]) * 0.25;
      const my = (FY[i] + FY[j] + BY[i] + BY[j]) * 0.25;
      const mz = (FZ[i] + FZ[j] + BZ[i] + BZ[j]) * 0.25;
      // Vector unitario de la cara al ojo. Si la normal no le mira, sobra.
      const vl = Math.hypot(mx, my, CRUZ_CAMARA - mz) || 1;
      const VX = -mx / vl, VY = -my / vl, VZ = (CRUZ_CAMARA - mz) / vl;
      const nv2 = AX * VX + AY * VY + AZ * VZ;
      if (nv2 <= 0) continue;

      // Cromado: reflejo del entorno + brillo especular + fresnel en los
      // cantos rasantes, que es donde el metal siempre devuelve luz.
      const RX = 2 * nv2 * AX - VX;
      const RY = 2 * nv2 * AY - VY;
      let m = entorno(-RY, RX);
      const HX = L0 + VX, HY = L1 + VY, HZ = L2 + VZ;
      const hl = Math.hypot(HX, HY, HZ) || 1;
      const nh = (AX * HX + AY * HY + AZ * HZ) / hl;
      if (nh > 0) m += 0.5 * Math.pow(nh, 26);
      m += 0.14 * Math.pow(1 - nv2, 3);

      visibles[nv] = i;
      zMedio[i] = mz;
      tono[i] = m > 1 ? 1 : m < 0 ? 0 : m;
      brillo[i] = acentoDe(AX, AY, AZ);
      nv++;
    }
    const orden = Array.prototype.slice.call(visibles.subarray(0, nv));
    orden.sort((a, b) => zMedio[a] - zMedio[b]);

    // Normal de la tapa frontal, y la trasera es la misma cambiada de signo.
    const NFX = sy, NFY = -cy * sx, NFZ = cy * cx;
    const frenteCerca = cy > 0;

    const iFrente = intensidadCon(NFX, NFY, NFZ);
    const iDorso = intensidadCon(-NFX, -NFY, -NFZ);
    const rFrente = acentoDe(NFX, NFY, NFZ);
    const rDorso = acentoDe(-NFX, -NFY, -NFZ);

    ctx.lineWidth = 1;
    ctx.lineJoin = "round";

    // Tapa lejana primero. Nunca se ve entera, pero cierra el solido cuando la
    // cruz esta muy girada y asoma por los huecos del dibujo.
    if (frenteCerca) tapa(bu, bv, ordenDirecto, tinta(iDorso, rDorso));
    else tapa(fu, fv, ordenDirecto, tinta(iFrente, rFrente));

    for (let k = 0; k < nv; k++) {
      const i = orden[k];
      const j = (i + 1) % n;
      const c = tinta(tono[i], brillo[i]);
      ctx.beginPath();
      ctx.moveTo(fu[i], fv[i]);
      ctx.lineTo(fu[j], fv[j]);
      ctx.lineTo(bu[j], bv[j]);
      ctx.lineTo(bu[i], bv[i]);
      ctx.closePath();
      ctx.fillStyle = c;
      ctx.fill();
      ctx.strokeStyle = c;
      ctx.stroke();
    }

    // Tapa cercana. Lleva un degradado que barre la cara segun cuanto este
    // girada: a cero es plano, y ahi la cruz vuelve a ser el logo tal cual.
    const u = frenteCerca ? fu : bu;
    const v = frenteCerca ? fv : bv;
    const i0 = frenteCerca ? iFrente : iDorso;
    const r0 = frenteCerca ? rFrente : rDorso;
    const barrido = Math.abs(sy);
    let relleno;
    if (barrido < 0.01) {
      relleno = tinta(i0, r0);
    } else {
      let minU = Infinity, maxU = -Infinity;
      for (let i = 0; i < n; i++) {
        if (u[i] < minU) minU = u[i];
        if (u[i] > maxU) maxU = u[i];
      }
      const grad = sy > 0
        ? ctx.createLinearGradient(minU, 0, maxU, 0)
        : ctx.createLinearGradient(maxU, 0, minU, 0);
      grad.addColorStop(0, tinta(i0 * (1 - 0.26 * barrido), r0));
      grad.addColorStop(0.62, tinta(i0, r0));
      grad.addColorStop(1, tinta(i0 * (1 - 0.10 * barrido), r0 + 0.10 * barrido));
      relleno = grad;
    }
    tapa(u, v, ordenDirecto, relleno);
  }

  /* --- Movimiento ------------------------------------------------------- */

  let objetivo = 0, actual = 0;
  let inclinaObj = 0, inclina = 0;
  let luzObj = 0, luzX = 0;
  let avanceObj = 0, avance = 0;   // 0 a 1: cuanto se ha ido el hero
  let retardo = 0.25;   // espera a que el wordmark termine de subir
  let entrada = 0;      // 0 a 1: la vuelta de presentacion
  let ultimo = 0;
  let raf = 0;
  let corriendo = false;
  let enPantalla = true;

  function alMover(e) {
    const my = e.clientY / (window.innerHeight || 1);
    const mx = e.clientX / (window.innerWidth || 1);
    // Media pantalla = cruz de frente; de arriba abajo, una vuelta entera.
    const deseado = (my - 0.5) * CRUZ_TAU;
    // De todas las vueltas equivalentes se coge la mas cercana a donde esta la
    // cruz: asi nunca desanda el camino para llegar a la misma pose.
    objetivo = deseado + Math.round((actual - deseado) / CRUZ_TAU) * CRUZ_TAU;
    // Ademas de girar, se asoma hacia el cursor: con el cursor arriba, la
    // punta se inclina hacia el que mira.
    inclinaObj = (my - 0.5) * 0.20;
    luzObj = (mx - 0.5) * 2;
    arrancar();
  }

  function alDesplazar() {
    const alto = (window.innerHeight || 1) * CRUZ_SCROLL_ALTO;
    const p = window.scrollY / alto;
    avanceObj = p < 0 ? 0 : p > 1 ? 1 : p;
    arrancar();
  }

  function marco(t) {
    raf = requestAnimationFrame(marco);
    const dt = ultimo ? Math.min(0.05, (t - ultimo) / 1000) : 0.016;
    ultimo = t;

    if (retardo > 0) retardo -= dt;
    else if (entrada < 1) entrada = Math.min(1, entrada + dt / 1.5);

    // Cuando ya no queda nada por recorrer se cuadra al objetivo, se pinta el
    // ultimo fotograma y se para el bucle: parada la cruz no gasta nada.
    const listo = entrada >= 1 &&
      Math.abs(objetivo - actual) < 5e-4 &&
      Math.abs(inclinaObj - inclina) < 5e-4 &&
      Math.abs(luzObj - luzX) < 5e-4 &&
      Math.abs(avanceObj - avance) < 5e-4;
    if (listo) {
      actual = objetivo;
      inclina = inclinaObj;
      luzX = luzObj;
      avance = avanceObj;
    } else {
      const k = 1 - Math.exp(-dt * 7);
      actual += (objetivo - actual) * k;
      inclina += (inclinaObj - inclina) * k;
      luzX += (luzObj - luzX) * k;
      // El avance del scroll pasa por el mismo muelle: es lo que da el arrastre
      // del scrub, en vez de ir clavado al pixel de la barra.
      avance += (avanceObj - avance) * k;
    }

    const suave = 1 - Math.pow(1 - entrada, 3);
    dibujar(
      actual + avance * CRUZ_SCROLL_GIRO - (1 - suave) * CRUZ_TAU,
      inclina + avance * CRUZ_SCROLL_INCLINA,
      luzX,
      1 + avance * CRUZ_SCROLL_ESCALA,
      avance * CRUZ_SCROLL_REZAGO
    );
    if (listo) parar();
  }

  function arrancar() {
    // Sin esto, desplazarse por el pie de pagina despertaria el bucle para
    // dibujar una cruz que no se ve.
    if (corriendo || !enPantalla) return;
    corriendo = true;
    ultimo = 0;
    raf = requestAnimationFrame(marco);
  }
  function parar() {
    if (!corriendo) return;
    corriendo = false;
    cancelAnimationFrame(raf);
  }

  leerColores();

  // Repinta si cambia el tema o el acento: el panel de tweaks los escribe en
  // el <html>, uno como atributo y el otro como variable en linea.
  const observador = new MutationObserver(() => { leerColores(); arrancar(); });
  observador.observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme", "style"],
  });

  // Fuera de pantalla no se pinta nada.
  const mirilla = new IntersectionObserver((entradas) => {
    enPantalla = entradas[entradas.length - 1].isIntersecting;
    if (enPantalla) arrancar();
    else parar();
  }, { threshold: 0 });
  mirilla.observe(canvas);

  // El canvas se mide aqui y no en cada fotograma: getBoundingClientRect
  // obliga al navegador a recalcular el layout.
  const cinta = new ResizeObserver(() => { medir(); arrancar(); });
  cinta.observe(canvas);

  const alCambiarVisibilidad = () => {
    if (document.hidden) parar();
    else arrancar();
  };

  // El scroll manda siempre; el cursor solo donde lo hay. En tactil, arrastrar
  // el dedo tambien dispara pointermove, asi que ahi se ignora: si no, el gesto
  // de desplazar la pagina giraria la cruz por partida doble.
  const conRaton = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (conRaton) window.addEventListener("pointermove", alMover, { passive: true });
  window.addEventListener("scroll", alDesplazar, { passive: true });
  alDesplazar();
  // ResizeObserver no se entera si solo cambia la densidad de pixeles, por
  // ejemplo al arrastrar la ventana a otro monitor.
  const alRedimensionar = () => { medir(); arrancar(); };
  window.addEventListener("resize", alRedimensionar, { passive: true });
  document.addEventListener("visibilitychange", alCambiarVisibilidad);
  arrancar();

  return {
    destruir() {
      parar();
      observador.disconnect();
      mirilla.disconnect();
      cinta.disconnect();
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alRedimensionar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    },
  };
}

/* Sitio exacto del canvas dentro del wordmark, con su margen. El margen esta
   en alturas de cruz; en horizontal hay que dividirlo por la proporcion del
   wordmark para que mida lo mismo en pixeles. */
function cruzEstilo(forma) {
  const proporcionWM = forma.wordmark[0] / forma.wordmark[1];
  const mv = CRUZ_MARGEN * forma.caja.h;
  const mh = mv / proporcionWM;
  const pct = (v) => (v * 100).toFixed(4) + "%";
  return {
    left: pct(forma.caja.x - mh),
    top: pct(forma.caja.y - mv),
    width: pct(forma.caja.w + 2 * mh),
    height: pct(forma.caja.h + 2 * mv),
  };
}

function Cruz3D() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const motor = crearCruz3D(ref.current, window.CRUZ_FORMA);
    return () => motor.destruir();
  }, []);
  return (
    <canvas ref={ref} className="cruz3d" style={cruzEstilo(window.CRUZ_FORMA)} aria-hidden="true"></canvas>
  );
}

/* La cruz 3D solo entra si hay con que dibujarla y si el visitante no ha
   pedido menos animacion. Si no, el hero usa el wordmark completo de siempre. */
function hayCruz3D() {
  if (!window.CRUZ_FORMA || !window.CRUZ_FORMA.puntos) return false;
  if (typeof document.createElement("canvas").getContext !== "function") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

window.Cruz3D = Cruz3D;
window.hayCruz3D = hayCruz3D;
