import { cuidados, especies } from '../datos/almacen.js'

const UN_DIA = 24 * 60 * 60 * 1000

function diasDesde(fecha) {
  const hoy = new Date(new Date().toISOString().slice(0, 10))
  return Math.floor((hoy - new Date(fecha)) / UN_DIA)
}

// fecha del ultimo riego, o null si nunca se rego
function ultimoRiego(plantaId) {
  let ultima = null
  for (const c of cuidados.values()) {
    if (c.plantaId === plantaId && c.tipo === 'riego' && (!ultima || c.fecha > ultima)) {
      ultima = c.fecha
    }
  }
  return ultima
}

// la salud no se guarda: depende de la fecha de hoy, asi que se calcula cada vez que se pide.
// solo mira el riego, comparando los dias sin regar contra la frecuencia de la especie
export function calcularSalud(planta) {
  // a una planta muerta o regalada ya no se la cuida
  if (planta.estado === 'muerta' || planta.estado === 'regalada') return null

  const especie = especies.get(planta.especieId)
  // si nunca se rego se cuenta desde la compra
  const diasSinRiego = diasDesde(ultimoRiego(planta.id) ?? planta.fechaCompra)
  const diasAtraso = Math.max(0, diasSinRiego - especie.frecuenciaRiegoDias)

  return { estado: diasAtraso > 0 ? 'atrasada' : 'al_dia', diasSinRiego, diasAtraso }
}
