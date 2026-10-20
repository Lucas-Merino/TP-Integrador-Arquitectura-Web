import { ErrorHttp } from './manejarErrores.js'

const NIVELES_LUZ = ['baja', 'media', 'alta']

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0
}

// revisa el body de POST y PUT antes de llegar al controlador
export function validarEspecie(req, res, next) {
  const datos = req.body

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorHttp(400, 'El cuerpo del pedido tiene que ser un objeto JSON')
  }
  if (typeof datos.nombreComun !== 'string' || datos.nombreComun.trim() === '') {
    throw new ErrorHttp(422, 'El campo nombreComun es obligatorio y tiene que ser texto')
  }
  if (datos.nombreCientifico != null && typeof datos.nombreCientifico !== 'string') {
    throw new ErrorHttp(422, 'El campo nombreCientifico tiene que ser texto')
  }
  if (!NIVELES_LUZ.includes(datos.luz)) {
    throw new ErrorHttp(422, 'El campo luz tiene que ser baja, media o alta')
  }
  if (!esEnteroPositivo(datos.frecuenciaRiegoDias)) {
    throw new ErrorHttp(422, 'El campo frecuenciaRiegoDias tiene que ser un entero mayor a 0')
  }
  if (!esEnteroPositivo(datos.frecuenciaAbonoDias)) {
    throw new ErrorHttp(422, 'El campo frecuenciaAbonoDias tiene que ser un entero mayor a 0')
  }

  next()
}
