"""
Script auxiliar para geração de ícones PWA institucionais do CONFORMA GSASP.
Gera ícones SVG e PNG (192x192, 512x512, 180x180) diretamente via zlib e struct sem dependências extras.
"""

import math
import struct
import zlib
from pathlib import Path


def criar_png_rgba(largura: int, altura: int, pixel_func) -> bytes:
    """Gera um arquivo PNG RGBA puro com zlib e struct."""
    assinatura = b"\x89PNG\r\n\x1a\n"

    # IHDR
    dados_ihdr = struct.pack(">IIBBBBB", largura, altura, 8, 6, 0, 0, 0)
    crc_ihdr = struct.pack(">I", zlib.crc32(b"IHDR" + dados_ihdr) & 0xFFFFFFFF)
    chunk_ihdr = struct.pack(">I", len(dados_ihdr)) + b"IHDR" + dados_ihdr + crc_ihdr

    # Dados das linhas (scanlines)
    scanlines = bytearray()
    for y in range(altura):
        scanlines.append(0)  # Filtro 0 (None)
        for x in range(largura):
            r, g, b, a = pixel_func(x, y, largura, altura)
            scanlines.extend((r, g, b, a))

    dados_comprimidos = zlib.compress(bytes(scanlines), level=9)
    crc_idat = struct.pack(">I", zlib.crc32(b"IDAT" + dados_comprimidos) & 0xFFFFFFFF)
    chunk_idat = struct.pack(">I", len(dados_comprimidos)) + b"IDAT" + dados_comprimidos + crc_idat

    # IEND
    chunk_iend = struct.pack(">I", 0) + b"IEND" + struct.pack(">I", zlib.crc32(b"IEND") & 0xFFFFFFFF)

    return assinatura + chunk_ihdr + chunk_idat + chunk_iend


def desenhar_icone_conforma(x: int, y: int, w: int, h: int) -> tuple[int, int, int, int]:
    """Renderiza um escudo institucional azul marinho com anel de conformidade e checkmark."""
    # Coordenadas normalizadas [-1, 1]
    nx = (x / (w - 1)) * 2 - 1
    ny = (y / (h - 1)) * 2 - 1

    dist_centro = math.sqrt(nx * nx + ny * ny)

    # Cores
    bg_azul_escuro = (15, 23, 42, 255)     # #0F172A
    azul_primario = (2, 132, 199, 255)     # #0284C7
    azul_claro = (56, 189, 248, 255)       # #38BDF8
    branco = (255, 255, 255, 255)
    dourado_suave = (245, 158, 11, 255)    # #F59E0B

    # Fundo arredondado (squircle / cantos suaves)
    raio_borda = 0.88
    if abs(nx) > raio_borda or abs(ny) > raio_borda:
        dx = max(0.0, abs(nx) - raio_borda + 0.12)
        dy = max(0.0, abs(ny) - raio_borda + 0.12)
        if math.sqrt(dx * dx + dy * dy) > 0.12:
            return (0, 0, 0, 0)

    # Anel externo sutil
    if 0.74 < dist_centro < 0.82:
        return azul_primario

    # Escudo central
    # Forma simplificada de escudo: topo reto, lados curvados convergindo embaixo
    em_escudo = False
    if ny > -0.55 and ny < 0.65:
        largura_max = 0.58
        if ny < 0.1:
            largura_atual = largura_max
        else:
            progresso = (ny - 0.1) / 0.55
            largura_atual = largura_max * (1.0 - progresso * 0.75)
        if abs(nx) <= largura_atual:
            em_escudo = True

    # Checkmark central de conformidade
    # Linha 1: (-0.28, 0.05) até (-0.05, 0.28)
    # Linha 2: (-0.05, 0.28) até (0.32, -0.22)
    def dist_segmento(px, py, x1, y1, x2, y2):
        l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2
        if l2 == 0:
            return math.hypot(px - x1, py - y1)
        t = max(0.0, min(1.0, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2))
        proj_x = x1 + t * (x2 - x1)
        proj_y = y1 + t * (y2 - y1)
        return math.hypot(px - proj_x, py - proj_y)

    dist_check1 = dist_segmento(nx, ny, -0.28, 0.04, -0.05, 0.27)
    dist_check2 = dist_segmento(nx, ny, -0.05, 0.27, 0.32, -0.20)
    dist_min_check = min(dist_check1, dist_check2)

    espessura_check = 0.065
    if dist_min_check < espessura_check:
        return branco
    if dist_min_check < espessura_check + 0.02:
        return azul_claro

    if em_escudo:
        # Degradê de azul no miolo do escudo
        fator = (ny + 0.55) / 1.2
        r = int(14 + (2 - 14) * fator)
        g = int(50 + (132 - 50) * fator)
        b = int(120 + (199 - 120) * fator)
        return (r, g, b, 255)

    return bg_azul_escuro


def gerar_svg_icone() -> str:
    """Gera um ícone vetorial SVG nítido para o favicon e visualização em qualquer resolução."""
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0284c7" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Fundo com cantos arredondados -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)" />

  <!-- Anel externo sutil de conformidade -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#38bdf8" stroke-width="6" stroke-dasharray="16 10" opacity="0.4" />

  <!-- Escudo institucional -->
  <path d="M 256,100 L 380,150 C 380,290 290,380 256,410 C 222,380 132,290 132,150 Z" 
        fill="url(#shieldGrad)" filter="url(#glow)" />
  <path d="M 256,112 L 368,157 C 368,284 288,366 256,394 C 224,366 144,284 144,157 Z" 
        fill="none" stroke="#bae6fd" stroke-width="4" opacity="0.6" />

  <!-- Checkmark de Conformidade -->
  <polyline points="190,260 236,306 332,198" 
            fill="none" stroke="#ffffff" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Selo textual compacto GSASP -->
  <text x="256" y="470" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" 
        fill="#94a3b8" letter-spacing="4" text-anchor="middle">CONFORMA GSASP</text>
</svg>
"""


def main():
    pasta_public = Path(__file__).resolve().parent.parent / "public"
    pasta_public.mkdir(parents=True, exist_ok=True)

    print("Gerando ícones PWA em:", pasta_public)

    # 1. SVG
    caminho_svg = pasta_public / "favicon.svg"
    caminho_svg.write_text(gerar_svg_icone(), encoding="utf-8")
    print("  - favicon.svg criado")

    # 2. PNGs
    tamanhos = {
        "pwa-192x192.png": 192,
        "pwa-512x512.png": 512,
        "pwa-maskable-192x192.png": 192,
        "pwa-maskable-512x512.png": 512,
        "apple-touch-icon.png": 180,
    }

    for nome, tam in tamanhos.items():
        dados_png = criar_png_rgba(tam, tam, desenhar_icone_conforma)
        caminho_png = pasta_public / nome
        caminho_png.write_bytes(dados_png)
        print(f"  - {nome} ({tam}x{tam}, {len(dados_png)} bytes) criado")


if __name__ == "__main__":
    main()
