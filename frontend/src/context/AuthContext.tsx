// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  name: string | null
  role: 'user' | 'host' | null
  login: (name: string, token: string, role: 'user' | 'host') => void
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [role, setRole] = useState<'user' | 'host' | null>(null) // 'user' 或 'host'

  useEffect(() => {
    // Load the token and name from localStorage when the component mounts
    const token = localStorage.getItem('jwt_token')
    const savedName = localStorage.getItem('name')
    const savedRole = localStorage.getItem('role') as 'user' | 'host' | null // 强制转换为具体的 role 类型

    if (token) {
      setIsLoggedIn(true)
      setName(savedName)
      setRole(savedRole)
    }
  }, [])

  // 登录方法
  const login = (name: string, token: string, role: 'user' | 'host') => {
    setIsLoggedIn(true)
    setName(name)
    localStorage.setItem('jwt_token', token) // 保存 JWT token 到 localStorage
    localStorage.setItem('name', name) // 保存 name 到 localStorage
    localStorage.setItem('role', role) // 存储角色信息
  }

  // 登出方法
  const logout = () => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    setIsLoggedIn(false)
    setIsLoggedIn(false)
    setName(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, name, role, login, logout }}>
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
