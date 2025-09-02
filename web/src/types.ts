export type Product = {
  id: number
  name: string
  slug: string
  price: number
  short_description?: string
  usage?: string
  warnings?: string
  image?: string // ruta relativa: /api/static/products/xxx.jpg
}
