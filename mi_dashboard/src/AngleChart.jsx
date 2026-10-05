import { useState } from 'react'

export default function AngleChart({ history, motors, live }) {
  const [selected, setSelected] = useState('')
  const motor = motors.find(m => String(m.id) === selected) || motors.find(m => /thigh|knee/i.test(m.nombre)) || motors[0]
  const end = history.at(-1)?.time ?? 0
  const points = history.map(sample => ({ t: sample.time, value: sample.angles[motor?.id] }))
  const values = points.map(p => p.value).filter(Number.isFinite)
  const min = Math.floor((Math.min(...values, 0) - 5) / 10) * 10
  const max = Math.ceil((Math.max(...values, 0) + 5) / 10) * 10
  const x = time => 60 + ((time - end + 30) / 30) * 800
  const y = value => 220 - ((value - min) / (max - min)) * 190
  const path = points.map((p, index) => {
    if (!Number.isFinite(p.value)) return ''
    const previous = points[index - 1]
    const command = Number.isFinite(previous?.value) && p.t - previous.t < 2 ? 'L' : 'M'
    return `${command}${x(p.t).toFixed(2)},${y(p.value).toFixed(2)}`
  }).join(' ')
  const latest = points.at(-1)
  return <section className="panel angle-chart" aria-labelledby="angle-title">
    <div className="chart-header"><div><h2 id="angle-title">Ángulos en el tiempo</h2><p>Últimos 30 segundos · grados (°)</p></div>
      <label htmlFor="motor-selector">Motor<select id="motor-selector" value={motor ? String(motor.id) : ''} disabled={!motors.length} onChange={e => setSelected(e.target.value)}>{!motors.length && <option value="">Sin datos</option>}{motors.map(m => <option key={m.id} value={String(m.id)}>{m.nombre}</option>)}</select></label>
    </div>
    {values.length ? <>
      <div className="chart-reading"><strong>{Number.isFinite(latest?.value) ? `${latest.value.toFixed(1)}°` : '—'}</strong><span>{motor?.nombre} · {live ? 'En vivo' : 'Sin datos nuevos'}</span></div>
      <svg viewBox="0 0 900 265" role="img" aria-label={`Historial del ángulo de ${motor?.nombre} en grados durante los últimos 30 segundos`}>
        {[0, 1, 2, 3, 4].map(i => { const value = min + (max - min) * i / 4; return <g key={i}><line x1="60" x2="860" y1={y(value)} y2={y(value)} stroke="#e4ebe6"/><text x="48" y={y(value) + 4} textAnchor="end">{Math.round(value)}°</text></g> })}
        {[30, 20, 10, 0].map(seconds => <text key={seconds} x={60 + (30 - seconds) / 30 * 800} y="249" textAnchor="middle">{seconds ? `−${seconds} s` : 'Ahora'}</text>)}
        <path d={path} fill="none" stroke="#267f5d" strokeWidth="2.5" strokeLinejoin="round"/>
        {Number.isFinite(latest?.value) && <circle cx={x(latest.t)} cy={y(latest.value)} r="4" fill="#267f5d"/>}
      </svg>
    </> : <div className="chart-empty">Conectá el robot para empezar a registrar sus ángulos.</div>}
    <p className="chart-note">Podés cambiar de motor sin perder su historial. El registro se reinicia al reconectar.</p>
  </section>
}
