import * as servicio from '../servicios/especiesServicio.js'

export function listar(req, res) {
  res.json(servicio.listar({ luz: req.query.luz }))
}

export function obtener(req, res) {
  res.json(servicio.obtener(req.params.id))
}

export function crear(req, res) {
  const especie = servicio.crear(req.body)
  // 201 + Location: le dice al cliente donde quedo el recurso nuevo
  res.status(201).location(`/api/v1/especies/${especie.id}`).json(especie)
}

export function reemplazar(req, res) {
  res.json(servicio.reemplazar(req.params.id, req.body))
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id)
  res.status(204).end()
}
