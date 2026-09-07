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

**Secciones.** Hero → Sobre → Showreel → Certificado → Servicios → Booking →
Testimonios → Redes.

## Pendiente

- Los tres testimonios son de la plantilla original: los nombres no
  corresponden a clientes reales.
- El certificado ShowRots está sin verificar y falta la foto del diploma.
- Los seis paquetes de booking muestran `—` en lugar de precio.
- Falta el rider técnico; el enlace se retiró del footer hasta tenerlo.
- Las imágenes no están optimizadas para web (sin WebP ni tamaños múltiples).
