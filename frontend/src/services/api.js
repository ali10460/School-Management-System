import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export const authService = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getProfile: () => api.get("/auth/me"),
    updateProfile: (data) => api.put("/auth/profile", data),
    updatePassword: (data) => api.put("/auth/password", data),
};

export const userService = {
    getUsers: () => api.get("/users"),
    getStats: () => api.get("/users/stats"),
};

export const studentService = {
    getStudents: (params) => api.get("/students", { params }),
    getStudent: (id) => api.get(`/students/${id}`),
    createStudent: (data) => api.post("/students", data),
    updateStudent: (id, data) => api.put(`/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/students/${id}`),
};

export const teacherService = {
    getTeachers: (params) => api.get("/teachers", { params }),
    getTeacher: (id) => api.get(`/teachers/${id}`),
    createTeacher: (data) => api.post("/teachers", data),
    updateTeacher: (id, data) => api.put(`/teachers/${id}`, data),
    deleteTeacher: (id) => api.delete(`/teachers/${id}`),
};

export const classService = {
    getClasses: () => api.get("/classes"),
    getClass: (id) => api.get(`/classes/${id}`),
    createClass: (data) => api.post("/classes", data),
    updateClass: (id, data) => api.put(`/classes/${id}`, data),
    deleteClass: (id) => api.delete(`/classes/${id}`),
};

export const subjectService = {
    getSubjects: (params) => api.get("/subjects", { params }),
    getSubject: (id) => api.get(`/subjects/${id}`),
    createSubject: (data) => api.post("/subjects", data),
    updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
    deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

export const attendanceService = {
    getAttendance: (params) => api.get("/attendance", { params }),
    markAttendance: (data) => api.post("/attendance", data),
    bulkMarkAttendance: (data) => api.post("/attendance/bulk", data),
    getAttendanceReport: (params) => api.get("/attendance/report", { params }),
};

export const examService = {
    getExams: (params) => api.get("/exams", { params }),
    getExam: (id) => api.get(`/exams/${id}`),
    createExam: (data) => api.post("/exams", data),
    updateExam: (id, data) => api.put(`/exams/${id}`, data),
    deleteExam: (id) => api.delete(`/exams/${id}`),
    addGrades: (id, data) => api.post(`/exams/${id}/grades`, data),
    getGrades: (id) => api.get(`/exams/${id}/grades`),
};

export const assignmentService = {
    getAssignments: (params) => api.get("/assignments", { params }),
    getAssignment: (id) => api.get(`/assignments/${id}`),
    createAssignment: (data) => api.post("/assignments", data),
    updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
    deleteAssignment: (id) => api.delete(`/assignments/${id}`),
    submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
    getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
    gradeSubmission: (id, data) =>
        api.put(`/assignment/submission/${id}/grade`, data),
};

export const noticeService = {
    getNotices: (params) => api.get("/notices", { params }),
    getNotice: (id) => api.get(`/notices/${id}`),
    createNotice: (data) => api.post("/notices", data),
    updateNotice: (id, data) => api.put(`/notices/${id}`, data),
    deleteNotice: (id) => api.delete(`/notices/${id}`),
};

export const feeService = {
    getFees: (params) => api.get("/fees", { params }),
    getFee: (id) => api.get(`/fees/${id}`),
    createFee: (data) => api.post("/fees", data),
    updateFee: (id, data) => api.put(`/fees/${id}`, data),
    deleteFee: (id) => api.delete(`/fees/${id}`),
    getFeeStats: (params) => api.get("/fees/stats", { params }),
};

export const messageService = {
    getConversations: () => api.get("/messages/conversations"),
    getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
    createConversation: (data) => api.post("/messages/conversation", data),
    getUsers: () => api.get("/messages/users"),
};

export default api;