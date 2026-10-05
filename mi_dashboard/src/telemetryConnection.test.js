import { test } from 'node:test'
import assert from 'node:assert/strict'
import { connectTelemetry } from './telemetryConnection.js'

function setup(t, fetchImpl = async () => ({ ok: true, json: async () => ({ modelo: 'go2' }) })) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const sockets = [], states = [], samples = []
  let resets = 0
  class Socket {
    constructor() { sockets.push(this) }
    close() { this.closed = true }
  }
  const stop = connectTelemetry('http://localhost:8001', {
    info() {}, state: s => states.push(s), reset: () => { resets++ }, snapshot: s => samples.push(s),
  }, { fetchImpl, Socket, timeoutMs: 100, retryMs: 30 })
  t.after(stop)
  return { sockets, states, samples, stop, resets: () => resets }
}
const flush = async () => { for (let i=0;i<8;i++) await Promise.resolve() }
const send = (socket, ts) => socket.onmessage({ data: JSON.stringify({ modelo:'go2', ts, motores:[], bms:{}, imu:{} }) })

test('se recupera después del cierre del backend sin duplicar intentos', async t => {
  const h=setup(t); await flush(); h.sockets[0].onopen(); send(h.sockets[0],0); send(h.sockets[0],1)
  h.sockets[0].onclose(); assert.equal(h.states.at(-1),'Reconectando…')
  assert.ok(h.resets()>0); t.mock.timers.tick(30); await flush()
  assert.equal(h.sockets.length,2); h.sockets[1].onopen(); send(h.sockets[1],1); send(h.sockets[1],2)
  assert.equal(h.states.at(-1),'En vivo')
})
test('datos repetidos vencen y no recuperan En vivo hasta un dato nuevo', async t => {
  const h=setup(t); await flush(); h.sockets[0].onopen(); send(h.sockets[0],0); send(h.sockets[0],1)
  t.mock.timers.tick(60); send(h.sockets[0],1); t.mock.timers.tick(40)
  assert.equal(h.states.at(-1),'Reconectando…'); assert.equal(h.samples.length,1)
  t.mock.timers.tick(30); await flush(); h.sockets[1].onopen(); send(h.sockets[1],1)
  assert.equal(h.states.at(-1),'Esperando datos…'); send(h.sockets[1],2)
  assert.equal(h.states.at(-1),'En vivo')
})
test('consulta HTTP bloqueada vence y Desconectar cancela los reintentos', async t => {
  let attempts=0
  const h=setup(t,()=>{attempts++;return new Promise(()=>{})})
  t.mock.timers.tick(100); assert.equal(h.states.at(-1),'Reconectando…')
  h.stop(); t.mock.timers.tick(1000); assert.equal(attempts,1)
})
test('handshake WebSocket bloqueado vence', async t => {
  const h=setup(t); await flush(); t.mock.timers.tick(100)
  assert.equal(h.states.at(-1),'Reconectando…'); assert.equal(h.sockets[0].closed,true)
})
test('paquetes inválidos limpian datos y un reloj reiniciado se recupera', async t => {
  const h=setup(t); await flush(); h.sockets[0].onopen(); send(h.sockets[0],99); send(h.sockets[0],100)
  h.sockets[0].onmessage({data:'invalid'}); assert.equal(h.states.at(-1),'Reconectando…')
  t.mock.timers.tick(30); await flush(); h.sockets[1].onopen(); send(h.sockets[1],100); send(h.sockets[1],0)
  assert.equal(h.states.at(-1),'En vivo'); assert.equal(h.samples.at(-1).ts,0)
})
test('Desconectar cierra el socket y no vuelve a conectarse', async t => {
  const h=setup(t); await flush(); h.sockets[0].onopen(); h.stop()
  t.mock.timers.tick(1000); assert.equal(h.sockets.length,1); assert.equal(h.sockets[0].closed,true)
})

test('no anuncia En vivo al recibir una foto vieja al conectar', async t => {
  const h=setup(t); await flush(); h.sockets[0].onopen(); send(h.sockets[0],50)
  assert.equal(h.states.at(-1),'Esperando datos…'); assert.equal(h.samples.length,0)
  t.mock.timers.tick(60); send(h.sockets[0],50); t.mock.timers.tick(40)
  assert.equal(h.states.at(-1),'Reconectando…'); assert.equal(h.samples.length,0)
})
