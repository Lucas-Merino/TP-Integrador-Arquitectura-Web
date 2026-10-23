import { pedir } from './cliente.js'

// los cuidados cuelgan de cada planta: /plantas/:id/cuidados
export const listarCuidados = (plantaId) => pedir(`/plantas/${plantaId}/cuidados`)

export const registrarCuidado = (plantaId, datos) =>
  pedir(`/plantas/${plantaId}/cuidados`, { method: 'POST', body: datos })

export const eliminarCuidado = (plantaId, cuidadoId) =>
  pedir(`/plantas/${plantaId}/cuidados/${cuidadoId}`, { method: 'DELETE' })
