export default function Pendiente({ nombre }) {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontWeight: 600, fontSize: 15 }}>{nombre}</p>
      <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 6 }}>
        Esta pantalla se construye en la siguiente fase.
      </p>
    </div>
  )
}
