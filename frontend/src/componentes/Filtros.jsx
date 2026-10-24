// los select son controlados: muestran lo que dice el estado del padre y le avisan cuando cambian
function Filtros({ filtros, especies, zonas, onCambiar, onLimpiar }) {
  return (
    <form className="filtros" onSubmit={(e) => e.preventDefault()}>
      <label>
        Zona
        <select value={filtros.zonaId} onChange={(e) => onCambiar('zonaId', e.target.value)}>
          <option value="">Todas</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>{z.nombre}</option>
          ))}
        </select>
      </label>

      <label>
        Especie
        <select value={filtros.especieId} onChange={(e) => onCambiar('especieId', e.target.value)}>
          <option value="">Todas</option>
          {especies.map((e) => (
            <option key={e.id} value={e.id}>{e.nombreComun}</option>
          ))}
        </select>
      </label>

      <label>
        Estado
        <select value={filtros.estado} onChange={(e) => onCambiar('estado', e.target.value)}>
          <option value="">Todos</option>
          <option value="activa">Activa</option>
          <option value="en_recuperacion">En recuperación</option>
          <option value="muerta">Muerta</option>
          <option value="regalada">Regalada</option>
        </select>
      </label>

      <button type="button" className="boton-secundario" onClick={onLimpiar}>
        Limpiar filtros
      </button>
    </form>
  )
}

export default Filtros
