import { query } from '../database'

export async function updateUser(
  mail: string,
  updates: { username?: string; phone_number?: string }
) {
  const fields = []
  const values = []
  let idx = 1

  if (updates.username) {
    fields.push(`username = $${idx++}`)
    values.push(updates.username)
  }
  if (updates.phone_number) {
    fields.push(`phone_number = $${idx++}`)
    values.push(updates.phone_number)
  }

  if (fields.length === 0) {
    return { error: 'No updates provided' }
  }

  const qstring = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE email = $${idx}
    RETURNING email, username, phone_number, role;
  `

  values.push(mail)

  let res
  try {
    res = await query(qstring, values)
    if (res.rowCount === 0) {
      return { error: 'user not found or no changes made' }
    }
  } catch (err) {
    return { err }
  }

  return {
    email: res.rows[0].email,
    username: res.rows[0].username,
    phone_number: res.rows[0].phone_number,
    role: res.rows[0].role,
  }
}
