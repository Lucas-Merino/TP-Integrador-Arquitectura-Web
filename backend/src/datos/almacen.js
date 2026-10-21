// los datos viven en memoria, se pierden cada vez que se reinicia el servidor
export const especies = new Map()
export const zonas = new Map()
export const plantas = new Map()
export const cuidados = new Map()

// deja todo vacio, lo usan las pruebas para arrancar de cero
export function reiniciar() {
  especies.clear()
  zonas.clear()
  plantas.clear()
  cuidados.clear()
}
