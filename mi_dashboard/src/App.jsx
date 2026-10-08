import { useEffect, useState } from 'react'
import './App.css'
import AngleChart from './AngleChart'
import MotorTemperatures from './MotorTemperatures'
import TemperatureBadge from './TemperatureBadge'
import FootDiagram from './FootDiagram'
import OrientationPanel from './OrientationPanel'
import ImuHistoryChart from './ImuHistoryChart'
import { appendImuSample } from './imuHistory'
import SampleCapture from './SampleCapture'
import { connectTelemetry } from './telemetryConnection'

const number = (value, unit = '') => Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—'

export default function App() {
  const [address, setAddress] = useState('http://localhost:8001')
  const [endpoint, setEndpoint] = useState('')
  const [status, setStatus] = useState('Sin conexión')
  const [info, setInfo] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [imuHistory, setImuHistory] = useState([])

  useEffect(() => {
    if (!endpoint) return
    return connectTelemetry(endpoint, {
      info: setInfo,
      state: (nextStatus, message) => { setStatus(nextStatus); setError(message) },
      reset: () => { setData(null); setHistory([]); setImuHistory([]) },
      snapshot: snapshot => {
        setData(snapshot)
        const time = performance.now() / 1000
        setImuHistory(previous => appendImuSample(previous, time, snapshot.imu))
        const readings = Object.fromEntries(snapshot.motores.map(m => [m.id, m]))
        setHistory(previous => [...previous.filter(sample => time - sample.time <= 30), { time, readings }].slice(-600))
      },
    })
  }, [endpoint])

  function handleConnect(event) {
    event.preventDefault()
    try {
      const url = new URL(address)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error()
      setError('')
      setData(null)
      setInfo(null)
      setEndpoint(url.origin)
    } catch { setError('Ingresá una dirección como http://localhost:8001, sin rutas ni credenciales.') }
  }

  function disconnect() {
    setEndpoint('')
    setHistory([])
    setImuHistory([])
    setData(null)
    setInfo(null)
    setError('')
    setStatus('Sin conexión')
  }

  return (
    <main>
      <header><span className="eyebrow">UADE / DESARROLLO DE APLICACIONES II</span><span className={`status ${status === 'En vivo' ? 'live' : ''}`} role="status">● {status}</span></header>
      <section className="intro"><p className="eyebrow">LABORATORIO DE ROBÓTICA · TP05</p><h1>El robot, en datos.</h1><p>Conectá el simulador y observá su estado en tiempo real.</p></section>
      <form className="connection" onSubmit={handleConnect}>
        <label htmlFor="address">Dirección del backend<input id="address" type="url" value={address} onChange={e => setAddress(e.target.value)} disabled={Boolean(endpoint)} required /></label>
        {endpoint ? <button type="button" onClick={disconnect}>Desconectar</button> : <button type="submit">Conectar robot ↗</button>}
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <section className="cards" aria-label="Resumen del robot">
        <article><h2>Robot</h2><strong>{info?.nombre || '—'}</strong><p>{info ? `${info.n_motores} motores · ${info.modo}` : 'Esperando conexión'}</p></article>
        <article><h2>Batería</h2><strong>{number(data?.bms?.soc, '%')}</strong><p>Carga disponible</p></article>
        <article><h2>Inclinación</h2><strong>{number(data?.imu?.pitch, '°')}</strong><p>Pitch · Roll {number(data?.imu?.roll, '°')} · Yaw {number(data?.imu?.yaw, '°')}</p></article>
      </section>
      <SampleCapture data={data} info={info} live={status === 'En vivo'} />
      <OrientationPanel imu={data?.imu} live={status === 'En vivo'} />
      <ImuHistoryChart history={imuHistory} live={status === 'En vivo'} />
      <MotorTemperatures motors={data?.motores || []} mode={info?.modo} />
      <AngleChart key={info?.modelo || 'none'} history={history} motors={data?.motores || []} live={status === 'En vivo'} />
      <section className="panel"><div className="section-title"><h2>Motores</h2><span>Ángulo, velocidad angular, temperatura y torque</span></div>
        {data ? <div className="table-wrap"><table><thead><tr><th>Motor</th><th>Ángulo</th><th>Velocidad angular (rad/s)</th><th>Temperatura</th><th>Torque</th></tr></thead><tbody>{data.motores.map(m => <tr key={m.id}><td>{m.nombre}</td><td>{number(m.angulo, '°')}</td><td>{number(m.velocidad, ' rad/s')}</td><td><TemperatureBadge value={m.temperatura} /></td><td>{number(m.torque, ' Nm')}</td></tr>)}</tbody></table></div> : <div className="empty"><span>◎</span><h3>Listo para recibir telemetría</h3><p>Abrí INICIAR_TP05.bat, elegí un robot y conectá su dirección arriba.</p><small>Los datos aparecerán cuando el backend los envíe.</small></div>}
      </section>
      <FootDiagram model={info?.modelo} forces={data?.fuerzas} live={status === 'En vivo'} />
      <footer>Primera versión · React + WebSocket <span>En simulación, varios valores son derivados; no son mediciones del robot físico.</span></footer>
    </main>
  )
}
