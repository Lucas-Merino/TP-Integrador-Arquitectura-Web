import { randomUUID } from 'node:crypto'
import { especies, zonas, plantas, cuidados, etiquetas, reiniciar } from './almacen.js'

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

  const regalo = guardar(etiquetas, { nombre: 'regalo de mamá' })
  const suculentas = guardar(etiquetas, { nombre: 'suculentas' })
  const aromaticas = guardar(etiquetas, { nombre: 'aromáticas' })

  function planta(apodo, especie, zona, extra = {}) {
    return guardar(plantas, {
      apodo,
      especieId: especie.id,
      zonaId: zona.id,
      fechaCompra: extra.fechaCompra ?? haceDias(200),
      estado: extra.estado ?? 'activa',
      etiquetas: extra.etiquetas ?? []
    })
  }

  // cada fila: planta, dias desde el ultimo riego, dias desde el ultimo abono
  const plantasConCuidados = [
    [planta('Pepe', potus, living, { etiquetas: [regalo.id] }), 3, 10], // sana
    [planta('Rulo', helecho, banio), 6, 40], // critica: riego y abono atrasados
    [planta('Pinchudo', cactus, balcon, { etiquetas: [suculentas.id] }), 10, 30], // sana
    [planta('Mónica', monstera, living), 12, 15], // atencion: riego atrasado
    [planta('Violeta', lavanda, patio, { etiquetas: [aromaticas.id] }), 2, 20], // sana
    [planta('Sansa', sansevieria, banio), 5, 70], // atencion: abono atrasado
    [planta('Albi', albahaca, cocina, { etiquetas: [aromaticas.id] }), 4, 25], // critica + alerta de luz
    [planta('Lava', lavanda, living, { etiquetas: [aromaticas.id, regalo.id] }), 1, 10], // alerta de luz
    [planta('Espina', cactus, cocina, { etiquetas: [suculentas.id] }), 25, 70], // critica + alerta de luz
    [planta('Colgante', potus, cocina), 9, 35], // critica
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
