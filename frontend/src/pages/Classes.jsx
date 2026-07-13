import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { classService, teacherService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { PageLoading } from '../components/LoadingSpinner';
import useFormValidation, { validators } from '../hooks/useFormValidation';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: '', classTeacher: '' });

  const rules = useMemo(() => ({
    name: [validators.required('Class name is required')]
  }), []);

  const { getFieldError, validateField, validateForm, touchField, clearErrors } = useFormValidation(rules);

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const fetchClasses = async () => {
    try { const res = await classService.getClasses(); setClasses(res.data.classes); }
    catch { toast.error('Failed to fetch classes'); } finally { setLoading(false); }
  };

  const fetchTeachers = async () => {
    try { const res = await teacherService.getTeachers(); setTeachers(res.data.teachers); } catch {}
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
      if (editData) { await classService.updateClass(editData._id, formData); toast.success('Class updated'); }
      else { await classService.createClass(formData); toast.success('Class created'); }
      setShowModal(false); fetchClasses(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (cls) => {
    setEditData(cls); setFormData({ name: cls.name, section: cls.section || '', classTeacher: cls.classTeacher?._id || '' }); clearErrors(); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try { await classService.deleteClass(id); toast.success('Deleted'); fetchClasses(); } catch { toast.error('Failed'); }
  };

  const resetForm = () => { setEditData(null); setFormData({ name: '', section: '', classTeacher: '' }); clearErrors(); };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Classes</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage classes and class teachers</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Add Class
        </button>
      </div>

      {loading ? <PageLoading /> : classes.length === 0 ? (
        <EmptyState icon={BookOpenIcon} title="No classes yet" description="Create your first class to get started"
          action={<button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><PlusIcon className="h-5 w-5" /> Create Class</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {classes.map((cls) => (
            <div key={cls._id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm">
                    <BookOpenIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white">{cls.name}</h3>
                    {cls.section && <p className="text-xs text-surface-500">Section {cls.section}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cls)} className="btn-ghost p-1.5 rounded-lg"><PencilIcon className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(cls._id)} className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <span className={`inline-block w-2 h-2 rounded-full ${cls.classTeacher ? 'bg-green-400' : 'bg-surface-300'}`} />
                {cls.classTeacher?.user?.name || 'No teacher assigned'}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Class Name" error={getFieldError('name')} required>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={(e) => handleBlur('name', e.target.value)} className={`input-field ${getFieldError('name') ? 'error' : ''}`} placeholder="e.g., Class 10" />
          </FormField>
          <FormField label="Section">
            <input type="text" value={formData.section} onChange={(e) => handleChange('section', e.target.value)} className="input-field" placeholder="e.g., A" />
          </FormField>
          <FormField label="Class Teacher">
            <select value={formData.classTeacher} onChange={(e) => handleChange('classTeacher', e.target.value)} className="input-field">
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
            </select>
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

export default Classes;
