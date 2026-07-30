# Zeven Gym — Documento de Definición del Proyecto

> **Documento vivo.** Aquí se registra la idea, las decisiones tomadas en cada etapa del
> cuestionario y lo que queda pendiente. Sirve como guía si se cambia de conversación y
> como checklist de repaso final antes de construir.

**Última actualización:** 2026-07-30
**Estado general:** 🟢 DEFINICIÓN ✅ · DISEÑO ✅ · CONSTRUCCIÓN ✅ · DESPLEGADA EN VERCEL ✅ · 100% CONECTADA A FIRESTORE (cero demos)
**Repo:** github.com/jostivtrb-create/zeven-gym- (cuenta jostivtrb, SSH `github-jostivtrb`)
**Fase 6 (2026-07-30):** toda la app usa datos reales — planes, clientes, membresías, pagos (con renovación de vigencia por política), comunicados, configuración, rutinas con plantillas Zeven, progreso del cliente en la nube (sesiones, pesos, racha calculada, medidas, fotos privadas en Storage), avisos de suscripción derivados de fechas y suspensión bloqueante. Rutas protegidas por rol. Los archivos demo fueron eliminados.

**⚠️ Regla de trabajo (pedida por el dueño):** las preguntas deben definir TODO.
Nada se asume, se adivina ni se improvisa. Si algo no está definido en este documento,
se pregunta antes de construir. Objetivo: no gastar tokens rehaciendo apartados.

---

## 1. La idea (resumen de lo que el dueño del proyecto describió)

Una **plataforma SaaS multi-gimnasio** en formato **PWA instalable** con 3 niveles:

1. **SUPERADMINISTRADOR (el dueño del proyecto):**
   - Cobra una mensualidad a cada gimnasio por usar la app.
   - Convierte a los dueños de gimnasio en administradores.

> 📌 **Aclaración (Etapa 0):** "varias escalas" = la **jerarquía de roles**
> (superadmin → admin de gimnasio → usuario), NO planes de precios.
> La estructura de cobro a los gimnasios se define en la Etapa 1.

2. **ADMINISTRADOR DE GIMNASIO (dueño del gimnasio):**
   - Control de usuarios registrados y usuarios activos.
   - Control de pagos: saber cuándo un cliente debe pagar su suscripción.
   - Asignar rutinas a sus clientes.
   - Más funciones por idear en el cuestionario.

3. **CLIENTE (usuario final):**
   - Se suscribe bajo un gimnasio específico.
   - Ve la app con los **colores y el logo de SU gimnasio** (marca blanca / multi-tenant).

**Decisiones ya tomadas (no volver a preguntar):**
- ✅ Será una **PWA instalable** en el celular.
- ✅ El diseño se hará desde **Claude Design**.
- ✅ Modelo de negocio: **suscripción mensual** de los gimnasios al superadmin.
- ✅ **Branding por gimnasio**: colores + logo propios para los clientes de cada gimnasio.
- ✅ Arquitectura de 3 roles mínimo: Superadmin → Admin de gimnasio → Cliente.

---

## 2. Mapa del cuestionario por capas

Método: cada etapa se responde con una mini-app interactiva. Según las respuestas,
se **descartan ramas** (no se preguntan cosas de caminos ya cerrados) y se abren
sub-preguntas solo donde aplique. Cada etapa cerrada se registra en la sección 3.

| Etapa | Tema | Estado |
|-------|------|--------|
| 0 | Confirmación de la idea y del método | ✅ Cerrada |
| 1 | Modelo de negocio (cómo cobra el superadmin a los gimnasios: plan único o varios, precios, moneda, país, prueba gratis, impago, sedes) | ✅ Cerrada |
| 2 | Pagos (cómo pagan los gimnasios al superadmin y cómo pagan los clientes al gimnasio: pasarela, manual/efectivo, comprobantes, recordatorios) | ✅ Cerrada |
| 3 | Roles y permisos (¿hay más roles? recepcionista, entrenador/coach; qué puede hacer cada uno) | ✅ Cerrada |
| 4 | Gestión de miembros (registro, estados activo/vencido/congelado, asistencia/check-in, planes del gimnasio hacia sus clientes) | ✅ Cerrada |
| 5 | Rutinas y entrenamiento (biblioteca de ejercicios, asignación, seguimiento, progreso, medidas corporales) | ✅ Cerrada |
| 6 | Branding multi-tenant (cómo entra cada cliente a su gimnasio: código, link, selección; qué se personaliza exactamente) | ✅ Cerrada |
| 7 | Funciones extra ("cosas curiosas": notificaciones, estadísticas, clases grupales, QR de acceso, tienda, etc. — se filtran por MVP vs futuro) | ✅ Cerrada |
| 8 | Alcance del MVP y fases de construcción (qué entra en la v1 y qué se deja para después) | ✅ Cerrada |
| 9 | Estética y diseño visual (estilo general, formas, tipografía, aplicación del color del gym, navegación, pantalla de inicio, logo de Zeven Gym) | ✅ Cerrada |
| 10 | Experiencia y detalles finos (tono de textos, cliente vencido, offline, privacidad de fotos, dominio, ícono PWA, animaciones) | ✅ Cerrada |

> El orden puede ajustarse y pueden aparecer etapas nuevas según las respuestas.
> Las etapas 9 y 10 se agregaron a petición del dueño al cerrar la Etapa 8:
> "aún no me has hecho muchas preguntas de estética ni demás temas".

---

## 3. Respuestas definidas por etapa

### Etapa 0 — Confirmación de la idea ✅ (cerrada 2026-07-28)
- **Idea general:** confirmada tal cual está en la sección 1.
- **"Escalas":** significa la jerarquía de roles (superadmin → admin → usuario), no planes de precios.
- **Estado del negocio:** hay uno o dos gimnasios en conversación (no es solo idea; hay clientes potenciales reales).
- **Mapa de etapas:** aprobado sin cambios.
- **Regla de trabajo:** definir TODO por preguntas, sin improvisar (ver advertencia al inicio del documento).

### Etapa 1 — Modelo de negocio ✅ (cerrada 2026-07-28)
- **Estructura de cobro a gimnasios:** plan único — mismo precio y funciones para todos.
- **Precio:** $79.000 COP al mes por gimnasio.
- **País de operación:** Colombia.
- **Prueba gratis:** 30 días para gimnasios nuevos.
- **Facturación:** solo mensual (no hay plan anual).
- **Impago:** periodo de gracia con avisos y luego suspensión (los días de gracia se definen en Etapa 2).
- **Sedes:** por ahora una sede por gimnasio, pero la base de datos debe quedar **preparada** para multi-sede en el futuro.

### Etapa 2 — Pagos ✅ (cerrada 2026-07-28)

**A) Gimnasios → Superadmin ($79.000/mes):**
- **Método:** transferencia manual (Nequi/banco); el superadmin confirma el pago desde su panel.
- **Días de gracia tras vencer:** 7 días, luego suspensión.
- **Avisos al admin del gimnasio (tono escalonado):**
  - Día 1 de atraso: popup suave de aviso "debes pagar la suscripción" — solo informativo, se puede cerrar.
  - Cuando queden 3 de los 7 días: el aviso se vuelve **urgente**.
  - Día 8 (fin de gracia): suspensión.

**B) Clientes → Gimnasio:**
- **Modalidad:** la app SOLO registra y controla; el gimnasio cobra por sus propios medios (efectivo, Nequi, etc.) y marca "pagado" en la app.
- **Comprobantes:** NO hay subida de comprobantes por parte del cliente.
- **Recordatorios al cliente:** notificación push + aviso dentro de la app + correo. (Sin WhatsApp.)
- **Anticipación:** 1 día antes del vencimiento.
- **Tono:** amable, tipo recordatorio — NO invasivo ni de "paga paga".

### Etapa 3 — Roles y permisos ✅ (cerrada 2026-07-28)
- **Roles del sistema (3, definitivos):** Superadmin → Admin de gimnasio → Cliente. NO hay recepcionista ni entrenador como roles aparte.
- **Alta de gimnasios:** SOLO el superadmin crea la cuenta del gimnasio (cierra el trato y entrega el acceso). No hay auto-registro de gimnasios.
- **Poderes del superadmin (los 4):**
  1. Ver estadísticas globales de todos los gimnasios.
  2. Entrar al panel de cualquier gimnasio (modo soporte).
  3. Suspender y reactivar gimnasios.
  4. Editar datos y branding de cualquier gimnasio.
- **Login (todos los roles):** cuenta de Google Y correo+contraseña (ambos métodos).
- **Clientes:** el admin puede desactivar Y también eliminar definitivamente.

### Etapa 4 — Gestión de miembros ✅ (cerrada 2026-07-28)
- **Registro de clientes:** el cliente se registra SOLO, usando un código o link único de su gimnasio (así queda vinculado al gimnasio correcto y recibe su branding).
- **Planes hacia clientes:** cada gimnasio crea sus propios planes — nombre, precio y duración (mensual, quincenal, día, etc.).
- **Vigencia de la membresía:** cada gimnasio elige su modalidad (30 días desde el pago o corte fijo) — es una configuración del gimnasio.
- **Congelar/pausar membresía:** disponible como opción, pero **cada admin decide** si la usa (configurable por gimnasio).
- **Asistencia/check-in:** NO por ahora (queda para el futuro).
- **Datos al registrar cliente:** nombre + celular (siempre) + documento de identidad + fecha de nacimiento + foto de perfil.

### Etapa 5 — Rutinas y entrenamiento ✅ (cerrada 2026-07-28)
- **Origen de rutinas:** ambas — la app trae plantillas base Y el admin puede crear desde cero.
- **Estructura:** por días de la semana, con ejercicios detallados (series, repeticiones, descanso).
- **Apoyo visual:** sí — imagen o gif demostrativo de cada ejercicio.
- **Interacción del cliente:** puede marcar ejercicios/sesiones como completados Y registrar el peso que levantó en cada ejercicio.
- **Asignación:** ambas — rutina individual por cliente y por grupos/niveles (principiante, intermedio, avanzado).
- **Seguimiento físico:** SÍ va completo — peso corporal + medidas (brazo, cintura, pierna...) + fotos de progreso. _(Aclarado en Etapa 6.)_

### Etapa 6 — Branding multi-tenant ✅ (cerrada 2026-07-28)
- **Se personaliza por gimnasio:** colores + logo + foto de portada/banner + datos de contacto y redes sociales + horarios del gimnasio.
- **Colores:** los configura el SUPERADMIN al crear el gimnasio (con la identidad del gym). El admin NO los cambia.
- **Tema:** SOLO modo claro (no hay modo oscuro).
- **Cuenta de cliente:** pertenece a UN solo gimnasio (no multi-gimnasio).
- **Nombre de la plataforma:** **Zeven Gym** (separado, con espacio) — definido en Etapa 7.

### Etapa 7 — Nombre y funciones extra ✅ (cerrada 2026-07-28)
- **Nombre de la plataforma:** **Zeven Gym** (escrito separado, con espacio).
- **Extras para el ADMIN (elegidas):**
  - Estadísticas con gráficas: ingresos del mes, activos vs vencidos, crecimiento.
  - Comunicados: el admin publica avisos que ven todos sus clientes.
- **Extras para el CLIENTE (elegidas):**
  - Rachas y logros: días seguidos entrenando, medallas por metas (gamificación).
  - Calculadoras fitness: IMC, calorías, RM.
  - Gráficas de progreso propio: pesos levantados y medidas en el tiempo.

### Etapa 8 — Alcance del MVP y fases ✅ (cerrada 2026-07-28)
- **Alcance de la v1:** TODO lo definido sale desde la primera versión — nada se pospone a una v2.
- **Stack tecnológico:** React + Firebase + Vercel (la misma base de las otras apps del dueño).
- **Ritmo:** sin afán — la prioridad es que quede bien, **pulir cada detalle**.
- **Consecuencia:** al cerrar esta etapa el dueño pidió más capas de definición (estética y detalles) → se crearon las Etapas 9 y 10.

### Etapa 9 — Estética y diseño visual ✅ (cerrada 2026-07-28)
- **Personalidad visual:** minimalista y limpia — mucho blanco, aire, sobria. (Igual para todos los gimnasios; solo cambia el color/logo.)
- **Formas:** ligeramente redondeadas (moderno neutro).
- **Tipografía:** moderna geométrica y limpia (tipo Poppins/Inter).
- **Aplicación del color del gimnasio:** PROTAGONISTA — encabezados y zonas grandes con el color del gym. (Como los colores los configura el superadmin, él garantiza que se vean bien.)
- **Navegación del cliente:** barra de pestañas inferior, estilo app nativa.
- **Pantalla de inicio del cliente:** portada del gimnasio con su banner y comunicados.
- **Logo de Zeven Gym:** se hará más adelante — no bloquea el diseño.

### Etapa 10 — Experiencia y detalles finos ✅ (cerrada 2026-07-28)
- **Tono de textos:** cercano y motivador — tuteo con energía ("¡Vamos por ese entreno!").
- **Cliente con membresía vencida:** CADA GIMNASIO DECIDE si se bloquea la rutina o solo se avisa (configuración del admin).
- **Offline:** SÍ — la rutina del cliente queda disponible sin internet (service worker con caché).
- **Fotos de progreso:** PRIVADAS — solo el cliente las ve. Ni el admin ni nadie más.
- **Dominio:** por ahora el gratuito de Vercel (zeven-gym.vercel.app); dominio propio más adelante.
- **Ícono de la PWA instalada (cliente):** el logo de SU gimnasio — cada cliente siente que instala la app de su gym. (Nota técnica: requiere manifest dinámico por gimnasio; cada gym tiene su propia ruta/link de entrada.)
- **Animaciones:** vistosas en los logros (confeti, celebraciones) y sutiles en el resto de la app.

---

## 3a-bis. Cuenta del proyecto (IMPORTANTE)

**TODO se crea y despliega con la cuenta `jostivtrb@gmail.com`:**
- Firebase (proyecto `zeven-gym`) ya está en esa cuenta.
- Los despliegues de reglas con firebase-tools deben usar `--account jostivtrb@gmail.com`.
- GitHub/Vercel para el deploy: usar esa misma cuenta (SSH multi-cuenta según skill `despliegue_en_vercel`).
- NUNCA usar otra cuenta del usuario para este proyecto.

## 3b. Próximos pasos acordados

1. ✅ **Diseño en Claude Design** — COMPLETADO el 2026-07-28 (ver sección 3c).
2. 🟡 Construcción con React + Firebase + Vercel (PWA instalable — usar skill `instalar-app-mobil`).
   - ✅ Fase 1a: scaffold Vite+React, tokens de diseño (`src/styles/tokens.css`), theming dinámico por gym (`ThemeContext`), arquitectura de datos (`ARQUITECTURA.md`), git iniciado. Verificado en preview.
   - ✅ Fase 1b: Firebase real conectado (proyecto `zeven-gym`); Firestore, Auth (Google+correo) y Storage activados.
   - ✅ Fase 2 (cliente): portada, rutina (marcar/pesos/bloqueo), progreso (racha/gráficas/medidas/fotos), calculadoras, perfil, bienvenida con código (+ link /g/:codigo), registro y login REALES.
   - ✅ Fase 3 (admin): dashboard, clientes+detalle, pagos, planes, rutinas+editor, comunicados, configuración, popup de suscripción (suave/urgente), menú Más.
   - ✅ Fase 4 (superadmin): dashboard global, gimnasios+detalle, crear gimnasio (escribe en Firestore real + invita admin), pagos plataforma, modo soporte con banner.
   - ✅ Fase 5a: Auth real popup-first con fallback redirect, persistencia localStorage, bootstrap de roles (ver 3d), capa de datos con fallback demo.
   - ✅ Fase 5b: reglas de Firestore y Storage DESPLEGADAS a producción (cuenta jostivtrb@gmail.com).
   - ✅ Fase 5c: PWA instalable (manifest, sw.js red-primero con offline, InstallPrompt Android/iOS, íconos Z) y verificación en navegador.

## 3d. Cómo funciona el arranque real (bootstrap) + despliegue pendiente

**Roles automáticos al primer login:**
- `jostivtrb@gmail.com` entra con Google → su perfil se crea SOLO como **superadmin** → /super.
- Un correo invitado (creado al usar "Crear gimnasio") → entra y su perfil se crea como **admin** de su gym → /admin.
- Cualquier otro → se registra como **cliente** con el código de su gym → /app.

**Flujo real de venta:** entras a /super → Crear gimnasio (nombre, ciudad, color, datos del dueño) → Firestore guarda el gym + invitación → le compartes código/link al dueño → él entra con su correo y ya es admin → sus clientes se registran con el código.

**ÚNICO PASO PENDIENTE — Despliegue a Vercel (hacerlo con el dueño):**
1. Crear el repo `zeven-gym` en GitHub con la cuenta jostivtrb (usuario `jostivtrb-create`) — la llave SSH ya existe (`github-jostivtrb` en ~/.ssh/config).
2. `git remote add origin git@github-jostivtrb:jostivtrb-create/zeven-gym.git && git push -u origin main`
3. En vercel.com (cuenta jostivtrb): Import → zeven-gym → deploy (Vite autodetectado).
4. En Firebase Console → Authentication → Settings → Authorized domains: agregar `zeven-gym.vercel.app` (si no, el login con Google falla en producción).
⚠️ La gh CLI local está logueada con OTRA cuenta (Infiniity-Eventos) — NO usarla para este repo.
3. Todo lo definido entra en la v1; ritmo sin afán, prioridad en pulir cada detalle.
4. Pendientes que NO bloquean: logo de Zeven Gym (se creará más adelante), dominio propio.

## 3c. Diseño en Claude Design ✅ (completado 2026-07-28)

**Proyecto:** "Zeven Gym PWA" — https://claude.ai/design/p/6e4abb4a-de1d-4193-9adb-1351087a8248

**Copia local del diseño:** `diseno/zeven-gym-cliente.dc.html` (las 26 pantallas en un solo HTML — fuente de verdad visual para construir).

**Sistema de diseño extraído del archivo:**
- Color del gimnasio como token `gymColor` (fallback demo: verde `#16a34a`).
- Tipografía: Poppins 400/500/600/700 (Google Fonts).
- Neutros: fondo `#fafaf9`/`#f7f7f5`, bordes `#ececea`/`#e2e2de`, texto `#1c1c1a`, secundario `#6b6b67`/`#8a8a86`, gris claro `#9ca3af`.
- Semánticos: advertencia `#92400e` (ámbar oscuro), peligro `#b91c1c`.
- 26 pantallas etiquetadas en el archivo (labels `data-dc`): cliente (8), admin (11), superadmin (6), bienvenida con código (1).

Se diseñó en 4 bloques, todos aprobados por el dueño:
1. **Cliente (núcleo):** portada del gimnasio, mi rutina, mi progreso.
2. **Cliente (resto):** calculadoras, perfil/membresía, rutina en pausa (vencido con bloqueo), entrada con código del gym, registro y login.
3. **Admin del gimnasio:** dashboard, clientes con filtros, detalle de cliente, pagos, planes, rutinas + editor, comunicados, configuración, popup de suscripción vencida.
4. **Superadmin:** dashboard global, gimnasios, detalle + crear gimnasio (branding con vista previa y código único), pagos del mes, modo soporte con banner.

**Decisiones que nacieron en el diseño (ya aplicadas):**
- Gym de ejemplo/demo: "Titán Gym" (Chapinero, Bogotá), código TITAN26.
- El color del gym funciona como token (probado con verde, morado, azul, naranja vía Tweaks).
- Tabs del cliente: Inicio · Rutina · Progreso · Calcular · Perfil.
- Tabs del admin: Inicio · Clientes · Rutinas · Más.
- Tabs del superadmin: Inicio · Gimnasios · Pagos.
- Panel del superadmin con identidad NEUTRA e independiente (oscura/sobria, "Z" como marcador mientras no hay logo) — no usa el color de ningún gimnasio.
- El código único y link de invitación del gym se generan al crear el gimnasio.

**Decisión pendiente (menor):** botón "Escribirle al gym por WhatsApp" en la pantalla de rutina en pausa — el cliente le escribe al gimnasio (NO es la rama descartada de recordatorios automáticos). Falta el sí/no del dueño; si queda, usar la skill `Mensajes_Whatsapp` al construir.

---

## 4. Ramas descartadas

- ❌ "Escalas" como planes de precios por niveles — era una mala interpretación; escalas = jerarquía de roles. La estructura real de cobro se define en Etapa 1.
- ❌ Varios planes/tiers para gimnasios (básico/pro/premium) — descartado en Etapa 1: es plan único.
- ❌ Cobro por tamaño del gimnasio (cantidad de clientes) — descartado en Etapa 1.
- ❌ Plan anual con descuento — descartado en Etapa 1: solo mensual.
- ❌ Suspensión automática inmediata al vencer y suspensión manual — descartadas; se eligió periodo de gracia + suspensión.
- ❌ Pasarela de pagos online (tanto para gimnasios→superadmin como para clientes→gimnasio) — descartada en Etapa 2: todo es manual/registro.
- ❌ Subida de comprobantes de pago por el cliente — descartada en Etapa 2.
- ❌ Recordatorios por WhatsApp a clientes — descartado en Etapa 2 (solo push, in-app y correo).
- ❌ Roles de recepcionista y entrenador/coach — descartados en Etapa 3: solo admin y clientes por gimnasio.
- ❌ Auto-registro de gimnasios (con o sin aprobación) — descartado en Etapa 3: solo el superadmin crea gimnasios.
- ❌ Registro de clientes por el admin en recepción — descartado en Etapa 4: el cliente se registra solo con código/link del gimnasio.
- ❌ Control de asistencia/check-in (QR o manual) — descartado en Etapa 4 para el inicio; posible función futura.
- ❌ Modo oscuro — descartado en Etapa 6: solo modo claro.
- ❌ Selección de colores por el admin (libre o por paletas) — descartada en Etapa 6: los colores los configura el superadmin.
- ❌ Cuenta de cliente en varios gimnasios — descartada en Etapa 6: una cuenta = un gimnasio.
- ❌ Cumpleaños de clientes (aviso + felicitación) — descartado en Etapa 7.
- ❌ Clases grupales con reserva de cupo — descartado en Etapa 7.
- ❌ Timer de descanso en la rutina — descartado en Etapa 7.
- ❌ Nombres alternativos (GymControl, FitAdmin, Entreno) — descartados; el nombre es Zeven Gym.

---

## 5. Ideas sueltas / parqueadero

_(ideas "curiosas" que surjan y aún no tengan etapa asignada)_
