const secciones = [
  { id: 'plantas', texto: 'Plantas' },
  { id: 'reportes', texto: 'Reportes' },
]

function Encabezado({ seccion, onCambiar }) {
  return (
    <header className="encabezado">
      <h1 className="encabezado-titulo">🌱 Jardín de plantas</h1>
      <nav aria-label="Secciones">
        <ul className="menu">
          {secciones.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={seccion === s.id ? 'menu-boton activo' : 'menu-boton'}
                aria-current={seccion === s.id ? 'page' : undefined}
                onClick={() => onCambiar(s.id)}
              >
                {s.texto}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Encabezado
