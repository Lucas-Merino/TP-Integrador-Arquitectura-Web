import * as servicio from '../servicios/plantasServicio.js'

export function listar(req, res) {
  res.json(servicio.listar(req.query))
}

export function obtener(req, res) {
  res.json(servicio.obtener(req.params.id))
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

export function reemplazarEtiquetas(req, res) {
  res.json(servicio.reemplazarEtiquetas(req.params.id, req.body.etiquetas))
}

export function eliminar(req, res) {
  servicio.eliminar(req.params.id)
  res.status(204).end()
}
