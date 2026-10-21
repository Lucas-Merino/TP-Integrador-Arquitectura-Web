import { randomUUID } from 'node:crypto'
import { plantas, especies, zonas, cuidados } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'
import { paginar } from '../utils/paginar.js'

// una planta muerta o regalada ya no vuelve a cambiar
const ESTADOS_FINALES = ['muerta', 'regalada']

export function listar(query = {}) {
  let lista = [...plantas.values()]

  if (query.zonaId) lista = lista.filter((p) => p.zonaId === query.zonaId)
  if (query.especieId) lista = lista.filter((p) => p.especieId === query.especieId)
  if (query.estado) lista = lista.filter((p) => p.estado === query.estado)

  return paginar(lista, query)
}

export function obtener(id) {
  const planta = plantas.get(id)
  if (!planta) {
    throw new ErrorHttp(404, `No existe la planta ${id}`)
  }
  return planta
}

// una planta nueva siempre arranca activa
export function crear(datos) {
  const planta = { id: randomUUID(), ...armarPlanta(datos), estado: 'activa' }
  plantas.set(planta.id, planta)
  return planta
}

// PUT reemplaza los datos editables; el estado se cambia con PATCH
export function reemplazar(id, datos) {
  const actual = obtener(id)
  const planta = { id, ...armarPlanta(datos), estado: actual.estado }
  plantas.set(id, planta)
  return planta
}

export function cambiarEstado(id, nuevoEstado) {
  // primero el 404: si la planta no existe no tiene sentido mirar el estado
  const planta = obtener(id)

  if (planta.estado === nuevoEstado) return planta

  if (ESTADOS_FINALES.includes(planta.estado)) {
    throw new ErrorHttp(409, `Una planta ${planta.estado} no puede cambiar de estado`)
  }

  planta.estado = nuevoEstado
  return planta
}

export function eliminar(id) {
  obtener(id)
  // los cuidados son de la planta, sin ella no tienen sentido
  for (const cuidado of cuidados.values()) {
    if (cuidado.plantaId === id) cuidados.delete(cuidado.id)
  }
  plantas.delete(id)
}

function armarPlanta(datos) {
  if (!especies.has(datos.especieId)) {
    throw new ErrorHttp(422, `No existe la especie ${datos.especieId}`)
  }
  if (!zonas.has(datos.zonaId)) {
    throw new ErrorHttp(422, `No existe la zona ${datos.zonaId}`)
  }
  return {
    apodo: datos.apodo.trim(),
    especieId: datos.especieId,
    zonaId: datos.zonaId,
    fechaCompra: datos.fechaCompra
  }
}
