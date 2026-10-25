// grafico de barras hecho a mano en SVG, sin librerias.
// datos: [{ etiqueta: '2026-10', valor: 14 }, ...]
const ANCHO = 600
const ALTO = 260
const MARGEN = { arriba: 20, derecha: 10, abajo: 40, izquierda: 36 }

function GraficoBarras({ datos, titulo }) {
  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo

  // escala: el valor mas alto ocupa toda la altura. Minimo 1 para no dividir por cero
  const maximo = Math.max(1, ...datos.map((d) => d.valor))
  const escalaY = (valor) => altoUtil - (valor / maximo) * altoUtil

  const anchoColumna = anchoUtil / datos.length
  const anchoBarra = anchoColumna * 0.6

  // tres o cuatro lineas guia en valores enteros
  const paso = Math.max(1, Math.ceil(maximo / 4))
  const guias = []
  for (let v = 0; v <= maximo; v += paso) guias.push(v)

  return (
    <svg
      className="grafico"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={titulo}
    >
      <title>{titulo}</title>
      <g transform={`translate(${MARGEN.izquierda}, ${MARGEN.arriba})`}>
        {guias.map((v) => (
          <g key={v}>
            <line className="grafico-guia" x1="0" x2={anchoUtil} y1={escalaY(v)} y2={escalaY(v)} />
            <text className="grafico-eje" x="-6" y={escalaY(v)} textAnchor="end" dominantBaseline="middle">
              {v}
            </text>
          </g>
        ))}

        {datos.map((d, i) => {
          const x = i * anchoColumna + (anchoColumna - anchoBarra) / 2
          const y = escalaY(d.valor)
          return (
            <g key={d.etiqueta}>
              <rect className="grafico-barra" x={x} y={y} width={anchoBarra} height={altoUtil - y} rx="3">
                <title>{`${d.etiqueta}: ${d.valor}`}</title>
              </rect>
              {d.valor > 0 && (
                <text className="grafico-valor" x={x + anchoBarra / 2} y={y - 5} textAnchor="middle">
                  {d.valor}
                </text>
              )}
              <text className="grafico-eje" x={x + anchoBarra / 2} y={altoUtil + 20} textAnchor="middle">
                {d.etiqueta}
              </text>
            </g>
          )
        })}

        <line className="grafico-linea-base" x1="0" x2={anchoUtil} y1={altoUtil} y2={altoUtil} />
      </g>
    </svg>
  )
}

export default GraficoBarras
