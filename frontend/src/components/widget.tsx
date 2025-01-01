// src/components/widget.tsx
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { formatDate } from '../context/kits'

interface WidgetProps {
  id: string // 假设每个活动有唯一的 id
  imageUrl: { type: string; data: number[] }
  name: string
  on_sale_date: string
  start_date: string
  end_date: string
}

function Widget({ imageUrl, name, start_date, end_date, id }: WidgetProps) {
  const { isLoggedIn } = useAuth()

  function formatDate(dateString:string) {
    // 将字符串解析为 Date 对象
    const date = new Date(dateString)

    // 确保有效的日期
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string')
    }

    // 获取日期的组成部分
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0')

    // 获取星期几
    const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = `${weekDayNames[date.getDay()]}`

    // 返回格式化的日期字符串
    return `${year}/${month}/${day} (${weekDay})`
  }

  // 测试
  const formattedDate = formatDate('2024-12-25')
  console.log(formattedDate) // 输出: 2024/12/25 (星期三)

  return (
    <Link
      to={`/activity/${id}`} // 使用模板字符串来传递动态的 ID
      style={{
        display: 'block',
        width: '300px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        textAlign: 'center',
        justifyItems: 'left',
      }}
    >
      {/* 照片区域 */}
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* 文字区域 */}
      <p
        style={{
          padding: '10px 15px',
          margin: 0,
          fontSize: '16px',
          color: '#333',
        }}
      >
        {formatDate(start_date)}
      </p>
      <p
        style={{
          padding: '0px 15px 15px',
          margin: 0,
          fontSize: '16px',
          color: '#333',
        }}
      >
        {name}
      </p>
    </Link>
  )
}

export default Widget
