import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../../constants'

export function comparePassword(
  plainText: string | Buffer,
  encryptedText: string
) {
  return bcrypt.compareSync(plainText, encryptedText)
}

export function encryptPassword(plainText: string) {
  return bcrypt.hashSync(plainText, 10)
}

export function generateJWT(_id: string, email: string, role: string) {
  const payload = {
    _id, // Include user_id in the payload
    email,
    role,
  }
  const token = jwt.sign(payload, env.JWT_SECRET)
  return 'Bearer ' + token
}
