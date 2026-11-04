import { useState } from 'react'

const TIPOS = [
  { tipo: 'riego', texto: '💧 Regar' },
  { tipo: 'abono', texto: '🌱 Abonar' },
  { tipo: 'poda', texto: '✂️ Podar' },
  { tipo: 'trasplante', texto: '🌿 Trasplantar' },
]

const ESTADOS = {
  activa: 'Activa',
  en_recuperacion: 'En recuperación',
  muerta: 'Muerta',
  regalada: 'Regalada',
}

// formularios para registrar un cuidado y cambiar el estado de una planta
function AccionesPlanta({ estadoActual, ocupado, onCuidado, onEstado }) {
  const [nota, setNota] = useState('')

  function registrar(tipo) {
    onCuidado(tipo, nota.trim())
    setNota('')
  }

  const otrosEstados = Object.keys(ESTADOS).filter((e) => e !== estadoActual)

  return (
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
              onClick={() => onEstado(estado)}
            >
              {ESTADOS[estado]}
            </button>
          ))}
        </div>
        <p className="ayuda">Si pasa a muerta o regalada, después no se puede volver atrás.</p>
      </fieldset>
    </>
  )
}

export default AccionesPlanta
