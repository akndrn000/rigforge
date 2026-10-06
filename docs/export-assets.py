"""Ekspor aset PNG RigForge neobrutalism modern (sumber: JetBrains Mono variable).

Sumber gambar dibuat sebagai SVG di public/brand.svg (vektor); file ini
me-render ulang desain yang sama ke PNG via Pillow: krem berpola titik +
kotak kuning miring + sudut membulat + bayangan keras hitam.
Jalankan: python docs/export-assets.py
"""

from pathlib import Path

from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
WOF_LATIN = (
    ROOT / "node_modules" / "@fontsource-variable" / "jetbrains-mono"
    / "files" / "jetbrains-mono-latin-wght-normal.woff2"
)

BG = "#FFFBEB"
DOT = (17, 17, 17, 36)
INK = "#111111"
MUTED = "#4B4B55"
YELLOW = "#FFD60A"
PINK = "#FF8FCB"
MINT = "#7CF2B4"
TEXT = "#111111"


def static_ttf(weight: int) -> Path:
    out = Path("C:/Users/Fauzi/AppData/Local/Temp/opencode/jbmono-{}.ttf".format(weight))
    out.parent.mkdir(parents=True, exist_ok=True)
    font = TTFont(str(WOF_LATIN))
    instantiateVariableFont(font, {"wght": weight}, inplace=True)
    font.save(str(out))
    return out


def paint_dots(base: Image.Image, step: int = 22, r: int = 2) -> None:
    # Pola titik di atas latar (RGBA lalu digabung).
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for y in range(2, base.size[1], step):
        for x in range(2, base.size[0], step):
            d.ellipse([x - r, y - r, x + r, y + r], fill=DOT)
    base.paste(Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB"))


def draw_brackets(draw: ImageDraw.ImageDraw, cx: float, cy: float, s: float,
                  color: str, width: int) -> None:
    # Kurung sudut ganda "<>" seperti ikon RigForge.
    draw.line([(cx - 0.30 * s, cy - 0.42 * s), (cx - 0.62 * s, cy),
               (cx - 0.30 * s, cy + 0.42 * s)], fill=color, width=width,
              joint="curve")
    draw.line([(cx + 0.30 * s, cy - 0.42 * s), (cx + 0.62 * s, cy),
               (cx + 0.30 * s, cy + 0.42 * s)], fill=color, width=width,
              joint="curve")


def tilted_box(base: Image.Image, x: int, y: int, box: int, radius: int,
               bw: int, shadow: int, angle: float = -4) -> tuple:
    # Kotak miring + bayangan keras: digambar di layer lalu diputar.
    pad = shadow + box
    layer = Image.new("RGBA", (box + pad * 2, box + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    o = pad
    d.rounded_rectangle([o + shadow, o + shadow, o + box + shadow, o + box + shadow],
                        radius=radius, fill=INK)
    d.rounded_rectangle([o, o, o + box, o + box],
                        radius=radius, fill=YELLOW, outline=INK, width=bw)
    layer = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    base.paste(layer, (x - pad, y - pad), layer)
    return (x + box / 2, y + box / 2)


def make_og(font_bold: str, font_regular: str) -> None:
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG)
    paint_dots(img)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([8, 8, W - 9, H - 9], radius=18, outline=INK, width=4)

    # Logo miring + ikon kurung.
    box = 120
    bx, by = 96, (H - box) // 2
    cx, cy = tilted_box(img, bx, by, box, radius=28, bw=6, shadow=12)
    d = ImageDraw.Draw(img)
    draw_brackets(d, cx, cy, 84, INK, 10)

    f_title = ImageFont.truetype(font_bold, 84)
    f_sub = ImageFont.truetype(font_regular, 24)
    tx = bx + box + 48 + 12
    title_top = by - 16
    # Marker pink di belakang bagian bawah wordmark.
    d.rectangle([tx - 6, title_top + 52, tx + 470, title_top + 90], fill=PINK)
    d.text((tx, title_top), "RigForge", font=f_title, fill=TEXT)
    d.text((tx, title_top + 100 + 12),
           "Ubah data avatar Roblox jadi script Lua siap pakai.",
           font=f_sub, fill=MUTED)

    # Tiga blok warna tanpa teks.
    for i, col in enumerate((PINK, YELLOW, MINT)):
        sx = tx + i * 72
        sy = title_top + 100 + 12 + 44
        d.rounded_rectangle([sx + 6, sy + 6, sx + 62, sy + 62],
                            radius=14, fill=INK)
        d.rounded_rectangle([sx, sy, sx + 56, sy + 56],
                            radius=14, fill=col, outline=INK, width=4)
    img.save(PUBLIC / "og-image.png")


def make_icon(font_bold: str) -> None:
    del font_bold
    S = 180
    img = Image.new("RGB", (S, S), BG)
    paint_dots(img, step=22, r=2)
    cx, cy = tilted_box(img, 28, 28, S - 56 - 12, radius=28, bw=8, shadow=12)
    d = ImageDraw.Draw(img)
    draw_brackets(d, cx, cy, 62, INK, 12)
    img.save(PUBLIC / "apple-touch-icon.png")


if __name__ == "__main__":
    bold = static_ttf(800)
    regular = static_ttf(400)
    make_og(str(bold), str(regular))
    make_icon(str(bold))
    print("wrote public/og-image.png + public/apple-touch-icon.png")
