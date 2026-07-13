# School Management System - Frontend Code Documentation

## 1. index.js - Application Entry Point

This is the main entry file that renders the React application.

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Explanation:**
- React.StrictMode helps identify potential problems in the application
- Mounts the App component to the HTML element with id="root"
- Imports global CSS styles from index.css

---

## 2. App.js - Main Router Configuration

This file sets up routing and wraps the app with authentication provider.

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Assignments from './pages/Assignments';
import Notices from './pages/Notices';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute roles={['admin', 'teacher']}><Classes /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute roles={['admin', 'teacher']}><Subjects /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'teacher']}><Attendance /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute roles={['admin', 'teacher']}><Exams /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
```

**Route Protection:**
- `/login` and `/register` - Public routes
- `/admin` - Only admin can access
- `/teacher` - Only teacher can access  
- `/student` - Only student can access
- `/students`, `/teachers` - Only admin can access
- `/classes`, `/subjects`, `/attendance`, `/exams` - Admin and teacher can access
- `/assignments`, `/notices`, `/profile` - All authenticated users can access

---

## 3. AuthContext.js - Authentication Context

Manages user authentication state across the application.

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Functions:**
- `login(email, password)` - Authenticates user and stores token
- `register(data)` - Creates new user account
- `logout()` - Clears authentication data
- `updateUser(user)` - Updates user information
- `useAuth()` - Hook to access auth context

---

## 4. api.js - API Service

Central API configuration with Axios for making HTTP requests.

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
};

export const userService = {
  getUsers: () => api.get('/users'),
  getStats: () => api.get('/users/stats')
};

export const studentService = {
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`)
};

export const teacherService = {
  getTeachers: (params) => api.get('/teachers', { params }),
  getTeacher: (id) => api.get(`/teachers/${id}`),
  createTeacher: (data) => api.post('/teachers', data),
  updateTeacher: (id, data) => api.put(`/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/teachers/${id}`)
};

export const classService = {
  getClasses: () => api.get('/classes'),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`)
};

export const subjectService = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`)
};

export const attendanceService = {
  getAttendance: (params) => api.get('/attendance', { params }),
  markAttendance: (data) => api.post('/attendance', data),
  bulkMarkAttendance: (data) => api.post('/attendance/bulk', data),
  getAttendanceReport: (params) => api.get('/attendance/report', { params })
};

export const examService = {
  getExams: (params) => api.get('/exams', { params }),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (data) => api.post('/exams', data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  addGrades: (id, data) => api.post(`/exams/${id}/grades`, data),
  getGrades: (id) => api.get(`/exams/${id}/grades`)
};

export const assignmentService = {
  getAssignments: (params) => api.get('/assignments', { params }),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  gradeSubmission: (id, data) => api.put(`/assignment/submission/${id}/grade`, data)
};

export const noticeService = {
  getNotices: (params) => api.get('/notices', { params }),
  getNotice: (id) => api.get(`/notices/${id}`),
  createNotice: (data) => api.post('/notices', data),
  updateNotice: (id, data) => api.put(`/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/notices/${id}`)
};

export default api;
```

**Features:**
- Auto-adds JWT token to requests
- Auto-redirects to login on 401 (unauthorized) responses
- Provides service functions for all API endpoints

---

## 5. ProtectedRoute.js - Route Protection

Protects routes from unauthorized access.

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const defaultRoute = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
```

**Logic:**
- Shows loading while checking authentication
- Redirects to login if not authenticated
- Redirects to default dashboard if role not allowed

---

## 6. DashboardLayout.js - Main Layout Component

Provides the sidebar, header, and logout functionality.

```javascript
import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon, HomeIcon, UserGroupIcon, AcademicCapIcon, BookOpenIcon, ClipboardDocumentListIcon, DocumentTextIcon, ClipboardDocumentCheckIcon, MegaphoneIcon, UserIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getMenuItems = () => {
    const commonItems = [
      { icon: MegaphoneIcon, label: 'Notices', path: '/notices' },
      { icon: UserIcon, label: 'Profile', path: '/profile' }
    ];

    if (user?.role === 'admin') {
      return [
        { icon: HomeIcon, label: 'Dashboard', path: '/admin' },
        { icon: UserGroupIcon, label: 'Students', path: '/students' },
        { icon: AcademicCapIcon, label: 'Teachers', path: '/teachers' },
        { icon: BookOpenIcon, label: 'Classes', path: '/classes' },
        { icon: ClipboardDocumentListIcon, label: 'Subjects', path: '/subjects' },
        { icon: ClipboardDocumentCheckIcon, label: 'Attendance', path: '/attendance' },
        { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
        { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
        ...commonItems
      ];
    }

    if (user?.role === 'teacher') {
      return [
        { icon: HomeIcon, label: 'Dashboard', path: '/teacher' },
        { icon: BookOpenIcon, label: 'Classes', path: '/classes' },
        { icon: ClipboardDocumentListIcon, label: 'Subjects', path: '/subjects' },
        { icon: ClipboardDocumentCheckIcon, label: 'Attendance', path: '/attendance' },
        { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
        { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
        ...commonItems
      ];
    }

    return [
      { icon: HomeIcon, label: 'Dashboard', path: '/student' },
      { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
      { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
      ...commonItems
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Sidebar */}
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          {sidebarOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          )}
          <div className={`fixed inset-y-0 left-0 flex w-full max-w-xs transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-800 pb-4">
              <div className="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">School CMS</h2>
                <button className="ml-auto p-2" onClick={() => setSidebarOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <nav className="mt-4 px-4 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.path} to={item.path} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="sidebar-link text-red-600 hover:bg-red-50 w-full">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white dark:lg:bg-gray-800 dark:lg:border-gray-700">
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">School CMS</h2>
          </div>
          <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} className="sidebar-link">
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleLogout} className="sidebar-link text-red-600 hover:bg-red-50">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:pl-64">
          <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="h-6 w-6 lg:hidden" />
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 hover:text-gray-700">
                  {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                </button>
                <div className="hidden lg:flex lg:items-center relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600">
                    <UserIcon className="h-6 w-6" />
                    <span>{user?.name}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="text-xs capitalize text-primary-600">{user?.role}</span>
                      </div>
                      <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
```

**Features:**
- Responsive sidebar (mobile hamburger menu)
- Desktop fixed sidebar
- Role-based menu items
- User dropdown with logout
- Dark mode toggle
- Logout button in sidebar

---

## 7. Login.js - Login Page

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      const route = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
      navigate(route);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

## 8. Register.js - Registration Page

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'student', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(formData);
      const route = formData.role === 'admin' ? '/admin' : formData.role === 'teacher' ? '/teacher' : '/student';
      navigate(route);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

---

## 9. AdminDashboard.js - Admin Dashboard

Shows statistics for students, teachers, classes, and admins.

```javascript
import { useState, useEffect } from 'react';
import { UserGroupIcon, AcademicCapIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { userService, classService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, adminCount: 0 });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([
          userService.getStats(),
          classService.getClasses()
        ]);
        setStats({ 
          studentCount: statsRes.data.stats.studentCount, 
          teacherCount: statsRes.data.stats.teacherCount,
          adminCount: statsRes.data.stats.adminCount
        });
        setClasses(classesRes.data.classes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.studentCount, icon: UserGroupIcon, color: 'bg-blue-500' },
    { title: 'Total Teachers', value: stats.teacherCount, icon: AcademicCapIcon, color: 'bg-green-500' },
    { title: 'Total Classes', value: classes.length, icon: BookOpenIcon, color: 'bg-purple-500' },
    { title: 'Admins', value: stats.adminCount, icon: CalendarIcon, color: 'bg-orange-500' }
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Classes Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">Class Name</th>
                <th className="table-header">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {classes.map((cls) => (
                <tr key={cls._id}>
                  <td className="table-cell">{cls.name}</td>
                  <td className="table-cell">{cls.section || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
```

---

## 10. Students.js - Student Management

Allows admin to add, edit, delete, and search students.

```javascript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { studentService, classService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', rollNumber: '', class: '', section: '',
    parentName: '', parentPhone: '', parentEmail: '', address: ''
  });
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search, classFilter]);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getStudents({ search, class: classFilter });
      setStudents(res.data.students);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data.classes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await studentService.updateStudent(editData._id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentService.createStudent(formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      fetchStudents();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditData(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      phone: student.user?.phone || '',
      rollNumber: student.rollNumber || '',
      class: student.class?._id || '',
      section: student.section || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      address: student.address || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.deleteStudent(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({
      name: '', email: '', phone: '', password: '', rollNumber: '', class: '', section: '',
      parentName: '', parentPhone: '', parentEmail: '', address: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add Student
        </button>
      </div>

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10" />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="input-field w-full sm:w-48">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">Roll No</th>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Class</th>
                <th className="table-header">Section</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-gray-500">No students found</td></tr>
              ) : students.map((student) => (
                <tr key={student._id}>
                  <td className="table-cell">{student.rollNumber}</td>
                  <td className="table-cell font-medium">{student.user?.name}</td>
                  <td className="table-cell">{student.user?.email}</td>
                  <td className="table-cell">{student.class?.name}</td>
                  <td className="table-cell">{student.section || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(student)} className="p-1 text-primary-600 hover:text-primary-800">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(student._id)} className="p-1 text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editData ? 'Edit Student' : 'Add Student'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                    <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                    <select value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} className="input-field" required>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                    <input type="text" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Name</label>
                    <input type="text" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone</label>
                    <input type="text" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" />
                  </div>
                  {!editData && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" required minLength={6} />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Students;
```

---

## 11. Teachers.js - Teacher Management

Allows admin to add, edit, delete, and search teachers.

```javascript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { teacherService, subjectService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', subjects: [], qualification: '', salary: '', experience: '', department: '', designation: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, [search]);

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getTeachers({ search });
      setTeachers(res.data.teachers);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getSubjects();
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await teacherService.updateTeacher(editData._id, formData);
        toast.success('Teacher updated successfully');
      } else {
        await teacherService.createTeacher(formData);
        toast.success('Teacher created successfully');
      }
      setShowModal(false);
      fetchTeachers();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save teacher');
    }
  };

  const handleEdit = (teacher) => {
    setEditData(teacher);
    setFormData({
      name: teacher.user?.name || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      subjects: teacher.subjects?.map(s => s._id) || [],
      qualification: teacher.qualification || '',
      salary: teacher.salary || '',
      experience: teacher.experience || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await teacherService.deleteTeacher(id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({
      name: '', email: '', phone: '', password: '', subjects: [], qualification: '', salary: '', experience: '', department: '', designation: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add Teacher
        </button>
      </div>

      <div className="card mb-6 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Subjects</th>
                <th className="table-header">Qualification</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-gray-500">No teachers found</td></tr>
              ) : teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="table-cell font-medium">{teacher.user?.name}</td>
                  <td className="table-cell">{teacher.user?.email}</td>
                  <td className="table-cell">{teacher.user?.phone || '-'}</td>
                  <td className="table-cell">{teacher.subjects?.map(s => s.name).join(', ') || '-'}</td>
                  <td className="table-cell">{teacher.qualification || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(teacher)} className="p-1 text-primary-600 hover:text-primary-800">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(teacher._id)} className="p-1 text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editData ? 'Edit Teacher' : 'Add Teacher'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
                    <input type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                    <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</label>
                    <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects</label>
                    <select multiple value={formData.subjects} onChange={(e) => setFormData({ ...formData, subjects: Array.from(e.target.selectedOptions, o => o.value) })} className="input-field h-32">
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name} - {s.classAssigned?.name}</option>)}
                    </select>
                  </div>
                  {!editData && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" required minLength={6} />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Teachers;
```

---

## 12. Classes.js - Class Management

Allows admin/teacher to add, edit, delete, and manage classes.

```javascript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { classService, teacherService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: '', classTeacher: '' });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data.classes);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getTeachers();
      setTeachers(res.data.teachers);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await classService.updateClass(editData._id, formData);
        toast.success('Class updated successfully');
      } else {
        await classService.createClass(formData);
        toast.success('Class created successfully');
      }
      setShowModal(false);
      fetchClasses();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save class');
    }
  };

  const handleEdit = (cls) => {
    setEditData(cls);
    setFormData({ name: cls.name, section: cls.section || '', classTeacher: cls.classTeacher?._id || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await classService.deleteClass(id);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({ name: '', section: '', classTeacher: '' });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add Class
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">Class Name</th>
                <th className="table-header">Section</th>
                <th className="table-header">Class Teacher</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-500">No classes found</td></tr>
              ) : classes.map((cls) => (
                <tr key={cls._id}>
                  <td className="table-cell font-medium">{cls.name}</td>
                  <td className="table-cell">{cls.section || '-'}</td>
                  <td className="table-cell">{cls.classTeacher?.user?.name || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(cls)} className="p-1 text-primary-600 hover:text-primary-800">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(cls._id)} className="p-1 text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {editData ? 'Edit Class' : 'Add Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required placeholder="e.g., Class 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <input type="text" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="input-field" placeholder="e.g., A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Teacher</label>
                <select value={formData.classTeacher} onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })} className="input-field">
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Classes;
```

---

## 13. Other Pages

The system also includes:
- **Subjects.js** - Subject management
- **Attendance.js** - Mark and view attendance
- **Exams.js** - Exam and grade management
- **Assignments.js** - Assignment management
- **Notices.js** - Notice board
- **Profile.js** - User profile management
- **TeacherDashboard.js** - Teacher-specific dashboard
- **StudentDashboard.js** - Student-specific dashboard

All pages follow similar patterns with:
- DashboardLayout wrapper for consistent layout
- API service calls for data
- Modal forms for create/update operations
- Tables for displaying data
- Search/filter functionality