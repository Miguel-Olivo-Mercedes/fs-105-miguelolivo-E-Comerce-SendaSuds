export type Product = {
  id: number
  name: string
  slug: string
  price: number
  short_description?: string
  usage?: string
  warnings?: string
  image?: string
}

export type CartProduct = {
  id: number
  name: string
  slug: string
  price: number
  image?: string
  short_description?: string
}

export type CartItem = {
  id: number
  product_id: number
  qty: number
  product: CartProduct
  line_total: number
}

export type CartResponse = {
  items: CartItem[]
  subtotal: number
}
