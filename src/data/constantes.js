/* Constantes visuales de la plataforma (no son datos demo). */

export const ESTADOS_GYM = {
  activo: { etiqueta: 'Activo', color: '#166534', bg: '#dcfce7' },
  prueba: { etiqueta: 'Prueba', color: '#1e40af', bg: '#dbeafe' },
  gracia: { etiqueta: 'Gracia', color: '#92400e', bg: '#fef3c7' },
  suspendido: { etiqueta: 'Suspendido', color: '#6b7280', bg: '#f3f4f6' },
}

export const PALETA_GYMS = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#7c3aed', '#0d9488']

/* Colores de ESTADO de los clientes: son semánticos (verde = al día, rojo =
   vencido), así que NO usan el color del gimnasio. Si un gym elige rojo, sus
   clientes activos seguirían viéndose en verde. */
export const COLORES_ESTADO = {
  activo: '#16a34a',
  por_vencer: '#fbbf24',
  vencido: '#ef4444',
  congelado: '#94a3b8',
  sin_plan: '#c9c9c5',
}
