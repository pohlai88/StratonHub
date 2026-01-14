# API Reference Guide

**Last Updated:** Current Session

---

## Base URL

All API endpoints are relative to your application base URL:
- Development: `http://localhost:3000`
- Production: Your production URL

---

## Users API

### List Users

```http
GET /api/users?page=1&pageSize=10
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 10, max: 100) - Items per page

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "deletedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Create User

```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "deletedAt": null
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

### Get User

```http
GET /api/users/{id}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "deletedAt": null
}
```

**Errors:**
- `404` - User not found

### Update User

```http
PATCH /api/users/{id}
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

**Response:** `200 OK` (same as Get User)

**Errors:**
- `400` - Validation error
- `404` - User not found

### Delete User

```http
DELETE /api/users/{id}
```

**Response:** `200 OK` (soft deleted user)

**Errors:**
- `404` - User not found

### Get User's Posts

```http
GET /api/users/{id}/posts?page=1&pageSize=10
```

**Response:** `200 OK`
```json
{
  "posts": [...],
  "pagination": {...}
}
```

---

## Posts API

### List Published Posts

```http
GET /api/posts?page=1&pageSize=10
```

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Post Title",
      "content": "Post content...",
      "slug": "post-slug",
      "published": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "deletedAt": null,
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {...}
}
```

### Create Post

```http
POST /api/posts
Content-Type: application/json

{
  "userId": "uuid",
  "title": "My Post",
  "content": "Post content here...",
  "slug": "my-post"
}
```

**Response:** `201 Created`

**Errors:**
- `400` - Validation error
- `409` - Slug already exists

### Get Post with Author

```http
GET /api/posts/{id}
```

**Response:** `200 OK` (includes author object)

### Update Post

```http
PATCH /api/posts/{id}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

### Publish Post

```http
POST /api/posts/{id}/publish
```

**Response:** `200 OK` (post with published timestamp)

### Delete Post

```http
DELETE /api/posts/{id}
```

**Response:** `200 OK` (soft deleted post)

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "field": "field-name" // Optional, for validation errors
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (unique constraint violation)
- `500` - Internal Server Error

---

## Best Practices

1. **Always validate input** - Use curated schemas
2. **Handle errors properly** - Check error types
3. **Use pagination** - Don't fetch all records
4. **Respect soft deletes** - Deleted records are filtered automatically
5. **Use relations** - Prefer JOIN queries over multiple queries

---

**Last Updated:** Current Session
