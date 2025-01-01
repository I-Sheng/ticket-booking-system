import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
const API_URL = process.env.REACT_APP_API_URL

const PaymentPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>()
  const [ticket, setTicket] = useState<any>(null)  // 儲存票據詳情
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  // 假設有一個 API 函數來根據票據ID查詢詳細資料
  const fetchTicketDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets/${id}`)
      const data = response.json()  // 使用 API 獲取票據信息
      setTicket(data)
    } catch (error: any) {
      setError('無法獲取票據詳情')
    } finally {
      setLoading(false)
    }
  }

  // 用戶在初始化頁面時加載票據詳細信息
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId)
    }
  }, [ticketId])

  const handlePayment = async () => {
    try {
      // 模擬付款處理，應該替換為實際的付款邏輯（例如調用支付API）
      console.log('開始付款處理...')
      // 完成支付後，將票務設置為已付款，或者調用API更新支付狀態
      // 用navigate來導向成功頁面或主頁
      navigate(`/payment-success/${ticketId}`)
    } catch (error) {
      setError('付款失敗，請重試。')
    }
  }

  if (loading) {
    return <div>正在加載...</div>
  }

  if (error) {
    return <div>錯誤: {error}</div>
  }

  if (!ticket) {
    return <div>找不到相應的票據。</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>付款頁面</h2>
      
      {/* 顯示票據詳細信息 */}
      <div>
        <h3>訂單詳情</h3>
        <p><strong>訂單編號: </strong>{ticket._id}</p>
        <p><strong>活動名稱: </strong>{ticket.activity.title}</p>
        <p><strong>座位號: </strong>{ticket.seat_number}</p>
        <p><strong>區域: </strong>{ticket.region_name}</p>
        <p>
          <strong>總額: </strong>￥{ticket.price}
        </p>
      </div>

      {/* 顯示付款按鈕 */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handlePayment}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          立即付款
        </button>
      </div>

      {/* 返回按鈕，返回票據詳細頁或訂單頁面 */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => navigate(-1)}  // 使用navigate(-1)來返回上一頁
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          返回
        </button>
      </div>
    </div>
  )
}

export default PaymentPage

