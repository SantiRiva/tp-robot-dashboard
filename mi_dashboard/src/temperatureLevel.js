// Umbrales exigidos por el enunciado TP05; 40 y 60 pertenecen a amarillo.
export function temperatureLevel(value) {
  if (!Number.isFinite(value)) return { key: 'unknown', label: 'Sin dato' }
  if (value < 40) return { key: 'normal', label: 'Normal' }
  if (value <= 60) return { key: 'warning', label: 'Atención' }
  return { key: 'critical', label: 'Crítica' }
}
