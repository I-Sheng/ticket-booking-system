import express from 'express'
import { encryptPassword, comparePassword, generateJWT } from './util'
import { createUser } from '../../database/auth/post'
import type { NewUserType } from '../../database/auth/post'
import { getUser } from '../../database/auth/get'

const router = express.Router()

router.get('/', async (_req, res) => {
  res.status(200).send('Auth routes are available!')
})

router.post('/register', async (req, res) => {
  const { email, password, phone_number, role, username } = req.body

  // Check if user already exists
  const hasUser = await getUser(email)
  if (!hasUser.error && hasUser) {
    return res.status(409).send('User already exists')
  }

  // Encrypt password
  const encryptedPassword = encryptPassword(password)

  // Create new user
  const newUser: NewUserType = {
    email,
    username,
    password: encryptedPassword,
    role,
    phone_number,
  }

  const result = await createUser(newUser)

  if (result.error) {
    console.error(result.error)
    return res.status(500).send(result.error)
  }

  return res.status(201).json({ email: result.email, id: result.id })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await getUser(email)
  if (user.error || !user) {
    return res.status(404).send('User not found')
  }

  // Check if password matches
  if (!comparePassword(password, user.password)) {
    return res.status(401).send('Invalid credentials')
  }

  // Generate JWT token
  const jwtToken = generateJWT(user.email, user.role)

  return res.status(200).json({ email: user.email, role: user.role, jwtToken })
})

export default router
