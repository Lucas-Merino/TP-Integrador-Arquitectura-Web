import { ErrorHttp } from '../middlewares/manejarErrores.js'

// lee un numero del query string; si no viene se usa el valor por defecto
function leerEnteroPositivo(valor, nombre, porDefecto) {
  if (valor === undefined) return porDefecto
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero < 1) {
    throw new ErrorHttp(400, `El parámetro ${nombre} tiene que ser un entero mayor a 0`)
  }
  return numero
}

// corta la lista en paginas y devuelve los datos junto con lo necesario para navegar
export function paginar(lista, query = {}) {
  const pagina = leerEnteroPositivo(query.page, 'page', 1)
  const limite = leerEnteroPositivo(query.limit, 'limit', 10)
  const total = lista.length
  const totalPaginas = Math.ceil(total / limite)
  const inicio = (pagina - 1) * limite

  return {
    datos: lista.slice(inicio, inicio + limite),
    pagina,
    limite,
    total,
    totalPaginas
  }
}
