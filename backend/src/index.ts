import express from 'express'
import cors from 'cors'
import { arenaRouter,ticketRouter } from './routes'

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = 8080

app.get('/', (_req, res) => {
  res.send('Hello TypeScript with Express!')
})

app.use('/arena', arenaRouter)
app.use('/ticket', ticketRouter)

app.listen(8080, () => {
  console.log(`Server is running on port ${port}`)
})
