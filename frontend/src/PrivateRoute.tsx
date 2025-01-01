import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isLoggedIn } = useAuth()

  return isLoggedIn ? children : <Navigate to="/login" />
}

export default PrivateRoute

