import { randomUUID } from 'node:crypto'
import { especies, zonas, plantas, cuidados, reiniciar } from './almacen.js'

// fecha de hace n dias en formato AAAA-MM-DD, asi el seed siempre queda "al dia"
function haceDias(n) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - n)
  return fecha.toISOString().slice(0, 10)
}

function guardar(mapa, datos) {
  const item = { id: randomUUID(), ...datos }
  mapa.set(item.id, item)
  return item
}

export function cargarSeed() {
  reiniciar()

  const potus = guardar(especies, { nombreComun: 'Potus', nombreCientifico: 'Epipremnum aureum', luz: 'media', frecuenciaRiegoDias: 7, frecuenciaAbonoDias: 30 })
  const helecho = guardar(especies, { nombreComun: 'Helecho', nombreCientifico: 'Nephrolepis exaltata', luz: 'baja', frecuenciaRiegoDias: 3, frecuenciaAbonoDias: 30 })
  const cactus = guardar(especies, { nombreComun: 'Cactus', nombreCientifico: null, luz: 'alta', frecuenciaRiegoDias: 20, frecuenciaAbonoDias: 60 })
  const monstera = guardar(especies, { nombreComun: 'Monstera', nombreCientifico: 'Monstera deliciosa', luz: 'media', frecuenciaRiegoDias: 7, frecuenciaAbonoDias: 30 })
  const lavanda = guardar(especies, { nombreComun: 'Lavanda', nombreCientifico: 'Lavandula angustifolia', luz: 'alta', frecuenciaRiegoDias: 5, frecuenciaAbonoDias: 45 })
  const sansevieria = guardar(especies, { nombreComun: 'Sansevieria', nombreCientifico: 'Dracaena trifasciata', luz: 'baja', frecuenciaRiegoDias: 15, frecuenciaAbonoDias: 60 })
  const albahaca = guardar(especies, { nombreComun: 'Albahaca', nombreCientifico: 'Ocimum basilicum', luz: 'alta', frecuenciaRiegoDias: 2, frecuenciaAbonoDias: 20 })

  const living = guardar(zonas, { nombre: 'Living', luz: 'media', interior: true })
  const banio = guardar(zonas, { nombre: 'Baño', luz: 'baja', interior: true })
  const balcon = guardar(zonas, { nombre: 'Balcón', luz: 'alta', interior: false })
  const cocina = guardar(zonas, { nombre: 'Cocina', luz: 'media', interior: true })
  const patio = guardar(zonas, { nombre: 'Patio', luz: 'alta', interior: false })

  function planta(apodo, especie, zona, extra = {}) {
    return guardar(plantas, {
      apodo,
      especieId: especie.id,
      zonaId: zona.id,
      fechaCompra: extra.fechaCompra ?? haceDias(200),
      estado: extra.estado ?? 'activa'
    })
  }

  // cada fila: planta, dias desde el ultimo riego, dias desde el ultimo abono
  // (el comentario dice si el riego esta al dia segun la frecuencia de la especie)
  const plantasConCuidados = [
    [planta('Pepe', potus, living), 3, 10], // al dia
    [planta('Rulo', helecho, banio), 6, 40], // atrasada
    [planta('Pinchudo', cactus, balcon), 10, 30], // al dia
    [planta('Mónica', monstera, living), 12, 15], // atrasada
    [planta('Violeta', lavanda, patio), 2, 20], // al dia
    [planta('Sansa', sansevieria, banio), 5, 70], // al dia
    [planta('Albi', albahaca, cocina), 4, 25], // atrasada
    [planta('Lava', lavanda, living), 1, 10], // al dia
    [planta('Espina', cactus, cocina), 25, 70], // atrasada
    [planta('Colgante', potus, cocina), 9, 35], // atrasada
    [planta('Helena', helecho, living, { estado: 'en_recuperacion' }), 1, 12],
    [planta('Tito', monstera, patio, { estado: 'regalada', fechaCompra: haceDias(400) }), 30, 60],
    [planta('Seca', albahaca, balcon, { estado: 'muerta', fechaCompra: haceDias(150) }), 50, 80]
  ]

  for (const [p, diasRiego, diasAbono] of plantasConCuidados) {
    // un par de riegos anteriores para que el reporte por mes tenga historia
    guardar(cuidados, { plantaId: p.id, tipo: 'riego', fecha: haceDias(diasRiego + 30), nota: null })
    guardar(cuidados, { plantaId: p.id, tipo: 'riego', fecha: haceDias(diasRiego), nota: null })
    guardar(cuidados, { plantaId: p.id, tipo: 'abono', fecha: haceDias(diasAbono), nota: null })
  }

  const [pepe] = plantasConCuidados[0]
  const [monica] = plantasConCuidados[3]
  guardar(cuidados, { plantaId: pepe.id, tipo: 'poda', fecha: haceDias(45), nota: 'le corté las hojas amarillas' })
  guardar(cuidados, { plantaId: monica.id, tipo: 'trasplante', fecha: haceDias(90), nota: 'maceta más grande' })
}
