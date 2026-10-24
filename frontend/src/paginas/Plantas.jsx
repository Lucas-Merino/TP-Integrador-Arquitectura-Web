import { useEffect, useState } from 'react'
import { listarPlantas } from '../api/plantas.js'
import { listarEspecies, listarZonas } from '../api/catalogos.js'
import TarjetaPlanta from '../componentes/TarjetaPlanta.jsx'
import Filtros from '../componentes/Filtros.jsx'
import Paginacion from '../componentes/Paginacion.jsx'

const POR_PAGINA = 6
const SIN_FILTROS = { zonaId: '', especieId: '', estado: '' }

function Plantas() {
  const [filtros, setFiltros] = useState(SIN_FILTROS)
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [especies, setEspecies] = useState([])
  const [zonas, setZonas] = useState([])

  // especies y zonas se piden una sola vez: sirven para los select y para mostrar nombres
  useEffect(() => {
    Promise.all([listarEspecies(), listarZonas()])
      .then(([e, z]) => {
        setEspecies(e)
        setZonas(z)
      })
      .catch((err) => setError(err.message))
  }, [])

  // cada vez que cambia un filtro o la pagina se vuelve a pedir el listado
  useEffect(() => {
    // si llega una respuesta vieja despues de una nueva, se ignora
    let vigente = true

    listarPlantas({ ...filtros, page: pagina, limit: POR_PAGINA })
      .then((res) => {
        if (!vigente) return
        setResultado(res)
        setError(null)
      })
      .catch((err) => {
        if (vigente) setError(err.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [filtros, pagina])

  // al filtrar se vuelve a la primera pagina, si no podes quedar en una que ya no existe
  // el aviso de carga se prende aca, en el evento, y no adentro del efecto
  function cambiarFiltro(campo, valor) {
    setCargando(true)
    setFiltros({ ...filtros, [campo]: valor })
    setPagina(1)
  }

  function limpiarFiltros() {
    setCargando(true)
    setFiltros(SIN_FILTROS)
    setPagina(1)
  }

  function irAPagina(numero) {
    setCargando(true)
    setPagina(numero)
  }

  const nombreEspecie = (id) => especies.find((e) => e.id === id)?.nombreComun ?? '...'
  const nombreZona = (id) => zonas.find((z) => z.id === id)?.nombre ?? '...'

  return (
    <section>
      <h2>Mis plantas</h2>

      <Filtros
        filtros={filtros}
        especies={especies}
        zonas={zonas}
        onCambiar={cambiarFiltro}
        onLimpiar={limpiarFiltros}
      />

      {error && <p className="error" role="alert">No se pudo cargar el listado: {error}</p>}

      {cargando && !resultado && <p className="aviso">Cargando plantas...</p>}

      {resultado && resultado.datos.length === 0 && (
        <p className="aviso">No hay plantas con esos filtros.</p>
      )}

      {resultado && resultado.datos.length > 0 && (
        <>
          <p className="cantidad">
            {resultado.total} {resultado.total === 1 ? 'planta' : 'plantas'}
            {cargando && ' · actualizando...'}
          </p>
          <ul className="grilla-plantas">
            {resultado.datos.map((planta) => (
              <li key={planta.id}>
                <TarjetaPlanta
                  planta={planta}
                  especie={nombreEspecie(planta.especieId)}
                  zona={nombreZona(planta.zonaId)}
                />
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={resultado.pagina}
            totalPaginas={resultado.totalPaginas}
            onCambiar={irAPagina}
          />
        </>
      )}
    </section>
  )
}

export default Plantas
