import React from 'react'

export function formatDate(dateString: string) {
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
