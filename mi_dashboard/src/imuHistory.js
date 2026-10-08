export const IMU_HISTORY_LIMIT = 120

export function appendImuSample(history, time, imu) {
  return [...history, { time, imu: { roll: imu?.roll, pitch: imu?.pitch, yaw: imu?.yaw } }].slice(-IMU_HISTORY_LIMIT)
}

export function imuPath(history, key, x, y) {
  return history.map((sample, index) => {
    const value = sample.imu[key]
    if (!Number.isFinite(value)) return ''
    const previous = history[index - 1]
    const connected = Number.isFinite(previous?.imu[key]) && sample.time - previous.time < 2 && Math.abs(value - previous.imu[key]) <= 180
    return `${connected ? 'L' : 'M'}${x(sample.time)},${y(value)}`
  }).join(' ')
}
