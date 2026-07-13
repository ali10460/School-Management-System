import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
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
import Fees from './pages/Fees';
import Profile from './pages/Profile';
import Messages from './pages/Messages';

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <Router>
        <AuthProvider>
          <SocketProvider>
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
            <Route path="/fees" element={<ProtectedRoute roles={['admin', 'teacher']}><Fees /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          </SocketProvider>
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </Router>
  );
}

export default App;