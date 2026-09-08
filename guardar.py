# -*- coding: utf-8 -*-
"""Guarda y publica los cambios de la pagina en un solo paso.

    python guardar.py "lo que cambiaste"

Hace, en este orden:
  1. Recompila el bundle si tocaste algun .jsx o .js (si no, la web publicada
     seguiria mostrando la version anterior).
  2. Muestra que archivos cambiaron.
  3. Hace el commit.
  4. Trae lo que haya subido otra persona y pone tus cambios encima.
  5. Sube a GitHub.

Si algo falla, se detiene y te dice que pasa en vez de dejar el repositorio a
medias.
"""
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
BUNDLE = os.path.join(RAIZ, "build", "compostela.js")
FUENTES = ["app.jsx", "hero.jsx", "sections.jsx", "extras.jsx",
           "tweaks-panel.jsx", "cruz3d.jsx", "cruz-forma.js", "image-slot.js"]


def git(*args, **kw):
    return subprocess.run(["git"] + list(args), cwd=RAIZ,
                          capture_output=True, text=True, encoding="utf-8",
                          errors="replace", **kw)


def salir(mensaje):
    print("\n  %s" % mensaje)
    raise SystemExit(1)


def hay_que_recompilar():
    if not os.path.exists(BUNDLE):
        return True
    bundle = os.path.getmtime(BUNDLE)
    for f in FUENTES:
        ruta = os.path.join(RAIZ, f)
        if os.path.exists(ruta) and os.path.getmtime(ruta) > bundle:
            return True
    return False


def main():
    if len(sys.argv) < 2:
        salir('Falta el mensaje. Ejemplo:\n'
              '     python guardar.py "cambio la foto del hero"')
    mensaje = " ".join(sys.argv[1:])

    if git("rev-parse", "--git-dir").returncode != 0:
        salir("Esta carpeta no es un repositorio de git.")

    # 1. Recompilar si hace falta
    if hay_que_recompilar():
        print("Recompilando el bundle...")
        r = subprocess.run([sys.executable, os.path.join("tools", "compilar.py")],
                           cwd=RAIZ)
        if r.returncode != 0:
            salir("Fallo la compilacion. No se subio nada.")
        print()
    else:
        print("El bundle ya esta al dia.\n")

    # 2. Ver que cambio
    cambios = git("status", "--porcelain").stdout.strip()
    if not cambios:
        print("No hay nada que guardar: no cambiaste ningun archivo.")
        return
    print("Cambios que se van a guardar:")
    for linea in cambios.split("\n"):
        print("   " + linea.strip())
    print()

    # 3. Commit
    git("add", "-A")
    r = git("commit", "-m", mensaje)
    if r.returncode != 0:
        salir("No se pudo hacer el commit:\n%s" % (r.stderr or r.stdout))
    print("Guardado: %s" % mensaje)

    # 4. Traer lo de los demas antes de subir
    print("Trayendo cambios de GitHub...")
    r = git("pull", "--rebase")
    if r.returncode != 0:
        salir("Hay un conflicto con lo que subio otra persona.\n"
              "     Tu commit esta guardado, pero no se subio.\n"
              "     Avisa para resolverlo:\n%s" % (r.stderr or r.stdout))

    # 5. Subir
    print("Subiendo...")
    r = git("push")
    if r.returncode != 0:
        salir("No se pudo subir:\n%s" % (r.stderr or r.stdout))

    print()
    print("Listo. En un minuto se ve en:")
    print("   https://sanjjhub.github.io/MAKE-COMPOSTELA-GREAT-AGAIN/")


if __name__ == "__main__":
    main()
