import { useState } from 'react'
import { captureRow, toCsv } from './csvExport'
import './SampleCapture.css'

const LIMIT = 1000
export default function SampleCapture({ data, info, live }) {
  const [rows, setRows] = useState([])
  const [separator, setSeparator] = useState(';')
  const [confirmClear, setConfirmClear] = useState(false)
  const [notice, setNotice] = useState('')
  function capture() {
    if (!live || !data || rows.length >= LIMIT) return
    const row = captureRow(data, info)
    setRows(previous => previous.length < LIMIT ? [...previous, row] : previous)
    setNotice('Muestra guardada.')
    setConfirmClear(false)
  }
  function download() {
    if (!rows.length) return
    const url = URL.createObjectURL(new Blob([toCsv(rows, separator)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `telemetria_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Descarga CSV solicitada. Las muestras siguen guardadas en esta página.')
  }
  return <section className="panel sample-capture" aria-labelledby="capture-title">
    <div className="section-title"><h2 id="capture-title">Capturar y exportar</h2><span>{rows.length} de {LIMIT} muestras</span></div>
    <p>Guardá una muestra del estado actual con fecha y hora UTC, robot, motores, batería e inclinación.</p>
    <div className="capture-actions">
      <button type="button" onClick={capture} disabled={!live || !data || rows.length >= LIMIT}>Capturar muestra</button>
      <label htmlFor="csv-separator">Separador CSV<select id="csv-separator" value={separator} onChange={event => setSeparator(event.target.value)}><option value=";">Punto y coma (;)</option><option value=",">Coma (,)</option></select></label>
      <button type="button" onClick={download} disabled={!rows.length}>Exportar CSV</button>
      <button type="button" className="capture-secondary" onClick={() => setConfirmClear(true)} disabled={!rows.length}>Descartar muestras</button>
    </div>
    {confirmClear && <div className="capture-confirm"><p>¿Descartar las {rows.length} muestras guardadas?</p><button type="button" onClick={() => { setRows([]); setConfirmClear(false); setNotice('Se descartaron las muestras.') }}>Sí, descartar</button><button type="button" onClick={() => setConfirmClear(false)}>Cancelar</button></div>}
    <p className="capture-notice" role="status">{notice}</p>
    {!live && <p className="capture-hint">Conectá el robot y esperá el estado En vivo para capturar. Podés exportar lo guardado aunque esté desconectado.</p>}
    {rows.length >= LIMIT && <p className="capture-hint">Llegaste al límite. Exportá las muestras y descartalas para comenzar otro registro.</p>}
    <p className="chart-note">Una fila por captura. Las muestras permanecen al desconectar o cambiar de robot, pero se pierden al recargar o cerrar la página. Exportalas antes. Los números usan punto decimal.</p>
  </section>
}
