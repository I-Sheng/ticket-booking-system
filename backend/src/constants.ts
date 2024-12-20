/* Get the environment variables from the .env file and export them */
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET || JWT_SECRET == '') throw new Error('JWT_SECRET not defined')

const DATABASE_URL = process.env.DATABASE_URL as string
if (!DATABASE_URL || DATABASE_URL == '')
  throw new Error('DATABASE_URL not defined')

export const env = {
  JWT_SECRET,
  DATABASE_URL,
}
