import express from 'express'
import createRouter from './create'
import updateRouter from './update'
import deleteRouter from './delete'
import getRouter from './get'

const router = express.Router()

router.use('/', createRouter)
router.use('/', updateRouter)
router.use('/', deleteRouter)
router.use('/', getRouter)

export default router
