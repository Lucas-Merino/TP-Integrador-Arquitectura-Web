import { randomUUID } from 'node:crypto'
import { cuidados } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'
import { obtener as obtenerPlanta } from './plantasServicio.js'

// del mas nuevo al mas viejo
export function listar(plantaId, query = {}) {
  obtenerPlanta(plantaId)
  let lista = [...cuidados.values()].filter((c) => c.plantaId === plantaId)
  if (query.tipo) lista = lista.filter((c) => c.tipo === query.tipo)
  return lista.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function obtener(plantaId, cuidadoId) {
  // si la planta no existe el 404 es por la planta, no por el cuidado
  obtenerPlanta(plantaId)
  const cuidado = cuidados.get(cuidadoId)
  // un cuidado de otra planta tambien es 404: en esta url no existe
  if (!cuidado || cuidado.plantaId !== plantaId) {
    throw new ErrorHttp(404, `No existe el cuidado ${cuidadoId} para esta planta`)
  }
  return cuidado
}

export function crear(plantaId, datos) {
  const planta = obtenerPlanta(plantaId)
  if (planta.estado === 'muerta' || planta.estado === 'regalada') {
    throw new ErrorHttp(409, `No se pueden registrar cuidados en una planta ${planta.estado}`)
  }

  const cuidado = {
    id: randomUUID(),
    plantaId,
    tipo: datos.tipo,
    fecha: datos.fecha ?? new Date().toISOString().slice(0, 10),
    nota: datos.nota?.trim() || null
  }
  cuidados.set(cuidado.id, cuidado)
  return cuidado
}

export function eliminar(plantaId, cuidadoId) {
  obtener(plantaId, cuidadoId)
  cuidados.delete(cuidadoId)
}
