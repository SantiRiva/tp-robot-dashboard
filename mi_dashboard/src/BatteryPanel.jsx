import './BatteryPanel.css'

const format = (value, unit, decimals = 1) => Number.isFinite(value) ? `${value.toFixed(decimals)} ${unit}` : 'Sin dato'

export default function BatteryPanel({ bms, live }) {
  const battery = live ? bms : null
  const cells = Array.isArray(battery?.celdas) ? battery.celdas : []
  const validCells = cells.filter(value => Number.isFinite(value) && value >= 0)
  const scale = Math.max(1, ...validCells)

  return <section className="panel battery-panel" aria-labelledby="battery-title">
    <div className="section-title"><h2 id="battery-title">Estado de la batería · BMS</h2><span>{live ? 'En vivo' : 'Esperando conexión'}</span></div>
    <dl className="battery-values">
      <div><dt>Carga disponible</dt><dd>{format(battery?.soc, '%', 0)}</dd></div>
      <div><dt>Corriente</dt><dd>{format(battery?.corriente, 'mA', 0)}</dd></div>
      <div><dt>Temperatura de batería</dt><dd>{format(battery?.temperatura, '°C')}</dd></div>
    </dl>
    <h3>Voltaje por celda</h3>
    {cells.length ? <>
      <p className="battery-caption">{cells.length} celdas · escala compartida de 0 a {scale.toFixed(3)} V</p>
      <ol className="battery-cells">{cells.map((voltage, index) => {
        const valid = Number.isFinite(voltage) && voltage >= 0
        return <li key={index}><div><span>Celda {index + 1}</span><strong>{valid ? format(voltage, 'V', 3) : 'Sin dato'}</strong></div><div className="battery-track" aria-hidden="true"><span style={{ width: `${valid ? voltage / scale * 100 : 0}%` }}/></div></li>
      })}</ol>
    </> : <p className="battery-empty">{live ? 'El backend no está informando voltajes de celdas.' : 'Conectá el robot para recibir datos de batería.'}</p>}
    <p className="chart-note">Las barras comparan voltajes; no indican un nivel de alarma. En simulación, el backend puede devolver valores derivados, ceros o una lista de celdas vacía.</p>
  </section>
}
