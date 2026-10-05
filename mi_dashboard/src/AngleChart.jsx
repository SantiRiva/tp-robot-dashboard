import { useState } from 'react'
const metrics = { angulo: ['Ángulo', '°'], temperatura: ['Temperatura', '°C'], velocidad: ['Velocidad', 'rad/s'], torque: ['Torque', 'Nm'] }
const colors = ['#267f5d', '#3269ba', '#ae4b7e', '#a56b16']

export default function AngleChart({ history, motors, live }) {
  const [selection, setSelection] = useState(null)
  const [metric, setMetric] = useState('angulo')
  const defaults = motors.filter(m => /thigh|knee/i.test(m.nombre)).slice(0, 2)
  const ids = selection ?? (defaults.length ? defaults : motors.slice(0, 1)).map(m => m.id)
  const selected = ids.map(id => motors.find(m => m.id === id)).filter(Boolean)
  const [label, unit] = metrics[metric]
  const end = history.at(-1)?.time ?? 0
  const series = selected.map((motor, index) => ({ motor, color: colors[index], points: history.map(s => ({ t: s.time, value: s.readings?.[motor.id]?.[metric] })) }))
  const values = series.flatMap(s => s.points.map(p => p.value)).filter(Number.isFinite)
  const low = values.length ? Math.min(...values) : 0
  const high = values.length ? Math.max(...values) : 1
  const pad = Math.max((high - low) * 0.15, metric === 'velocidad' ? 0.1 : 1)
  const min = low - pad, max = high + pad
  const x = t => 60 + (t - end + 30) / 30 * 800
  const y = v => 220 - (v - min) / (max - min) * 190
  function toggle(id) {
    setSelection(ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 4 ? [...ids, id] : ids)
  }
  return <section className="panel angle-chart" aria-labelledby="angle-title">
    <div className="chart-header"><div><h2 id="angle-title">Comparar motores</h2><p>Últimos 30 segundos · hasta 4 motores · {live ? 'En vivo' : 'Sin datos nuevos'}</p></div>
      <label htmlFor="metric-selector">Magnitud<select id="metric-selector" value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metrics).map(([key, [name, units]]) => <option key={key} value={key}>{name} ({units})</option>)}</select></label>
    </div>
    <fieldset className="motor-choices"><legend>Elegí motores ({selected.length}/4)</legend>{motors.map(m => <label key={m.id}><input type="checkbox" checked={ids.includes(m.id)} disabled={!ids.includes(m.id) && ids.length >= 4} onChange={() => toggle(m.id)}/>{m.nombre}</label>)}</fieldset>
    {values.length ? <>
      <div className="series-legend">{series.map(s => <span key={s.motor.id}><i style={{background:s.color}}/>{s.motor.nombre}: <strong>{Number.isFinite(s.points.at(-1)?.value) ? s.points.at(-1).value.toFixed(2) : '—'} {unit}</strong></span>)}</div>
      <svg viewBox="0 0 900 265" role="img" aria-label={`${label} de ${selected.map(m => m.nombre).join(', ')} en ${unit}, últimos 30 segundos`}>
        {[0,1,2,3,4].map(i => { const v=min+(max-min)*i/4; return <g key={i}><line x1="60" x2="860" y1={y(v)} y2={y(v)} stroke="#e4ebe6"/><text x="48" y={y(v)+4} textAnchor="end">{v.toFixed(1)}</text></g> })}
        {[30,20,10,0].map(s => <text key={s} x={60+(30-s)/30*800} y="249" textAnchor="middle">{s ? `−${s} s` : 'Ahora'}</text>)}
        {series.map(s => { const d=s.points.map((p,i) => { if(!Number.isFinite(p.value)) return ''; const prev=s.points[i-1]; return `${Number.isFinite(prev?.value) && p.t-prev.t<2 ? 'L':'M'}${x(p.t)},${y(p.value)}` }).join(' '); const last=s.points.at(-1); return <g key={s.motor.id}><path d={d} fill="none" stroke={s.color} strokeWidth="2.5"/>{Number.isFinite(last?.value) && <circle cx={x(last.t)} cy={y(last.value)} r="4" fill={s.color}/>}</g> })}
      </svg>
    </> : <p className="chart-empty">{!motors.length ? 'Conectá el robot para recibir datos.' : !selected.length ? 'Seleccioná al menos un motor.' : 'Esperando muestras de esta magnitud…'}</p>}
    <p className="chart-note">Unidad: {unit}. Cambiá la magnitud sin perder el historial. Para elegir un quinto motor, desmarcá uno primero.</p>
  </section>
}
