// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface AuthContextType {
  jwtToken: string | null
  isLoggedIn: boolean
  name: string | null
  role: 'user' | 'host' | null
  phone: string | null
  login: (
    email: string,
    name: string,
    token: string,
    role: 'user' | 'host',
    phone: string
  ) => void
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [role, setRole] = useState<'user' | 'host' | null>(null) // 'user' 或 'host'
  const [phone, setPhone] = useState<string | null>(null)
  const [jwtToken, setJwtToken] = useState<string | null>(null)

  useEffect(() => {
    // Load the token and name from localStorage when the component mounts
    const token = localStorage.getItem('jwt_token')
    const savedEmail = localStorage.getItem('email')
    const savedName = localStorage.getItem('name')
    const savedRole = localStorage.getItem('role') as 'user' | 'host' | null // 强制转换为具体的 role 类型
    const savedPhone = localStorage.getItem('phone')

    if (token) {
      setJwtToken(token)
      setIsLoggedIn(true)
      setEmail(savedEmail)
      setName(savedName)
      setRole(savedRole)
      setPhone(savedPhone)
    }
  }, [])

  // 登录方法
  const login = (
    email: string,
    name: string,
    token: string,
    role: 'user' | 'host',
    phone: string
  ) => {
    setIsLoggedIn(true)
    setEmail(email)
    setName(name)
    setJwtToken(token)
    setRole(role)
    setPhone(phone)
    localStorage.setItem('jwt_token', token) // 保存 JWT token 到 localStorage
    localStorage.setItem('email', email) // 保存 name 到 localStorage
    localStorage.setItem('name', name) // 保存 name 到 localStorage
    localStorage.setItem('role', role) // 存储角色信息
    localStorage.setItem('phone', phone) // 存储角色信息
  }

  // 登出方法
  const logout = () => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('email')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    localStorage.removeItem('phone')
    setIsLoggedIn(false)
    setEmail(null)
    setName(null)
    setRole(null)
    setPhone(null)
    setJwtToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ jwtToken, isLoggedIn, name, role, phone, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
