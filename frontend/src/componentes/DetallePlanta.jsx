import { useEffect, useState } from 'react'
import { obtenerPlanta, cambiarEstado } from '../api/plantas.js'
import { listarCuidados, registrarCuidado, eliminarCuidado } from '../api/cuidados.js'

const TIPOS = [
  { tipo: 'riego', texto: '💧 Regar' },
  { tipo: 'abono', texto: '🌱 Abonar' },
  { tipo: 'poda', texto: '✂️ Podar' },
  { tipo: 'trasplante', texto: '🪴 Trasplantar' },
]

const textoTipo = { riego: 'Riego', abono: 'Abono', poda: 'Poda', trasplante: 'Trasplante' }

const textoEstado = {
  activa: 'Activa',
  en_recuperacion: 'En recuperación',
  muerta: 'Muerta',
  regalada: 'Regalada',
}

// misma regla que el backend: de muerta o regalada no se sale
const FINALES = ['muerta', 'regalada']

// "2026-10-03" -> "03/10/2026", sin pasar por Date para no tener problemas de zona horaria
const formatearFecha = (fecha) => fecha.split('-').reverse().join('/')

function DetallePlanta({ id, especie, zona, onVolver }) {
  const [planta, setPlanta] = useState(null)
  const [cuidados, setCuidados] = useState([])
  const [nota, setNota] = useState('')
  const [error, setError] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [version, setVersion] = useState(0)

  // la planta y sus cuidados se piden juntos; despues de cada cambio se vuelven a pedir
  // porque la salud la calcula el servidor
  useEffect(() => {
    let vigente = true
    Promise.all([obtenerPlanta(id), listarCuidados(id)])
      .then(([p, c]) => {
        if (!vigente) return
        setPlanta(p)
        setCuidados(c)
      })
      .catch((err) => {
        if (vigente) setError(err.message)
      })
    return () => {
      vigente = false
    }
  }, [id, version])

  // envuelve cada accion: bloquea los botones, muestra el error y recarga al final
  async function hacer(accion) {
    setOcupado(true)
    setError(null)
    try {
      await accion()
    } catch (err) {
      // un 409 llega si la planta cambio de estado en otra pestaña, por ejemplo
      setError(err.status === 409 ? `No se pudo: ${err.message}` : err.message)
    } finally {
      setOcupado(false)
      setVersion((v) => v + 1)
    }
  }

  function registrar(tipo) {
    hacer(async () => {
      await registrarCuidado(id, { tipo, nota: nota.trim() || undefined })
      setNota('')
    })
  }

  if (!planta) {
    return (
      <section>
        <button type="button" className="boton-secundario" onClick={onVolver}>
          ← Volver
        </button>
        {error ? <p className="error" role="alert">{error}</p> : <p className="aviso">Cargando...</p>}
      </section>
    )
  }

  // estado derivado: no se guarda en el estado de React, sale de la planta
  const terminada = FINALES.includes(planta.estado)
  const otrosEstados = Object.keys(textoEstado).filter((e) => e !== planta.estado)

  return (
    <section className="detalle">
      <button type="button" className="boton-secundario" onClick={onVolver}>
        ← Volver al listado
      </button>

      <header className="detalle-cabecera">
        <h2>{planta.apodo}</h2>
        <span className={`estado estado-${planta.estado}`}>{textoEstado[planta.estado]}</span>
      </header>

      <dl className="tarjeta-datos">
        <dt>Especie</dt>
        <dd>{especie}</dd>
        <dt>Zona</dt>
        <dd>{zona}</dd>
        <dt>Comprada</dt>
        <dd>{formatearFecha(planta.fechaCompra)}</dd>
        {planta.salud && (
          <>
            <dt>Riego</dt>
            <dd>
              {planta.salud.estado === 'atrasada'
                ? `atrasado ${planta.salud.diasAtraso} ${planta.salud.diasAtraso === 1 ? 'día' : 'días'}`
                : 'al día'}
            </dd>
          </>
        )}
      </dl>

      {error && <p className="error-servidor" role="alert">{error}</p>}

      {terminada ? (
        <p className="aviso">
          Esta planta está {planta.estado}: ya no se le registran cuidados ni cambia de estado.
        </p>
      ) : (
        <>
          <fieldset className="detalle-bloque">
            <legend>Registrar un cuidado de hoy</legend>
            <label htmlFor="nota">Nota (opcional)</label>
            <input
              id="nota"
              value={nota}
              maxLength={120}
              placeholder="Ej: le puse fertilizante líquido"
              onChange={(e) => setNota(e.target.value)}
            />
            <div className="detalle-botones">
              {TIPOS.map(({ tipo, texto }) => (
                <button
                  key={tipo}
                  type="button"
                  className="boton-principal"
                  disabled={ocupado}
                  onClick={() => registrar(tipo)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="detalle-bloque">
            <legend>Cambiar estado</legend>
            <div className="detalle-botones">
              {otrosEstados.map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className="boton-secundario"
                  disabled={ocupado}
                  onClick={() => hacer(() => cambiarEstado(id, estado))}
                >
                  {textoEstado[estado]}
                </button>
              ))}
            </div>
            <p className="ayuda">Si pasa a muerta o regalada, después no se puede volver atrás.</p>
          </fieldset>
        </>
      )}

      <h3>Historial de cuidados</h3>
      {cuidados.length === 0 ? (
        <p className="aviso">Todavía no tiene cuidados registrados.</p>
      ) : (
        <ul className="historial">
          {cuidados.map((c) => (
            <li key={c.id}>
              <time dateTime={c.fecha}>{formatearFecha(c.fecha)}</time>
              <strong>{textoTipo[c.tipo]}</strong>
              {c.nota && <span className="historial-nota">{c.nota}</span>}
              <button
                type="button"
                className="boton-quitar"
                disabled={ocupado}
                aria-label={`Borrar ${textoTipo[c.tipo].toLowerCase()} del ${formatearFecha(c.fecha)}`}
                onClick={() => hacer(() => eliminarCuidado(id, c.id))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DetallePlanta
