import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { subjectService, classService, teacherService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { PageLoading } from '../components/LoadingSpinner';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import useFormValidation, { validators } from '../hooks/useFormValidation';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', classAssigned: '', teacher: '', creditHours: 0 });

  const rules = useMemo(() => ({
    name: [validators.required('Subject name is required')],
    classAssigned: [validators.required('Class is required')]
  }), []);

  const { getFieldError, validateField, validateForm, touchField, clearErrors } = useFormValidation(rules);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subjectRes, classRes, teacherRes] = await Promise.all([
        subjectService.getSubjects(), classService.getClasses(), teacherService.getTeachers()
      ]);
      setSubjects(subjectRes.data.subjects); setClasses(classRes.data.classes); setTeachers(teacherRes.data.teachers);
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (name, value) => {
    touchField(name);
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    try {
      if (editData) { await subjectService.updateSubject(editData._id, formData); toast.success('Subject updated'); }
      else { await subjectService.createSubject(formData); toast.success('Subject created'); }
      setShowModal(false); fetchData(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (subject) => {
    setEditData(subject);
    setFormData({ name: subject.name, code: subject.code || '', classAssigned: subject.classAssigned?._id || '', teacher: subject.teacher?._id || '', creditHours: subject.creditHours || 0 });
    clearErrors();
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await subjectService.deleteSubject(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const resetForm = () => { setEditData(null); setFormData({ name: '', code: '', classAssigned: '', teacher: '', creditHours: 0 }); clearErrors(); };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage subjects and assignments</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Add Subject
        </button>
      </div>

      {loading ? <PageLoading /> : subjects.length === 0 ? (
        <EmptyState icon={BookOpenIcon} title="No subjects yet" description="Add your first subject"
          action={<button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><PlusIcon className="h-5 w-5" /> Add Subject</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr>
                <th className="table-header">Name</th>
                <th className="table-header">Code</th>
                <th className="table-header">Class</th>
                <th className="table-header">Teacher</th>
                <th className="table-header">Credits</th>
                <th className="table-header text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {subjects.map((subject, i) => (
                  <tr key={subject._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="table-cell font-medium">{subject.name}</td>
                    <td className="table-cell text-surface-500 font-mono text-xs">{subject.code || '-'}</td>
                    <td className="table-cell"><span className="badge-blue">{subject.classAssigned?.name}</span></td>
                    <td className="table-cell">{subject.teacher?.user?.name || <span className="text-surface-400">Not assigned</span>}</td>
                    <td className="table-cell">{subject.creditHours}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(subject)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(subject._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Subject Name" error={getFieldError('name')} required>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={(e) => handleBlur('name', e.target.value)} className={`input-field ${getFieldError('name') ? 'error' : ''}`} />
          </FormField>
          <FormField label="Subject Code">
            <input type="text" value={formData.code} onChange={(e) => handleChange('code', e.target.value)} className="input-field" placeholder="e.g., MATH101" />
          </FormField>
          <FormField label="Class" error={getFieldError('classAssigned')} required>
            <select value={formData.classAssigned} onChange={(e) => handleChange('classAssigned', e.target.value)} onBlur={(e) => handleBlur('classAssigned', e.target.value)} className={`input-field ${getFieldError('classAssigned') ? 'error' : ''}`}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Teacher">
            <select value={formData.teacher} onChange={(e) => handleChange('teacher', e.target.value)} className="input-field">
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
            </select>
          </FormField>
          <FormField label="Credit Hours">
            <input type="number" value={formData.creditHours} onChange={(e) => handleChange('creditHours', Number(e.target.value))} className="input-field" min="0" />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Subjects;
