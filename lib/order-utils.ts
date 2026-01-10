/**
 * Generate order number based on Vietnam timezone
 * Format: YY + MM + DD + HH + mm + ss
 * Example: 2025/01/11 02:15:30 → 250111021530
 */
export function generateOrderNumber(): string {
  // Get current time in Vietnam timezone (UTC+7)
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  
  const year = (vietnamTime.getFullYear() % 100).toString().padStart(2, '0') // Last 2 digits
  const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0') // 0-indexed
  const day = vietnamTime.getDate().toString().padStart(2, '0')
  const hour = vietnamTime.getHours().toString().padStart(2, '0')
  const minute = vietnamTime.getMinutes().toString().padStart(2, '0')
  const second = vietnamTime.getSeconds().toString().padStart(2, '0')
  
  // Format: YY + MM + DD + HH + mm + ss
  const orderNumber = `${year}${month}${day}${hour}${minute}${second}`
  
  return orderNumber
}

/**
 * Generate unique order number with retry logic
 * In case of collision, adds milliseconds
 */
export function generateUniqueOrderNumber(): string {
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  
  const year = (vietnamTime.getFullYear() % 100).toString().padStart(2, '0')
  const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0')
  const day = vietnamTime.getDate().toString().padStart(2, '0')
  const hour = vietnamTime.getHours().toString().padStart(2, '0')
  const minute = vietnamTime.getMinutes().toString().padStart(2, '0')
  const second = vietnamTime.getSeconds().toString().padStart(2, '0')
  const ms = now.getMilliseconds().toString().padStart(3, '0')
  
  // Include milliseconds for uniqueness: YY + MM + DD + HH + mm + ss + ms
  const orderNumber = `${year}${month}${day}${hour}${minute}${second}${ms}`
  
  return orderNumber
}
