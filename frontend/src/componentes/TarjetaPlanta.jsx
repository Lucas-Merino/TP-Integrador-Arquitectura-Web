import { useState } from 'react'

const textoEstado = {
  activa: 'Activa',
  en_recuperacion: 'En recuperación',
  muerta: 'Muerta',
  regalada: 'Regalada',
}

function Salud({ salud }) {
  // muertas y regaladas no tienen salud
  if (!salud) return null

  if (salud.estado === 'atrasada') {
    return (
      <p className="salud atrasada">
        💧 Riego atrasado {salud.diasAtraso} {salud.diasAtraso === 1 ? 'día' : 'días'}
      </p>
    )
  }
  return <p className="salud al-dia">💧 Riego al día</p>
}

function TarjetaPlanta({ planta, especie, zona, onEditar, onEliminar }) {
  // la confirmacion de la baja se hace en la misma tarjeta, sin window.confirm
  const [confirmando, setConfirmando] = useState(false)

  return (
    <article className="tarjeta">
      <header className="tarjeta-cabecera">
        <h3>{planta.apodo}</h3>
        <span className={`estado estado-${planta.estado}`}>{textoEstado[planta.estado]}</span>
      </header>
      <dl className="tarjeta-datos">
        <dt>Especie</dt>
        <dd>{especie}</dd>
        <dt>Zona</dt>
        <dd>{zona}</dd>
      </dl>
      <Salud salud={planta.salud} />

      {confirmando ? (
        <div className="tarjeta-acciones confirmar">
          <p>¿Eliminar a {planta.apodo}? También se borran sus cuidados.</p>
          <button type="button" className="boton-peligro" onClick={onEliminar}>
            Sí, eliminar
          </button>
          <button type="button" className="boton-secundario" onClick={() => setConfirmando(false)}>
            No
          </button>
        </div>
      ) : (
        <div className="tarjeta-acciones">
          <button type="button" className="boton-secundario" onClick={onEditar}>
            Editar
          </button>
          <button type="button" className="boton-secundario" onClick={() => setConfirmando(true)}>
            Eliminar
          </button>
        </div>
      )}
    </article>
  )
}

export default TarjetaPlanta
