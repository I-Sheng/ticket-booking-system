// App.tsx
import React from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Registration'
import Login from './components/Login'
import { AuthProvider, useAuth } from './context/AuthContext'
import Activity from './components/activity'
import CreateActivity from './components/createActivity'
import MyTicket from './components/myTicket' // 引入MyTicket组件
import UserSettings from './components/UserSettings'
import ChangePassword from './components/ChangePassword'
import BuyTicketPage from './components/BuyTicketPage'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Topbar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '50px',
              borderBottom: '1px solid #ccc',
            }}
          >
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                width: '85%',
                borderRight: '1px solid #ccc',
              }}
            >
              <Link style={{ padding: '30px' }} to="/">
                首頁
              </Link>
              <Link style={{ padding: '30px' }} to="/myTicket">
                我的票卷
              </Link>
              <Link style={{ padding: '30px' }} to="/settings">
                使用者設定
              </Link>
              <HostLink />
              {/* <Link to="/schedule">報名</Link> */}
            </nav>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                width: '15%',
              }}
            >
              <LoginDisplay /> {/* 顯示用戶名稱或登入按鈕 */}
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px' }}>
            {/* 主要內容路由 */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/Activity/:id" element={<Activity />}></Route>
              <Route path="/create-activity" element={<CreateActivity />} />
              <Route path="/myTicket" element={<MyTicket />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route
                path="/settings/change-password"
                element={<ChangePassword />}
              />
              <Route path="/buy-ticket/:id" element={<BuyTicketPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

// 顯示用戶名稱或登入按鈕的組件
const LoginDisplay: React.FC = () => {
  const { isLoggedIn, name, logout } = useAuth()

  return (
    <>
      {isLoggedIn ? (
        <>
          <span style={{ marginRight: '10px' }}>歡迎, {name}!</span>
          <button onClick={logout}>登出</button>
        </>
      ) : (
        <>
          <Link to="/register" style={{ marginRight: '10px' }}>
            註冊
          </Link>
          <Link to="/login">登入</Link>
        </>
      )}
    </>
  )
}
const HostLink: React.FC = () => {
  const { role } = useAuth()
  return role === 'host' ? (
    <Link to="/create-activity" style={{ padding: '30px' }}>
      新增活動
    </Link>
  ) : null
}

export default App
