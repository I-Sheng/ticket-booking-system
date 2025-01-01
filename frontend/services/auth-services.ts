import axios from 'axios'
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.136:8080'

type LoginRes = {
  error: string | null
  data: string
}

class AuthService {
  async login(email: string, password: string): Promise<LoginRes> {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (res.status != 200) {
      const errMessage = await res.text()
      const err: LoginRes = { error: errMessage, data: '' }
      return new Promise<LoginRes>((resolve) => {
        resolve(err)
      })
    }
    const sucMessage = await res.json()
    const suc: LoginRes = {
      error: null,
      data: JSON.stringify(sucMessage),
    }
    return suc
  }

  async register(form: FormData) {
    return await axios.post(API_URL + '/auth/register', form)
  }

  async changePassword(
    jwt_token: string,
    oldPassword: string,
    newPassword: string
  ) {
    return await axios.patch(
      API_URL + '/auth/change-password',
      { oldPassword: oldPassword, newPassword: newPassword },
      {
        headers: { Authorization: 'Bearer ' + jwt_token },
      }
    )
  }
}

export default new AuthService()

