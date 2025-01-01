// src/components/UserSettings.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const UserSettings: React.FC = () => {
  const { name, login } = useAuth() // 从 AuthContext 获取 name 和 login 方法
  const [currentName, setCurrentName] = useState<string>(name || '')
  const [phone, setPhone] = useState<string>(
    localStorage.getItem('phone') || ''
  )
  const [email] = useState<string>(
    localStorage.getItem('email') || 'johndoe@example.com'
  )

  useEffect(() => {
    setCurrentName(name || '')
  }, [name])

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()

    // 假设保持 token 和 role 不变
    const token = localStorage.getItem('jwt_token') || ''
    const role = localStorage.getItem('role') as 'user' | 'host'

    if (token && role) {
      localStorage.setItem('name', currentName) // 保存新的名字到本地存储
      localStorage.setItem('phone', phone) // 保存手机号到本地存储

      // 更新 AuthContext 的 name
      login(currentName, token, role)

      alert('更新成功')
    } else {
      alert('失败')
    }
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>使用者設定</h2>
      <form onSubmit={handleSaveChanges}>
        {/* 电子邮箱 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            電子郵件
          </label>
          <input
            type="email"
            value={email}
            disabled // 邮箱不可编辑
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
              cursor: 'not-allowed',
            }}
          />
        </div>

        {/* 姓名 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>姓名</label>
          <input
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        {/* 手机号码 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            手機號碼
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
          }}
        >
          儲存
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/settings/change-password"
          style={{
            color: '#007BFF',
            textDecoration: 'none',
          }}
        >
          修改密碼
        </a>
      </div>
    </div>
  )
}

export default UserSettings
