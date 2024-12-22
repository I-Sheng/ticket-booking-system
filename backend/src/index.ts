import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = 8080

app.get('/', (_req, res) => {
  res.send('Hello TypeScript with Express!')
})

import { arenaRouter, authRouter, } from './routes'
app.use('/arena', arenaRouter)
app.use('/auth', authRouter)

app.listen(8080, () => {
  console.log(`Server is running on port ${port}`)
})
