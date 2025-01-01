import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listArena } from '../context/kits'
import { useNavigate } from 'react-router-dom'
const API_URL = process.env.REACT_APP_API_URL

interface Arena {
  _id: string
  title: string
  address: string
  capacity: number
}

const CreateActivity = () => {
  const { jwtToken, role } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [onSaleDate, setOnSaleDate] = useState('')
  const [arenaId, setArenaId] = useState('')
  const [regions, setRegions] = useState([
    { region_name: '', region_price: 0, region_capacity: 0 },
  ])
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const [priceLevelImg, setPriceLevelImg] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [arenas, setArenas] = useState<Arena[]>([])
  const navigate = useNavigate()

  React.useEffect(() => {
    listArena(setArenas)
  }, [])

  // 合併選擇的日期和時間
  const combineDateTime = (date: string, time: string): string => {
    return `${date}T${time}:00` // 合併成ISO日期時間格式
  }

  // 處理區域欄位的變更
  const handleRegionChange = (index: number, field: string, value: any) => {
    const updatedRegions: any[] = [...regions]
    updatedRegions[index][field] = value
    setRegions(updatedRegions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()

    // Append text fields to formData
    formData.append('title', title)
    formData.append('content', content)

    // Combine date and time for start_time and end_time
    const combinedStartTime = combineDateTime(activityDate, startTime)
    const combinedEndTime = combineDateTime(activityDate, endTime)

    formData.append('start_time', combinedStartTime)
    formData.append('end_time', combinedEndTime)
    formData.append('on_sale_date', onSaleDate)
    formData.append('arena_id', arenaId)

    regions.forEach((region, index) => {
      formData.append(`regions[${index}][region_name]`, region.region_name)
      formData.append(
        `regions[${index}][region_price]`,
        String(region.region_price)
      )
      formData.append(
        `regions[${index}][region_capacity]`,
        String(region.region_capacity)
      )
    })

    // Append files to formData
    if (coverImg) formData.append('cover_img', coverImg)
    if (priceLevelImg) formData.append('price_level_img', priceLevelImg)

    try {
      const response = await fetch(`${API_URL}/activities/create`, {
        method: 'POST',
        headers: {
          Authorization: `${jwtToken}`, // 提供jwt token
        },
        body: formData,
        redirect: 'follow',
      })

      if (response.ok) {
        const data = await response.json()
        alert('活動新增成功')
        console.log('Activity created:', data)
        setTitle('')
        setContent('')
        setActivityDate('')
        setStartTime('')
        setEndTime('')
        setOnSaleDate('')
        setArenaId('')
        setRegions([{ region_name: '', region_price: 0, region_capacity: 0 }])
        setCoverImg(null)
        setPriceLevelImg(null)

        // 跳轉回首頁
        navigate('/') // 使用useNavigate來導向首頁
      } else {
        const errorData = await response.json()
        setStatus(`Error: ${errorData.error}`)
      }
    } catch (error) {
      setStatus('Error: Failed to create activity')
      console.error('Error creating activity:', error)
    }
  }

  const handleAddRegion = () => {
    setRegions([
      ...regions,
      { region_name: '', region_price: 0, region_capacity: 0 },
    ])
  }

  if (role != 'host') {
    return <h2>Permissions denied</h2>
  }
  return (
    <div>
      <h2>新增活動</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="title">活動名稱：</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">說明：</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        {/* 變更為選擇日期和時間 */}
        <div>
          <label htmlFor="activity_date">活動日期：</label>
          <input
            type="date"
            id="activity_date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="start_time">開始時間：</label>
          <input
            type="time"
            id="start_time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="end_time">結束時間：</label>
          <input
            type="time"
            id="end_time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="on_sale_date">開賣日：</label>
          <input
            type="datetime-local"
            id="on_sale_date"
            value={onSaleDate}
            onChange={(e) => setOnSaleDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="arena_id">場館：</label>
          <select
            id="arena_id"
            value={arenaId}
            onChange={(e) => setArenaId(e.target.value)} // 當選擇時設置 arenaId 為 _id
            required
          >
            <option value="">選擇場館</option>
            {arenas.map((arena) => (
              <option key={arena._id} value={arena._id}>
                {arena.title}
              </option>
            ))}
          </select>
        </div>

        <h3>區域</h3>
        <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '10px' }}>
          區域名稱、價格、座位上限
        </p>
        {regions.map((region, index) => (
          <div key={index} className="region-fields">
            <input
              type="text"
              placeholder="區域名稱"
              value={region.region_name}
              onChange={(e) =>
                handleRegionChange(index, 'region_name', e.target.value)
              }
              required
            />
            <input
              type="number"
              placeholder="區域價格"
              value={region.region_price}
              onChange={(e) =>
                handleRegionChange(
                  index,
                  'region_price',
                  parseFloat(e.target.value)
                )
              }
              required
            />
            <input
              type="number"
              placeholder="座位上限"
              value={region.region_capacity}
              onChange={(e) =>
                handleRegionChange(
                  index,
                  'region_capacity',
                  parseInt(e.target.value)
                )
              }
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddRegion}>
          新增區域
        </button>

        <div
          style={{
            padding: '10px 15px',
          }}
        />
        <div>
          <label htmlFor="cover_img">封面圖</label>
          <input
            type="file"
            id="cover_img"
            accept="image/*"
            onChange={(e) =>
              setCoverImg(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>
        <div>
          <label htmlFor="price_level_img">價位圖</label>
          <input
            type="file"
            id="price_level_img"
            accept="image/*"
            onChange={(e) =>
              setPriceLevelImg(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        <button type="submit">確認新增</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  )
}

export default CreateActivity
