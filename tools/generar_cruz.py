# -*- coding: utf-8 -*-
"""Extrae la cruz de Santiago del logo y genera lo que necesita el motion 3D.

    python tools/generar_cruz.py

Produce dos cosas:

  cruz-forma.js                          El contorno de la cruz como poligono,
                                         y donde encaja dentro del wordmark.
  assets/logo-wordmark-nocross.png       El wordmark sin la cruz, para que el
                                         hueco de la T lo ocupe el canvas 3D.

El contorno se traza sobre assets/logo-mark.png (3000x3000) y no sobre la cruz
del wordmark (291 px de ancho): es el mismo dibujo -- se han comparado y
coinciden al 98% -- pero con cinco veces mas resolucion, asi que los bordes
curvos salen limpios en pantallas grandes.

El trazado es marching squares con interpolacion lineal en el umbral: da
puntos con precision de subpixel, en vez del borde en escalera que sale de
seguir el contorno pixel a pixel.
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARK = os.path.join(RAIZ, "assets", "logo-mark.png")
WORDMARK = os.path.join(RAIZ, "assets", "logo-wordmark-tight.png")
SIN_CRUZ = os.path.join(RAIZ, "assets", "logo-wordmark-nocross.png")
SALIDA = os.path.join(RAIZ, "cruz-forma.js")

UMBRAL = 128.0
# Tolerancia del simplificado, en unidades de altura de la cruz. A 0.0015 el
# error se queda por debajo de medio pixel con la cruz a 300 px de alto -- mas
# de lo que llega a medir en un hero de escritorio -- con unos 190 puntos.
TOLERANCIA = 0.0015


def contornos(campo, iso=UMBRAL):
    """Marching squares: devuelve las curvas cerradas del nivel `iso`.

    Cada celda de 2x2 aporta 0, 1 o 2 segmentos segun cuales de sus cuatro
    esquinas quedan dentro. Los extremos se interpolan sobre la arista, que es
    lo que evita el borde en escalera.
    """
    campo = np.pad(campo.astype(np.float64), 1, constant_values=0.0)
    alto, ancho = campo.shape

    def cruce(a, b, pa, pb):
        """Punto de la arista pa-pb donde el campo vale `iso`."""
        t = (iso - a) / (b - a) if b != a else 0.5
        return (pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t)

    # Aristas de la celda: 0 arriba, 1 derecha, 2 abajo, 3 izquierda. Cada
    # caso dice por que dos aristas sale la curva; el sentido da igual porque
    # los segmentos se encadenan sin orientacion y el giro final lo decide el
    # area.
    TABLA = {
        1: [(3, 0)], 2: [(0, 1)], 3: [(3, 1)], 4: [(1, 2)],
        6: [(0, 2)], 7: [(3, 2)], 8: [(2, 3)], 9: [(0, 2)],
        11: [(1, 2)], 12: [(1, 3)], 13: [(0, 1)], 14: [(0, 3)],
    }

    dentro = (campo >= iso).astype(np.uint8)
    casos = (dentro[:-1, :-1] | (dentro[:-1, 1:] << 1) |
             (dentro[1:, 1:] << 2) | (dentro[1:, :-1] << 3))
    # Solo interesan las celdas que corta la curva: son unas pocas miles de
    # los nueve millones que tiene la imagen.
    ys, xs = np.nonzero((casos != 0) & (casos != 15))

    segmentos = []
    for y, x in zip(ys.tolist(), xs.tolist()):
        caso = int(casos[y, x])
        v00, v10 = campo[y, x], campo[y, x + 1]
        v01, v11 = campo[y + 1, x], campo[y + 1, x + 1]
        p00, p10 = (x, y), (x + 1, y)
        p01, p11 = (x, y + 1), (x + 1, y + 1)
        aristas = (
            cruce(v00, v10, p00, p10),
            cruce(v10, v11, p10, p11),
            cruce(v01, v11, p01, p11),
            cruce(v00, v01, p00, p01),
        )
        if caso in (5, 10):
            # Silla de montar: las cuatro aristas estan cortadas y hay dos
            # formas de unirlas. La media de las esquinas dice si las dos
            # diagonales de dentro se tocan por el centro o no.
            medio = (v00 + v10 + v01 + v11) / 4.0 >= iso
            if (caso == 5) == medio:
                pares = ((0, 1), (2, 3))
            else:
                pares = ((3, 0), (1, 2))
        else:
            pares = TABLA[caso]
        for a, b in pares:
            segmentos.append((aristas[a], aristas[b]))

    # Encadenado: los extremos que comparten dos celdas salen del mismo
    # calculo, asi que coinciden en binario. Aun asi se redondea por si acaso.
    def clave(p):
        return (round(p[0], 6), round(p[1], 6))

    vecinos = {}
    for a, b in segmentos:
        vecinos.setdefault(clave(a), []).append((clave(b), b))
        vecinos.setdefault(clave(b), []).append((clave(a), a))

    curvas = []
    visitados = set()
    for inicio in list(vecinos):
        if inicio in visitados:
            continue
        curva = [inicio]
        visitados.add(inicio)
        actual, previo = inicio, None
        while True:
            siguiente = None
            for k, p in vecinos.get(actual, ()):
                if k != previo and k not in visitados:
                    siguiente = (k, p)
                    break
            if siguiente is None:
                break
            visitados.add(siguiente[0])
            curva.append(siguiente[1])
            previo, actual = actual, siguiente[0]
        if len(curva) > 8:
            curvas.append([(float(p[0]), float(p[1])) for p in curva])
    return curvas


def area(puntos):
    """Area con signo. Negativa o positiva segun el sentido de giro."""
    s = 0.0
    for i in range(len(puntos)):
        x0, y0 = puntos[i]
        x1, y1 = puntos[(i + 1) % len(puntos)]
        s += x0 * y1 - x1 * y0
    return s / 2.0


def simplificar(puntos, tol):
    """Ramer-Douglas-Peucker sobre una curva cerrada."""
    def tramo(pts):
        if len(pts) < 3:
            return pts
        x0, y0 = pts[0]
        x1, y1 = pts[-1]
        dx, dy = x1 - x0, y1 - y0
        norma = (dx * dx + dy * dy) ** 0.5
        peor, idx = -1.0, 0
        for i in range(1, len(pts) - 1):
            x, y = pts[i]
            if norma == 0:
                d = ((x - x0) ** 2 + (y - y0) ** 2) ** 0.5
            else:
                d = abs(dy * x - dx * y + x1 * y0 - y1 * x0) / norma
            if d > peor:
                peor, idx = d, i
        if peor <= tol:
            return [pts[0], pts[-1]]
        return tramo(pts[:idx + 1])[:-1] + tramo(pts[idx:])

    # Se parte por el punto mas lejano al centro para que el corte del RDP no
    # caiga en mitad de una curva suave (la punta de la espada, por ejemplo).
    cx = sum(p[0] for p in puntos) / len(puntos)
    cy = sum(p[1] for p in puntos) / len(puntos)
    pivote = max(range(len(puntos)),
                 key=lambda i: (puntos[i][0] - cx) ** 2 + (puntos[i][1] - cy) ** 2)
    girado = puntos[pivote:] + puntos[:pivote]
    salida = tramo(girado + [girado[0]])
    return salida[:-1]


def cruz_del_wordmark():
    """Bbox de la cruz dentro del wordmark, y el wordmark sin ella."""
    img = Image.open(WORDMARK).convert("RGBA")
    datos = np.array(img)
    alfa = datos[:, :, 3]

    # Umbral bajo para que el antialias entre en la misma pieza: si se corta a
    # 128 quedaria un halo de la cruz al borrarla. Las letras siguen sueltas,
    # la mas cercana pasa a 3 px.
    etiquetas, _ = ndimage.label(alfa > 8, structure=np.ones((3, 3)))
    piezas = ndimage.find_objects(etiquetas)
    # La cruz es la pieza mas alta: sube por encima de las mayusculas y baja
    # por debajo de la linea base.
    idx = max(range(len(piezas)), key=lambda i: piezas[i][0].stop - piezas[i][0].start)
    mascara = etiquetas == (idx + 1)

    ys, xs = np.nonzero(mascara & (alfa > UMBRAL))
    caja = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)

    datos[mascara] = 0
    Image.fromarray(datos).save(SIN_CRUZ)
    return caja, img.size


def main():
    caja, (ancho_wm, alto_wm) = cruz_del_wordmark()
    x0, y0, x1, y1 = caja
    print("  cruz dentro del wordmark: x %d-%d  y %d-%d  (%dx%d)"
          % (x0, x1, y0, y1, x1 - x0, y1 - y0))

    alfa = np.array(Image.open(MARK).convert("RGBA"))[:, :, 3]
    curvas = contornos(alfa)
    curvas.sort(key=lambda c: abs(area(c)), reverse=True)
    print("  contornos encontrados: %d (el mayor con %d puntos)"
          % (len(curvas), len(curvas[0])))

    forma = curvas[0]
    # Sentido horario en coordenadas de pantalla (y hacia abajo): asi la
    # normal de cada arista apunta hacia fuera al girarla 90 grados.
    if area(forma) < 0:
        forma.reverse()

    xs = [p[0] for p in forma]
    ys = [p[1] for p in forma]
    ancho = max(xs) - min(xs)
    alto = max(ys) - min(ys)
    cx = (max(xs) + min(xs)) / 2.0
    cy = (max(ys) + min(ys)) / 2.0

    # Normalizado: alto 1, centrado en el origen. El ancho queda en su
    # proporcion real (~0.74).
    forma = [((px - cx) / alto, (py - cy) / alto) for px, py in forma]
    forma = simplificar(forma, TOLERANCIA)
    print("  simplificado a %d puntos (tolerancia %.4f)" % (len(forma), TOLERANCIA))

    datos = {
        # Tamano del wordmark, para calcular su proporcion en el navegador.
        "wordmark": [ancho_wm, alto_wm],
        # Donde va la cruz dentro de la caja del wordmark, en fracciones.
        "caja": {
            "x": round(x0 / ancho_wm, 6),
            "y": round(y0 / alto_wm, 6),
            "w": round((x1 - x0) / ancho_wm, 6),
            "h": round((y1 - y0) / alto_wm, 6),
        },
        "proporcion": round(ancho / alto, 6),
        "puntos": [[round(px, 5), round(py, 5)] for px, py in forma],
    }

    with open(SALIDA, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* Generado por tools/generar_cruz.py — no editar a mano.\n"
                 "   Contorno de la cruz de Santiago del logo, normalizado a\n"
                 "   altura 1 y centrado en el origen. */\n")
        fh.write("window.CRUZ_FORMA = " + json.dumps(datos, separators=(",", ":")) + ";\n")

    print("  cruz-forma.js: %.1f KB" % (os.path.getsize(SALIDA) / 1024))
    print("  assets/logo-wordmark-nocross.png: %.1f KB"
          % (os.path.getsize(SIN_CRUZ) / 1024))


if __name__ == "__main__":
    main()
