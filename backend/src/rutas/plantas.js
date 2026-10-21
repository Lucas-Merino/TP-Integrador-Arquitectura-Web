import { Router } from 'express'
import * as controlador from '../controladores/plantasControlador.js'
import rutasCuidados from './cuidados.js'
import { validarPlanta, validarEstado } from '../middlewares/validarPlanta.js'

const router = Router()

router.get('/', controlador.listar)
router.get('/:id', controlador.obtener)
router.post('/', validarPlanta, controlador.crear)
router.put('/:id', validarPlanta, controlador.reemplazar)
router.patch('/:id', validarEstado, controlador.cambiarEstado)
router.delete('/:id', controlador.eliminar)

// los cuidados son un sub-recurso de cada planta
router.use('/:id/cuidados', rutasCuidados)

export default router
