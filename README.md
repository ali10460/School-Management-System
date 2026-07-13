# School Management System

A comprehensive full-stack school management system with React.js frontend, Express.js backend, and MongoDB database.

## Features

- **User Authentication**: JWT-based login/register with three roles (Admin, Teacher, Student)
- **Role-based Dashboards**: Custom dashboards for each user role
- **Student Management**: CRUD operations for students with profile pictures
- **Teacher Management**: CRUD operations for teachers with subject assignments
- **Class & Subject Management**: Create classes, assign subjects to teachers
- **Attendance System**: Mark daily attendance (Present/Absent/Late)
- **Exam & Grade Management**: Create exams, add marks, auto-calculate grades
- **Assignments**: Create/submit/grade assignments
- **Notice Board**: Post notices with priority levels
- **Profile Management**: Update profile and password

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt password hashing
- express-validator
- Multer for file uploads
- Helmet + rate limiting

### Frontend
- React.js with Functional Components & Hooks
- Tailwind CSS
- React Router DOM
- Axios for API calls
- React Toastify

## Project Structure

```
/backend
  /config
  /controllers
  /middleware
  /models
  /routes
  /utils
  server.js
  package.json
  .env

/frontend
  /public
  /src
    /components
    /context
    /pages
    /services
    App.js
    index.js
    index.css
  package.json
  tailwind.config.js
```

## Installation & Running

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm start
```
Backend runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile
- PUT `/api/auth/password` - Change password

### Students (Admin)
- GET/POST `/api/students`
- GET/PUT/DELETE `/api/students/:id`

### Teachers (Admin)
- GET/POST `/api/teachers`
- GET/PUT/DELETE `/api/teachers/:id`

### Classes (Admin/Teacher)
- GET/POST `/api/classes`
- GET/PUT/DELETE `/api/classes/:id`

### Subjects (Admin/Teacher)
- GET/POST `/api/subjects`
- GET/PUT/DELETE `/api/subjects/:id`

### Attendance (Admin/Teacher)
- POST `/api/attendance/bulk` - Bulk mark attendance
- GET `/api/attendance` - View attendance

### Exams (Admin/Teacher)
- GET/POST `/api/exams`
- POST `/api/exams/:id/grades` - Add grades

### Assignments
- GET/POST `/api/assignments`
- POST `/api/assignments/:id/submit` - Submit (Student)

### Notices
- GET/POST `/api/notices`
- GET/PUT/DELETE `/api/notices/:id`

## Default Roles

After registration:
- **Admin**: Full access to all features
- **Teacher**: Manage classes, subjects, attendance, exams, assignments
- **Student**: View notices, submit assignments, view grades

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## License

MIT