import { query } from '../database'

export async function getUser(mail: string) {
  const qstring = 'select * from users where email = $1'
  let res
  try {
    res = await query(qstring, [mail])
    if (res.rowCount === 0) {
      return { error: 'user not found' }
    }
  } catch (err) {
    return { error: err }
  }
  if (!res || !res.rowCount) return { error: 'user not found' }
  if (res.rowCount === 0) return { error: 'user not found' }
  return {
    email: res.rows[0].email,
    password: res.rows[0].password,
    username: res.rows[0].username,
    phone_number: res.rows[0].phone_number,
    role: res.rows[0].role,
    is_disabled: res.rows[0].is_disabled,
    createdAt: res.rows[0].created_at,
  }
}
