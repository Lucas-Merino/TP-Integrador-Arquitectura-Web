import { pedir, armarQuery } from './cliente.js'

export const listarPlantas = (filtros) => pedir(`/plantas${armarQuery(filtros)}`)

export const obtenerPlanta = (id) => pedir(`/plantas/${id}`)

export const crearPlanta = (datos) => pedir('/plantas', { method: 'POST', body: datos })

export const editarPlanta = (id, datos) => pedir(`/plantas/${id}`, { method: 'PUT', body: datos })

export const cambiarEstado = (id, estado) =>
  pedir(`/plantas/${id}`, { method: 'PATCH', body: { estado } })

export const eliminarPlanta = (id) => pedir(`/plantas/${id}`, { method: 'DELETE' })
