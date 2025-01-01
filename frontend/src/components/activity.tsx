// components/activity.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext' // 確保導入 useAuth
import { useParams } from 'react-router-dom'
const API_URL = process.env.REACT_APP_API_URL

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
  const [activity, setActivity] = useState<Activity | null>(null)
  const [status, setStatus] = useState<string>('')
  const fetchActivity = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/activities/get/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('data',data)
        setStatus('ok')
        setActivity(data.activity) // 假设后端返回的数据中包含 activity 属性
      } else {
        setStatus('error')
        console.error('Failed to fetch activity:', response.statusText)
      }
    } catch (error) {
      setStatus('error')
      console.error('Error fetching activity:', error)
    }
  }
  useEffect(() => {
    fetchActivity(id!)
  }, [id])

  if (!activity) {
    return (
      <>
        <p>loading...</p>
        <p>{status}</p>
      </>
    )
  }

  return (
    <div>
      <p>{activity?.title}</p>
      {/* <h2>{activity.name}</h2> */}
      {/* <p> */}
      {/*   <strong>时间：</strong> */}
      {/*   {activity.date} */}
      {/* </p> */}
      {/* <p> */}
      {/*   <strong>地点：</strong> */}
      {/*   {activity.location} */}
      {/* </p> */}
      {/* <p>{activity.description}</p> */}
    </div>
  )
}

export default ActivityPage
