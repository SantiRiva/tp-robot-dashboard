import './MotorTemperatures.css'
import { temperatureLevel } from './temperatureLevel'

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
      <ul className="temperature-legend" aria-label="Umbrales de temperatura del enunciado">
        <li className="temperature-normal"><i aria-hidden="true"/>Verde · Normal: menos de 40 °C</li>
        <li className="temperature-warning"><i aria-hidden="true"/>Amarillo · Atención: de 40 a 60 °C</li>
        <li className="temperature-critical"><i aria-hidden="true"/>Rojo · Crítica: más de 60 °C</li>
      </ul>
      {valid.length > 0 && <div className="temperature-summary">
        <div><span>Promedio de motores</span><strong>{degrees(average)}</strong></div>
        <div><span>Máxima actual</span><strong>{degrees(hottest.temperatura)}</strong><small>{hottest.nombre}</small></div>
      </div>}
      {motors.length ? <>
        <p className="temperature-scale">Escala común: {lower} a {upper} °C · se amplía según los datos</p>
        <ul className="temperature-grid">
          {motors.map(motor => {
            const available = Number.isFinite(motor.temperatura)
            const level = temperatureLevel(motor.temperatura)
            const maximum = available && motor.temperatura === hottest?.temperatura
            const width = available ? (motor.temperatura - lower) / (upper - lower) * 100 : 0
            return <li key={motor.id} className={`temperature-motor temperature-${level.key}`}>
              <div className="temperature-label"><span>{motor.nombre}</span><strong>{available ? degrees(motor.temperatura) : 'Sin dato'}</strong></div>
              {available ? <div className="temperature-track" role="meter" aria-label={`Temperatura de ${motor.nombre}`} aria-valuemin={lower} aria-valuemax={upper} aria-valuenow={motor.temperatura} aria-valuetext={degrees(motor.temperatura)}><div style={{ width: `${width}%` }} /></div> : <div className="temperature-track" aria-hidden="true" />}
              <small>{level.label}{maximum ? ' · Máxima actual' : ''}</small>
            </li>
          })}
        </ul>
      </> : <p className="temperature-empty">Conectá el robot para ver la temperatura de cada motor.</p>}
      <p className="chart-note">{mode === 'simulador' || mode === 'demo' ? 'En este entorno las temperaturas son simuladas. ' : ''}Semáforo según los umbrales del enunciado del TP05.</p>
    </section>
  )
}
