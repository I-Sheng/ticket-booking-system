import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = process.env.REACT_APP_API_URL

interface Ticket {
  _id: string
  activity_id: string
  region_id: string
  seat_number: number
  is_paid: boolean
}
const PaymentPage: React.FC = () => {
  const { id } = useParams()
  const { jwtToken, name, phone } = useAuth()
  const [ticket, setTicket] = useState<Ticket>() // 儲存票據詳情
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cardNumber, setCardNumber] = useState(['1234', '5678', '9012', '3456']) // 四個輸入框
  const [cvv, setCvv] = useState('123')
  const [expiryMonth, setExpiryMonth] = useState('01')
  const [expiryYear, setExpiryYear] = useState('27')

  const navigate = useNavigate()

  const fetchTicketDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets/get/${id}`, {
        method: 'GET',
        headers: { authorization: `${jwtToken}` },
        redirect: 'follow',
      })
      if (response.ok) {
        const data = await response.json() // 使用 API 獲取票據信息
        setTicket(data.ticket)
        setLoading(false)
      }
    } catch (error: any) {
      setError('無法獲取票據詳情')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTicketDetails(id)
    }
  }, [id])

  const handleCardInput = (index: number, value: string) => {
    if (/^\d{0,4}$/.test(value)) {
      const updatedCardNumber = [...cardNumber]
      updatedCardNumber[index] = value
      setCardNumber(updatedCardNumber)
    }
  }

  const handlePayment = async () => {
    if (
      cardNumber.some((num) => num.length < 4) ||
      !cvv ||
      !expiryMonth ||
      !expiryYear
    ) {
      alert('請填寫完整的信用卡信息')
      return
    }
    try {
      console.log('開始付款處理...')

      const myHeaders = new Headers()
      myHeaders.append('Authorization', `${jwtToken}`) // 使用 Context 中的 jwtToken
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

      const urlencoded = new URLSearchParams()
      urlencoded.append('ticket_id', id!)

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
      }
      const response = await fetch(
        `${API_URL}/tickets/buyTicket`,
        requestOptions
      )
      if (response.ok) {
        alert('付款成功')
        navigate(`/myTicket`)
      }else{
        alert('付款失敗')
      }
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
    return <div>找不到相應的票據{id}。</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>付款</h2>

      <div>
        <p>
          <strong>訂單編號: </strong>
          {ticket._id}
        </p>
        <p>
          <strong>訂單金額: </strong>
        </p>
        <p>
          <strong>座位: </strong>
          {ticket.seat_number}
        </p>
        <p>
          <strong>姓名: </strong>
          {name}
        </p>
        <p>
          <strong>電話: </strong>
          {phone}
        </p>

        {/* 新增信用卡輸入 */}
        <div style={{ marginTop: '20px' }}>
          <label>
            信用卡卡號
            <div style={{ display: 'flex', padding: '4px', gap: '5px' }}>
              {cardNumber.map((num, index) => (
                <input
                  disabled
                  key={index}
                  type="text"
                  value={num}
                  maxLength={4}
                  onChange={(e) => handleCardInput(index, e.target.value)}
                  style={{ width: '40px', padding: '4px', textAlign: 'center' }}
                />
              ))}
            </div>
          </label>
          <label style={{ display: 'block', marginTop: '10px' }}>
            信用卡檢查碼
            <div>
              <input
                disabled
                type="text"
                placeholder="xxx"
                value={cvv}
                onChange={(e) =>
                  /^\d{0,3}$/.test(e.target.value) && setCvv(e.target.value)
                }
                style={{ width: '40px', padding: '4px', margin: '5px' }}
              />
            </div>
          </label>
          <label style={{ display: 'block', marginTop: '10px' }}>
            信用卡到期日期
            <div style={{ display: 'flex', gap: '10px', padding: '4px' }}>
              <input
                disabled
                type="text"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) =>
                  /^\d{0,2}$/.test(e.target.value) &&
                  setExpiryMonth(e.target.value)
                }
                style={{ width: '40px', padding: '4px', textAlign: 'center' }}
              />
              <input
                disabled
                type="text"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) =>
                  /^\d{0,4}$/.test(e.target.value) &&
                  setExpiryYear(e.target.value)
                }
                style={{ width: '40px', padding: '4px', textAlign: 'center' }}
              />
            </div>
          </label>
        </div>
      </div>

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

      {/* <div style={{ marginTop: '10px' }}> */}
      {/*   <button */}
      {/*     onClick={() => navigate(-1)} */}
      {/*     style={{ */}
      {/*       padding: '10px 20px', */}
      {/*       backgroundColor: '#007bff', */}
      {/*       color: 'white', */}
      {/*       border: 'none', */}
      {/*       borderRadius: '5px', */}
      {/*       cursor: 'pointer', */}
      {/*       marginTop: '10px', */}
      {/*     }} */}
      {/*   > */}
      {/*     返回 */}
      {/*   </button> */}
      {/* </div> */}
    </div>
  )
}

export default PaymentPage
