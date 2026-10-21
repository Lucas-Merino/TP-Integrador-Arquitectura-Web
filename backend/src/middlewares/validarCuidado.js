import { ErrorHttp } from './manejarErrores.js'
import { esFecha } from './validarPlanta.js'

export const TIPOS_CUIDADO = ['riego', 'abono', 'poda', 'trasplante']

// la fecha y la nota son opcionales: si no viene fecha se toma la de hoy
export function validarCuidado(req, res, next) {
  const datos = req.body
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorHttp(400, 'El cuerpo del pedido tiene que ser un objeto JSON')
  }

  if (!TIPOS_CUIDADO.includes(datos.tipo)) {
    throw new ErrorHttp(422, `El campo tipo tiene que ser uno de: ${TIPOS_CUIDADO.join(', ')}`)
  }
  if (datos.fecha !== undefined) {
    if (!esFecha(datos.fecha)) {
      throw new ErrorHttp(422, 'El campo fecha tiene que ser una fecha AAAA-MM-DD')
    }
    // comparar textos AAAA-MM-DD funciona porque el orden alfabetico es el mismo que el de las fechas
    if (datos.fecha > new Date().toISOString().slice(0, 10)) {
      throw new ErrorHttp(422, 'No se puede registrar un cuidado con fecha futura')
    }
  }
  if (datos.nota !== undefined && datos.nota !== null && typeof datos.nota !== 'string') {
    throw new ErrorHttp(422, 'El campo nota tiene que ser texto')
  }

  next()
}
