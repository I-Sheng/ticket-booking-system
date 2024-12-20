import { Pool, PoolClient, QueryResultRow } from 'pg'
import { env } from '../constants'

declare module 'pg' {
  interface PoolClient {
    lastQuery?: any[]
    query: (...args: any[]) => Promise<QueryResult<any>>
    release: (err?: boolean | Error | undefined) => void
  }
}

// 創建連線池
const pool = new Pool({
  connectionString: env.DATABASE_URL, // 確保 .env 文件中有此變數
})

// 封裝 query 方法
export async function query<
  R extends QueryResultRow = any,
  I extends any[] | undefined = any[],
>(text: string, params: I) {
  const start = Date.now()
  console.log('executing query', { text })
  const res = await pool.query<R>(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}

// 獲取單個 client
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  const query = client.query
  const release = client.release

  // 設置5秒的超時，檢測是否有長時間占用的連線
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
    console.error(
      `The last executed query on this client was: ${client.lastQuery}`
    )
  }, 5000)

  // 補丁方法，記錄最後執行的查詢
  client.query = (...args: any[]) => {
    client.lastQuery = args
    return query.apply(client, args)
  }
  const originalRelease = client.release
  client.release = () => {
    // 清除超時
    clearTimeout(timeout)
    // 恢復方法
    client.query = query
    client.release = originalRelease
    return release.apply(client)
  }
  return client
}

