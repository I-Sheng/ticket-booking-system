// components/Login.tsx
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom' // 導入 useNavigate
import { useAuth } from '../context/AuthContext' // 確保導入 useAuth
const API_URL = process.env.REACT_APP_API_URL

const Login: React.FC = () => {
  const [email, setemail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
      if (!response.ok) {
        const errorText = await response.text() // 获取服务器返回的错误信息
        throw new Error(errorText)
      }

      const data = await response.json()
      if (data.jwtToken) {
        // 登录成功后，调用 login 保存状态和 token
        login(data.email, data.username, data.jwtToken, data.role, data.phone_number)
        navigate('/') // 跳转到首页
      } else {
        alert('登录失败')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || '登入失敗')
      } else {
        setError('伺服器錯誤，請稍後再試')
      }
    }
  }

  return (
    <div>
      <h2>登入</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">用戶名:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">密碼:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">登入</button>
      </form>
    </div>
  )
}

export default Login
