// App.tsx
import React, { useState } from 'react'
import './styles.css'
import {
  useNavigate,
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
} from 'react-router-dom'
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
import PaymentPage from './components/PaymentPage'
import ManageActivities from './components/manageActivities'
import EditActivity from './components/editActivity'

const App: React.FC = () => {
  const { isLoggedIn } = useAuth()
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Topbar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100px',
              borderBottom: '1px solid #ccc',
              padding: '0px 100px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#0CCDDD',
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
              <div>
                <Link
                  to="/"
                  style={{
                    textDecoration: 'none',
                    color: '#333',
                    fontSize: '50px',
                    fontWeight: 'bold',
                    marginRight: '30px',
                  }}
                >
                  tixkraft
                </Link>
              </div>
              <Link
                style={{
                  textDecoration: 'none',
                  color: '#333',
                  padding: '30px',
                }}
                to="/"
                onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
              >
                <p>活動資訊</p>
              </Link>
              {isLoggedIn && (
                <Link
                  style={{
                    textDecoration: 'none',
                    color: '#333',
                    padding: '30px',
                  }}
                  to="/myTicket"
                  onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
                >
                  <p>我的訂單</p>
                </Link>
              )}
              <HostLink />
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
          <div style={{ flex: 1, padding: '0px 100px' }}>
            {/* 主要內容路由 */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/Activity/:id" element={<Activity />}></Route>
              <Route
                path="/editActivity/:id"
                element={<EditActivity />}
              ></Route>
              <Route path="/create-activity" element={<CreateActivity />} />
              <Route path="/manage-activity" element={<ManageActivities />} />
              <Route path="/myTicket" element={<MyTicket />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route
                path="/settings/change-password"
                element={<ChangePassword />}
              />
              <Route path="/buy-ticket/:id" element={<BuyTicketPage />} />
              <Route path="/payment/:id" element={<PaymentPage />} />
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

  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/')
    window.location.reload()
  }
  const [showDropdown, setShowDropdown] = useState(false)
  let closeTimeout: NodeJS.Timeout | null = null
  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout)
    setShowDropdown(true)
  }
  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }
  return (
    <>
      {isLoggedIn ? (
        <>
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              style={{
                backgroundColor: 'transparent',
                border: '0px solid #ccc',
                cursor: 'pointer',
                padding: '10px',
                color: '#000',
                width: '200px', // 設定固定寬度與下拉選單一致
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              會員帳戶
            </button>{' '}
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  left: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  minWidth: '200px',
                }}
                onMouseEnter={handleMouseEnter}
              >
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    justifyItems: 'center',
                  }}
                >
                  <li
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '10px 0',
                      display: 'block', // 確保填滿父容器
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <p>{name}</p>
                  </li>
                  <li
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '10px 0',
                      display: 'block', // 確保填滿父容器
                      width: '100%',
                    }}
                  >
                    <Link
                      to="/settings"
                      style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        color: '#333',
                        display: 'block', // 確保填滿父容器
                        width: '100%',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = '#1E90FF')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
                    >
                      會員資料
                    </Link>
                  </li>
                  <li
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '10px 0',
                      display: 'block', // 確保填滿父容器
                      width: '100%',
                    }}
                  >
                    <Link
                      to="/myTicket"
                      style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        color: '#333',
                        display: 'block', // 確保填滿父容器
                        width: '100%',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = '#1E90FF')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
                    >
                      我的訂單
                    </Link>
                  </li>
                  <li
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '10px 0',
                      display: 'block', // 確保填滿父容器
                      width: '100%',
                    }}
                  >
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: 'transparent',
                        textDecoration: 'none',
                        textAlign: 'center',
                        color: '#333',
                        display: 'block', // 確保填滿父容器
                        fontSize: '16px',
                        width: '100%',
                        borderWidth: 0,
                        cursor: 'pointer',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = '#1E90FF')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
                    >
                      登出
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Link
            to="/login"
            style={{ textDecoration: 'none', color: '#333' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
          >
            登入
          </Link>
          <Link
            to="/register"
            style={{
              textDecoration: 'none',
              color: '#333',
              marginRight: '10px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
          >
            註冊
          </Link>
        </>
      )}
    </>
  )
}
const HostLink: React.FC = () => {
  const { role } = useAuth()
  return role === 'host' ? (
    <>
      {' '}
      <Link
        to="/create-activity"
        style={{ textDecoration: 'none', color: '#333', padding: '30px' }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
      >
        新增活動
      </Link>
      <Link
        to="/manage-activity"
        style={{ textDecoration: 'none', color: '#333', padding: '30px' }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#1E90FF')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
      >
        管理活動
      </Link>
    </>
  ) : null
}

export default App
