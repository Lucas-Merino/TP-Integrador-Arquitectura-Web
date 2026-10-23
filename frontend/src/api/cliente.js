const BASE = '/api/v1'

// hace el fetch y devuelve el JSON. Si la API responde con error,
// tira un Error con el mensaje que mando el backend ({ error: '...' })
export async function pedir(ruta, opciones = {}) {
  const config = { ...opciones }

  if (opciones.body !== undefined) {
    config.headers = { 'Content-Type': 'application/json', ...opciones.headers }
    config.body = JSON.stringify(opciones.body)
  }

  const respuesta = await fetch(BASE + ruta, config)

  // 204 No Content no trae cuerpo
  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const error = new Error(datos?.error || `Error ${respuesta.status}`)
    error.status = respuesta.status
    throw error
  }

  return datos
}

// arma "?zonaId=...&page=2" salteando lo que viene vacio
export function armarQuery(filtros = {}) {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.append(clave, valor)
    }
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}
