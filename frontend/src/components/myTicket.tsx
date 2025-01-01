// components/MyTicket.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
const API_URL = process.env.REACT_APP_API_URL

interface Ticket {
  id: number
  activity_id: string
  region_id: string
  seat_number: number
  is_paid: boolean
}

const MyTicket: React.FC = () => {
  const { isLoggedIn, role, jwtToken } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets/list`, {
        method: 'GET',
        headers: {
          Authorization: `${jwtToken}`,
        },
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`${jwtToken}`)
      }

      const data = await response.json()
      setTickets(data.tickets)
    } catch (err: any) {
      setError(err.message || '发生错误')
    } finally {
      setLoading(false)
    }
  }
  React.useEffect(() => {
    fetchTickets()
  }, [])

  if (loading) {
    return <div>正在加载票务信息...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div>
      <h2>我的门票</h2>
      {tickets.length === 0 ? (
        <p>您还没有购买任何门票。</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <h3>{ticket.is_paid}</h3>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyTicket
