import { Router } from 'express'
import * as controlador from '../controladores/etiquetasControlador.js'
import { validarEtiqueta } from '../middlewares/validarPlanta.js'

const router = Router()

router.get('/', controlador.listar)
router.post('/', validarEtiqueta, controlador.crear)
router.delete('/:id', controlador.eliminar)

export default router
