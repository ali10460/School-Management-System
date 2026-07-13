import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { assignmentService, classService, subjectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { PageLoading } from '../components/LoadingSpinner';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', class: '', subject: '', dueDate: '', totalMarks: 100 });
  const [submissionData, setSubmissionData] = useState({ submissionText: '', fileUrl: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [assignRes, classRes, subjectRes] = await Promise.all([
        assignmentService.getAssignments(), classService.getClasses(), subjectService.getSubjects()
      ]);
      setAssignments(assignRes.data.assignments); setClasses(classRes.data.classes); setSubjects(subjectRes.data.subjects);
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) { await assignmentService.updateAssignment(editData._id, formData); toast.success('Updated'); }
      else { await assignmentService.createAssignment(formData); toast.success('Created'); }
      setShowModal(false); fetchData(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (assignment) => {
    setEditData(assignment);
    setFormData({ title: assignment.title, description: assignment.description || '', class: assignment.class?._id || '', subject: assignment.subject?._id || '', dueDate: new Date(assignment.dueDate).toISOString().split('T')[0], totalMarks: assignment.totalMarks });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try { await assignmentService.deleteAssignment(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try { await assignmentService.submitAssignment(selectedAssignment._id, submissionData); toast.success('Submitted!'); setShowSubmitModal(false); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const resetForm = () => setEditData(null) || setFormData({ title: '', description: '', class: '', subject: '', dueDate: '', totalMarks: 100 });

  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{canManage ? 'Create and manage assignments' : 'View and submit assignments'}</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
            <PlusIcon className="h-5 w-5" /> Create Assignment
          </button>
        )}
      </div>

      {loading ? <PageLoading /> : assignments.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title="No assignments yet" description={canManage ? 'Create your first assignment' : 'No assignments posted yet'}
          action={canManage ? <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><PlusIcon className="h-5 w-5" /> Create</button> : null}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment, i) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();
            return (
              <div key={assignment._id} className="card p-5 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-base font-bold text-surface-900 dark:text-white">{assignment.title}</h3>
                      {isOverdue ? <span className="badge-red">Overdue</span> : <span className="badge-green">Active</span>}
                    </div>
                    {assignment.description && <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">{assignment.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-400">
                      <span>Class: <strong className="text-surface-600 dark:text-surface-300">{assignment.class?.name}</strong></span>
                      <span>Subject: <strong className="text-surface-600 dark:text-surface-300">{assignment.subject?.name}</strong></span>
                      <span>Due: <strong className={isOverdue ? 'text-red-500' : 'text-surface-600 dark:text-surface-300'}>{new Date(assignment.dueDate).toLocaleDateString()}</strong></span>
                      <span>Marks: <strong className="text-surface-600 dark:text-surface-300">{assignment.totalMarks}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {user?.role === 'student' && (
                      <button onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }} className="btn-primary text-sm px-3 py-2">
                        Submit
                      </button>
                    )}
                    {canManage && (
                      <>
                        <button onClick={() => handleEdit(assignment)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(assignment._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Assignment' : 'Create Assignment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Total Marks</label>
              <input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })} className="input-field" min="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assignment">
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Your Answer</label>
            <textarea value={submissionData.submissionText} onChange={(e) => setSubmissionData({ ...submissionData, submissionText: e.target.value })} className="input-field" rows={4} placeholder="Write your answer here..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">File URL (optional)</label>
            <input type="url" value={submissionData.fileUrl} onChange={(e) => setSubmissionData({ ...submissionData, fileUrl: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Assignments;
