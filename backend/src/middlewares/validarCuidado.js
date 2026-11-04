import { ErrorHttp } from './manejarErrores.js'

export const TIPOS_CUIDADO = ['riego', 'abono', 'poda', 'trasplante']

// la nota es opcional; la fecha no se manda, el cuidado queda con la de hoy
export function validarCuidado(req, res, next) {
  const datos = req.body ?? {}

  if (!TIPOS_CUIDADO.includes(datos.tipo)) {
    throw new ErrorHttp(422, `El campo tipo tiene que ser uno de: ${TIPOS_CUIDADO.join(', ')}`)
  }
  if (datos.nota !== undefined && datos.nota !== null && typeof datos.nota !== 'string') {
    throw new ErrorHttp(422, 'El campo nota tiene que ser texto')
  }

  next()
}
