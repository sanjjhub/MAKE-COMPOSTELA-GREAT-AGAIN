# -*- coding: utf-8 -*-
"""Genera el EPK de una pagina (press/compostela-epk.pdf).

Toma los mismos datos y la misma identidad que la web: fondo negro, texto
blanco y magenta de marca. Se ejecuta a mano cuando cambian los datos:

    python tools/generar_epk.py
"""
import os

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "press", "compostela-epk.pdf")

NEGRO = HexColor("#000000")
BLANCO = HexColor("#ffffff")
MAGENTA = HexColor("#ff00ff")
GRIS = HexColor("#8a8a8a")

ANCHO, ALTO = A4
MARGEN = 38

DATOS = [
    ("Base", "Panamá · disponible para viajar"),
    ("Géneros", "Reggaeton · Latin urban · House · Tech house · Afro · EDM"),
    ("Formatos", "Discoteca · Privado · Boda · Quinceaños · Universidad · Beach"),
    ("Duración de set", "Hasta 4h, curado por bloques"),
    ("Equipo", "Pioneer CDJ / DDJ + mixer"),
    ("Formación", "DJ Profesional · ShowRots, 2024"),
    ("Idiomas", "Español / Inglés"),
    ("Disponibilidad", "2026 — early 2027"),
]

CONTACTO = [
    ("Booking", "djcompostela@gmail.com"),
    ("Teléfono", "+507 6388-7908"),
    ("Instagram", "@compostela.pty"),
    ("TikTok", "@compostela.ptyy"),
    ("YouTube", "@djcompostela"),
    ("SoundCloud", "soundcloud.com/compostela-103016286"),
]

BIO = (
    "Compostela es un DJ contemporáneo especializado en música urbana latina y "
    "electrónica, construyendo sets que mueven a multitudes con la misma intensidad "
    "en una discoteca de mil personas que en una boda de cien. El enfoque es simple: "
    "leer al público, respetar la curaduría del cliente y entregar una experiencia "
    "sonora premium."
)


def logo_blanco(ruta):
    """El wordmark es blanco sobre transparente; sobre fondo negro en PDF hay
    que aplanarlo contra negro o el alfa se vuelve blanco opaco."""
    im = Image.open(ruta).convert("RGBA")
    fondo = Image.new("RGB", im.size, (0, 0, 0))
    fondo.paste(im, mask=im.split()[3])
    return ImageReader(fondo)


def ajustar(c, texto, x, y, ancho, fuente, tam, interlineado):
    """Escribe texto ajustado a un ancho. Devuelve la Y final."""
    c.setFont(fuente, tam)
    palabras, linea = texto.split(), ""
    for p in palabras:
        prueba = (linea + " " + p).strip()
        if c.stringWidth(prueba, fuente, tam) <= ancho:
            linea = prueba
        else:
            c.drawString(x, y, linea)
            y -= interlineado
            linea = p
    if linea:
        c.drawString(x, y, linea)
        y -= interlineado
    return y


def main():
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    c = canvas.Canvas(SALIDA, pagesize=A4)
    c.setTitle("Compostela — Press Kit")
    c.setAuthor("Compostela")
    c.setSubject("EPK — DJ Compostela, Panamá")

    c.setFillColor(NEGRO)
    c.rect(0, 0, ANCHO, ALTO, fill=1, stroke=0)

    # --- Cabecera: wordmark ---
    wm = os.path.join(RAIZ, "assets", "logo-wordmark-tight.png")
    ancho_wm = ANCHO - MARGEN * 2
    alto_wm = ancho_wm * 399.0 / 2914.0
    y = ALTO - MARGEN - alto_wm
    c.drawImage(logo_blanco(wm), MARGEN, y, ancho_wm, alto_wm, mask="auto")

    y -= 26
    c.setFillColor(MAGENTA)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(MARGEN, y, "DJ  ·  OPEN FORMAT  ·  LATIN URBAN  ·  ELECTRÓNICA")
    c.setFillColor(GRIS)
    c.drawRightString(ANCHO - MARGEN, y, "PANAMÁ  ·  BOOKING 2026")

    y -= 16
    c.setStrokeColor(MAGENTA)
    c.setLineWidth(1.2)
    c.line(MARGEN, y, ANCHO - MARGEN, y)

    # --- Foto ---
    y -= 8
    foto = os.path.join(RAIZ, "assets", "session-thumb.jpg")
    alto_foto = 205
    y -= alto_foto
    c.drawImage(ImageReader(foto), MARGEN, y, ancho_wm, alto_foto,
                mask="auto", preserveAspectRatio=True, anchor="c")

    # --- Bio ---
    y -= 30
    c.setFillColor(BLANCO)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGEN, y, "QUIÉN ES COMPOSTELA")
    y -= 16
    c.setFillColor(HexColor("#d8d8d8"))
    y = ajustar(c, BIO, MARGEN, y, ancho_wm, "Helvetica", 9.5, 13)

    # --- Ficha tecnica ---
    y -= 16
    c.setFillColor(BLANCO)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGEN, y, "FICHA TÉCNICA")
    y -= 6
    for clave, valor in DATOS:
        y -= 15
        c.setStrokeColor(HexColor("#242424"))
        c.setLineWidth(0.5)
        c.line(MARGEN, y + 10, ANCHO - MARGEN, y + 10)
        c.setFillColor(GRIS)
        c.setFont("Helvetica", 7.5)
        c.drawString(MARGEN, y, clave.upper())
        c.setFillColor(BLANCO)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(MARGEN + 115, y, valor)

    # --- Ultima sesion ---
    y -= 28
    c.setFillColor(BLANCO)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGEN, y, "ÚLTIMA SESIÓN")
    y -= 15
    c.setFillColor(MAGENTA)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGEN, y, "Random Rec #1 · Summer Edition")
    y -= 13
    c.setFillColor(GRIS)
    c.setFont("Helvetica", 8.5)
    c.drawString(MARGEN, y, "Mayo 2026  ·  Ciudad de Panamá  ·  49 min  ·  Dir. Linder Romero")
    y -= 12
    c.setFillColor(HexColor("#d8d8d8"))
    c.drawString(MARGEN, y, "youtu.be/1um4NTRpCF8")

    # --- Contacto ---
    y_caja = MARGEN + 96
    c.setFillColor(HexColor("#0d0d0d"))
    c.rect(MARGEN, MARGEN, ancho_wm, y_caja - MARGEN, fill=1, stroke=0)
    c.setStrokeColor(MAGENTA)
    c.setLineWidth(1.2)
    c.line(MARGEN, y_caja, ANCHO - MARGEN, y_caja)

    yc = y_caja - 20
    c.setFillColor(BLANCO)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGEN + 14, yc, "CONTACTO Y BOOKING")

    yc -= 16
    col = 0
    inicio = yc
    for clave, valor in CONTACTO:
        x = MARGEN + 14 + (col // 3) * (ancho_wm / 2)
        yy = inicio - (col % 3) * 13
        c.setFillColor(GRIS)
        c.setFont("Helvetica", 7)
        c.drawString(x, yy, clave.upper())
        c.setFillColor(BLANCO)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(x + 62, yy, valor)
        col += 1

    c.setFillColor(HexColor("#4a4a4a"))
    c.setFont("Helvetica", 6.5)
    c.drawRightString(ANCHO - MARGEN - 14, MARGEN + 10,
                      "sanjjhub.github.io/MAKE-COMPOSTELA-GREAT-AGAIN")

    c.showPage()
    c.save()
    print("EPK generado: %s (%.0f KB)" % (SALIDA, os.path.getsize(SALIDA) / 1024))


if __name__ == "__main__":
    main()
