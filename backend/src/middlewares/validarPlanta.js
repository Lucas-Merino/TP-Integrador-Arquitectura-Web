import { ErrorHttp } from './manejarErrores.js'

export const ESTADOS = ['activa', 'en_recuperacion', 'muerta', 'regalada']

function esTexto(valor) {
  return typeof valor === 'string' && valor.trim() !== ''
}

// fecha con formato AAAA-MM-DD
function esFecha(valor) {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
}

// POST y PUT: los datos editables de la planta. Que la especie y la zona existan lo ve el servicio
export function validarPlanta(req, res, next) {
  const datos = req.body ?? {}

  if (!esTexto(datos.apodo)) {
    throw new ErrorHttp(422, 'El campo apodo es obligatorio y tiene que ser texto')
  }
  if (!esTexto(datos.especieId)) {
    throw new ErrorHttp(422, 'El campo especieId es obligatorio')
  }
  if (!esTexto(datos.zonaId)) {
    throw new ErrorHttp(422, 'El campo zonaId es obligatorio')
  }
  if (!esFecha(datos.fechaCompra)) {
    throw new ErrorHttp(422, 'El campo fechaCompra tiene que ser una fecha AAAA-MM-DD')
  }
  // comparar textos AAAA-MM-DD sirve porque ordenan igual que las fechas
  if (datos.fechaCompra > new Date().toLocaleDateString('en-CA')) {
    throw new ErrorHttp(422, 'La fecha de compra no puede ser futura')
  }

  next()
}

// PATCH: por ahora lo unico que se cambia asi es el estado
export function validarEstado(req, res, next) {
  const datos = req.body ?? {}

  if (!ESTADOS.includes(datos.estado)) {
    throw new ErrorHttp(422, `El campo estado tiene que ser uno de: ${ESTADOS.join(', ')}`)
  }

  next()
}
