import { useId } from 'react'
import './OrientationPanel.css'

const format = value => Number.isFinite(value) ? `${value.toFixed(1)}°` : 'Sin dato'

export default function OrientationPanel({ imu, live }) {
  const clipId = useId()
  const roll = live && Number.isFinite(imu?.roll) ? imu.roll : null
  const pitch = live && Number.isFinite(imu?.pitch) ? imu.pitch : null
  const yaw = live && Number.isFinite(imu?.yaw) ? imu.yaw : null
  const attitudeReady = roll !== null && pitch !== null
  const headingReady = yaw !== null
  const heading = headingReady ? ((yaw % 360) + 360) % 360 : 0
  const limitedPitch = attitudeReady ? Math.max(-45, Math.min(45, pitch)) : 0
  return <section className="panel orientation-panel" aria-labelledby="orientation-title">
    <div className="section-title"><h2 id="orientation-title">Inclinación y orientación</h2><span>{live ? 'Lectura de la IMU' : 'Esperando conexión'}</span></div>
    <div className="orientation-grid">
      <article className="orientation-instrument">
        <h3>Horizonte artificial</h3>
        <svg viewBox="0 0 260 260" role="img" aria-label={attitudeReady ? `Horizonte artificial: roll ${format(roll)}, pitch ${format(pitch)}` : 'Horizonte sin datos'}>
          <defs><clipPath id={clipId}><circle cx="130" cy="130" r="100"/></clipPath></defs>
          <circle cx="130" cy="130" r="108" fill="#edf2ee" stroke="#bdcec2"/>
          <g clipPath={`url(#${clipId})`}>
            {attitudeReady ? <g transform={`translate(130 130) rotate(${-roll}) translate(0 ${limitedPitch * 2})`}>
              <rect x="-400" y="-500" width="800" height="500" fill="#91bdd1"/>
              <rect x="-400" y="0" width="800" height="500" fill="#c5ae89"/>
              <line x1="-400" x2="400" y1="0" y2="0" stroke="#fff" strokeWidth="3"/>
              {[-40,-30,-20,-10,10,20,30,40].map(deg => <g key={deg}><line x1={deg % 20 === 0 ? -30 : -18} x2={deg % 20 === 0 ? 30 : 18} y1={-deg*2} y2={-deg*2} stroke="#243e42"/><text x="38" y={-deg*2+4} fill="#243e42" fontSize="11">{deg}°</text></g>)}
            </g> : <rect width="260" height="260" fill="#e4ebe6"/>}
          </g>
          {attitudeReady ? <><path d="M65 130 H111 L118 137 H142 L149 130 H195" fill="none" stroke="#18332d" strokeWidth="4"/><circle cx="130" cy="130" r="3" fill="#18332d"/><path d="M125 16 L135 16 L130 25 Z" fill="#18332d"/></> : <text x="130" y="135" textAnchor="middle" fill="#64796f">Sin datos</text>}
        </svg>
        <p>La referencia central permanece fija mientras el horizonte refleja el balanceo.</p>
        {attitudeReady && Math.abs(pitch) > 45 && <small>Dibujo limitado a ±45°; el valor numérico es completo.</small>}
      </article>
      <article className="orientation-instrument">
        <h3>Rumbo relativo</h3>
        <svg viewBox="0 0 260 260" role="img" aria-label={headingReady ? `Yaw ${format(yaw)}, relativo al rumbo cero` : 'Rumbo sin datos'}>
          <circle cx="130" cy="130" r="100" fill="#f5f8f4" stroke="#bdcec2"/>
          <circle cx="130" cy="130" r="75" fill="none" stroke="#dce5de" strokeDasharray="3 5"/>
          <path d="M130 40 V55 M40 130 H55 M205 130 H220 M130 205 V220" stroke="#8aa193"/>
          <g fill="#50685c" fontSize="12" textAnchor="middle"><text x="130" y="20">0°</text><text x="16" y="134">90°</text><text x="244" y="134">270°</text><text x="130" y="248">180°</text></g>
          {headingReady ? <g transform={`rotate(${-heading} 130 130)`}><path d="M130 57 L114 96 L125 90 V170 H135 V90 L146 96 Z" fill="#267f5d"/><circle cx="130" cy="130" r="7" fill="#18332d"/></g> : <text x="130" y="135" textAnchor="middle" fill="#64796f">Sin datos</text>}
        </svg>
        <p>0° es la referencia del entorno, no el norte geográfico. El giro positivo va hacia la izquierda.</p>
      </article>
    </div>
    <dl className="orientation-values">
      <div><dt>Roll · balanceo lateral</dt><dd>{format(roll)}</dd></div>
      <div><dt>Pitch · inclinación frontal</dt><dd>{format(pitch)}</dd></div>
      <div><dt>Yaw · orientación</dt><dd>{format(yaw)}</dd></div>
    </dl>
  </section>
}
