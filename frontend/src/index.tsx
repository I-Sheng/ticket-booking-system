import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { AuthProvider } from './context/AuthContext' // 假设你已经创建了 AuthContext

// checkLoginStatus 用于从 localStorage 获取并设置登录状态
const checkLoginStatus = () => {
  const jwtToken = localStorage.getItem('jwt_token')
  const name = localStorage.getItem('name')

  return { jwtToken, name }
}

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const { jwtToken, name } = checkLoginStatus()
    if (jwtToken) {
      setIsLoggedIn(true)
      setName(name)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
