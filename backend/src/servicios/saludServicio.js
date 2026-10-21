import { cuidados, especies } from '../datos/almacen.js'

const UN_DIA = 24 * 60 * 60 * 1000

function diasDesde(fecha) {
  const hoy = new Date(new Date().toISOString().slice(0, 10))
  return Math.floor((hoy - new Date(fecha)) / UN_DIA)
}

// fecha del ultimo cuidado de ese tipo, o null si nunca se hizo
function ultimaFecha(plantaId, tipo) {
  let ultima = null
  for (const c of cuidados.values()) {
    if (c.plantaId === plantaId && c.tipo === tipo && (!ultima || c.fecha > ultima)) {
      ultima = c.fecha
    }
  }
  return ultima
}

// la salud no se guarda: depende de la fecha de hoy, asi que se calcula cada vez que se pide
export function calcularSalud(planta) {
  // a una planta muerta o regalada ya no se la cuida
  if (planta.estado === 'muerta' || planta.estado === 'regalada') return null

  const especie = especies.get(planta.especieId)
  const frecuencias = { riego: especie.frecuenciaRiegoDias, abono: especie.frecuenciaAbonoDias }
  const atrasados = []

  for (const [tipo, cadaCuantosDias] of Object.entries(frecuencias)) {
    // si nunca se hizo se cuenta desde la compra
    const desde = ultimaFecha(planta.id, tipo) ?? planta.fechaCompra
    const dias = diasDesde(desde)
    if (dias > cadaCuantosDias) {
      atrasados.push({ tipo, diasAtraso: dias - cadaCuantosDias })
    }
  }

  let estado = 'sana'
  if (atrasados.length === 1) estado = 'atencion'
  if (atrasados.length === 2) estado = 'critica'

  return { estado, atrasados }
}
