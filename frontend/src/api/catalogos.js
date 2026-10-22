import { pedir } from './cliente.js'

// especies y zonas solo se leen desde el front, para los select de los formularios y filtros
export const listarEspecies = () => pedir('/especies')

export const listarZonas = () => pedir('/zonas')
