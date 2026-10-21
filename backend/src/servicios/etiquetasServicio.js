import { randomUUID } from 'node:crypto'
import { etiquetas, plantas } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'

export function listar() {
  return [...etiquetas.values()]
}

export function crear(datos) {
  const nombre = datos.nombre.trim()
  // se compara sin mayusculas para que "Suculentas" y "suculentas" cuenten como la misma
  const repetida = [...etiquetas.values()].some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())
  if (repetida) {
    throw new ErrorHttp(409, `Ya existe una etiqueta llamada ${nombre}`)
  }
  const etiqueta = { id: randomUUID(), nombre }
  etiquetas.set(etiqueta.id, etiqueta)
  return etiqueta
}

export function eliminar(id) {
  if (!etiquetas.has(id)) {
    throw new ErrorHttp(404, `No existe la etiqueta ${id}`)
  }
  // se saca de todas las plantas que la tenian, asi no quedan ids sueltos
  for (const planta of plantas.values()) {
    planta.etiquetas = planta.etiquetas.filter((e) => e !== id)
  }
  etiquetas.delete(id)
}
