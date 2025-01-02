import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// const API_URL = 'http://localhost:8080'
const API_URL = process.env.REACT_APP_API_URL

const Registration: React.FC = () => {
  const [step, setStep] = useState(1)
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [personalData, setPersonalData] = useState({
    name: '',
    gender: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountData({ ...accountData, [name]: value })
  }

  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setPersonalData({ ...personalData, [name]: value })
  }
  const handleSubmitAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (accountData.password !== accountData.confirmPassword) {
      setError('密碼不一致')
      return
    }

    setError('')
    setStep(2) // 轉到第二步
  }

  const handleSubmitPersonal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: accountData.email,
          password: accountData.password,
          phone_number: personalData.phone,
          role: 'user',
          username: personalData.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '註冊失敗')
      }

      const data = await response.json()
      setSuccess(data.message)
      setStep(3) // 轉到確認資訊步驟
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('發生未知錯誤')
      }
    }
  }

  return (
    <div className="create-activity-container">
      <h2>註冊</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {step === 1 && (
        <form onSubmit={handleSubmitAccount}>
          <div>
            <label>帳號</label>
            <input
              type="text"
              name="email"
              value={accountData.email}
              onChange={handleAccountChange}
              required
              className="input-region"
            />
          </div>
          <div>
            <label>密碼</label>
            <input
              type="password"
              name="password"
              value={accountData.password}
              onChange={handleAccountChange}
              required
              className="input-region"
            />
          </div>
          <div>
            <label>確認密碼</label>
            <input
              type="password"
              name="confirmPassword"
              value={accountData.confirmPassword}
              onChange={handleAccountChange}
              required
              className="input-region"
            />
          </div>
          <button type="submit">下一步</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitPersonal}>
          <div>
            <label>姓名</label>
            <input
              type="text"
              name="name"
              value={personalData.name}
              onChange={handlePersonalChange}
              required
              className="input-region"
            />
          </div>
          <div>
            <label>手機</label>
            <input
              type="text"
              name="phone"
              value={personalData.phone}
              onChange={handlePersonalChange}
              required
              className="input-region"
            />
          </div>
          <button type="button" onClick={() => setStep(1)}>
            上一步
          </button>
          <button type="submit">下一步</button>
        </form>
      )}

      {step === 3 && (
        <div>
          <h3>確認資訊</h3>
          <p>帳號: {accountData.email}</p>
          <p>姓名: {personalData.name}</p>
          <p>手機: {personalData.phone}</p>
          <button
            onClick={() => {
              alert('註冊完成')
              navigate('/login') // 導向到登入頁面
            }}
          >
            確認註冊
          </button>
          <button type="button" onClick={() => setStep(2)}>
            上一步
          </button>
        </div>
      )}
    </div>
  )
}

export default Registration
