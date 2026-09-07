# -*- coding: utf-8 -*-
"""Arma el foto pack descargable (press/compostela-fotos.zip).

Reune las fotos y los logos a resolucion completa para que un club pueda hacer
el flyer sin tener que pedirlos por WhatsApp. Se regenera con:

    python tools/generar_fotopack.py
"""
import os
import zipfile

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(RAIZ, "assets")
SALIDA = os.path.join(RAIZ, "press", "compostela-fotos.zip")

FOTOS = [
    ("foto6.jpg", "compostela-01.jpg"),
    ("image.jpg", "compostela-02.jpg"),
    ("image2.jpg", "compostela-03.jpg"),
    ("image3.jpg", "compostela-04.jpg"),
    ("image4.jpg", "compostela-05.jpg"),
    ("hero.jpg", "compostela-retrato-01.jpg"),
    ("booking.jpg", "compostela-retrato-02.jpg"),
    ("session-thumb.jpg", "random-rec-portada.jpg"),
]

LOGOS = [
    ("logo-wordmark.png", "logo-wordmark-blanco.png"),
    ("logo-wordmark-tight.png", "logo-wordmark-blanco-recortado.png"),
    ("logo-mark.png", "logo-cruz-blanco.png"),
    ("logo-stacked.png", "logo-apilado-blanco.png"),
]

LEEME = """COMPOSTELA - FOTO PACK
======================

Fotografias y logos a resolucion completa para uso en flyers, carteleria,
prensa y redes.

CONTENIDO
  fotos/   Fotografias en alta resolucion.
  logos/   Logos en PNG, blancos sobre fondo transparente.

SOBRE LOS LOGOS
  Son blancos: sobre fondo claro no se veran. Para fondo claro, invierte el
  color en tu editor.

CREDITOS
  Portada de "Random Rec #1": direccion de Linder Romero.

CONTACTO
  Booking     djcompostela@gmail.com
  Telefono    +507 6388-7908
  Instagram   @compostela.pty
  TikTok      @compostela.ptyy
  YouTube     @djcompostela
  SoundCloud  soundcloud.com/compostela-103016286

  sanjjhub.github.io/MAKE-COMPOSTELA-GREAT-AGAIN
"""


def main():
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    incluidos = 0
    # Las fotos ya son JPEG y los logos PNG: comprimirlos otra vez no gana
    # nada y ralentiza la descarga, asi que se guardan tal cual.
    with zipfile.ZipFile(SALIDA, "w", zipfile.ZIP_STORED) as z:
        z.writestr("LEEME.txt", LEEME)
        for carpeta, lista in (("fotos", FOTOS), ("logos", LOGOS)):
            for origen, destino in lista:
                ruta = os.path.join(ASSETS, origen)
                if not os.path.exists(ruta):
                    print("  falta y se omite: %s" % origen)
                    continue
                with Image.open(ruta) as im:
                    medida = "%dx%d" % im.size
                z.write(ruta, "%s/%s" % (carpeta, destino))
                print("  %-34s %-12s %.0f KB" % (destino, medida,
                                                 os.path.getsize(ruta) / 1024))
                incluidos += 1

    print()
    print("Foto pack: %s" % SALIDA)
    print("%d archivos, %.1f MB" % (incluidos, os.path.getsize(SALIDA) / 1024 / 1024))


if __name__ == "__main__":
    main()
