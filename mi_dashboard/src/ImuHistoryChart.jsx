import { IMU_HISTORY_LIMIT, imuPath } from './imuHistory'

const axes = [
  { key: 'roll', label: 'Roll · lateral', color: '#267f5d', dash: undefined },
  { key: 'pitch', label: 'Pitch · frontal', color: '#3269ba', dash: '8 3' },
  { key: 'yaw', label: 'Yaw · orientación', color: '#ae4b7e', dash: '2 4' },
]

export default function ImuHistoryChart({ history, live }) {
  const values = history.flatMap(sample => axes.map(axis => sample.imu[axis.key])).filter(Number.isFinite)
  const end = history.at(-1)?.time ?? 0
  const duration = Math.max(1, end - (history[0]?.time ?? end))
  const low = Math.min(0, ...values), high = Math.max(0, ...values)
  const padding = Math.max(1, (high - low) * 0.1)
  const min = low - padding, max = high + padding
  const x = time => 65 + (time - end + duration) / duration * 790
  const y = value => 220 - (value - min) / (max - min) * 190

  return <section className="panel angle-chart" aria-labelledby="imu-history-title">
    <div className="chart-header"><div><h2 id="imu-history-title">Historial de inclinación</h2><p>Últimas {IMU_HISTORY_LIMIT} muestras · {history.length}/{IMU_HISTORY_LIMIT} recibidas · {live ? 'En vivo' : 'Esperando conexión'}</p></div></div>
    {values.length ? <>
      <div className="series-legend">{axes.map(axis => {
        const value = history.at(-1)?.imu[axis.key]
        return <span key={axis.key}><i style={{ background: axis.color }}/>{axis.label}: <strong>{Number.isFinite(value) ? `${value.toFixed(1)}°` : 'Sin dato'}</strong></span>
      })}</div>
      <svg viewBox="0 0 900 265" role="img" aria-label={`Historial de roll, pitch y yaw en grados, ${history.length} muestras. Eje horizontal: segundos hasta la última lectura.`}>
        {[0, 1, 2, 3, 4].map(index => {
          const value = min + (max - min) * index / 4
          return <g key={index}><line x1="65" x2="855" y1={y(value)} y2={y(value)} stroke="#e4ebe6"/><text x="55" y={y(value) + 4} textAnchor="end">{value.toFixed(1)}°</text></g>
        })}
        {[0, 1, 2, 3].map(index => <text key={index} x={65 + index / 3 * 790} y="249" textAnchor="middle">{index === 3 ? 'Última lectura' : `−${(duration * (1 - index / 3)).toFixed(1)} s`}</text>)}
        {axes.map(axis => {
          const last = history.at(-1)
          return <g key={axis.key}><path d={imuPath(history, axis.key, x, y)} fill="none" stroke={axis.color} strokeWidth="2.5" strokeDasharray={axis.dash}/>{Number.isFinite(last?.imu[axis.key]) && <circle cx={x(last.time)} cy={y(last.imu[axis.key])} r="4" fill={axis.color}/>}</g>
        })}
      </svg>
    </> : <p className="chart-empty">{live ? 'Esperando valores de inclinación de la IMU…' : 'Conectá el robot para empezar el historial de inclinación.'}</p>}
    <p className="chart-note">Roll: línea continua · Pitch: guiones · Yaw: puntos. Se conservan hasta 120 muestras, sin límite de tiempo. El historial se reinicia al desconectar o reconectar. Los datos ausentes y los saltos de ángulo mayores a 180° cortan la línea.</p>
  </section>
}
