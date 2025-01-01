import express from 'express'
import { encryptPassword, comparePassword, generateJWT } from './util'
import { createUser } from '../../database/auth/post'
import type { NewUserType } from '../../database/auth/post'
import { getUser } from '../../database/auth/get'
import { updateUser } from '../../database/auth/put'
import { jwtProtect } from '../middleware'

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
  const jwtToken = generateJWT(user._id, user.email, user.role)

  return res.status(200).json({
    email: user.email,
    username: user.username,
    phone_number: user.phone_number,
    role: user.role,
    jwtToken,
  })
})

router.get('/userinfo', jwtProtect, async (req, res) => {
  const email = req.body.decoded.email
  console.log(email)

  // Retrieve user information
  const user = await getUser(email)
  if (user.error || !user) {
    return res.status(404).send('User not found')
  }

  return res.status(200).json({
    email: user.email,
    username: user.username,
    role: user.role,
    phone_number: user.phone_number,
  })
})

router.put('/', jwtProtect, async (req, res) => {
  const email = req.body.decoded.email
  const { username, phone_number } = req.body

  // Update user information
  const updatedUser = await updateUser(email, { username, phone_number })
  if (updatedUser.error) {
    console.error(updatedUser.error)
    return res.status(500).send(updatedUser.error)
  }

  return res.status(200).json({
    email: updatedUser.email,
    username: updatedUser.username,
    role: updatedUser.role,
    phone_number: updatedUser.phone_number,
  })
})

export default router
