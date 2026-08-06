import { useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { listarProgreso, guardarMedidasHoy, calcularRacha } from '../../services/db'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }
const fmt = (n) => String(n).replace('.', ',')
const MES_CORTO = new Intl.DateTimeFormat('es-CO', { month: 'short' })
const FECHA_FOTO = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const DIA_MS = 86400000

const textoFecha = (iso) => FECHA_FOTO.format(new Date(iso + 'T12:00:00'))

/* Cuánto tiempo separa la primera foto de la última, en palabras. */
function distanciaTexto(desde, hasta) {
  const dias = Math.round((new Date(hasta + 'T12:00:00') - new Date(desde + 'T12:00:00')) / DIA_MS)
  if (dias < 1) return 'Del mismo día'
  if (dias < 14) return `${dias} día${dias === 1 ? '' : 's'} de diferencia`
  if (dias < 60) return `${Math.round(dias / 7)} semanas de diferencia`
  const meses = Math.round(dias / 30)
  return `${meses} ${meses === 1 ? 'mes' : 'meses'} de diferencia`
}

export default function Progreso() {
  const { perfil } = useAuth()
  const [progreso, setProgreso] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ peso: '', cintura: '', brazo: '' })
  const [subiendo, setSubiendo] = useState(false)
  const [fotoAbierta, setFotoAbierta] = useState(null)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const cargar = () => perfil?.uid && listarProgreso(perfil.uid).then(setProgreso).catch(() => setProgreso([]))
  useEffect(() => { cargar() }, [perfil?.uid])

  const lista = progreso ?? []
  const racha = calcularRacha(lista)
  const medidas = lista.filter((p) => p.tipo === 'medidas')
  const ultimaMedida = medidas.at(-1)
  const anteriorMedida = medidas.at(-2)
  const delta = (k) => (ultimaMedida?.[k] != null && anteriorMedida?.[k] != null ? Math.round((ultimaMedida[k] - anteriorMedida[k]) * 10) / 10 : 0)

  // Gráfica: el ejercicio con más registros de peso en las sesiones
  const porEjercicio = {}
  for (const s of lista.filter((p) => p.tipo === 'sesion')) {
    for (const [ejId, dato] of Object.entries(s.ejercicios ?? {})) {
      if (dato?.peso != null) (porEjercicio[ejId] ??= []).push({ fecha: s.fecha, peso: dato.peso })
    }
  }
  const mejorSerie = Object.values(porEjercicio).sort((a, b) => b.length - a.length)[0] ?? []
  const puntos = mejorSerie.slice(-6)
  const fotos = lista.filter((p) => p.tipo === 'foto')

  const logros = [
    { nombre: 'Primera semana', logrado: racha.mejor >= 7 || racha.entrenos >= 5, meta: 7 },
    { nombre: '10 entrenos', logrado: racha.entrenos >= 10, meta: 10 },
    { nombre: 'Constancia 30', logrado: racha.entrenos >= 30, meta: 30 },
  ]

  const guardarMedidas = async () => {
    const datos = {}
    for (const k of ['peso', 'cintura', 'brazo']) {
      const v = parseFloat(form[k])
      if (!Number.isNaN(v)) datos[k] = v
    }
    if (!Object.keys(datos).length) return
    await guardarMedidasHoy(perfil.uid, datos)
    setEditando(false)
    setForm({ peso: '', cintura: '', brazo: '' })
    await cargar()
  }

  const subirFoto = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(true)
    try {
      const fecha = new Date().toISOString().slice(0, 10)
      const ruta = `usuarios/${perfil.uid}/fotos/${fecha}-${Date.now()}.jpg`
      const r = ref(storage, ruta)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      // Se guarda la ruta además de la url: así borrarla después es directo
      await setDoc(doc(db, 'usuarios', perfil.uid, 'progreso', `foto-${Date.now()}`), { tipo: 'foto', fecha, url, ruta })
      await cargar()
    } catch (err) {
      console.warn('subirFoto:', err.code ?? err.message)
    } finally {
      setSubiendo(false)
    }
  }

  /* Borrar una foto: primero el archivo, después el registro. Si el archivo ya
     no estuviera, igual se quita de la lista para que no quede una foto rota. */
  const borrarFoto = async (foto) => {
    setBorrando(true)
    try {
      await deleteObject(ref(storage, foto.ruta ?? foto.url)).catch((e) => {
        if (e.code !== 'storage/object-not-found') throw e
      })
      await deleteDoc(doc(db, 'usuarios', perfil.uid, 'progreso', foto.id))
      setFotoAbierta(null)
      setConfirmandoBorrar(null)
      await cargar()
    } catch (err) {
      console.warn('borrarFoto:', err.code ?? err.message)
    } finally {
      setBorrando(false)
    }
  }

  const X = (i) => 24 + (i * 272) / Math.max(1, puntos.length - 1)
  const min = Math.min(...puntos.map((p) => p.peso), 0)
  const max = Math.max(...puntos.map((p) => p.peso), 1)
  const Y = (v) => 110 - ((v - min) / (max - min || 1)) * 65

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Mi progreso</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Cada registro cuenta. ¡Sigue así!</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {progreso === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando tu progreso…</div>}

        {progreso !== null && (
          <>
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: 99, background: 'color-mix(in oklab, var(--gym-color) 12%, var(--mix-base))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gym-color)', lineHeight: 1 }}>{racha.actual}</div>
                  <div style={{ fontSize: 8.5, fontWeight: 600, color: 'var(--gym-color)', letterSpacing: '.04em' }}>DÍAS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                    {racha.actual > 0 ? '¡Racha encendida!' : racha.entrenos > 0 ? 'Retoma tu racha' : 'Tu primera racha te espera'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {racha.entrenos === 0
                      ? 'Completa tu rutina de hoy y arranca. 🔥'
                      : `${racha.actual} día${racha.actual === 1 ? '' : 's'} seguidos entrenando. Tu mejor racha: ${racha.mejor}.`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {logros.map((l) => (
                  <div key={l.nombre} style={{ flex: 1, textAlign: 'center', background: l.logrado ? 'color-mix(in oklab, var(--gym-color) 8%, var(--mix-base))' : 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 4px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: l.logrado ? 'var(--gym-color)' : 'var(--track)', color: l.logrado ? '#fff' : 'var(--text-4)', fontSize: l.logrado ? 13 : 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      {l.logrado ? '✓' : l.meta}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: l.logrado ? 600 : 500, marginTop: 6, color: l.logrado ? 'inherit' : 'var(--text-4)' }}>{l.nombre}</div>
                  </div>
                ))}
              </div>
            </div>

            {puntos.length >= 2 && (
              <div style={{ ...card, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Tu levantamiento estrella</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gym-color)', background: 'color-mix(in oklab, var(--gym-color) 10%, var(--mix-base))', borderRadius: 99, padding: '3px 9px' }}>
                    {puntos.at(-1).peso - puntos[0].peso >= 0 ? '+' : ''}{fmt(puntos.at(-1).peso - puntos[0].peso)} kg
                  </div>
                </div>
                <svg viewBox="0 0 320 130" style={{ width: '100%', marginTop: 10 }}>
                  {[30, 70, 110].map((y) => <line key={y} x1="16" y1={y} x2="312" y2={y} stroke="var(--track)" strokeWidth="1" />)}
                  <polyline points={puntos.map((p, i) => `${X(i)},${Y(p.peso)}`).join(' ')} fill="none" stroke="var(--gym-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {puntos.map((p, i) => (
                    <circle key={i} cx={X(i)} cy={Y(p.peso)} r={i === puntos.length - 1 ? 5 : 3.5} fill="var(--gym-color)" stroke={i === puntos.length - 1 ? 'var(--surface)' : 'none'} strokeWidth="2" />
                  ))}
                  <text x={X(puntos.length - 1)} y={Y(puntos.at(-1).peso) - 12} textAnchor="middle" style={{ font: '600 11px Poppins,sans-serif' }} fill="var(--gym-color)">
                    {fmt(puntos.at(-1).peso)} kg
                  </text>
                  {puntos.map((p, i) => (
                    <text key={i} x={X(i)} y="126" textAnchor="middle" style={{ font: '10px Poppins,sans-serif' }} fill="var(--text-4)">
                      {MES_CORTO.format(new Date(p.fecha + 'T00:00:00'))} {new Date(p.fecha + 'T00:00:00').getDate()}
                    </text>
                  ))}
                </svg>
              </div>
            )}

            {ultimaMedida && (
              <div style={{ ...card, padding: '6px 16px' }}>
                {[
                  ['Peso corporal', 'peso', 'kg'],
                  ['Cintura', 'cintura', 'cm'],
                  ['Brazo', 'brazo', 'cm'],
                ].filter(([, k]) => ultimaMedida[k] != null).map(([nombre, k, unidad], i, arr) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{nombre}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {fmt(ultimaMedida[k])} {unidad}{' '}
                      {delta(k) !== 0 && (
                        <span style={{ fontSize: 11, color: 'var(--gym-color)' }}>
                          {delta(k) < 0 ? '▼' : '▲'} {fmt(Math.abs(delta(k)))}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Fotos de progreso</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Privadas: solo tú las ves</div>
              </div>

              {/* Antes y después: lo que de verdad se disfruta de estas fotos */}
              {fotos.length >= 2 && (
                <div style={{ marginTop: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['Antes', fotos[0]], ['Ahora', fotos.at(-1)]].map(([etiqueta, f]) => (
                      <div key={etiqueta} style={{ flex: 1, minWidth: 0 }}>
                        <img
                          src={f.url} alt={etiqueta} onClick={() => setFotoAbierta(f)}
                          style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-sm)', objectFit: 'cover', cursor: 'zoom-in', display: 'block' }}
                        />
                        <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 5 }}>{etiqueta}</div>
                        <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{textoFecha(f.fecha)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--gym-color-text)', fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
                    {distanciaTexto(fotos[0].fecha, fotos.at(-1).fecha)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {fotos.map((f) => (
                  <div key={f.id} style={{ flex: '0 0 31%' }}>
                    <img
                      src={f.url} alt={f.fecha} onClick={() => setFotoAbierta(f)}
                      style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius)', objectFit: 'cover', cursor: 'zoom-in', display: 'block' }}
                    />
                    <div style={{ fontSize: 9.5, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>{textoFecha(f.fecha)}</div>
                  </div>
                ))}
                <label style={{ flex: '0 0 31%', aspectRatio: '3/4', borderRadius: 'var(--radius)', border: '1.5px dashed var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-4)', cursor: 'pointer', textAlign: 'center' }}>
                  {subiendo ? 'Subiendo…' : '+ Añadir'}
                  <input type="file" accept="image/*" onChange={subirFoto} style={{ display: 'none' }} />
                </label>
              </div>

              {fotos.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10, lineHeight: 1.55 }}>
                  Tómate una hoy y otra en un mes: el cambio se ve mucho mejor en fotos que en la balanza.
                </div>
              )}
              {fotos.length > 0 && (
                <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 10 }}>Toca una foto para verla en grande o borrarla.</div>
              )}
            </div>

            {editando ? (
              <div style={{ ...card, padding: 16 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Medidas de hoy</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[
                    ['peso', 'Peso (kg)'],
                    ['cintura', 'Cintura (cm)'],
                    ['brazo', 'Brazo (cm)'],
                  ].map(([k, label]) => (
                    <div key={k} style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                      <input type="number" inputMode="decimal" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ultimaMedida?.[k] != null ? fmt(ultimaMedida[k]) : '—'} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 10px', fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--surface-2)', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <button onClick={guardarMedidas} style={{ marginTop: 12, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 13, fontWeight: 600 }}>
                  Guardar medidas
                </button>
              </div>
            ) : (
              <button onClick={() => setEditando(true)} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600 }}>
                Registrar medidas de hoy
              </button>
            )}
          </>
        )}
      </div>

      {/* Foto en grande. Borrar vive aquí dentro: así la cuadrícula queda
          limpia y nadie borra una foto sin querer. */}
      {fotoAbierta && (
        <div
          onClick={() => setFotoAbierta(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(8,8,10,.92)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 16px calc(24px + env(safe-area-inset-bottom))' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
            <img src={fotoAbierta.url} alt={fotoAbierta.fecha} style={{ width: '100%', maxHeight: '62vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)', display: 'block' }} />
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', marginTop: 12 }}>{textoFecha(fotoAbierta.fecha)}</div>

            {confirmandoBorrar === fotoAbierta.id ? (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, lineHeight: 1.5 }}>
                  ¿Borrar esta foto? No se puede recuperar.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => setConfirmandoBorrar(null)} style={{ flex: 1, border: '1px solid rgba(255,255,255,.3)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600 }}>
                    Conservarla
                  </button>
                  <button onClick={() => borrarFoto(fotoAbierta)} disabled={borrando} style={{ flex: 1, background: '#dc2626', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600, opacity: borrando ? 0.6 : 1 }}>
                    {borrando ? 'Borrando…' : 'Sí, borrar'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => setFotoAbierta(null)} style={{ flex: 1, border: '1px solid rgba(255,255,255,.3)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600 }}>
                  Cerrar
                </button>
                <button onClick={() => setConfirmandoBorrar(fotoAbierta.id)} style={{ flex: 'none', padding: '12px 18px', color: '#fca5a5', fontSize: 13, fontWeight: 600 }}>
                  Borrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
