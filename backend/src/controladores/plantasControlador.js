import * as servicio from '../servicios/plantasServicio.js'
import { calcularSalud } from '../servicios/saludServicio.js'

// la salud tambien va en el listado, la tarjeta de cada planta la muestra
export function listar(req, res) {
  const resultado = servicio.listar(req.query)
  const datos = resultado.datos.map((p) => ({ ...p, salud: calcularSalud(p) }))
  res.json({ ...resultado, datos })
}

// en el detalle se agrega la salud, que se calcula en el momento
export function obtener(req, res) {
  const planta = servicio.obtener(req.params.id)
  res.json({ ...planta, salud: calcularSalud(planta) })
}

export function crear(req, res) {
  const planta = servicio.crear(req.body)
  res.status(201).location(`/api/v1/plantas/${planta.id}`).json(planta)
}

export function reemplazar(req, res) {
  res.json(servicio.reemplazar(req.params.id, req.body))
}

export function cambiarEstado(req, res) {
  res.json(servicio.cambiarEstado(req.params.id, req.body.estado))
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id)
  res.status(204).end()
}
