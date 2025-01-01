import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom' // 导入 useNavigate
import { getArena } from '../context/kits'

const API_URL = process.env.REACT_APP_API_URL

interface Arena {
  _id: string
  title: string
  address: string
  capacity: number
}

interface Region {
  region_name: string
  region_price: number
  region_capacity: number
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
  regions: Region[]
}

const ActivityPage: React.FC = () => {
  const { id } = useParams() // 获取活动的 ID
  const navigate = useNavigate() // useNavigate 用來導航
  const [activity, setActivity] = useState<Activity | null>(null)
  const [arena, setArena] = useState<Arena | null>(null)

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
        setActivity(data.activity) // 假设后端返回的数据中包含 activity 属性
        getArena(setArena, data.activity.arena_id)
      } else {
        console.error('Failed to fetch activity:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  useEffect(() => {
    fetchActivity(id!)
  }, [id])

  // 購票頁面導航
  const handleBuyTicket = () => {
    navigate(`/buy-ticket/${id}`) // 假設購票頁面的路徑是 /buy-ticket/活動ID
  }

  if (!activity) {
    return (
      <>
        <p>loading...</p>
      </>
    )
  }

  return (
    <div>
      <h2>{activity.title}</h2>
      <p>
        <strong>地點：</strong>
        {arena?.title} ({arena?.address})
      </p>
      <p>
        <strong>說明：</strong>
        {activity.content}
      </p>

      <button onClick={handleBuyTicket}>購票</button> {/* 購票按鈕 */}
    </div>
  )
}

export default ActivityPage

