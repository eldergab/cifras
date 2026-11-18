#!/usr/bin/env python3
"""Varre a pasta 'cifras' (A-Z / cantor / musica.txt) e gera indice.json.

Uso:
    python gerar_indice.py                # usa a pasta ./cifras
    python gerar_indice.py outra_pasta    # usa outra pasta
"""
import json
import sys
from pathlib import Path

# Se existir uma subpasta "cifras", usa ela; senão usa a pasta atual
# (caso em que as pastas a, b, c... estão ao lado deste script).
if len(sys.argv) > 1:
    raiz = Path(sys.argv[1])
elif Path("cifras").is_dir():
    raiz = Path("cifras")
else:
    raiz = Path(".")

if not raiz.is_dir():
    sys.exit(f"Pasta '{raiz}' não encontrada. Rode o script ao lado da pasta cifras.")

indice = []  # cada item: [letra, cantor, arquivo]
for letra in sorted(p for p in raiz.iterdir() if p.is_dir() and not p.name.startswith(".")):
    for cantor in sorted(p for p in letra.iterdir() if p.is_dir()):
        for arq in sorted(cantor.glob("*.txt")):
            indice.append([letra.name, cantor.name, arq.name])

saida = Path("indice.json")
saida.write_text(
    json.dumps({"pasta": "" if raiz == Path(".") else raiz.name, "musicas": indice}, ensure_ascii=False),
    encoding="utf-8",
)
print(f"{len(indice)} cifras indexadas -> {saida}")
