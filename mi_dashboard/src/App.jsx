import { useEffect, useState } from 'react'
import './App.css'
import AngleChart from './AngleChart'
import MotorTemperatures from './MotorTemperatures'

const number = (value, unit = '') => Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—'

export default function App() {
  const [address, setAddress] = useState('http://localhost:8001')
  const [endpoint, setEndpoint] = useState('')
  const [status, setStatus] = useState('Sin conexión')
  const [info, setInfo] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!endpoint) return
    let stopped = false
    let socket
    let retry
    let watchdog
    let lastMessage = Date.now()
    const controller = new AbortController()
    const connect = async () => {
      setStatus('Conectando…')
      try {
        const response = await fetch(`${endpoint}/info`, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const details = await response.json()
        if (stopped) return
        setInfo(details)
        const url = new URL(`${endpoint}/ws`)
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        socket = new WebSocket(url)
        socket.onopen = () => { lastMessage = Date.now(); setHistory([]); setStatus('Esperando datos…') }
        socket.onmessage = (event) => {
          if (stopped) return
          try {
            const snapshot = JSON.parse(event.data)
            if (!Array.isArray(snapshot.motores) || !snapshot.bms || !snapshot.imu) throw new Error('Formato inesperado')
            lastMessage = Date.now()
            setData(snapshot)
            const time = performance.now() / 1000
            const angles = Object.fromEntries(snapshot.motores.map(m => [m.id, m.angulo]))
            setHistory(previous => [...previous.filter(sample => time - sample.time <= 30), { time, angles }].slice(-600))
            setStatus('En vivo')
            setError('')
          } catch { setError('El servidor envió datos con un formato inesperado.') }
        }
        socket.onerror = () => socket.close()
        socket.onclose = () => {
          if (stopped) return
          setData(null)
          setStatus('Reconectando…')
          retry = setTimeout(connect, 3000)
        }
      } catch {
        if (stopped) return
        setStatus('Reconectando…')
        setError('No se pudo conectar. Revisá que INICIAR_TP05.bat esté abierto y la dirección sea correcta.')
        retry = setTimeout(connect, 3000)
      }
    }
    connect()
    watchdog = setInterval(() => {
      if (Date.now() - lastMessage > 10000 && socket?.readyState === WebSocket.OPEN) {
        setData(null)
        setError('El servidor dejó de enviar datos. Intentando reconectar…')
        socket.close()
      }
    }, 2000)
    return () => {
      stopped = true
      controller.abort()
      clearTimeout(retry)
      clearInterval(watchdog)
      socket?.close()
    }
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
      <MotorTemperatures motors={data?.motores || []} mode={info?.modo} />
      <AngleChart history={history} motors={data?.motores || []} live={status === 'En vivo'} />
      <section className="panel"><div className="section-title"><h2>Motores</h2><span>Ángulos y temperaturas</span></div>
        {data ? <div className="table-wrap"><table><thead><tr><th>Motor</th><th>Ángulo</th><th>Temperatura</th><th>Torque</th></tr></thead><tbody>{data.motores.map(m => <tr key={m.id}><td>{m.nombre}</td><td>{number(m.angulo, '°')}</td><td>{number(m.temperatura, ' °C')}</td><td>{number(m.torque, ' Nm')}</td></tr>)}</tbody></table></div> : <div className="empty"><span>◎</span><h3>Listo para recibir telemetría</h3><p>Abrí INICIAR_TP05.bat, elegí un robot y conectá su dirección arriba.</p><small>Los datos aparecerán cuando el backend los envíe.</small></div>}
      </section>
      {info?.modelo === 'go2' && data && <section className="panel"><h2>Apoyo de patas</h2><div className="feet">{Object.entries(data.fuerzas || {}).map(([name, value]) => <span key={name}>{name}: {value ? 'Apoyada' : 'En el aire'}</span>)}</div></section>}
      <footer>Primera versión · React + WebSocket <span>En simulación, varios valores son derivados; no son mediciones del robot físico.</span></footer>
    </main>
  )
}
