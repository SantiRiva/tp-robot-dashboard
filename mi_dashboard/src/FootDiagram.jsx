import './FootDiagram.css'

const feet = [
  { id: 'FL', name: 'Delantera izquierda', position: 'front-left' },
  { id: 'FR', name: 'Delantera derecha', position: 'front-right' },
  { id: 'RL', name: 'Trasera izquierda', position: 'rear-left' },
  { id: 'RR', name: 'Trasera derecha', position: 'rear-right' },
]

export default function FootDiagram({ model, forces, live }) {
  if (model !== 'go2') return null
  const state = id => {
    if (!live || (forces?.[id] !== 0 && forces?.[id] !== 1)) return 'unknown'
    return forces[id] === 1 ? 'ground' : 'air'
  }
  const supported = feet.filter(foot => state(foot.id) === 'ground').length
  const known = feet.filter(foot => state(foot.id) !== 'unknown').length
  return <section className="panel foot-panel" aria-labelledby="feet-title">
    <div className="section-title"><h2 id="feet-title">Apoyo de patas</h2><span>{known === 4 ? `${supported} de 4 apoyadas` : known ? `${supported} apoyadas · ${4 - known} sin dato` : 'Esperando datos'}</span></div>
    <p className="foot-description">Go2 visto desde arriba · izquierda y derecha desde la perspectiva del robot.</p>
    <div className="foot-diagram" role="group" aria-label="Estado de las cuatro patas del Go2, con la cabeza hacia arriba">
      <div className="robot-heading" aria-hidden="true">↑ FRENTE</div>
      <div className="robot-body" aria-hidden="true"><div className="robot-eyes"><i/><i/></div><span>GO2</span><small>UNITREE</small></div>
      {feet.map(foot => {
        const status = state(foot.id)
        const label = status === 'ground' ? 'Apoyada' : status === 'air' ? 'En el aire' : 'Sin dato'
        return <div key={foot.id} className={`foot-indicator ${foot.position} foot-${status}`}>
          <div className="foot-code"><span className="foot-dot" aria-hidden="true"/>{foot.id}</div>
          <span className="foot-name">{foot.name}</span><strong>{label}</strong>
        </div>
      })}
    </div>
    <div className="foot-legend"><span><i className="legend-ground"/>Apoyada</span><span><i className="legend-air"/>En el aire</span><span><i className="legend-unknown"/>Sin dato</span></div>
    <p className="chart-note">El apoyo cambia con cada paso. El diagrama representa contacto con el suelo, no la fuerza en newtons.</p>
  </section>
}
