import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { examService, classService, subjectService, studentService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { PageLoading } from '../components/LoadingSpinner';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'midterm', class: '', subject: '', date: '', totalMarks: 100, passingMarks: 33, duration: 60 });
  const [gradeData, setGradeData] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [examRes, classRes, subjectRes] = await Promise.all([
        examService.getExams(), classService.getClasses(), subjectService.getSubjects()
      ]);
      setExams(examRes.data.exams); setClasses(classRes.data.classes); setSubjects(subjectRes.data.subjects);
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedExam?._id) { await examService.updateExam(selectedExam._id, formData); toast.success('Exam updated'); }
      else { await examService.createExam(formData); toast.success('Exam created'); }
      setShowModal(false); fetchData(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (exam) => {
    setFormData({ name: exam.name, type: exam.type, class: exam.class?._id || '', subject: exam.subject?._id || '', date: new Date(exam.date).toISOString().split('T')[0], totalMarks: exam.totalMarks, passingMarks: exam.passingMarks, duration: exam.duration });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try { await examService.deleteExam(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const handleViewGrades = async (exam) => {
    setSelectedExam(exam);
    try { const res = await examService.getGrades(exam._id); setGradeData(res.data.grades || []); setShowGradesModal(true); } catch {}
  };

  const resetForm = () => setFormData({ name: '', type: 'midterm', class: '', subject: '', date: '', totalMarks: 100, passingMarks: 33, duration: 60 });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Exams</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage exams and grades</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Create Exam
        </button>
      </div>

      {loading ? <PageLoading /> : exams.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No exams yet" description="Create your first exam"
          action={<button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><PlusIcon className="h-5 w-5" /> Create</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Class</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Date</th>
                <th className="table-header">Marks</th>
                <th className="table-header text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {exams.map((exam, i) => (
                  <tr key={exam._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="table-cell font-medium">{exam.name}</td>
                    <td className="table-cell"><StatusBadge status={exam.type} /></td>
                    <td className="table-cell">{exam.class?.name}</td>
                    <td className="table-cell">{exam.subject?.name}</td>
                    <td className="table-cell text-surface-500">{new Date(exam.date).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className="font-semibold">{exam.totalMarks}</span>
                      <span className="text-surface-400 text-xs"> / {exam.passingMarks} pass</span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewGrades(exam)} className="btn-ghost p-2 rounded-xl"><EyeIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleEdit(exam)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(exam._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedExam?._id ? 'Edit Exam' : 'Create Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Exam Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="unit-test">Unit Test</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Duration (min)</label>
              <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Class</label>
              <select value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} className="input-field" required>
                <option value="">Select</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Subject</label>
              <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-field" required>
                <option value="">Select</option>
                {subjects.filter(s => s.classAssigned?._id === formData.class).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Total Marks</label>
                <input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Passing Marks</label>
                <input type="number" value={formData.passingMarks} onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })} className="input-field" min="0" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showGradesModal} onClose={() => setShowGradesModal(false)} title={`Grades - ${selectedExam?.name || ''}`} size="lg">
        {gradeData.length === 0 ? (
          <div className="text-center py-8 text-surface-500">No grades recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr>
                <th className="table-header">Student</th>
                <th className="table-header">Roll No</th>
                <th className="table-header">Marks</th>
                <th className="table-header">Grade</th>
                <th className="table-header">Percentage</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {gradeData.map((g, i) => (
                  <tr key={g._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="table-cell font-medium">{g.student?.user?.name}</td>
                    <td className="table-cell">{g.student?.rollNumber}</td>
                    <td className="table-cell">{g.marks}</td>
                    <td className="table-cell"><StatusBadge status={g.grade} /></td>
                    <td className="table-cell">{g.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Exams;
