import express from 'express'
import createRouter from './create'
import getRouter from './get'
import updateRouter from './update'
import regionsRouter from './regions'

const router = express.Router()

router.use('/', createRouter)
router.use('/', getRouter)
router.use('/', updateRouter)
router.use('/regions', regionsRouter)

export default router
