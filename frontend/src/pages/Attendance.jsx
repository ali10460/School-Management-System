import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckIcon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { attendanceService, studentService, classService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { PageLoading } from '../components/LoadingSpinner';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => { if (selectedClass) fetchStudents(); }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data.classes);
      if (res.data.classes.length > 0) setSelectedClass(res.data.classes[0]._id);
    } catch { toast.error('Failed to fetch classes'); }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudents({ class: selectedClass });
      const attendRes = await attendanceService.getAttendance({ class: selectedClass, date: selectedDate });
      const existing = {};
      attendRes.data.attendances.forEach(a => { existing[a.student._id] = a.status; });
      setStudents(res.data.students);
      setAttendanceData(existing);
    } catch {} finally { setLoading(false); }
  };

  const handleAttendance = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: prev[studentId] === status ? '' : status }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceData).filter(([, s]) => s).map(([student, status]) => ({ student, status }));
      await attendanceService.bulkMarkAttendance({ class: selectedClass, date: selectedDate, records });
      toast.success('Attendance saved');
    } catch { toast.error('Failed to save attendance'); } finally { setSaving(false); }
  };

  const StatusBtn = ({ studentId, status, icon: Icon, label }) => {
    const active = attendanceData[studentId] === status;
    const colors = {
      present: { active: 'bg-green-500 text-white shadow-sm', inactive: 'bg-surface-100 dark:bg-surface-700/50 text-surface-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600' },
      late: { active: 'bg-yellow-500 text-white shadow-sm', inactive: 'bg-surface-100 dark:bg-surface-700/50 text-surface-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600' },
      absent: { active: 'bg-red-500 text-white shadow-sm', inactive: 'bg-surface-100 dark:bg-surface-700/50 text-surface-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600' }
    };
    return (
      <button onClick={() => handleAttendance(studentId, status)} title={label}
        className={`p-2 rounded-xl transition-all duration-150 ${colors[status][active ? 'active' : 'inactive']}`}>
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Mark student attendance</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" />
          </div>
          <button onClick={saveAttendance} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {loading ? <PageLoading /> : (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
            <span className="text-sm text-surface-500">{students.length} student{students.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3 text-xs text-surface-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Present</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Late</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent</span>
            </div>
          </div>
          {students.length === 0 ? (
            <EmptyState icon={ClipboardDocumentCheckIcon} title="No students" description="No students found in this class" />
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {students.map((student, i) => (
                <div key={student._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-surface-400 w-10">{student.rollNumber}</span>
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{student.user?.name}</span>
                    {attendanceData[student._id] && <StatusBadge status={attendanceData[student._id]} />}
                  </div>
                  <div className="flex gap-1.5">
                    <StatusBtn studentId={student._id} status="present" icon={CheckIcon} label="Present" />
                    <StatusBtn studentId={student._id} status="late" icon={ClockIcon} label="Late" />
                    <StatusBtn studentId={student._id} status="absent" icon={XMarkIcon} label="Absent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Attendance;
