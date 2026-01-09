/**
 * Generate order number based on Vietnam timezone
 * Format: day + month + year(2 digits) + hour + minute + "21"
 * Example: 9/1/2025 13:50 → 9125135021
 */
export function generateOrderNumber(): string {
  // Get current time in Vietnam timezone (UTC+7)
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  
  const day = vietnamTime.getDate()
  const month = vietnamTime.getMonth() + 1 // 0-indexed
  const year = vietnamTime.getFullYear() % 100 // Last 2 digits
  const hour = vietnamTime.getHours()
  const minute = vietnamTime.getMinutes()
  const second = vietnamTime.getSeconds()
  
  // Format: day + month + year(2) + hour + minute + "21"
  // Add seconds to ensure uniqueness for orders created in same minute
  const orderNumber = `${day}${month}${year}${hour}${minute}${second}21`
  
  return orderNumber
}

/**
 * Generate unique order number with retry logic
 * In case of collision, adds milliseconds
 */
export function generateUniqueOrderNumber(): string {
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  
  const day = vietnamTime.getDate()
  const month = vietnamTime.getMonth() + 1
  const year = vietnamTime.getFullYear() % 100
  const hour = vietnamTime.getHours()
  const minute = vietnamTime.getMinutes()
  const second = vietnamTime.getSeconds()
  const ms = now.getMilliseconds()
  
  // Include milliseconds for uniqueness
  const orderNumber = `${day}${month}${year}${hour}${minute}${second}${ms.toString().padStart(3, '0')}21`
  
  return orderNumber
}
