import * as servicio from '../servicios/cuidadosServicio.js'

export function listar(req, res) {
  res.json(servicio.listar(req.params.id, req.query))
}

export function obtener(req, res) {
  res.json(servicio.obtener(req.params.id, req.params.cuidadoId))
}

export function crear(req, res) {
  const cuidado = servicio.crear(req.params.id, req.body)
  res.status(201).location(`/api/v1/plantas/${req.params.id}/cuidados/${cuidado.id}`).json(cuidado)
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id, req.params.cuidadoId)
  res.status(204).end()
}
