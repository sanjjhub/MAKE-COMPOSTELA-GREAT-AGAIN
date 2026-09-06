# Compostela — Press Kit

Press kit web de una sola página para **Compostela**, DJ de open format, música
urbana latina y electrónica.

## Ver la página

Necesita servirse por HTTP: los `.jsx` se compilan en el navegador con Babel y
el protocolo `file://` los bloquea por CORS.

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

> Ojo: la página compila JSX en el navegador con Babel standalone. Funciona,
> pero carga ~1,5 MB de JavaScript antes de pintar nada. Para producción de
> verdad conviene precompilar los `.jsx` y usar las versiones `production` de
> React.

## Estructura

```
index.html         Esqueleto: fuentes, React, Babel y los scripts
styles.css         Todo el diseño (variables, secciones, animaciones)
app.jsx            Composición de la página, datos y panel de ajustes
hero.jsx           Intro de carga, navegación, hero y marquesina
sections.jsx       Sobre, Showreel, Certificado
extras.jsx         Servicios, Booking, Testimonios, Redes, Footer
tweaks-panel.jsx   Panel flotante para ajustar acento y tipografía
image-slot.js      Componente para reemplazar imágenes desde la propia página
assets/            Fotos y logos
serve.py           Servidor de desarrollo
```

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

- Casi todos los enlaces externos son `href="#"`: redes, WhatsApp, YouTube y
  los botones de cotización. Faltan las URLs reales.
- Los seis paquetes de Booking muestran `—` en vez de precio.
- El dato **Idiomas** de la ficha técnica (`sections.jsx`) está sin confirmar.
- `assets/foto5.jpg` e `assets/image5.jpg` no se usan en ninguna parte.
- El tema claro deja los logos invisibles: son blancos fijos y el fondo es
  blanco. O se ajusta o se quita el interruptor.
- `.section` pisa el `padding` lateral de `.shell` y lo deja en 0, así que los
  títulos van pegados al borde de la pantalla.
- Las imágenes no están optimizadas para web (sin WebP ni tamaños múltiples).
