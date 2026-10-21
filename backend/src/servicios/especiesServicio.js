import { randomUUID } from 'node:crypto'
import { especies, plantas } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'

export function listar(filtros = {}) {
  let lista = [...especies.values()]
  if (filtros.luz) {
    lista = lista.filter((e) => e.luz === filtros.luz)
  }
  return lista
}

export function obtener(id) {
  const especie = especies.get(id)
  if (!especie) {
    throw new ErrorHttp(404, `No existe la especie ${id}`)
  }
  return especie
}

export function crear(datos) {
  const especie = { id: randomUUID(), ...armarEspecie(datos) }
  especies.set(especie.id, especie)
  return especie
}

// PUT reemplaza la especie entera, solo se conserva el id
export function reemplazar(id, datos) {
  obtener(id)
  const especie = { id, ...armarEspecie(datos) }
  especies.set(id, especie)
  return especie
}

export function eliminar(id) {
  obtener(id)
  // no se borra si quedarian plantas apuntando a algo que no existe
  const enUso = [...plantas.values()].some((p) => p.especieId === id)
  if (enUso) {
    throw new ErrorHttp(409, 'No se puede borrar: hay plantas de esta especie')
  }
  especies.delete(id)
}

// se copian solo los campos conocidos, asi no se guarda basura que venga en el body
function armarEspecie(datos) {
  return {
    nombreComun: datos.nombreComun.trim(),
    nombreCientifico: datos.nombreCientifico?.trim() || null,
    luz: datos.luz,
    frecuenciaRiegoDias: datos.frecuenciaRiegoDias,
    frecuenciaAbonoDias: datos.frecuenciaAbonoDias
  }
}
