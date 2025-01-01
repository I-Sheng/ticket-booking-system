// components/CreateActivity.tsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const CreateActivity: React.FC = () => {
  const { isLoggedIn, name, role } = useAuth()
  const [activityName, setActivityName] = useState('')
  const [activityDescription, setActivityDescription] = useState('')

  // 确保只有 host 角色的用户可以访问
  if (role !== 'host') {
    return <div>你没有权限访问此页面。</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 假设这里是用来提交活动的代码
    console.log('活动名称:', activityName)
    console.log('活动描述:', activityDescription)
    // 在这里处理提交逻辑，例如发送请求到后端
  }

  return (
    <div>
      <h2>创建活动</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            活动名称：
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            活动描述：
            <textarea
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">提交活动</button>
      </form>
    </div>
  )
}

export default CreateActivity

