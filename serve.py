"""Servidor de desarrollo para el press kit de Compostela.

    python serve.py     ->  http://localhost:4173

Sirve los archivos sin cache y estampa un ?v=<fecha> en cada css/js/jsx que
enlaza el HTML. Sin esto el navegador se queda con las versiones viejas de los
.jsx y los cambios no se ven al recargar.

No hace falta para publicar: en GitHub Pages basta con los archivos estaticos.
"""

import functools
import http.server
import io
import os
import re

# El puerto puede venir del entorno: asi el arrancador puede asignar otro
# libre si el 4173 esta ocupado.
PORT = int(os.environ.get("PORT") or 4173)
ROOT = os.path.dirname(os.path.abspath(__file__))
ASSET_RE = re.compile(r'(?P<attr>(?:src|href)=")(?P<url>[^":?]+\.(?:css|js|jsx))"')


def stamp(html):
    """Anade ?v=<mtime> a cada recurso local enlazado en el HTML."""

    def repl(match):
        url = match.group("url")
        path = os.path.join(ROOT, url.lstrip("/"))
        try:
            version = int(os.path.getmtime(path))
        except OSError:
            return match.group(0)
        return '{}{}?v={}"'.format(match.group("attr"), url, version)

    return ASSET_RE.sub(repl, html)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if path.endswith(".html") and os.path.isfile(path):
            with open(path, encoding="utf-8") as handle:
                body = stamp(handle.read()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()

    def log_message(self, fmt, *args):
        pass

    def handle_one_request(self):
        # El navegador abre varias conexiones y cierra las que no llega a usar.
        # En Windows eso lanza un ConnectionAbortedError que llenaba la consola
        # de trazas sin que pasara nada malo.
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError):
            self.close_connection = True


if __name__ == "__main__":
    # Con un solo hilo el servidor atiende una conexion cada vez, y como el
    # navegador abre varias a la vez y las mantiene vivas, la pagina se
    # quedaba a medio cargar.
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    http.server.ThreadingHTTPServer.daemon_threads = True
    handler = functools.partial(Handler, directory=ROOT)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print("Compostela -> http://localhost:{}".format(PORT))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nAdios.")
