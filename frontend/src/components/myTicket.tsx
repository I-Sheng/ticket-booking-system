// components/MyTicket.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Ticket {
  id: number
  event_name: string
  event_date: string
  ticket_type: string
  price: number
}

const MyTicket: React.FC = () => {
  const { isLoggedIn, role } = useAuth()
  // const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tickets: Ticket[] = [
    {
      id: 1,
      event_name: '周杰倫',
      event_date: '2024-12-25',
      ticket_type: 'VIP',
      price: 100,
    },
    {
      id: 2,
      event_name: '音乐会',
      event_date: '2025-01-10',
      ticket_type: '普通票',
      price: 50,
    },
    {
      id: 3,
      event_name: '电影放映',
      event_date: '2024-12-30',
      ticket_type: '学生票',
      price: 30,
    },
  ]
  // useEffect(() => {
  //   if (isLoggedIn) {
  //     // 假设我们已经将 `jwt_token` 存储在 `localStorage` 中，并将它传递给请求
  //     const token = localStorage.getItem('jwt_token')
  //     if (token) {
  //       fetchTickets(token)
  //     } else {
  //       setError('未找到用户登录信息，请重新登录')
  //     }
  //   }
  // }, [isLoggedIn])
  //
  // // 获取已购票数据
  // const fetchTickets = async (token: string) => {
  //   try {
  //     const response = await fetch('/api/tickets', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`, // 将 JWT token 添加到请求头
  //       },
  //     })
  //
  //     if (!response.ok) {
  //       throw new Error('无法获取票务数据')
  //     }
  //
  //     const data = await response.json()
  //     setTickets(data)
  //   } catch (err: any) {
  //     setError(err.message || '发生错误')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // if (loading) {
  //   return <div>正在加载票务信息...</div>
  // }

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
              <h3>{ticket.event_name}</h3>
              <p>时间：{ticket.event_date}</p>
              <p>票种：{ticket.ticket_type}</p>
              <p>价格：{ticket.price}元</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyTicket
