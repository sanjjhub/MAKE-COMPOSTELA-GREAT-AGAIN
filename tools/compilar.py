# -*- coding: utf-8 -*-
"""Compila los .jsx a un unico JavaScript listo para el navegador.

Sin esto la pagina compila el JSX en el navegador con Babel, lo que obliga a
cada visitante a descargar unos 3 MB solo para arrancar. Aqui se hace una vez,
en local, y el navegador recibe JavaScript ya compilado.

    python tools/compilar.py

Genera build/compostela.js. Ese archivo se versiona porque GitHub Pages sirve
estaticos y no compila nada.
"""
import hashlib
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, "build")
SALIDA = os.path.join(BUILD, "compostela.js")
# Huella del codigo fuente con el que se genero el bundle. Comparar fechas
# no sirve: git reescribe los archivos al cambiar de rama y les pone fecha
# nueva sin que su contenido haya cambiado.
HUELLA = os.path.join(BUILD, ".fuentes.sha256")

# El orden importa: cada archivo deja globales que usan los siguientes, y
# app.jsx tiene que ir al final porque es el que monta la aplicacion.
FUENTES = [
    "image-slot.js",
    "tweaks-panel.jsx",
    "cruz-forma.js",
    "cruz3d.jsx",
    "hero.jsx",
    "sections.jsx",
    "extras.jsx",
    "app.jsx",
]

ESBUILD = ["npx", "--yes", "esbuild@0.24.0"]


def compilar(ruta):
    """Transforma un archivo con esbuild y devuelve el JavaScript resultante."""
    cmd = ESBUILD + [
        ruta,
        "--loader:.jsx=jsx",
        "--loader:.js=js",
        "--jsx=transform",
        "--jsx-factory=React.createElement",
        "--jsx-fragment=React.Fragment",
        "--target=es2019",
        "--minify",
    ]
    r = subprocess.run(cmd, capture_output=True, shell=(os.name == "nt"))
    if r.returncode != 0:
        sys.stderr.write(r.stderr.decode("utf-8", "replace"))
        raise SystemExit("esbuild fallo con %s" % ruta)
    return r.stdout.decode("utf-8")


def huella_actual():
    h = hashlib.sha256()
    for nombre in FUENTES:
        with open(os.path.join(RAIZ, nombre), "rb") as fh:
            h.update(nombre.encode("utf-8"))
            h.update(fh.read())
    return h.hexdigest()


def esta_al_dia():
    if not (os.path.exists(SALIDA) and os.path.exists(HUELLA)):
        return False
    with open(HUELLA, encoding="utf-8") as fh:
        return fh.read().strip() == huella_actual()


def main():
    os.makedirs(BUILD, exist_ok=True)

    if "--si-hace-falta" in sys.argv and esta_al_dia():
        print("  El bundle ya esta al dia.")
        return
    partes = ["/* Generado por tools/compilar.py — no editar a mano. */"]
    total_fuente = 0

    for nombre in FUENTES:
        ruta = os.path.join(RAIZ, nombre)
        total_fuente += os.path.getsize(ruta)
        js = compilar(ruta)
        # Cada fuente va en su propio bloque para que un `return` o un `const`
        # de una no se cuele en la siguiente.
        partes.append("/* %s */\n%s" % (nombre, js.strip()))
        print("  %-20s %6.0f KB -> %6.0f KB" %
              (nombre, os.path.getsize(ruta) / 1024, len(js.encode("utf-8")) / 1024))

    with open(SALIDA, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(partes) + "\n")

    with open(HUELLA, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(huella_actual() + "\n")

    final = os.path.getsize(SALIDA)
    print()
    print("  build/compostela.js: %.0f KB (fuentes: %.0f KB)" %
          (final / 1024, total_fuente / 1024))


if __name__ == "__main__":
    main()
