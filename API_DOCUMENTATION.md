# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Products API

### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `category` - Filter by category ID
- `subcategory` - Filter by subcategory ID
- `brand` - Filter by brand
- `search` - Search in name, brand, description, SKU
- `inStock` - Filter by stock status (true/false)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Example:**
```
GET /api/products?category=woodwinds&search=flute&page=1&limit=10
```

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 16,
    "totalPages": 2
  }
}
```

### Get Product by ID
```
GET /api/products/[id]
```

### Get Product by Slug
```
GET /api/products/slug/[slug]
```

### Create Product
```
POST /api/products
```

**Body:**
```json
{
  "name": "Product Name",
  "slug": "product-slug",
  "brand": "Brand Name",
  "price": 999.99,
  "retailPrice": 1199.99,
  "categoryId": "category-id",
  "subcategoryId": "subcategory-id",
  "images": ["/images/product.jpg"],
  "badge": "new",
  "inStock": true,
  "stock": 10,
  "description": "Product description",
  "specs": {"key": "value"},
  "included": ["item1", "item2"],
  "warranty": "1 year",
  "sku": "SKU-123",
  "rating": 4.5,
  "reviewCount": 10
}
```

### Update Product
```
PUT /api/products/[id]
```

### Delete Product
```
DELETE /api/products/[id]
```

## Categories API

### Get All Categories
```
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "...",
    "name": "Woodwinds",
    "slug": "woodwinds",
    "path": "/shop/woodwinds",
    "subcategories": [...]
  }
]
```

### Create Category
```
POST /api/categories
```

**Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "path": "/shop/category-slug",
  "subcategories": [
    {
      "name": "Subcategory Name",
      "slug": "subcategory-slug",
      "path": "/shop/category/subcategory"
    }
  ]
}
```

## Blog API

### Get All Blog Posts
```
GET /api/blog
```

**Query Parameters:**
- `category` - Filter by category name
- `search` - Search in title, excerpt, content, author
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /api/blog?category=Saxophones&page=1&limit=5
```

### Get Blog Post by ID
```
GET /api/blog/[id]
```

### Get Blog Post by Slug
```
GET /api/blog/slug/[slug]
```

### Create Blog Post
```
POST /api/blog
```

**Body:**
```json
{
  "title": "Blog Post Title",
  "slug": "blog-post-slug",
  "excerpt": "Short excerpt",
  "content": "<p>HTML content</p>",
  "date": "2024-12-28",
  "author": "Author Name",
  "categories": ["Category1", "Category2"],
  "image": "/images/blog/image.jpg",
  "readTime": 5
}
```

### Update Blog Post
```
PUT /api/blog/[id]
```

### Delete Blog Post
```
DELETE /api/blog/[id]
```

## Promos API

### Get All Promo Banners
```
GET /api/promos
```

### Get Promo Banner by ID
```
GET /api/promos/[id]
```

### Create Promo Banner
```
POST /api/promos
```

**Body:**
```json
{
  "title": "Promo Title",
  "description": "Promo description",
  "image": "/images/promo.jpg",
  "ctaText": "Shop Now",
  "ctaLink": "/shop"
}
```

### Update Promo Banner
```
PUT /api/promos/[id]
```

### Delete Promo Banner
```
DELETE /api/promos/[id]
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `404` - Not Found
- `409` - Conflict (duplicate slug/SKU)
- `500` - Internal Server Error

