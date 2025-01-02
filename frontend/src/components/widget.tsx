import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { formatDate } from '../context/kits'
import './Widget.css' // 引入 CSS 样式表

interface WidgetProps {
  id: string
  path: string
  imageUrl: { type: string; data: number[] }
  name: string
  on_sale_date: string
  start_date: string
  end_date: string
}

function Widget({
  imageUrl,
  name,
  start_date,
  end_date,
  path,
  id,
}: WidgetProps) {
  const { isLoggedIn } = useAuth()

  return (
    <Link to={`/${path}/${id}`} className="widget-container">
      {/* 照片区域 */}
      <div
        className="widget-image"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* 文字区域 */}
      <p className="widget-date">
        {formatDate(start_date) === formatDate(end_date)
          ? formatDate(start_date) // 如果开始和结束时间相同，只显示开始时间
          : `${formatDate(start_date)} ~ ${formatDate(end_date)}`}
      </p>
      <p className="widget-name">{name}</p>
    </Link>
  )
}

export default Widget

