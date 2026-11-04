// lee un numero del query string; si no viene o no es valido se usa el valor por defecto
function leerNumero(valor, porDefecto) {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero > 0 ? numero : porDefecto
}

// corta la lista en paginas y devuelve los datos junto con lo necesario para navegar
export function paginar(lista, query = {}) {
  const pagina = leerNumero(query.page, 1)
  const limite = leerNumero(query.limit, 10)
  const inicio = (pagina - 1) * limite

  return {
    datos: lista.slice(inicio, inicio + limite),
    pagina,
    limite,
    total: lista.length,
    totalPaginas: Math.ceil(lista.length / limite)
  }
}
