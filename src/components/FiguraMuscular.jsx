/* Figura anatómica de frente que resalta los grupos musculares del día con el
   color del gimnasio. Es un SVG paramétrico: funciona para cualquier gym y
   cualquier color, sin imágenes. Grupos: Pecho, Espalda, Hombro, Brazo,
   Pierna, Core, Cardio (corazón). */

export default function FiguraMuscular({ grupos = [], ancho = 104 }) {
  const activos = new Set(grupos.filter(Boolean).map((g) => g.toLowerCase()))
  const on = (g) => activos.has(g)
  const fill = (g) => (on(g) ? 'var(--gym-color)' : 'var(--track, #2b2b31)')
  const glow = (g) => (on(g) ? { filter: 'url(#brillo-musculo)' } : undefined)
  const base = 'var(--surface-2, #202024)'

  return (
    <svg width={ancho} height={ancho * 1.9} viewBox="16 0 108 205" fill="none" aria-hidden="true">
      <defs>
        <filter id="brillo-musculo" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--gym-color)" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Silueta base */}
      <circle cx="70" cy="15" r="10" fill={base} />
      <rect x="65" y="23" width="10" height="8" rx="2" fill={base} />
      <path d="M48 34 L92 34 C94 60 90 80 84 98 L56 98 C50 80 46 60 48 34 Z" fill={base} />
      <path d="M56 98 L84 98 L86 112 L70 120 L54 112 Z" fill={base} />
      <circle cx="26.5" cy="105" r="4" fill={base} />
      <circle cx="113.5" cy="105" r="4" fill={base} />
      <ellipse cx="57" cy="191" rx="6" ry="3.5" fill={base} />
      <ellipse cx="83" cy="191" rx="6" ry="3.5" fill={base} />

      {/* Trapecio + dorsales (Espalda, visibles de frente a los lados) */}
      <path d="M52 33 Q70 26 88 33 L88 38 L52 38 Z" fill={fill('espalda')} style={glow('espalda')} />
      <path d="M50 56 C47 66 48 76 53 85 L58 80 C54 72 54 64 56 58 Z" fill={fill('espalda')} style={glow('espalda')} />
      <path d="M90 56 C93 66 92 76 87 85 L82 80 C86 72 86 64 84 58 Z" fill={fill('espalda')} style={glow('espalda')} />

      {/* Hombros */}
      <ellipse cx="44" cy="42" rx="8.5" ry="9" fill={fill('hombro')} style={glow('hombro')} />
      <ellipse cx="96" cy="42" rx="8.5" ry="9" fill={fill('hombro')} style={glow('hombro')} />

      {/* Pecho */}
      <ellipse cx="59.5" cy="51" rx="9.5" ry="7.5" fill={fill('pecho')} style={glow('pecho')} />
      <ellipse cx="80.5" cy="51" rx="9.5" ry="7.5" fill={fill('pecho')} style={glow('pecho')} />

      {/* Core / abdomen */}
      <g style={glow('core')}>
        <rect x="61" y="61" width="18" height="32" rx="6" fill={fill('core')} />
        <line x1="61" y1="70" x2="79" y2="70" stroke="var(--bg, #0c0c0e)" strokeWidth="1.4" />
        <line x1="61" y1="78" x2="79" y2="78" stroke="var(--bg, #0c0c0e)" strokeWidth="1.4" />
        <line x1="61" y1="86" x2="79" y2="86" stroke="var(--bg, #0c0c0e)" strokeWidth="1.4" />
        <line x1="70" y1="62" x2="70" y2="92" stroke="var(--bg, #0c0c0e)" strokeWidth="1.4" />
      </g>

      {/* Brazos: bíceps + antebrazo */}
      <ellipse cx="37.5" cy="62" rx="7" ry="14" transform="rotate(14 37.5 62)" fill={fill('brazo')} style={glow('brazo')} />
      <ellipse cx="102.5" cy="62" rx="7" ry="14" transform="rotate(-14 102.5 62)" fill={fill('brazo')} style={glow('brazo')} />
      <ellipse cx="30.5" cy="88" rx="5.5" ry="13" transform="rotate(12 30.5 88)" fill={fill('brazo')} style={glow('brazo')} />
      <ellipse cx="109.5" cy="88" rx="5.5" ry="13" transform="rotate(-12 109.5 88)" fill={fill('brazo')} style={glow('brazo')} />

      {/* Piernas: muslos + pantorrillas */}
      <ellipse cx="60" cy="132" rx="10" ry="21" fill={fill('pierna')} style={glow('pierna')} />
      <ellipse cx="80" cy="132" rx="10" ry="21" fill={fill('pierna')} style={glow('pierna')} />
      <ellipse cx="58" cy="172" rx="6.5" ry="14" fill={fill('pierna')} style={glow('pierna')} />
      <ellipse cx="82" cy="172" rx="6.5" ry="14" fill={fill('pierna')} style={glow('pierna')} />

      {/* Cardio: corazón encendido */}
      {on('cardio') && (
        <path d="M70 60 C58 51 62 41 70 46 C78 41 82 51 70 60 Z" fill="var(--gym-color)" style={{ filter: 'url(#brillo-musculo)' }} />
      )}
    </svg>
  )
}
