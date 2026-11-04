// grafico de barras simple con divs: el alto de cada barra es un porcentaje del valor mas alto.
// datos: [{ etiqueta: 'oct', valor: 14 }, ...]
function GraficoBarras({ datos, titulo }) {
  const maximo = Math.max(1, ...datos.map((d) => d.valor))

  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      <div className="grafico-barras">
        {datos.map((d) => (
          <div key={d.etiqueta} className="grafico-columna">
            <span className="grafico-valor">{d.valor}</span>
            <div className="grafico-barra" style={{ height: `${(d.valor / maximo) * 100}%` }} />
            <span className="grafico-etiqueta">{d.etiqueta}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}

export default GraficoBarras
