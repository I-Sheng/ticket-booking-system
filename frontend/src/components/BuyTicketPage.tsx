import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
    region_name: string
    region_price: number
    region_capacity: number
  }[]
}

const BuyTicketPage: React.FC = () => {
  const { id } = useParams() // 獲取活動ID
  const [activity, setActivity] = useState<Activity | null>(null)
  const [arena, setArena] = useState<Arena | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('') // 選擇區域
  const [ticketQuantity, setTicketQuantity] = useState<number>(1) // 訂票數量

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

  useEffect(() => {
    if (id) {
      fetchActivity(id) // 根據 ID 獲取活動資料
    }
  }, [id])

  // 計算總金額
  const calculateTotal = () => {
    if (activity && selectedRegion) {
      const region = activity.regions.find((r) => r.region_name === selectedRegion)
      if (region) {
        return region.region_price * ticketQuantity
      }
    }
    return 0
  }

  // 提交購票
  const handleBuyTickets = () => {
    if (!selectedRegion || ticketQuantity <= 0) {
      alert('請選擇區域並輸入有效的數量')
      return
    }

    // 在此執行實際的購票邏輯，如 API 提交等
    alert('購票成功！')
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
            <option key={region.region_name} value={region.region_name}>
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
          onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value)))}
          min="1"
          disabled
          required
        />
      </div>

      <div>
        <p>
          <strong>總金額：</strong>${calculateTotal()}
        </p>
      </div>

      <button onClick={handleBuyTickets}>立即購票</button>
    </div>
  )
}

export default BuyTicketPage

