import React, { useState } from 'react'
import Widget from './widget'
import { useAuth } from '../context/AuthContext'
import { listArena } from '../context/kits'
import { useNavigate } from 'react-router-dom'
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

const ManageActivities = () => {
  const { jwtToken, role } = useAuth()
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [arenaId, setArenaId] = React.useState('')
  const fetchActivities = async (arenaId: any) => {
    try {
      const response = await fetch(`${API_URL}/activities/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities) // 使用后端返回的 activities 数据
      } else {
        console.error('Failed to fetch activities:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  React.useEffect(() => {
    fetchActivities(arenaId) // 页面加载时获取活动数据
  }, [])

  if (role != 'host') {
    return <h2>Permissions denied</h2>
  }
  return (
    <div>
      <p style={{ letterSpacing: '1.3px', color: '#666', fontSize: '14px' }}>
        管理活動
      </p>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {activities.length == 0 && <p>尚無活動</p>}
        {activities.map((activity) => (
          <Widget
            key={activity._id}
            id={activity._id}
            path={'editActivity'}
            name={activity.title}
            on_sale_date={activity.on_sale_date}
            start_date={activity.start_time}
            end_date={activity.end_time}
            imageUrl={activity.cover_img}
          />
        ))}
      </div>
    </div>
  )
}

export default ManageActivities
