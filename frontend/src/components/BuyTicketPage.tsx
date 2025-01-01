import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getArena } from '../context/kits'

const API_URL = process.env.REACT_APP_API_URL

interface Arena {
  _id: string
  title: string
  address: string
  capacity: number
}

interface Activity {
  _id: string
  on_sale_date: string
  start_time: string
  end_time: string
  title: string
  content: string
  cover_img: { type: string; data: number[] }
  price_level_img: { type: string; data: number[] }
  arena_id: string
  creator_id: string
  is_archived: boolean
  regions: {
    _id: string
    region_name: string
    region_price: number
    region_capacity: number
  }[]
}

const BuyTicketPage: React.FC = () => {
  const { id } = useParams() // 獲取活動ID
  const { jwtToken } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [arena, setArena] = useState<Arena | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('') // 選擇區域
  const [ticketQuantity, setTicketQuantity] = useState<number>(1) // 訂票數量
  const [leftCapacity, setLeftCapacity] = useState<number>(0) // 剩餘座位數
  const navigate = useNavigate()

  // 獲取活動資料
  const fetchActivity = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/activities/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setActivity(data.activity) // 保存活動資料
        getArena(setArena, data.activity.arena_id)
        // 可能還需要調用 API 獲取 arena 資訊
      } else {
        console.error('Failed to fetch activity:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }
  const fetchTicketByRegion = async (regionId: string, isPaid: boolean) => {
    const url = new URL(`${API_URL}/tickets/list-by-region`)
    url.searchParams.append('region_id', regionId)
    url.searchParams.append('is_paid', isPaid.toString())

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Authorization: `${jwtToken}` },
        redirect: 'follow',
      })

      if (response.ok) {
        const data = await response.json()
        setLeftCapacity(data.tickets.length) // 确保这里有正确定义的 state 设置函数
      } else {
        console.error('Failed to fetch tickets:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
    }
  }
  useEffect(() => {
    if (id) {
      fetchActivity(id) // 根據 ID 獲取活動資料
    }
  }, [id])
  useEffect(() => {
    if (selectedRegion) {
      fetchTicketByRegion(selectedRegion, false) // 獲取選擇區域的剩餘座位數
    }
  }, [selectedRegion])
  // 計算總金額
  const calculateTotal = () => {
    if (activity && selectedRegion) {
      const region = activity.regions.find((r) => r._id === selectedRegion)
      if (region) {
        return region.region_price * 1
      }
    }
    return 0
  }

  // 提交購票
  const reserveTickets = async () => {
    if (!selectedRegion) return
    try {
      const myHeaders = new Headers()
      myHeaders.append('Authorization', `${jwtToken}`) // 使用 Context 中的 jwtToken
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

      const urlencoded = new URLSearchParams()
      urlencoded.append('region_id', selectedRegion)

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
      }

      const response = await fetch(
        `${API_URL}/tickets/reserveTicket`,
        requestOptions
      )

      if (response.ok) {
        const result = await response.json()
        console.log('Reservation success:', result)
        alert('購票成功！')
        navigate('/myTicket')
      } else {
        console.error('Reservation failed:', response.statusText)
        alert('購票失敗，請再試一次！')
      }
    } catch (error) {
      console.error('Error reserving ticket:', error)
      alert('系統錯誤，請稍後再試！')
    }
  }
  const handleBuyTickets = () => {
    if (!selectedRegion || ticketQuantity <= 0) {
      alert('請選擇區域')
      return
    }
    reserveTickets()

    // 在此執行實際的購票邏輯，如 API 提交等
  }

  if (!activity || !arena) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h2>{activity.title} - 購票頁面</h2>
      <p>
        <strong>地點：</strong>
        {arena?.title} ({arena?.address})
      </p>
      <p>{activity.content}</p>

      <div>
        <label htmlFor="region">選擇區域：</label>
        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          required
        >
          <option value="">請選擇區域</option>
          {activity.regions.map((region) => (
            <option key={region._id} value={region._id}>
              {region.region_name} - ${region.region_price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ticketQuantity">數量：</label>
        <input
          type="number"
          id="ticketQuantity"
          value={ticketQuantity}
          onChange={(e) =>
            setTicketQuantity(Math.max(1, parseInt(e.target.value)))
          }
          min="1"
          disabled
          required
        />
      </div>

      <div>
        <p>
          <strong>剩餘座位數：</strong>
          {selectedRegion && (
            <>
              {leftCapacity}/
              {activity.regions.find((r) => r._id === selectedRegion)
                ?.region_capacity || 'N/A'}
            </>
          )}
        </p>{' '}
        <p>
          <strong>總金額：</strong>${calculateTotal()}
        </p>
        <p>
          <strong>regionId：</strong>
          {selectedRegion}
        </p>
      </div>

      {leftCapacity == 0 ? (
        <button disabled>已售罄</button>
      ) : (
        <button onClick={handleBuyTickets}>立即購票</button>
      )}
    </div>
  )
}

export default BuyTicketPage
