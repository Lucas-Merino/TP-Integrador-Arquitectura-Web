import { Router } from 'express'
import * as controlador from '../controladores/zonasControlador.js'
import { validarZona } from '../middlewares/validarZona.js'

const router = Router()

router.get('/', controlador.listar)
router.get('/:id', controlador.obtener)
router.post('/', validarZona, controlador.crear)
router.put('/:id', validarZona, controlador.reemplazar)
router.delete('/:id', controlador.eliminar)

export default router
