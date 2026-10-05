import './MotorTemperatures.css'

const degrees = value => `${value.toFixed(1)} °C`

export default function MotorTemperatures({ motors, mode }) {
  const valid = motors.filter(motor => Number.isFinite(motor.temperatura))
  const hottest = valid.reduce((result, motor) => !result || motor.temperatura > result.temperatura ? motor : result, null)
  const average = valid.length ? valid.reduce((sum, motor) => sum + motor.temperatura, 0) / valid.length : null
  // La misma escala para todos los motores permite comparar sus temperaturas.
  const lower = Math.min(0, Math.floor(Math.min(...valid.map(m => m.temperatura), 0) / 10) * 10)
  const upper = Math.max(50, Math.ceil((hottest?.temperatura ?? 0) / 10) * 10)

  return (
    <section className="panel temperatures" aria-labelledby="temperatures-title">
      <div className="section-title">
        <h2 id="temperatures-title">Temperatura de los motores</h2>
        <span>{valid.length} de {motors.length} con datos</span>
      </div>
      {valid.length > 0 && <div className="temperature-summary">
        <div><span>Promedio de motores</span><strong>{degrees(average)}</strong></div>
        <div><span>Máxima actual</span><strong>{degrees(hottest.temperatura)}</strong><small>{hottest.nombre} · resaltada en naranja</small></div>
      </div>}
      {motors.length ? <>
        <p className="temperature-scale">Escala común: {lower} a {upper} °C · se amplía según los datos</p>
        <ul className="temperature-grid">
          {motors.map(motor => {
            const available = Number.isFinite(motor.temperatura)
            const maximum = available && motor.temperatura === hottest?.temperatura
            const width = available ? (motor.temperatura - lower) / (upper - lower) * 100 : 0
            return <li key={motor.id} className={`temperature-motor${maximum ? ' temperature-maximum' : ''}`}>
              <div className="temperature-label"><span>{motor.nombre}</span><strong>{available ? degrees(motor.temperatura) : 'Sin dato'}</strong></div>
              {available ? <div className="temperature-track" role="meter" aria-label={`Temperatura de ${motor.nombre}`} aria-valuemin={lower} aria-valuemax={upper} aria-valuenow={motor.temperatura} aria-valuetext={degrees(motor.temperatura)}><div style={{ width: `${width}%` }} /></div> : <div className="temperature-track" aria-hidden="true" />}
              <small>{maximum ? 'Máxima actual' : available ? 'Temperatura del motor' : 'No se recibió una temperatura válida'}</small>
            </li>
          })}
        </ul>
      </> : <p className="temperature-empty">Conectá el robot para ver la temperatura de cada motor.</p>}
      <p className="chart-note">{mode === 'simulador' || mode === 'demo' ? 'En este entorno las temperaturas son simuladas. ' : ''}El naranja destaca la temperatura más alta del grupo; no indica una alarma ni un límite de seguridad.</p>
    </section>
  )
}
