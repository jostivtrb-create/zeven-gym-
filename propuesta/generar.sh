#!/usr/bin/env bash
# Genera la propuesta de Zeven Gym en PDF.
#   Edita el contenido en  cuerpo.html  y ejecuta este script.
#   La tipografía (fuentes.css) se incrusta sola: el HTML y el PDF quedan
#   autónomos, sin depender de internet.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

python3 - <<'PY'
fuentes = open('fuentes.css', encoding='utf-8').read()
html = open('cuerpo.html', encoding='utf-8').read()
open('propuesta-zeven-gym.html', 'w', encoding='utf-8').write(html.replace('/*FUENTES*/', fuentes))
PY

rm -rf /tmp/_prop_zeven
google-chrome --headless --disable-gpu --no-pdf-header-footer --no-sandbox \
  --user-data-dir=/tmp/_prop_zeven \
  --print-to-pdf="$DIR/propuesta-zeven-gym.pdf" \
  "file://$DIR/propuesta-zeven-gym.html" 2>/dev/null

echo "✓ Listo: propuesta-zeven-gym.pdf"
