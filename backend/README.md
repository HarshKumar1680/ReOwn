# ReOwn Backend API

A complete authentication and user management backend system with MongoDB Atlas, Mongoose, and JWT authentication.

## Features

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Password Hashing with bcryptjs
- ✅ Admin CRUD Operations
- ✅ User Role Management
- ✅ MongoDB Atlas Integration
- ✅ CORS Enabled
- ✅ Error Handling

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/reown_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=24h
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Replace the `MONGODB_URI` in your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication Routes

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update User Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123" // optional
}
```

### Admin Routes (Admin Only)

#### Get All Users
- **GET** `/api/admin/users`
- **Headers:** `Authorization: Bearer <admin_token>`

#### Get User by ID
- **GET** `/api/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin_token>`

#### Create User
- **POST** `/api/admin/users`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Update User
- **PUT** `/api/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": true
}
```

#### Delete User
- **DELETE** `/api/admin/users/:id`
- **Headers:** `Authorization: Bearer <admin_token>`

#### Toggle User Status
- **PATCH** `/api/admin/users/:id/toggle-status`
- **Headers:** `Authorization: Bearer <admin_token>`

## Response Format

### Success Response
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "jwt_token_here"
}
```

### Error Response
```json
{
  "message": "Error message here"
}
```

## Testing with Postman/Thunder Client

1. **Register a user:**
   - POST `http://localhost:5000/api/auth/register`
   - Body: JSON with name, email, password

2. **Login:**
   - POST `http://localhost:5000/api/auth/login`
   - Body: JSON with email, password

3. **Create an admin user:**
   - POST `http://localhost:5000/api/auth/register`
   - Body: JSON with name, email, password, role: "admin"

4. **Test admin routes:**
   - Use the admin token in Authorization header
   - Test all CRUD operations

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation
- Error handling
- CORS protection

## File Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── adminController.js
├── middleware/
│   └── auth.js
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── adminRoutes.js
├── utils/
│   └── constants.js
├── server.js
├── package.json
└── README.md
```

## Next Steps

- Add input validation middleware
- Add rate limiting
- Add logging
- Add unit tests
- Add API documentation with Swagger
- Add password reset functionality
- Add email verification 