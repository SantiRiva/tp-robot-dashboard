// Mantiene una sola conexión activa y cancela todos los intentos al salir.
export function connectTelemetry(endpoint, callbacks, options = {}) {
  const { fetchImpl = fetch, Socket = WebSocket, retryMs = 3000, timeoutMs = 10000 } = options
  let stopped = false
  let disposeAttempt = () => {}
  let retry
  let lastTimestamp
  let lastModel

  function connect() {
    if (stopped) return
    let active = true
    let socket
    let deadline
    let baseline
    const controller = new AbortController()
    const dispose = () => {
      active = false
      clearTimeout(deadline)
      controller.abort()
      if (socket) {
        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null
        socket.close()
      }
    }
    disposeAttempt = dispose
    const fail = message => {
      if (!active || stopped) return
      dispose()
      callbacks.reset()
      callbacks.state('Reconectando…', message)
      retry = setTimeout(connect, retryMs)
    }
    const arm = message => {
      clearTimeout(deadline)
      deadline = setTimeout(() => fail(message), timeoutMs)
    }
    callbacks.state('Conectando…', '')
    arm('El backend no respondió a tiempo. Reintentando automáticamente…')
    ;(async () => {
      try {
        const response = await fetchImpl(`${endpoint}/info`, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const info = await response.json()
        if (!active || stopped) return
        callbacks.info(info)
        const url = new URL(`${endpoint}/ws`)
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        socket = new Socket(url.href)
        socket.onopen = () => {
          if (!active) return
          callbacks.state('Esperando datos…', '')
          arm('No llegan datos nuevos del robot. Revisá que el simulador siga abierto.')
        }
        socket.onmessage = event => {
          if (!active || stopped) return
          let snapshot
          try {
            snapshot = JSON.parse(event.data)
            if (!Array.isArray(snapshot.motores) || !snapshot.bms || !snapshot.imu || !Number.isFinite(snapshot.ts)) throw new Error()
          } catch {
            fail('La telemetría tiene un formato inválido. Reintentando…')
            return
          }
          // El primer paquete puede ser una foto vieja guardada por el backend.
          // Esperar que avance su reloj antes de anunciar En vivo.
          if (baseline === undefined) {
            baseline = snapshot.ts
            return
          }
          if (snapshot.ts === baseline) return
          // Recibir el mismo snapshot no significa que el robot siga conectado.
          if (snapshot.ts === lastTimestamp && snapshot.modelo === lastModel) return
          if (snapshot.modelo !== lastModel || snapshot.ts < lastTimestamp) callbacks.reset()
          lastTimestamp = snapshot.ts
          lastModel = snapshot.modelo
          arm('La telemetría dejó de actualizarse. Revisá el simulador; la conexión se recuperará automáticamente.')
          callbacks.snapshot(snapshot)
          callbacks.state('En vivo', '')
        }
        socket.onerror = () => fail('Se perdió la conexión con el backend. Reintentando automáticamente…')
        socket.onclose = () => fail('El backend cerró la conexión. Reintentando automáticamente…')
      } catch {
        fail('No se pudo conectar. Revisá que el backend esté abierto y la dirección sea correcta.')
      }
    })()
  }
  connect()
  return () => {
    stopped = true
    clearTimeout(retry)
    disposeAttempt()
  }
}
