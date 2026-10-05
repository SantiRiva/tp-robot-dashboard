import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captureRow, csvCell, toCsv } from './csvExport.js'

test('captura independiente con fecha, unidades y todos los motores', () => {
  const data={modelo:'g1',ts:3,imu:{roll:-5},bms:{soc:87,celdas:[3.8]},fuerzas:{},motores:Array.from({length:29},(_,id)=>({id,nombre:`M${id}`,angulo:id,temperatura:30,velocidad:1,torque:2}))}
  const row=captureRow(data,{modo:'simulador'},new Date('2026-10-05T12:00:00Z'))
  data.motores[0].angulo=999
  assert.equal(row.g1_motor_0_angulo_deg,0)
  assert.equal(row.g1_motor_28_torque_nm,2)
  assert.equal(row.fecha_hora_utc,'2026-10-05T12:00:00.000Z')
  assert.equal(row.celda_1_v,3.8)
})
test('combina modelos sin mezclar columnas, y agrega BOM para acentos', () => {
  const csv=toCsv([{modelo:'go2',go2_contacto_FR:1},{modelo:'g1',g1_motor_28_angulo_deg:12}])
  assert.equal(csv,'\ufeffmodelo;go2_contacto_FR;g1_motor_28_angulo_deg\r\ngo2;1;\r\ng1;;12')
})
test('escapa separadores, comillas, saltos y textos fórmula sin alterar negativos', () => {
  assert.equal(csvCell('a;"b"\nc',';'),'"a;""b""\nc"')
  assert.equal(csvCell('a,b',','),'"a,b"')
  assert.equal(csvCell('=1+1',';'),"'=1+1")
  assert.equal(csvCell(-4.2,';'),'-4.2')
  assert.equal(csvCell(null,';'),'')
  assert.equal(csvCell(NaN,';'),'')
  assert.equal(toCsv([]),'')
  assert.throws(()=>toCsv([{}],'|'))
})
