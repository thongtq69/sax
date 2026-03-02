export function isProductSoldOut(product: {
  inStock?: boolean | null
  stock?: number | null
  stockStatus?: string | null
}): boolean {
  if (product.stockStatus === 'sold-out') return true
  if (product.stockStatus === 'pre-order') return false

  if (typeof product.stock === 'number') {
    return product.stock <= 0
  }

  return product.inStock === false
}
