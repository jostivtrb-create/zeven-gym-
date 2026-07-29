# Brief para Claude Design — Zeven Gym

> Copia TODO lo que está dentro del bloque de abajo y pégalo como primer mensaje
> en Claude Design. Si la herramienta permite adjuntar archivos, adjunta también
> `DEFINICION-PROYECTO.md` para que tenga el contexto completo.

---

Diseña una PWA móvil llamada **Zeven Gym**: una plataforma SaaS multi-gimnasio donde cada gimnasio tiene su propia marca (colores y logo) dentro de la misma app. Hay 3 roles: Superadmin (dueño de la plataforma), Admin (dueño del gimnasio) y Cliente (usuario del gimnasio). Idioma: español (Colombia). Mobile-first estricto (es una app instalable en el celular), aunque el panel de admin y superadmin también deben verse bien en escritorio.

## Guía de estilo (obligatoria)
- **Personalidad:** minimalista y limpia — mucho blanco, aire, sobria. SOLO modo claro.
- **Color:** el color de cada gimnasio es PROTAGONISTA — encabezados y zonas grandes con el color del gym; el resto de la app clara. Usa un color de ejemplo (ej. verde #16a34a) pero diséñalo como variable/token, porque cada gimnasio tendrá el suyo.
- **Formas:** ligeramente redondeadas (radius moderado, moderno neutro). Sin degradados recargados.
- **Tipografía:** moderna geométrica y limpia (Poppins o Inter).
- **Navegación del cliente:** barra de pestañas inferior estilo app nativa.
- **Tono de textos:** cercano y motivador, tuteo con energía ("¡Vamos por ese entreno!").
- **Animaciones:** vistosas SOLO en logros (confeti, celebración al completar); sutiles en todo lo demás.

## Pantallas del CLIENTE (prioridad 1)
1. Registro/entrada con código o link del gimnasio (al entrar toma los colores y logo de ese gym) + login con Google o correo.
2. **Inicio = portada del gimnasio:** banner del gym, comunicados del admin, horarios, contacto y redes.
3. **Mi rutina:** por días de la semana; cada ejercicio con imagen/gif, series, reps y descanso; marcar completado y registrar el peso levantado.
4. **Mi progreso:** gráficas de pesos levantados y medidas en el tiempo, registro de peso/medidas, fotos de progreso (privadas), rachas de días entrenando y medallas/logros.
5. **Calculadoras fitness:** IMC, calorías, RM.
6. **Mi membresía/perfil:** plan actual, fecha de vencimiento, historial de pagos, recordatorio amable cuando está por vencer (1 día antes) y estado vencido (aviso o bloqueo de rutina según configure el gym).

## Pantallas del ADMIN de gimnasio (prioridad 2)
1. **Dashboard:** estadísticas con gráficas — ingresos del mes, clientes activos vs vencidos, crecimiento.
2. **Clientes:** lista con estados (activo/vencido/congelado/desactivado), detalle de cliente, registrar pago manual (marcar pagado), congelar membresía, desactivar o eliminar.
3. **Planes:** crear/editar planes propios (nombre, precio, duración).
4. **Rutinas:** biblioteca con plantillas de la app + crear desde cero; asignar individual o por grupos/niveles.
5. **Comunicados:** publicar avisos que ven todos sus clientes.
6. **Configuración del gym:** banner, contacto/redes, horarios, política de vigencia, congelamiento y bloqueo por vencimiento.
7. Popup de suscripción de la plataforma vencida: suave el día 1 de atraso, urgente cuando quedan 3 de los 7 días de gracia.

## Pantallas del SUPERADMIN (prioridad 3)
1. Dashboard global: estadísticas de todos los gimnasios.
2. Gimnasios: crear gimnasio configurando SU branding (colores, logo), suspender/reactivar, editar.
3. Pagos: confirmar transferencias de los $79.000/mes de cada gimnasio, ver quién está en prueba (30 días) o en gracia (7 días).
4. Modo soporte: entrar a ver el panel de cualquier gimnasio.

Empieza por las pantallas del CLIENTE en este orden: portada del gimnasio → mi rutina → mi progreso.
