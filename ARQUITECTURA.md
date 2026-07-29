# Zeven Gym — Arquitectura de datos (Firestore)

> Fase 1. Complementa a DEFINICION-PROYECTO.md. Las reglas se despliegan con la
> skill `Actualizar_Reglas_Firebase` cuando exista el proyecto de Firebase.

## Colecciones

```
usuarios/{uid}
  rol: 'superadmin' | 'admin' | 'cliente'
  gymId: string | null        // null solo para superadmin
  nombre, celular, documento, nacimiento, fotoUrl
  estado: 'activo' | 'desactivado'
  creadoEl

gimnasios/{gymId}
  nombre, ciudad
  codigo: 'TITAN26'           // único, para registro de clientes
  branding: { color, logoUrl, bannerUrl }
  contacto: { celular, whatsapp, instagram, facebook }
  horarios: [{ dias, abre, cierra }]
  politicas:
    vigencia: 'desde_pago' | 'corte_fijo'
    diaCorte: number | null
    permitirCongelar: boolean
    bloquearAlVencer: boolean
  suscripcion:                // la del gym con Zeven ($79.000/mes)
    estado: 'prueba' | 'activo' | 'gracia' | 'suspendido'
    inicioPrueba, proximoCorte, ultimoPagoEl
  adminUid
  creadoEl

gimnasios/{gymId}/planes/{planId}
  nombre, precio, duracionDias, activo

gimnasios/{gymId}/membresias/{uid}
  planId, inicio, vence
  estado: 'activa' | 'vencida' | 'congelada'
  congeladaDesde, diasRestantesAlCongelar

gimnasios/{gymId}/pagos/{pagoId}
  uid, planId, monto, metodo, fecha, registradoPor

gimnasios/{gymId}/rutinas/{rutinaId}
  nombre, nivel: 'principiante'|'intermedio'|'avanzado'|null
  dias: { lun: [{ nombre, imagenUrl, series, reps, descansoSeg }], ... }
  asignadaA: [uid] | { grupo: nivel }

plantillasRutinas/{id}        // globales de Zeven (solo lectura para admins)
  (misma forma que rutinas)

gimnasios/{gymId}/comunicados/{id}
  titulo, texto, creadoEl

usuarios/{uid}/progreso/{registroId}
  tipo: 'peso' | 'medidas' | 'fotoProgreso' | 'levantamiento'
  fecha, datos { ... }        // fotos → Storage usuarios/{uid}/fotos/*

usuarios/{uid}/logros/{logroId}
  tipo, fecha                 // rachas y medallas

pagosPlataforma/{id}          // solo superadmin
  gymId, mes, monto, confirmadoEl
```

## Reglas de seguridad (resumen a desplegar)

- Helpers: `esSuperadmin()`, `esAdminDe(gymId)`, `esMiembroDe(gymId)`.
- `usuarios/{uid}`: lee/edita el dueño; el admin de su gym lee y edita estado; superadmin todo. Nadie cambia su propio `rol` ni `gymId` (solo admin/superadmin).
- `gimnasios/{gymId}`: lectura pública SOLO de nombre/branding/codigo (para la pantalla de entrada); escritura branding+suscripcion solo superadmin; contacto/horarios/politicas el admin.
- Subcolecciones del gym: admin del gym escribe; clientes del gym leen (membresías: cada cliente solo la suya; pagos: cada cliente solo los suyos).
- `usuarios/{uid}/progreso`: SOLO el dueño lee y escribe (fotos privadas — Storage rules igual).
- `plantillasRutinas`: lectura autenticada, escritura solo superadmin.
- `pagosPlataforma`: solo superadmin.

## Decisiones técnicas

- **Vigencia:** al registrar un pago se calcula `vence = max(hoy, vence) + duracionDias` (desde_pago) o el próximo `diaCorte` (corte_fijo).
- **Estados derivados:** 'por_vencer' NO se guarda — se deriva en el cliente (vence − hoy ≤ 3 días). 'vencida' se deriva de `vence < hoy` (evita jobs programados).
- **Suspensión de gym:** derivada de `proximoCorte`: atraso día 1–7 = gracia (avisos), >7 = suspendido. El superadmin confirma pagos y eso mueve `proximoCorte`.
- **Ícono PWA por gym:** manifest dinámico generado por ruta del gym (Fase 5).
- **Auth PWA estable:** persistencia localStorage, login popup-first con fallback redirect (skill Solucion_Ingreso).
