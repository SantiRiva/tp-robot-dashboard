import { test } from 'node:test'
import assert from 'node:assert/strict'
import { temperatureLevel } from './temperatureLevel.js'

test('respeta los límites exactos del semáforo del TP05', () => {
  for (const [value, expected] of [[0,'normal'],[39.99,'normal'],[40,'warning'],[50,'warning'],[60,'warning'],[60.01,'critical'],[90,'critical']]) {
    assert.equal(temperatureLevel(value).key,expected,`Temperatura ${value}`)
  }
})
test('una temperatura ausente o inválida no se presenta como normal', () => {
  for (const value of [null,undefined,NaN,Infinity,'40']) assert.equal(temperatureLevel(value).key,'unknown')
})
