import { ErrorHttp } from './manejarErrores.js'

export const ESTADOS = ['activa', 'en_recuperacion', 'muerta', 'regalada']

function revisarObjeto(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorHttp(400, 'El cuerpo del pedido tiene que ser un objeto JSON')
  }
}

function esTexto(valor) {
  return typeof valor === 'string' && valor.trim() !== ''
}

// fecha AAAA-MM-DD que ademas sea real (no 2024-02-31)
function esFecha(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const fecha = new Date(valor)
  return !isNaN(fecha) && fecha.toISOString().slice(0, 10) === valor
}

// POST y PUT: los datos editables de la planta. Que la especie y la zona existan lo ve el servicio
export function validarPlanta(req, res, next) {
  const datos = req.body
  revisarObjeto(datos)

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

  next()
}

// PATCH: por ahora lo unico que se cambia asi es el estado
export function validarEstado(req, res, next) {
  const datos = req.body
  revisarObjeto(datos)

  if (!ESTADOS.includes(datos.estado)) {
    throw new ErrorHttp(422, `El campo estado tiene que ser uno de: ${ESTADOS.join(', ')}`)
  }

  next()
}

// PUT /plantas/:id/etiquetas recibe la lista completa de ids
export function validarListaEtiquetas(req, res, next) {
  const datos = req.body
  revisarObjeto(datos)

  if (!Array.isArray(datos.etiquetas) || !datos.etiquetas.every(esTexto)) {
    throw new ErrorHttp(422, 'El campo etiquetas tiene que ser una lista de ids')
  }

  next()
}

export function validarEtiqueta(req, res, next) {
  const datos = req.body
  revisarObjeto(datos)

  if (!esTexto(datos.nombre)) {
    throw new ErrorHttp(422, 'El campo nombre es obligatorio y tiene que ser texto')
  }

  next()
}
