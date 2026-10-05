// Una fila por captura; las columnas de motores se identifican por modelo e ID.
export function captureRow(data, info, date = new Date()) {
  const row = {
    fecha_hora_utc: date.toISOString(), modelo: data.modelo, modo: info?.modo ?? '',
    tiempo_robot_s: data.ts, bateria_pct: data.bms?.soc,
    bateria_corriente: data.bms?.corriente, bateria_temperatura_c: data.bms?.temperatura,
    roll_deg: data.imu?.roll, pitch_deg: data.imu?.pitch, yaw_deg: data.imu?.yaw,
    ax_ms2: data.imu?.ax, ay_ms2: data.imu?.ay, az_ms2: data.imu?.az,
  }
  for (const motor of data.motores ?? []) {
    const prefix = `${data.modelo}_motor_${motor.id}`
    row[`${prefix}_nombre`] = motor.nombre
    row[`${prefix}_angulo_deg`] = motor.angulo
    row[`${prefix}_temperatura_c`] = motor.temperatura
    row[`${prefix}_velocidad_rads`] = motor.velocidad
    row[`${prefix}_torque_nm`] = motor.torque
  }
  for (const [foot, contact] of Object.entries(data.fuerzas ?? {})) row[`${data.modelo}_contacto_${foot}`] = contact
  for (const [index, voltage] of (data.bms?.celdas ?? []).entries()) row[`celda_${index + 1}_v`] = voltage
  return row
}

export function csvCell(value, separator) {
  if (value === null || value === undefined || (typeof value === 'number' && !Number.isFinite(value))) return ''
  // Los textos recibidos del servidor nunca deben convertirse en fórmulas de Excel.
  let text = String(value)
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = "'" + text
  return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(rows, separator = ';') {
  if (![',', ';'].includes(separator)) throw new Error('Separador no válido')
  if (!rows.length) return ''
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  const lines = [columns, ...rows.map(row => columns.map(key => row[key]))]
  return '\ufeff' + lines.map(line => line.map(cell => csvCell(cell, separator)).join(separator)).join('\r\n')
}
