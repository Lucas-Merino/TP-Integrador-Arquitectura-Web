import { pedir, armarQuery } from './cliente.js'

export const riegosPendientes = () => pedir('/reportes/riegos-pendientes')

export const cuidadosPorMes = (meses) => pedir(`/reportes/cuidados-por-mes${armarQuery({ meses })}`)
