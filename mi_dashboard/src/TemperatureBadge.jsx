import { temperatureLevel } from './temperatureLevel'
import './MotorTemperatures.css'

export default function TemperatureBadge({ value }) {
  const level = temperatureLevel(value)
  return <span className={`temperature-badge temperature-${level.key}`}>
    <i aria-hidden="true" />
    {Number.isFinite(value) && <strong>{value.toFixed(1)} °C</strong>}
    <span>{level.label}</span>
  </span>
}
