import { useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { listarProgreso, guardarMedidasHoy, calcularRacha } from '../../services/db'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }
const fmt = (n) => String(n).replace('.', ',')
const MES_CORTO = new Intl.DateTimeFormat('es-CO', { month: 'short' })

export default function Progreso() {
  const { perfil } = useAuth()
  const [progreso, setProgreso] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ peso: '', cintura: '', brazo: '' })
  const [subiendo, setSubiendo] = useState(false)

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
      const r = ref(storage, `usuarios/${perfil.uid}/fotos/${fecha}-${Date.now()}.jpg`)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      await setDoc(doc(db, 'usuarios', perfil.uid, 'progreso', `foto-${Date.now()}`), { tipo: 'foto', fecha, url })
      await cargar()
    } catch (err) {
      console.warn('subirFoto:', err.code ?? err.message)
    } finally {
      setSubiendo(false)
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
                <div style={{ width: 64, height: 64, borderRadius: 99, background: 'color-mix(in oklab, var(--gym-color) 12%, white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                  <div key={l.nombre} style={{ flex: 1, textAlign: 'center', background: l.logrado ? 'color-mix(in oklab, var(--gym-color) 8%, white)' : 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 4px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: l.logrado ? 'var(--gym-color)' : '#e4e4e0', color: l.logrado ? '#fff' : '#a8a8a4', fontSize: l.logrado ? 13 : 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      {l.logrado ? '✓' : l.meta}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: l.logrado ? 600 : 500, marginTop: 6, color: l.logrado ? 'inherit' : '#a8a8a4' }}>{l.nombre}</div>
                  </div>
                ))}
              </div>
            </div>

            {puntos.length >= 2 && (
              <div style={{ ...card, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Tu levantamiento estrella</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gym-color)', background: 'color-mix(in oklab, var(--gym-color) 10%, white)', borderRadius: 99, padding: '3px 9px' }}>
                    {puntos.at(-1).peso - puntos[0].peso >= 0 ? '+' : ''}{fmt(puntos.at(-1).peso - puntos[0].peso)} kg
                  </div>
                </div>
                <svg viewBox="0 0 320 130" style={{ width: '100%', marginTop: 10 }}>
                  {[30, 70, 110].map((y) => <line key={y} x1="16" y1={y} x2="312" y2={y} stroke="#f0f0ee" strokeWidth="1" />)}
                  <polyline points={puntos.map((p, i) => `${X(i)},${Y(p.peso)}`).join(' ')} fill="none" stroke="var(--gym-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {puntos.map((p, i) => (
                    <circle key={i} cx={X(i)} cy={Y(p.peso)} r={i === puntos.length - 1 ? 5 : 3.5} fill="var(--gym-color)" stroke={i === puntos.length - 1 ? '#fff' : 'none'} strokeWidth="2" />
                  ))}
                  <text x={X(puntos.length - 1)} y={Y(puntos.at(-1).peso) - 12} textAnchor="middle" style={{ font: '600 11px Poppins,sans-serif' }} fill="var(--gym-color)">
                    {fmt(puntos.at(-1).peso)} kg
                  </text>
                  {puntos.map((p, i) => (
                    <text key={i} x={X(i)} y="126" textAnchor="middle" style={{ font: '10px Poppins,sans-serif' }} fill="#a8a8a4">
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
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none' }}>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
                {fotos.slice(-4).map((f) => (
                  <img key={f.id} src={f.url} alt={f.fecha} style={{ flex: '0 0 31%', aspectRatio: '3/4', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                ))}
                <label style={{ flex: '0 0 31%', aspectRatio: '3/4', borderRadius: 'var(--radius)', border: '1.5px dashed #d6d6d2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a8a8a4', cursor: 'pointer' }}>
                  {subiendo ? 'Subiendo…' : '+ Añadir'}
                  <input type="file" accept="image/*" onChange={subirFoto} style={{ display: 'none' }} />
                </label>
              </div>
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
    </>
  )
}
