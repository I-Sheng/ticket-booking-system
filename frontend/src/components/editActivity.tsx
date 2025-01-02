import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listArena } from '../context/kits'
import { useNavigate, useParams } from 'react-router-dom'
import { convertToObject } from 'typescript'
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

const EditActivity = () => {
  const { id } = useParams()
  const { jwtToken, role } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [onSaleDate, setOnSaleDate] = useState('')
  const [arenaId, setArenaId] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [originRegions, setOriginRegions] = useState<Region[]>([])
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const [priceLevelImg, setPriceLevelImg] = useState<File | null>(null)

  const [status, setStatus] = useState('')
  const [arenas, setArenas] = useState<Arena[]>([])
  const navigate = useNavigate()
  const [isOnSale, setIsOnSale] = useState(false)

  const checkIsOnSale = () => {
    if (isOnSale) return
    const today = new Date()
    const saleDate = new Date(onSaleDate)
    const disabled = saleDate > today
    setIsOnSale(disabled)
  }
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
        const activityData = data.activity // 確保資料格式正確

        // 設定表單預設值
        setTitle(activityData.title || '')
        setContent(activityData.content || '')
        setActivityDate(
          activityData.start_time ? activityData.start_time.split('T')[0] : ''
        )
        setStartTime(
          activityData.start_time
            ? activityData.start_time.split('T')[1].slice(0, 5)
            : ''
        )
        setEndTime(
          activityData.end_time
            ? activityData.end_time.split('T')[1].slice(0, 5)
            : ''
        )
        setArenaId(activityData.arena_id || '')
        if (activityData.regions && Array.isArray(activityData.regions)) {
          setRegions(
            activityData.regions.map((region: Region) => ({
              region_name: region.region_name || '',
              region_price: region.region_price || 0,
              region_capacity: region.region_capacity || 0,
            }))
          )
        }
        setOriginRegions(activityData.regions)
        setCoverImg(activityData.cover_img as File)
        setPriceLevelImg(activityData.price_level_img as File)
        // console.log(activityData)
        const formatToInputDateTime = (isoDateTime: string | undefined) => {
          if (!isoDateTime) return '' // 若未定義值，返回空字串
          const date = new Date(isoDateTime) // 確保是日期對象
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0') // 月份補 0
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0') // 小時補 0
          const minutes = String(date.getMinutes()).padStart(2, '0') // 分鐘補 0
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }
        setOnSaleDate(activityData.on_sale_date || '')
        setOnSaleDate(formatToInputDateTime(activityData?.on_sale_date))
      } else {
        console.error('Failed to fetch activity:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  React.useEffect(() => {
    listArena(setArenas)
    fetchActivity(id!)
  }, [])
  React.useEffect(() => {
    checkIsOnSale()
  }, [onSaleDate])

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
    setStatus('')
    const regionNames = regions.map((region) => region.region_name)
    const hasDuplicateRegionNames =
      new Set(regionNames).size !== regionNames.length

    if (hasDuplicateRegionNames) {
      alert('區域名稱不能重複，請修改後再送出')
      return
    }
    const hasInvalidRegion = regions.some(
      (region) => region.region_price === 0 || region.region_capacity === 0
    )

    if (hasInvalidRegion) {
      alert('價格或座位不能為0，請修改後再送出')
      return // 防止送出
    }
    if (
      !title ||
      !content ||
      !activityDate ||
      !startTime ||
      !endTime ||
      !onSaleDate ||
      !arenaId ||
      regions.length == 0
    ) {
      alert('資料不得為空')
      return
    }
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
      const response = await fetch(`${API_URL}/activities/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `${jwtToken}`, // 提供jwt token
        },
        body: formData,
        redirect: 'follow',
      })

      if (response.ok) {
        alert('更新成功')
        navigate('/manage-activity')
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
  const handleRemoveRegion = (index: number) => {
    const updatedRegions = regions.filter((_, i) => i !== index)
    setRegions(updatedRegions)
  }

  return (
    <div className="create-activity-container">
      <p className="page-title">管理 / 管理活動</p>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="title">活動名稱：</label>
          <input
            disabled={isOnSale}
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="content">說明：</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="textarea"
          ></textarea>
        </div>

        {/* 變更為選擇日期和時間 */}
        <div>
          <label htmlFor="activity_date">活動日期：</label>
          <input
            type="date"
            disabled={isOnSale}
            id="activity_date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="start_time">開始時間：</label>
          <input
            type="time"
            disabled={isOnSale}
            id="start_time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="end_time">結束時間：</label>
          <input
            type="time"
            disabled={isOnSale}
            id="end_time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="on_sale_date">開賣日：</label>
          <input
            type="datetime-local"
            disabled={isOnSale}
            id="on_sale_date"
            value={onSaleDate}
            onChange={(e) => setOnSaleDate(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="arena_id">場館：</label>
          <select
            id="arena_id"
            disabled={isOnSale}
            value={arenaId}
            onChange={(e) => setArenaId(e.target.value)} // 當選擇時設置 arenaId 為 _id
            required
            className="select"
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
        <p className="sub-description">區域名稱、價格、座位上限</p>
        {regions.map((region, index) => {
          const isNewRegion = !originRegions.some(
            (origRegion) =>
              origRegion.region_name === region.region_name &&
              origRegion.region_price === region.region_price &&
              origRegion.region_capacity === region.region_capacity
          )
          return (
            <div key={index} className="region-fields">
              <input
                type="text"
                disabled={isOnSale && !isNewRegion}
                placeholder="區域名稱"
                value={region.region_name}
                onChange={(e) =>
                  handleRegionChange(index, 'region_name', e.target.value)
                }
                required
                className="input-region"
              />
              <input
                type="number"
                disabled={isOnSale && !isNewRegion}
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
                className="input-region"
              />
              <input
                type="number"
                disabled={isOnSale && !isNewRegion}
                placeholder="座位上限"
                value={region.region_capacity}
                onChange={(e) =>
                  handleRegionChange(
                    index,
                    'region_capacity',
                    parseInt(e.target.value)
                  )
                }
                className="input-region"
                required
              />
              {(isNewRegion || !isOnSale) && (
                <button
                  type="button"
                  onClick={() => handleRemoveRegion(index)}
                  className="remove-button"
                >
                  X
                </button>
              )}
            </div>
          )
        })}
        <button type="button" onClick={handleAddRegion} className="add-button">
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
            className="input-file"
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
            className="input-file"
          />
        </div>

        <button type="submit" className="submit-button">
          確認修改
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  )
}

export default EditActivity
