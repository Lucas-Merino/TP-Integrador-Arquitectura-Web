import { ErrorHttp } from './manejarErrores.js'

const NIVELES_LUZ = ['baja', 'media', 'alta']

export function validarZona(req, res, next) {
  const datos = req.body

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorHttp(400, 'El cuerpo del pedido tiene que ser un objeto JSON')
  }
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    throw new ErrorHttp(422, 'El campo nombre es obligatorio y tiene que ser texto')
  }
  if (!NIVELES_LUZ.includes(datos.luz)) {
    throw new ErrorHttp(422, 'El campo luz tiene que ser baja, media o alta')
  }
  if (typeof datos.interior !== 'boolean') {
    throw new ErrorHttp(422, 'El campo interior tiene que ser true o false')
  }

  next()
}
