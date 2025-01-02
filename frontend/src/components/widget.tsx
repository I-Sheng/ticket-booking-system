// src/components/widget.tsx
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { formatDate } from '../context/kits'

interface WidgetProps {
  id: string
  path: string
  imageUrl: { type: string; data: number[] }
  name: string
  on_sale_date: string
  start_date: string
  end_date: string
}

function Widget({ imageUrl, name, start_date, end_date,path, id }: WidgetProps) {
  const { isLoggedIn } = useAuth()

  return (
    <Link
      to={`/${path}/${id}`} // 使用模板字符串来传递动态的 ID
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
      />

      {/* 文字区域 */}
      <p
        style={{
          padding: '10px 15px',
          margin: 0,
          fontSize: '16px',
          color: '#333',
        }}
      >
        {formatDate(start_date) === formatDate(end_date)
          ? formatDate(start_date) // 如果开始和结束时间相同，只显示开始时间
          : `${formatDate(start_date)} ~ ${formatDate(end_date)}`}{' '}
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
