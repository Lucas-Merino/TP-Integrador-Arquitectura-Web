import { randomUUID } from 'node:crypto'
import { zonas, plantas } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'

export function listar(filtros = {}) {
  let lista = [...zonas.values()]
  // el query string llega como texto, por eso se compara contra 'true'
  if (filtros.interior === 'true' || filtros.interior === 'false') {
    const interior = filtros.interior === 'true'
    lista = lista.filter((z) => z.interior === interior)
  }
  return lista
}

export function obtener(id) {
  const zona = zonas.get(id)
  if (!zona) {
    throw new ErrorHttp(404, `No existe la zona ${id}`)
  }
  return zona
}

export function crear(datos) {
  const zona = { id: randomUUID(), ...armarZona(datos) }
  zonas.set(zona.id, zona)
  return zona
}

export function reemplazar(id, datos) {
  obtener(id)
  const zona = { id, ...armarZona(datos) }
  zonas.set(id, zona)
  return zona
}

export function eliminar(id) {
  obtener(id)
  // no se borra si quedarian plantas apuntando a algo que no existe
  const enUso = [...plantas.values()].some((p) => p.zonaId === id)
  if (enUso) {
    throw new ErrorHttp(409, 'No se puede borrar: hay plantas en esta zona')
  }
  zonas.delete(id)
}

// plantas que estan en la zona, primero se fija que la zona exista
export function listarPlantas(id) {
  obtener(id)
  return [...plantas.values()].filter((p) => p.zonaId === id)
}

function armarZona(datos) {
  return {
    nombre: datos.nombre.trim(),
    luz: datos.luz,
    interior: datos.interior
  }
}
