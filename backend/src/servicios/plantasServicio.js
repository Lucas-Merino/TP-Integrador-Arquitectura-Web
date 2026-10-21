import { randomUUID } from 'node:crypto'
import { plantas, especies, zonas, etiquetas, cuidados } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'
import { paginar } from '../utils/paginar.js'

// a que estados se puede pasar desde cada uno; muerta y regalada son finales
const TRANSICIONES = {
  activa: ['en_recuperacion', 'muerta', 'regalada'],
  en_recuperacion: ['activa', 'muerta'],
  muerta: [],
  regalada: []
}

export function listar(query = {}) {
  let lista = [...plantas.values()]

  if (query.zonaId) lista = lista.filter((p) => p.zonaId === query.zonaId)
  if (query.especieId) lista = lista.filter((p) => p.especieId === query.especieId)
  if (query.estado) lista = lista.filter((p) => p.estado === query.estado)
  // la etiqueta se filtra por id, igual que zona y especie
  if (query.etiqueta) lista = lista.filter((p) => p.etiquetas.includes(query.etiqueta))

  return paginar(lista, query)
}

export function obtener(id) {
  const planta = plantas.get(id)
  if (!planta) {
    throw new ErrorHttp(404, `No existe la planta ${id}`)
  }
  return planta
}

// una planta nueva siempre arranca activa y sin etiquetas
export function crear(datos) {
  const planta = { id: randomUUID(), ...armarPlanta(datos), estado: 'activa', etiquetas: [] }
  plantas.set(planta.id, planta)
  return planta
}

// PUT reemplaza los datos editables; el estado y las etiquetas tienen su propio endpoint
export function reemplazar(id, datos) {
  const actual = obtener(id)
  const planta = { id, ...armarPlanta(datos), estado: actual.estado, etiquetas: actual.etiquetas }
  plantas.set(id, planta)
  return planta
}

export function cambiarEstado(id, nuevoEstado) {
  // primero el 404: si la planta no existe no tiene sentido mirar la transicion
  const planta = obtener(id)

  if (planta.estado === nuevoEstado) return planta

  if (!TRANSICIONES[planta.estado].includes(nuevoEstado)) {
    if (TRANSICIONES[planta.estado].length === 0) {
      throw new ErrorHttp(409, `Una planta ${planta.estado} no puede cambiar de estado`)
    }
    throw new ErrorHttp(409, `No se puede pasar de ${planta.estado} a ${nuevoEstado}`)
  }

  planta.estado = nuevoEstado
  return planta
}

// reemplaza la lista entera: mandar la misma lista dos veces deja todo igual
export function reemplazarEtiquetas(id, ids) {
  const planta = obtener(id)
  for (const idEtiqueta of ids) {
    if (!etiquetas.has(idEtiqueta)) {
      throw new ErrorHttp(422, `No existe la etiqueta ${idEtiqueta}`)
    }
  }
  // el Set saca repetidos por si mandan el mismo id dos veces
  planta.etiquetas = [...new Set(ids)]
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
