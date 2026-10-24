import { useState } from 'react'

const VACIO = { apodo: '', especieId: '', zonaId: '', fechaCompra: '' }

// hoy en formato AAAA-MM-DD, para que no se pueda cargar una compra en el futuro
const hoy = () => new Date().toISOString().slice(0, 10)

// revisa lo mismo que el backend, pero antes de mandar nada.
// No reemplaza la validacion del servidor: es solo para avisar rapido
function validar(datos) {
  const errores = {}
  if (!datos.apodo.trim()) errores.apodo = 'Poné un apodo para la planta'
  if (!datos.especieId) errores.especieId = 'Elegí una especie'
  if (!datos.zonaId) errores.zonaId = 'Elegí una zona'
  if (!datos.fechaCompra) errores.fechaCompra = 'Indicá la fecha de compra'
  else if (datos.fechaCompra > hoy()) errores.fechaCompra = 'La fecha no puede ser futura'
  return errores
}

// sirve para alta y para edicion: si llega una planta, los campos arrancan con sus datos
function FormularioPlanta({ planta, especies, zonas, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() =>
    planta
      ? {
          apodo: planta.apodo,
          especieId: planta.especieId,
          zonaId: planta.zonaId,
          fechaCompra: planta.fechaCompra,
        }
      : VACIO
  )
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  function cambiar(e) {
    const { name, value } = e.target
    setDatos({ ...datos, [name]: value })
    // si el campo tenia error, se borra apenas el usuario lo toca
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  async function enviar(e) {
    e.preventDefault()

    const encontrados = validar(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    setErrorServidor(null)
    try {
      await onGuardar({ ...datos, apodo: datos.apodo.trim() })
    } catch (err) {
      // aca llegan los 422 (o un 404 si la borraron mientras tanto) con el mensaje del backend
      setErrorServidor(err.message)
      setGuardando(false)
    }
  }

  const titulo = planta ? `Editar "${planta.apodo}"` : 'Nueva planta'

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <h3>{titulo}</h3>

      {errorServidor && (
        <p className="error-servidor" role="alert">
          {errorServidor}
        </p>
      )}

      <label htmlFor="apodo">Apodo *</label>
      <input
        id="apodo"
        name="apodo"
        type="text"
        maxLength={40}
        value={datos.apodo}
        onChange={cambiar}
        aria-invalid={Boolean(errores.apodo)}
        aria-describedby={errores.apodo ? 'error-apodo' : undefined}
      />
      {errores.apodo && <p id="error-apodo" className="error-campo">{errores.apodo}</p>}

      <label htmlFor="especieId">Especie *</label>
      <select
        id="especieId"
        name="especieId"
        value={datos.especieId}
        onChange={cambiar}
        aria-invalid={Boolean(errores.especieId)}
        aria-describedby={errores.especieId ? 'error-especie' : undefined}
      >
        <option value="">Elegir...</option>
        {especies.map((e) => (
          <option key={e.id} value={e.id}>{e.nombreComun}</option>
        ))}
      </select>
      {errores.especieId && <p id="error-especie" className="error-campo">{errores.especieId}</p>}

      <label htmlFor="zonaId">Zona *</label>
      <select
        id="zonaId"
        name="zonaId"
        value={datos.zonaId}
        onChange={cambiar}
        aria-invalid={Boolean(errores.zonaId)}
        aria-describedby={errores.zonaId ? 'error-zona' : undefined}
      >
        <option value="">Elegir...</option>
        {zonas.map((z) => (
          <option key={z.id} value={z.id}>{z.nombre}</option>
        ))}
      </select>
      {errores.zonaId && <p id="error-zona" className="error-campo">{errores.zonaId}</p>}

      <label htmlFor="fechaCompra">Fecha de compra *</label>
      <input
        id="fechaCompra"
        name="fechaCompra"
        type="date"
        max={hoy()}
        value={datos.fechaCompra}
        onChange={cambiar}
        aria-invalid={Boolean(errores.fechaCompra)}
        aria-describedby={errores.fechaCompra ? 'error-fecha' : undefined}
      />
      {errores.fechaCompra && <p id="error-fecha" className="error-campo">{errores.fechaCompra}</p>}

      <div className="formulario-botones">
        <button type="submit" className="boton-principal" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="boton-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioPlanta
