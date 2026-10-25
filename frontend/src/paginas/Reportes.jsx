import { useEffect, useState } from 'react'
import { riegosPendientes, cuidadosPorMes } from '../api/reportes.js'
import GraficoBarras from '../componentes/GraficoBarras.jsx'
import '../estilos/reportes.css'

const NOMBRES_MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// "2026-10" -> "oct 26"
function nombreCorto(mes) {
  const [anio, numero] = mes.split('-')
  return `${NOMBRES_MES[Number(numero) - 1]} ${anio.slice(2)}`
}

function Reportes() {
  const [pendientes, setPendientes] = useState(null)
  const [porMes, setPorMes] = useState(null)
  const [meses, setMeses] = useState(6)
  const [error, setError] = useState(null)

  useEffect(() => {
    riegosPendientes()
      .then(setPendientes)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    let vigente = true
    cuidadosPorMes(meses)
      .then((datos) => {
        if (vigente) setPorMes(datos)
      })
      .catch((err) => setError(err.message))
    return () => {
      vigente = false
    }
  }, [meses])

  if (error) return <p className="error">No se pudieron cargar los reportes: {error}</p>

  const totalPendientes = pendientes?.reduce((suma, z) => suma + z.pendientes.length, 0)

  return (
    <>
      <h2>Reportes</h2>

      <section className="reporte">
        <h3>Riegos pendientes</h3>
        {!pendientes && <p>Cargando...</p>}
        {pendientes?.length === 0 && <p className="aviso">Todas las plantas están regadas 🎉</p>}
        {pendientes?.length > 0 && (
          <>
            <p className="texto-suave">
              {totalPendientes} {totalPendientes === 1 ? 'planta necesita' : 'plantas necesitan'} agua.
            </p>
            <div className="zonas-pendientes">
              {pendientes.map((z) => (
                <article key={z.zona} className="zona-pendiente">
                  <h4>{z.zona}</h4>
                  <ul>
                    {z.pendientes.map((p) => (
                      <li key={p.plantaId}>
                        <span>{p.apodo}</span>
                        <span className="atraso">
                          {p.diasAtraso} {p.diasAtraso === 1 ? 'día' : 'días'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="reporte">
        <div className="reporte-encabezado">
          <h3>Cuidados por mes</h3>
          <label>
            Mostrar
            <select value={meses} onChange={(e) => setMeses(Number(e.target.value))}>
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </label>
        </div>

        {!porMes && <p>Cargando...</p>}
        {porMes && (
          <>
            <GraficoBarras
              titulo={`Cuidados registrados en los últimos ${meses} meses`}
              datos={porMes.map((m) => ({ etiqueta: nombreCorto(m.mes), valor: m.total }))}
            />

            {/* la misma info en tabla, con el detalle por tipo */}
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Mes</th>
                    <th scope="col">Riego</th>
                    <th scope="col">Abono</th>
                    <th scope="col">Poda</th>
                    <th scope="col">Trasplante</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {porMes.map((m) => (
                    <tr key={m.mes}>
                      <th scope="row">{nombreCorto(m.mes)}</th>
                      <td>{m.porTipo.riego}</td>
                      <td>{m.porTipo.abono}</td>
                      <td>{m.porTipo.poda}</td>
                      <td>{m.porTipo.trasplante}</td>
                      <td>{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  )
}

export default Reportes
