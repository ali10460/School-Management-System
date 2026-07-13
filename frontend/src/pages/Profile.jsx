import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', profilePicture: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', phone: user.phone || '', profilePicture: user.profilePicture || '' });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { const res = await authService.updateProfile(formData); updateUser(res.data.user); toast.success('Profile updated'); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try { await authService.updatePassword(passwordData); toast.success('Password updated'); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-surface-100 dark:border-surface-700/50">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shrink-0">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email}</p>
              <div className="mt-1.5">
                <StatusBadge status={user?.role}>{user?.role?.toUpperCase()}</StatusBadge>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
              <input type="email" value={user?.email || ''} disabled className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Profile Picture URL</label>
              <input type="url" value={formData.profilePicture} onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface-100 dark:border-surface-700/50">
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-700">
              <LockClosedIcon className="h-6 w-6 text-surface-600 dark:text-surface-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Change Password</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Update your password regularly</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
