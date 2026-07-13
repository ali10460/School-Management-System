import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { noticeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { PageLoading } from '../components/LoadingSpinner';

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', targetRole: 'all', priority: 'normal' });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try { const res = await noticeService.getNotices({ role: user?.role }); setNotices(res.data.notices); }
    catch { toast.error('Failed to fetch notices'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) { await noticeService.updateNotice(editData._id, formData); toast.success('Notice updated'); }
      else { await noticeService.createNotice(formData); toast.success('Notice posted'); }
      setShowModal(false); fetchNotices(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (notice) => {
    setEditData(notice);
    setFormData({ title: notice.title, content: notice.content, targetRole: notice.targetRole || 'all', priority: notice.priority || 'normal' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try { await noticeService.deleteNotice(id); toast.success('Deleted'); fetchNotices(); } catch { toast.error('Failed'); }
  };

  const resetForm = () => setEditData(null) || setFormData({ title: '', content: '', targetRole: 'all', priority: 'normal' });

  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const priorityStyle = {
    urgent: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10',
    important: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10',
    normal: 'border-l-surface-300 dark:border-l-surface-600'
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notices</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">School announcements and updates</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
            <PlusIcon className="h-5 w-5" /> Post Notice
          </button>
        )}
      </div>

      {loading ? <PageLoading /> : notices.length === 0 ? (
        <EmptyState icon={MegaphoneIcon} title="No notices" description="No announcements have been posted yet"
          action={canManage ? <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><PlusIcon className="h-5 w-5" /> Post Notice</button> : null}
        />
      ) : (
        <div className="space-y-3">
          {notices.map((notice, i) => (
            <div key={notice._id} className={`card p-5 border-l-4 ${priorityStyle[notice.priority] || priorityStyle.normal} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="text-base font-bold text-surface-900 dark:text-white">{notice.title}</h3>
                    {notice.priority === 'urgent' && <span className="badge-red text-[10px]">URGENT</span>}
                    {notice.priority === 'important' && <span className="badge-yellow text-[10px]">IMPORTANT</span>}
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{notice.content}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-surface-400">
                    <span>By <strong className="text-surface-600 dark:text-surface-300">{notice.postedBy?.name}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-surface-300" />
                    <span className="capitalize">For {notice.targetRole}</span>
                    <span className="w-1 h-1 rounded-full bg-surface-300" />
                    <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(notice)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(notice._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Notice' : 'Post Notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required placeholder="Notice title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Content</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field" rows={4} required placeholder="Write your notice..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Target</label>
              <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="input-field">
                <option value="all">All</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input-field">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editData ? 'Update' : 'Post'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Notices;
