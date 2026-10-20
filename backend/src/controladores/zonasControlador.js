import * as servicio from '../servicios/zonasServicio.js'

export function listar(req, res) {
  res.json(servicio.listar({ interior: req.query.interior }))
}

export function obtener(req, res) {
  res.json(servicio.obtener(req.params.id))
}

export function crear(req, res) {
  const zona = servicio.crear(req.body)
  res.status(201).location(`/api/v1/zonas/${zona.id}`).json(zona)
}

export function reemplazar(req, res) {
  res.json(servicio.reemplazar(req.params.id, req.body))
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id)
  res.status(204).end()
}

export function listarPlantas(req, res) {
  res.json(servicio.listarPlantas(req.params.id))
}
