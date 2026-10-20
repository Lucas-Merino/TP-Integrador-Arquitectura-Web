// error con status http, para tirarlo desde cualquier lado y que lo agarre el middleware
export class ErrorHttp extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// express sabe que es de errores porque recibe 4 parametros
export function manejarErrores(err, req, res, next) {
  if (err instanceof ErrorHttp) {
    return res.status(err.status).json({ error: err.message })
  }

  // express.json() tira este error cuando el body no es un JSON valido
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo del pedido no es un JSON válido' })
  }

  // cualquier otra cosa es un error nuestro: se loguea y no se muestra el detalle
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
