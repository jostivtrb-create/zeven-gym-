# Pesos sugeridos — propuesta de fórmula (borrador para revisión)

Reemplaza la "tabla maestra" de 4.536 celdas por una fórmula que genera los mismos
valores. Nadie la edita desde la app: son constantes del código, igual que el catálogo.

> ⚠️ **Pendiente de validación por un entrenador real.** Los valores base salen de
> estándares publicados de fuerza para personas SIN entrenar, convertidos a peso de
> trabajo de 10-12 reps y redondeados hacia abajo. Están deliberadamente cortos:
> es mejor que el cliente suba peso a que se lastime en su primer día.

---

## 1. La fórmula

```
valor = base(ejercicio) × género × edad × contextura × actividad × pesoCorporal
```

Luego se redondea a un número usable en el gym (ver §5).

**Persona de referencia** (todos los multiplicadores = 1,0):
hombre · 30 años · 70 kg · contextura promedio · actividad "de vez en cuando".

---

## 2. Multiplicadores

### Género
Aplica solo a ejercicios de **peso** y **repeticiones**. Los de **tiempo** (plancha,
cardio) no se recortan por género.

| | Tren superior (Pecho, Espalda, Hombro, Brazo) | Tren inferior (Pierna) | Core |
|---|---|---|---|
| Hombre | 1,00 | 1,00 | 1,00 |
| Mujer | 0,60 | 0,75 | 0,75 |

### Edad
| Rango | × |
|---|---|
| 18-25 | 1,00 |
| 26-35 | 1,00 |
| 36-45 | 0,93 |
| 46-55 | 0,85 |
| 56-65 | 0,75 |
| 65+ | 0,62 |

### Contextura (calculada por IMC = peso / estatura²)
| Categoría | IMC | × |
|---|---|---|
| Delgado | < 18,5 | 0,88 |
| Promedio | 18,5 – 24,9 | 1,00 |
| Robusto | ≥ 25 | 1,06 |

### Actividad física
| Nivel | × |
|---|---|
| Nunca | 0,80 |
| De vez en cuando | 1,00 |
| Regular | 1,18 |

### Peso corporal
Solo para ejercicios de **peso** (no aplica a reps ni tiempo).
Escalado amortiguado — el doble de peso corporal no significa el doble de fuerza:

```
× = 1 + 0,5 × (pesoCliente − 70) / 70      (limitado entre 0,80 y 1,30)
```

---

## 3. Valores base por ejercicio (persona de referencia)

Los de **peso** son por mancuerna cuando el ejercicio usa dos.

### Pecho
| Ejercicio | Tipo | Base |
|---|---|---|
| Press de banca | peso | 22,5 kg |
| Press inclinado con mancuernas | peso | 10 kg |
| Aperturas en polea | peso | 7,5 kg |
| Flexiones de pecho | reps | 10 |
| Fondos en paralelas | reps | 6 |

### Espalda
| Ejercicio | Tipo | Base |
|---|---|---|
| Dominadas | reps | 3 |
| Dominadas asistidas | reps | 8 |
| Jalón al pecho | peso | 27,5 kg |
| Remo con barra | peso | 22,5 kg |
| Remo con mancuerna | peso | 12,5 kg |
| Remo en máquina | peso | 25 kg |
| Peso muerto | peso | 35 kg |

### Pierna
| Ejercicio | Tipo | Base |
|---|---|---|
| Sentadilla con barra | peso | 27,5 kg |
| Sentadilla goblet | peso | 12,5 kg |
| Prensa de pierna | peso | 60 kg |
| Peso muerto rumano | peso | 30 kg |
| Zancadas con mancuernas | peso | 8 kg |
| Curl femoral | peso | 20 kg |
| Extensión de cuádriceps | peso | 20 kg |
| Elevación de talones | peso | 30 kg |
| Hip thrust | peso | 30 kg |
| Sentadilla búlgara | peso | 8 kg |

### Hombro
| Ejercicio | Tipo | Base |
|---|---|---|
| Press militar | peso | 15 kg |
| Press de hombro con mancuernas | peso | 8 kg |
| Elevaciones laterales | peso | 4 kg |
| Elevaciones frontales | peso | 4 kg |
| Pájaros posteriores | peso | 3 kg |
| Encogimiento de hombros | peso | 20 kg |

### Brazo
| Ejercicio | Tipo | Base |
|---|---|---|
| Curl de bíceps con barra | peso | 12,5 kg |
| Curl con mancuernas | peso | 7,5 kg |
| Curl martillo | peso | 7,5 kg |
| Extensión de tríceps en polea | peso | 15 kg |
| Press francés | peso | 12,5 kg |
| Fondos en banco | reps | 10 |

### Core
| Ejercicio | Tipo | Base |
|---|---|---|
| Plancha | tiempo | 30 s |
| Crunch abdominal | reps | 15 |
| Crunch en polea | peso | 15 kg |
| Elevación de piernas | reps | 10 |
| Russian twist | reps | 20 |

### Cardio
| Ejercicio | Tipo | Base |
|---|---|---|
| Caminadora | tiempo | 15 min |
| Bicicleta estática | tiempo | 15 min |
| Burpees | reps | 8 |

---

## 4. Datos faltantes del perfil

Nunca se bloquea el acceso a la rutina. Si falta un dato se usa el valor neutro
o el conservador:

| Falta | Se asume |
|---|---|
| Género | Coeficiente femenino (el más bajo — nunca sugerir de más) |
| Peso o estatura | Contextura "Promedio" y factor de peso 1,00 |
| Actividad | "De vez en cuando" (1,00) |
| Fecha de nacimiento | Rango 26-35 (1,00) |

---

## 5. Redondeo (para que el número sea usable en el gym)

| Tipo | Regla |
|---|---|
| Peso ≥ 20 kg | múltiplos de 5 |
| Peso 10 – 20 kg | múltiplos de 2,5 |
| Peso < 10 kg | múltiplos de 1 |
| Repeticiones | entero, mínimo 1 |
| Tiempo en segundos | múltiplos de 5 |
| Tiempo en minutos | múltiplos de 5, mínimo 5 |

---

## 6. Ejemplos (salida real del código, no cuentas a mano)

**Jhonatan — hombre, 30 años, 82 kg, 1,75 m (IMC 26,8 → robusto), activo regular**
- Press de banca → **30 kg**
- Sentadilla con barra → **35 kg**
- Plancha → **40 s**
- Elevaciones laterales → **5 kg**

**Mujer, 45 años, 62 kg, 1,62 m (IMC 23,6 → promedio), nunca ha entrenado**
- Press de banca → **9 kg**
- Sentadilla con barra → **15 kg**
- Caminadora → **10 min**
- Flexiones de pecho → **4 reps**

**Hombre, 68 años, 75 kg, 1,70 m (IMC 26 → robusto), de vez en cuando**
- Press de banca → **15 kg**
- Prensa de pierna → **40 kg**

**Perfil totalmente vacío** (recién registrado, sin género ni medidas)
- Press de banca → **12,5 kg** · Jalón al pecho → **17,5 kg** · Plancha → **30 s**
- Sale bajo a propósito: sin género conocido se aplica el coeficiente femenino.

---

## 7. Limitaciones conocidas

1. **La barra pesa más que la sugerencia.** Una barra olímpica pesa 20 kg, así que un
   "10 kg de press de banca" solo se logra con mancuernas, barra corta o multipower.
   El texto de la app debe dejar claro que es un punto de partida, y el cliente ajusta.
2. **Las máquinas varían por marca.** Una prensa de pierna de un gym no arranca en el
   mismo peso que la de otro. Es inevitable con cualquier método; el cliente corrige.
3. **IMC no distingue músculo de grasa.** Alguien muy musculoso sale "robusto". El
   multiplicador es suave (1,06) justo por eso.
4. **Sin validación de entrenador todavía.** Ver aviso del encabezado.

---

## 8. Cómo se guarda (decidido)

- El valor **se calcula al vuelo** cada vez, a partir del perfil actual del cliente.
- **No se congela** nada en el primer ingreso.
- Cuando el cliente ajusta un valor, **ese sí se guarda** y desde entonces manda
  siempre: ninguna recalculación lo pisa.
- Ventaja: si el cliente completa su perfil después, sus sugerencias mejoran solas,
  y los ejercicios nuevos de una rutina siempre usan sus datos actuales — sin popup.
