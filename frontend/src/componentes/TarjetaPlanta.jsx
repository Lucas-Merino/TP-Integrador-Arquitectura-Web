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

function TarjetaPlanta({ planta, especie, zona }) {
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
    </article>
  )
}

export default TarjetaPlanta
