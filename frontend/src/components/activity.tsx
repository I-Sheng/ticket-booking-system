// components/activity.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface Activity {
  id: number
  name: string
  description: string
  date: string
  location: string
}

const ActivityPage: React.FC = () => {
  const { id } = useParams()  // 获取活动的 ID
  const [activity, setActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (id) {
      // 模拟获取活动数据，实际情况应该是通过 API 请求获取
      const fetchedActivity: Activity = {
        id: Number(id),
        name: `活动 ${id}`,
        description: `这是活动 ${id} 的描述`,
        date: '2024-12-30',
        location: '活动地点',
      }

      setActivity(fetchedActivity)
    }
  }, [id])

  if (!activity) {
    return <p>活动加载中...</p>
  }

  return (
    <div>
      <h2>{activity.name}</h2>
      <p><strong>时间：</strong>{activity.date}</p>
      <p><strong>地点：</strong>{activity.location}</p>
      <p>{activity.description}</p>
    </div>
  )
}

export default ActivityPage

