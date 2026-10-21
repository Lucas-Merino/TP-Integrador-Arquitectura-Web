import { plantas, zonas, cuidados } from '../datos/almacen.js'
import { ErrorHttp } from '../middlewares/manejarErrores.js'
import { calcularSalud } from './saludServicio.js'

const TIPOS = ['riego', 'abono', 'poda', 'trasplante']

// solo interesan las plantas que todavia se cuidan
function plantasVivas() {
  return [...plantas.values()].filter((p) => p.estado === 'activa' || p.estado === 'en_recuperacion')
}

// plantas con el riego atrasado agrupadas por zona, las zonas al dia no aparecen
export function riegosPendientes() {
  const porZona = new Map()

  for (const planta of plantasVivas()) {
    const salud = calcularSalud(planta)
    if (salud.estado === 'al_dia') continue

    if (!porZona.has(planta.zonaId)) {
      porZona.set(planta.zonaId, { zona: zonas.get(planta.zonaId).nombre, pendientes: [] })
    }
    porZona.get(planta.zonaId).pendientes.push({ plantaId: planta.id, apodo: planta.apodo, diasAtraso: salud.diasAtraso })
  }

  // lo mas atrasado primero dentro de cada zona
  const resultado = [...porZona.values()]
  resultado.forEach((z) => z.pendientes.sort((a, b) => b.diasAtraso - a.diasAtraso))
  return resultado.sort((a, b) => a.zona.localeCompare(b.zona))
}

// cantidad de cuidados de los ultimos n meses, incluido el actual
export function cuidadosPorMes(query = {}) {
  const meses = query.meses === undefined ? 6 : Number(query.meses)
  if (!Number.isInteger(meses) || meses < 1 || meses > 24) {
    throw new ErrorHttp(400, 'meses tiene que ser un número entero entre 1 y 24')
  }

  // se arma la lista de meses vacia primero, asi los meses sin cuidados aparecen en 0
  const resultado = []
  const hoy = new Date()
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    resultado.push({ mes, total: 0, porTipo: Object.fromEntries(TIPOS.map((t) => [t, 0])) })
  }

  for (const c of cuidados.values()) {
    // la fecha es AAAA-MM-DD, los primeros 7 caracteres son el mes
    const fila = resultado.find((r) => r.mes === c.fecha.slice(0, 7))
    if (fila) {
      fila.total++
      fila.porTipo[c.tipo]++
    }
  }
  return resultado
}
