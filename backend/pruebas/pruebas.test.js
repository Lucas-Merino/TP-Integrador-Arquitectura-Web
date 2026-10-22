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
  it('GET /salud responde ok', async () => {
    const res = await pedir('GET', '/salud')
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { ok: true })
  })

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

  it('GET lista las 7 del seed', async () => {
    const res = await pedir('GET', '/especies')
    assert.equal(res.status, 200)
    assert.equal(res.body.length, 7)
  })

  it('GET filtra por luz', async () => {
    const res = await pedir('GET', '/especies?luz=alta')
    assert.ok(res.body.length > 0)
    assert.ok(res.body.every((e) => e.luz === 'alta'))
  })

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

  it('POST con un array en vez de objeto da 400', async () => {
    const res = await pedir('POST', '/especies', [ficus])
    assert.equal(res.status, 400)
  })

  it('PUT reemplaza la especie', async () => {
    const { body: creada } = await pedir('POST', '/especies', ficus)
    const res = await pedir('PUT', `/especies/${creada.id}`, { ...ficus, nombreCientifico: null, luz: 'alta' })
    assert.equal(res.status, 200)
    assert.equal(res.body.luz, 'alta')
    assert.equal(res.body.nombreCientifico, null)
  })

  it('GET, PUT y DELETE de una especie que no existe dan 404', async () => {
    assert.equal((await pedir('GET', `/especies/${ID_INEXISTENTE}`)).status, 404)
    assert.equal((await pedir('PUT', `/especies/${ID_INEXISTENTE}`, ficus)).status, 404)
    assert.equal((await pedir('DELETE', `/especies/${ID_INEXISTENTE}`)).status, 404)
  })

  it('DELETE de una especie sin plantas da 204', async () => {
    const { body: creada } = await pedir('POST', '/especies', ficus)
    const res = await pedir('DELETE', `/especies/${creada.id}`)
    assert.equal(res.status, 204)
    assert.equal((await pedir('GET', `/especies/${creada.id}`)).status, 404)
  })

  it('DELETE de una especie con plantas da 409', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('DELETE', `/especies/${pepe.especieId}`)
    assert.equal(res.status, 409)
  })
})

describe('zonas', () => {
  const terraza = { nombre: 'Terraza', luz: 'alta', interior: false }

  it('GET lista las zonas y filtra por interior', async () => {
    const todas = await pedir('GET', '/zonas')
    assert.equal(todas.status, 200)
    assert.equal(todas.body.length, 5)

    const afuera = await pedir('GET', '/zonas?interior=false')
    assert.deepEqual(afuera.body.map((z) => z.nombre).sort(), ['Balcón', 'Patio'])
  })

  it('POST crea con 201 y PUT la reemplaza', async () => {
    const creada = await pedir('POST', '/zonas', terraza)
    assert.equal(creada.status, 201)
    assert.ok(creada.headers.get('location').endsWith(creada.body.id))

    const res = await pedir('PUT', `/zonas/${creada.body.id}`, { ...terraza, luz: 'media' })
    assert.equal(res.status, 200)
    assert.equal(res.body.luz, 'media')
  })

  it('interior tiene que ser booleano, si no 422', async () => {
    const res = await pedir('POST', '/zonas', { ...terraza, interior: 'no' })
    assert.equal(res.status, 422)
  })

  it('una zona que no existe da 404', async () => {
    assert.equal((await pedir('GET', `/zonas/${ID_INEXISTENTE}`)).status, 404)
    assert.equal((await pedir('DELETE', `/zonas/${ID_INEXISTENTE}`)).status, 404)
  })

  it('DELETE vacia da 204 y con plantas da 409', async () => {
    const { body: creada } = await pedir('POST', '/zonas', terraza)
    assert.equal((await pedir('DELETE', `/zonas/${creada.id}`)).status, 204)

    const pepe = await buscarPlanta('Pepe')
    assert.equal((await pedir('DELETE', `/zonas/${pepe.zonaId}`)).status, 409)
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

  it('la pagina 2 trae las que faltan', async () => {
    const res = await pedir('GET', '/plantas?page=2')
    assert.equal(res.body.datos.length, 3)
  })

  it('filtra por estado', async () => {
    const res = await pedir('GET', '/plantas?estado=muerta')
    assert.equal(res.body.total, 1)
    assert.equal(res.body.datos[0].apodo, 'Seca')
  })

  it('page o limit invalidos dan 400', async () => {
    assert.equal((await pedir('GET', '/plantas?page=0')).status, 400)
    assert.equal((await pedir('GET', '/plantas?limit=diez')).status, 400)
  })

  it('el detalle trae la salud calculada', async () => {
    const rulo = await buscarPlanta('Rulo')
    const res = await pedir('GET', `/plantas/${rulo.id}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.salud.estado, 'atrasada')
    assert.equal(res.body.salud.diasAtraso, 3)
  })

  it('una muerta no tiene salud', async () => {
    const seca = await buscarPlanta('Seca')
    const res = await pedir('GET', `/plantas/${seca.id}`)
    assert.equal(res.body.salud, null)
  })

  it('POST crea una planta activa', async () => {
    const res = await pedir('POST', '/plantas', await plantaNueva())
    assert.equal(res.status, 201)
    assert.equal(res.body.estado, 'activa')
    assert.equal(res.headers.get('location'), `/api/v1/plantas/${res.body.id}`)
  })

  it('POST sin apodo o con fecha imposible da 422', async () => {
    const datos = await plantaNueva()
    assert.equal((await pedir('POST', '/plantas', { ...datos, apodo: '' })).status, 422)
    assert.equal((await pedir('POST', '/plantas', { ...datos, fechaCompra: '2026-02-31' })).status, 422)
  })

  it('POST con una especie que no existe da 422', async () => {
    const res = await pedir('POST', '/plantas', { ...(await plantaNueva()), especieId: ID_INEXISTENTE })
    assert.equal(res.status, 422)
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

  it('PATCH con un estado que no existe da 422', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('PATCH', `/plantas/${pepe.id}`, { estado: 'feliz' })
    assert.equal(res.status, 422)
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

  it('DELETE da 204 y se lleva sus cuidados', async () => {
    const pepe = await buscarPlanta('Pepe')
    assert.equal((await pedir('DELETE', `/plantas/${pepe.id}`)).status, 204)
    assert.equal((await pedir('GET', `/plantas/${pepe.id}`)).status, 404)
    assert.equal((await pedir('GET', `/plantas/${pepe.id}/cuidados`)).status, 404)
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

  it('filtra por tipo', async () => {
    const pepe = await buscarPlanta('Pepe')
    const res = await pedir('GET', `/plantas/${pepe.id}/cuidados?tipo=abono`)
    assert.ok(res.body.every((c) => c.tipo === 'abono'))
  })

  it('regar a Rulo lo deja al dia', async () => {
    const rulo = await buscarPlanta('Rulo')
    const res = await pedir('POST', `/plantas/${rulo.id}/cuidados`, { tipo: 'riego' })
    assert.equal(res.status, 201)
    assert.equal(res.headers.get('location'), `/api/v1/plantas/${rulo.id}/cuidados/${res.body.id}`)

    const detalle = await pedir('GET', `/plantas/${rulo.id}`)
    assert.equal(detalle.body.salud.estado, 'al_dia')
  })

  it('tipo invalido o fecha futura dan 422', async () => {
    const pepe = await buscarPlanta('Pepe')
    assert.equal((await pedir('POST', `/plantas/${pepe.id}/cuidados`, { tipo: 'charla' })).status, 422)
    assert.equal((await pedir('POST', `/plantas/${pepe.id}/cuidados`, { tipo: 'poda', fecha: '2099-01-01' })).status, 422)
  })

  it('no se cuida una planta muerta: 409', async () => {
    const seca = await buscarPlanta('Seca')
    const res = await pedir('POST', `/plantas/${seca.id}/cuidados`, { tipo: 'riego' })
    assert.equal(res.status, 409)
  })

  it('un cuidado de otra planta da 404 en esta url', async () => {
    const pepe = await buscarPlanta('Pepe')
    const rulo = await buscarPlanta('Rulo')
    const { body: cuidadosRulo } = await pedir('GET', `/plantas/${rulo.id}/cuidados`)
    const res = await pedir('GET', `/plantas/${pepe.id}/cuidados/${cuidadosRulo[0].id}`)
    assert.equal(res.status, 404)
  })

  it('planta o cuidado inexistente dan 404', async () => {
    const pepe = await buscarPlanta('Pepe')
    assert.equal((await pedir('GET', `/plantas/${ID_INEXISTENTE}/cuidados`)).status, 404)
    assert.equal((await pedir('POST', `/plantas/${ID_INEXISTENTE}/cuidados`, { tipo: 'riego' })).status, 404)
    assert.equal((await pedir('DELETE', `/plantas/${pepe.id}/cuidados/${ID_INEXISTENTE}`)).status, 404)
  })

  it('GET de uno y DELETE con 204', async () => {
    const pepe = await buscarPlanta('Pepe')
    const { body: creado } = await pedir('POST', `/plantas/${pepe.id}/cuidados`, { tipo: 'poda', nota: 'ramas secas' })
    const ruta = `/plantas/${pepe.id}/cuidados/${creado.id}`

    const detalle = await pedir('GET', ruta)
    assert.equal(detalle.status, 200)
    assert.equal(detalle.body.nota, 'ramas secas')

    assert.equal((await pedir('DELETE', ruta)).status, 204)
    assert.equal((await pedir('GET', ruta)).status, 404)
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

  it('por defecto son 6 meses', async () => {
    const res = await pedir('GET', '/reportes/cuidados-por-mes')
    assert.equal(res.body.length, 6)
  })

  it('meses fuera de rango da 400', async () => {
    assert.equal((await pedir('GET', '/reportes/cuidados-por-mes?meses=0')).status, 400)
    assert.equal((await pedir('GET', '/reportes/cuidados-por-mes?meses=cien')).status, 400)
  })

  it('los reportes son solo lectura', async () => {
    const res = await pedir('POST', '/reportes/riegos-pendientes')
    assert.equal(res.status, 404)
  })
})
