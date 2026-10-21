import * as servicio from '../servicios/etiquetasServicio.js'

export function listar(req, res) {
  res.json(servicio.listar())
}

export function crear(req, res) {
  const etiqueta = servicio.crear(req.body)
  res.status(201).location(`/api/v1/etiquetas/${etiqueta.id}`).json(etiqueta)
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id)
  res.status(204).end()
}
