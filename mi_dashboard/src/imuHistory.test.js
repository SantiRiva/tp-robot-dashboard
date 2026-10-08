import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appendImuSample, imuPath } from './imuHistory.js'

test('conserva 120 muestras incluso con recepción lenta y elimina las más antiguas', () => {
  let history = []
  for (let index = 0; index < 150; index++) history = appendImuSample(history, index * 3, { roll: index, pitch: 0, yaw: -index })
  assert.equal(history.length, 120)
  assert.equal(history[0].imu.roll, 30)
  assert.equal(history.at(-1).imu.yaw, -149)
})

test('no une datos ausentes, cortes temporales ni cruces entre +180 y -180', () => {
  const history = [
    { time: 0, imu: { yaw: 178 } },
    { time: 0.1, imu: { yaw: 179 } },
    { time: 0.2, imu: { yaw: -179 } },
    { time: 0.3, imu: {} },
    { time: 0.4, imu: { yaw: -177 } },
    { time: 4, imu: { yaw: -176 } },
  ]
  assert.equal(imuPath(history, 'yaw', v => v, v => v), 'M0,178 L0.1,179 M0.2,-179  M0.4,-177 M4,-176')
})

test('copia la IMU y admite mensajes sin IMU sin inventar ceros', () => {
  const imu = { roll: 5, pitch: 0, yaw: -5 }
  const history = appendImuSample([], 0, imu)
  imu.roll = 99
  assert.equal(history[0].imu.roll, 5)
  const next = appendImuSample(history, 1)
  assert.equal(history.length, 1)
  assert.equal(next[1].imu.roll, undefined)
})
