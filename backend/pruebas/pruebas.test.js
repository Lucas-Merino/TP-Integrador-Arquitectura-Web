import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { cargarSeed } from '../src/datos/seed.js'

let servidor
let base

// el puerto 0 le pide al sistema uno libre, asi no choca con el servidor de desarrollo
before(async () => {
  servidor = app.listen(0)
  await new Promise((resolve) => servidor.once('listening', resolve))
  base = `http://localhost:${servidor.address().port}/api/v1`
})

after(() => {
  servidor.close()
})

// cada prueba arranca con el jardin de ejemplo, asi ninguna depende de lo que hizo otra
beforeEach(() => {
  cargarSeed()
})

// hace el pedido y devuelve el status, los headers y el body ya leido
async function pedir(metodo, ruta, body) {
  const opciones = { method: metodo, headers: {} }
  if (body !== undefined) {
    opciones.headers['Content-Type'] = 'application/json'
    opciones.body = typeof body === 'string' ? body : JSON.stringify(body)
  }
  const res = await fetch(base + ruta, opciones)
  const texto = await res.text()
  return { status: res.status, headers: res.headers, body: texto ? JSON.parse(texto) : null }
}

const ID_INEXISTENTE = '00000000-0000-0000-0000-000000000000'

async function buscarPlanta(apodo) {
  const { body } = await pedir('GET', '/plantas?limit=50')
  return body.datos.find((p) => p.apodo === apodo)
}

describe('servidor', () => {
  it('una ruta que no existe da 404 en JSON', async () => {
    const res = await pedir('GET', '/macetas')
    assert.equal(res.status, 404)
    assert.ok(res.body.error)
  })

  it('un JSON mal escrito da 400', async () => {
    const res = await pedir('POST', '/especies', '{"nombreComun": "Ficus",')
    assert.equal(res.status, 400)
  })
})

describe('especies', () => {
  const ficus = { nombreComun: 'Ficus', nombreCientifico: 'Ficus lyrata', luz: 'media', frecuenciaRiegoDias: 7, frecuenciaAbonoDias: 30 }

  it('POST crea y devuelve 201 con Location', async () => {
    const res = await pedir('POST', '/especies', ficus)
    assert.equal(res.status, 201)
    assert.equal(res.headers.get('location'), `/api/v1/especies/${res.body.id}`)

    const detalle = await pedir('GET', `/especies/${res.body.id}`)
    assert.equal(detalle.status, 200)
    assert.equal(detalle.body.nombreComun, 'Ficus')
  })

  it('POST con datos invalidos da 422', async () => {
    const res = await pedir('POST', '/especies', { ...ficus, frecuenciaRiegoDias: -2 })
    assert.equal(res.status, 422)
  })

  it('DELETE de una especie con plantas da 409', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('DELETE', `/especies/${pepe.especieId}`)
    assert.equal(res.status, 409)
  })
})

describe('plantas', () => {
  async function plantaNueva() {
    const pepe = await buscarPlanta('Pepe')
    return { apodo: 'Ramona', especieId: pepe.especieId, zonaId: pepe.zonaId, fechaCompra: '2026-03-15' }
  }

  it('GET devuelve la primera pagina con 10', async () => {
    const res = await pedir('GET', '/plantas')
    assert.equal(res.status, 200)
    assert.equal(res.body.datos.length, 10)
    assert.equal(res.body.total, 13)
    assert.equal(res.body.totalPaginas, 2)
  })

  it('filtra por estado', async () => {
    const res = await pedir('GET', '/plantas?estado=muerta')
    assert.equal(res.body.total, 1)
    assert.equal(res.body.datos[0].apodo, 'Seca')
  })

  it('el detalle trae la salud calculada', async () => {
    const rulo = await buscarPlanta('Rulo')
    const res = await pedir('GET', `/plantas/${rulo.id}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.salud.estado, 'atrasada')
    assert.equal(res.body.salud.diasAtraso, 3)
  })

  it('POST crea una planta activa', async () => {
    const res = await pedir('POST', '/plantas', await plantaNueva())
    assert.equal(res.status, 201)
    assert.equal(res.body.estado, 'activa')
    assert.equal(res.headers.get('location'), `/api/v1/plantas/${res.body.id}`)
  })

  it('PUT cambia los datos pero conserva el estado', async () => {
    const helena = await buscarPlanta('Helena')
    const res = await pedir('PUT', `/plantas/${helena.id}`, { ...(await plantaNueva()), apodo: 'Helena II' })
    assert.equal(res.status, 200)
    assert.equal(res.body.apodo, 'Helena II')
    assert.equal(res.body.estado, 'en_recuperacion')
  })

  it('PATCH cambia el estado', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('PATCH', `/plantas/${pepe.id}`, { estado: 'en_recuperacion' })
    assert.equal(res.status, 200)
    assert.equal(res.body.estado, 'en_recuperacion')
  })

  it('una planta regalada no puede volver a activa: 409', async () => {
    const tito = await buscarPlanta('Tito')
    const res = await pedir('PATCH', `/plantas/${tito.id}`, { estado: 'activa' })
    assert.equal(res.status, 409)
  })

  it('GET, PUT, PATCH y DELETE de una planta que no existe dan 404', async () => {
    assert.equal((await pedir('GET', `/plantas/${ID_INEXISTENTE}`)).status, 404)
    assert.equal((await pedir('PUT', `/plantas/${ID_INEXISTENTE}`, await plantaNueva())).status, 404)
    assert.equal((await pedir('PATCH', `/plantas/${ID_INEXISTENTE}`, { estado: 'activa' })).status, 404)
    assert.equal((await pedir('DELETE', `/plantas/${ID_INEXISTENTE}`)).status, 404)
  })
})

describe('cuidados', () => {
  it('GET lista los cuidados de la planta, el mas nuevo primero', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('GET', `/plantas/${pepe.id}/cuidados`)
    assert.equal(res.status, 200)
    assert.ok(res.body.length > 0)
    assert.ok(res.body.every((c) => c.plantaId === pepe.id))
    assert.ok(res.body[0].fecha >= res.body.at(-1).fecha)
  })

  it('regar a Rulo lo deja al dia', async () => {
    const rulo = await buscarPlanta('Rulo')
    const res = await pedir('POST', `/plantas/${rulo.id}/cuidados`, { tipo: 'riego' })
    assert.equal(res.status, 201)
    assert.equal(res.headers.get('location'), `/api/v1/plantas/${rulo.id}/cuidados/${res.body.id}`)

    const detalle = await pedir('GET', `/plantas/${rulo.id}`)
    assert.equal(detalle.body.salud.estado, 'al_dia')
  })

  it('DELETE borra el cuidado con 204', async () => {
    const pepe = await buscarPlanta('Pepe')
    const { body: creado } = await pedir('POST', `/plantas/${pepe.id}/cuidados`, { tipo: 'poda', nota: 'ramas secas' })
    const ruta = `/plantas/${pepe.id}/cuidados/${creado.id}`

    assert.equal((await pedir('DELETE', ruta)).status, 204)
    assert.equal((await pedir('DELETE', ruta)).status, 404)
  })
})

describe('reportes', () => {
  it('riegos-pendientes agrupa por zona', async () => {
    const res = await pedir('GET', '/reportes/riegos-pendientes')
    assert.equal(res.status, 200)
    assert.deepEqual(res.body.map((z) => z.zona), ['Baño', 'Cocina', 'Living'])

    const cocina = res.body.find((z) => z.zona === 'Cocina')
    assert.equal(cocina.pendientes[0].apodo, 'Espina')
  })

  it('cuidados-por-mes devuelve los meses pedidos', async () => {
    const res = await pedir('GET', '/reportes/cuidados-por-mes?meses=3')
    assert.equal(res.status, 200)
    assert.equal(res.body.length, 3)
    assert.ok('porTipo' in res.body[0])
  })
})
