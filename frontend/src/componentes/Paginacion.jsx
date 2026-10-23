function Paginacion({ pagina, totalPaginas, onCambiar }) {
  // con una sola pagina no hace falta mostrar nada
  if (totalPaginas <= 1) return null

  return (
    <nav className="paginacion" aria-label="Paginación">
      <button type="button" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button type="button" disabled={pagina === totalPaginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente →
      </button>
    </nav>
  )
}

export default Paginacion
