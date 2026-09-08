# Compostela — Press Kit

Press kit web de una sola página para **Compostela**, DJ de open format, música
urbana latina y electrónica.

## Ver la página

Necesita servirse por HTTP; con `file://` el navegador bloquea los scripts.

```bash
python serve.py
```

Y abre <http://localhost:4173>.

El servidor añade un `?v=<fecha>` a cada CSS/JS que enlaza el HTML. Sin eso el
navegador se queda con las versiones en caché de los `.jsx` y los cambios no se
ven al recargar.

## Publicar en GitHub Pages

No hace falta compilar nada. En **Settings → Pages** elige la rama y la carpeta
raíz (`/`); `index.html` está en el nivel superior del repositorio.

**Importante:** si tocas cualquier `.jsx`, hay que recompilar antes de subir,
o la web publicada seguirá con la versión anterior:

```bash
python tools/compilar.py
```

## Estructura

```
index.html            Esqueleto: fuentes, React y el bundle compilado
styles.css            Todo el diseño (variables, secciones, animaciones)
app.jsx               Composición de la página y datos
cruz-forma.js         Generado. Contorno de la cruz y su sitio en el wordmark
cruz3d.jsx            La cruz de Santiago en 3D, en el hueco de la T del hero
hero.jsx              Intro de carga, navegación, hero y marquesina
sections.jsx          Sobre, Showreel, Última sesión, Certificado
extras.jsx            Servicios, Booking, Testimonios, Redes, Footer
tweaks-panel.jsx      Panel flotante para ajustar acento y tipografía
image-slot.js         Reemplazo de imágenes desde la propia página
build/compostela.js   Generado. No editar a mano.
assets/               Fotos, logos y el vídeo de la sesión
press/                EPK en PDF y foto pack, para descargar
tools/                Scripts que generan el bundle, el EPK y el foto pack
serve.py              Servidor de desarrollo
```

## Compilar

Los `.jsx` no se envían al navegador: se compilan aquí una vez.

```bash
python tools/compilar.py        # -> build/compostela.js
python tools/generar_cruz.py    # -> cruz-forma.js + logo-wordmark-nocross.png
python tools/generar_epk.py     # -> press/compostela-epk.pdf
python tools/generar_fotopack.py # -> press/compostela-fotos.zip
```

Antes, la página mandaba los `.jsx` en crudo y Babel los compilaba en el
navegador: **4,2 MB de librerías** que cada visitante descargaba para ver
la primera pantalla. Ahora son unos 200 KB.

## Diseño

**Paleta.** Negro como color principal, blanco y magenta `#ff00ff` como
secundarios. Definida en variables CSS al principio de `styles.css`:

```css
:root            { /* tema claro: negro sobre blanco */ }
[data-theme=dark]{ /* tema principal: blanco sobre negro */ }
```

**Logos.** Los tres PNG son blancos sobre transparente y se aplican como
máscara CSS (`.logo--mark`, `.logo--word`, `.logo--word-tight`), no como `<img>`.
Así toman el color de `--logo`, fijado en blanco en todas partes.

`logo-wordmark-tight.png` es el wordmark recortado a su caja real: el original
trae mucho aire vertical y quedaba diminuto dentro de su contenedor.

`logo-wordmark-nocross.png` es ese mismo wordmark con la cruz de la T borrada.
El hueco lo ocupa la cruz en 3D del hero.

**La cruz 3D.** En el hero, la cruz de Santiago que hace de T no es parte del
PNG: es un `<canvas>` colocado en su hueco exacto. Se mueve con dos cosas:

- **El cursor.** De arriba abajo de la pantalla, una vuelta completa. En
  horizontal desplaza la luz, y la cruz se asoma un poco hacia el puntero.
- **El scroll.** Mientras el hero se va, otra vuelta más: la cruz se inclina,
  crece y se queda rezagada respecto a la página.

Los dos van *enganchados* al gesto, no disparados por él: se recorren hacia
delante y hacia atrás, como el `scrub` de ScrollTrigger. En táctil no hay
cursor, así que allí manda solo el scroll.

Con el cursor a media altura y sin scroll, la cruz queda de frente y el
resultado es idéntico al logo plano: la extrusión se ve de canto y la cara
frontal sale justo en el color de `--logo`. Es la pose de reposo, y es lo que
permite que el motion arranque desde el propio logotipo sin costura.

**Los cantos son metal.** Las tapas siguen siendo la cara del logo — planas, en
su color, porque tienen que seguir leyéndose como el logotipo. Los cantos, en
cambio, no se iluminan: reflejan. La función `entorno` de `cruz3d.jsx` es un
estudio de tres franjas (suelo oscuro, foco sobre el horizonte, cielo claro)
que se consulta con el rayo reflejado de cada cara. Como el contorno es plano y
se extruye recto, las normales de los cantos barren los 360° del plano de la
cruz: los de arriba reflejan cielo y los de abajo suelo. De ahí salen las
bandas del cromado.

No usa ninguna librería 3D. La cruz es un prisma —dos tapas y una tira de
cuadriláteros— que se pinta con Canvas 2D: unos 200 polígonos por fotograma,
frente a los 600 KB que pesaría `three.js` en una página cuyo bundle entero son
75. El contorno sale de trazar `logo-mark.png` con marching squares
(`tools/generar_cruz.py`), simplificado a 193 puntos.

Cuando la cruz llega a su sitio y deja de moverse, el bucle se detiene: parada
no consume nada. Con `prefers-reduced-motion` no se monta y vuelve el wordmark
completo de siempre.

**Secciones.** Hero → Sobre → Showreel → Certificado → Servicios → Booking →
Testimonios → Redes.

## Pendiente

- Los tres testimonios son de la plantilla original: los nombres no
  corresponden a clientes reales.
- El certificado ShowRots está sin verificar y falta la foto del diploma.
- Los seis paquetes de booking muestran `—` en lugar de precio.
- Falta el rider técnico; el enlace se retiró del footer hasta tenerlo.
- Las imágenes no están optimizadas para web (sin WebP ni tamaños múltiples).
