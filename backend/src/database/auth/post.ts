import { query } from '../database'

export type NewUserType = {
  email: string
  username: string
  password: string
  role: 'host' | 'user'
  phone_number: string
}

export async function createUser(newuser: NewUserType) {
  const { email, username, password, role, phone_number } = newuser

  // 檢查是否存在重複的 email
  const checkEmailQuery = `
    SELECT _id FROM users WHERE email = $1;
  `
  try {
    const emailCheckRes = await query(checkEmailQuery, [email])
    if (emailCheckRes.rowCount && emailCheckRes.rowCount > 0) {
      return { error: 'Email already exists' }
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred'
    return { error: errorMessage }
  }

  // 插入新用戶
  const insertUserQuery = `
    INSERT INTO users (email, username, password, role, phone_number)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING _id, email, username, role, phone_number, created_at;
  `

  let res
  try {
    res = await query(insertUserQuery, [
      email,
      username,
      password,
      role,
      phone_number,
    ])
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred'
    return { error: errorMessage }
  }

  if (!res || res.rowCount === 0) {
    return { error: 'User not created' }
  }

  return {
    id: res.rows[0]._id,
    email: res.rows[0].email,
    username: res.rows[0].username,
    role: res.rows[0].role,
    phone_number: res.rows[0].phone_number,
    created_at: res.rows[0].created_at,
  }
}
