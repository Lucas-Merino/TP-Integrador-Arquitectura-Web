import * as servicio from '../servicios/reportesServicio.js'

export function riegosPendientes(req, res) {
  res.json(servicio.riegosPendientes())
}

export function cuidadosPorMes(req, res) {
  res.json(servicio.cuidadosPorMes(req.query))
}
