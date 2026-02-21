'use client';

import { useState } from 'react';
import { Plus, Search, Loader2, Eye, Trash2, X, Filter, Shield, Mail, Phone, User as UserIcon, Edit2 } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useUserManagement } from '@/firebase/hooks/useUserManagement';
import type { User, UserRole } from '@/types';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  driver: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  customer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={16} />,
  manager: <UserIcon size={16} />,
  driver: <UserIcon size={16} />,
  customer: <UserIcon size={16} />,
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { members, loading, error, addMember, deleteMember, updateRole } = useUserManagement(currentUser?.companyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver' as UserRole,
    department: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.companyId) return;

    setIsSubmitting(true);
    try {
      await addMember({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role,
        status: 'active',
        joinDate: new Date(),
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'driver',
        department: '',
      });
    } catch (err) {
      console.error('Error adding member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedMember) {
      setIsSubmitting(true);
      try {
        await deleteMember(selectedMember.id);
        setShowDeleteModal(false);
        setSelectedMember(null);
      } catch (err) {
        console.error('Error deleting member:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (!currentUser) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Users</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage team members and permissions</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium">
              <Plus size={20} />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">{error}</div>}

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Filter size={20} /> <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">Role</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Members</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{members.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Admins</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{members.filter(m => m.role === 'admin').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Drivers</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{members.filter(m => m.role === 'driver').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Managers</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{members.filter(m => m.role === 'manager').length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading members...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left px-6 py-3 font-semibold text-black dark:text-white">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-black dark:text-white">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-black dark:text-white">Role</th>
                    <th className="text-left px-6 py-3 font-semibold text-black dark:text-white">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-black dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-black dark:text-white">{member.displayName}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.role}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black dark:text-white">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-800'}`}>
                          {ROLE_ICONS[member.role] || null}
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedMember(member); setShowViewModal(true); }} className="p-2 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => { setSelectedMember(member); setShowDeleteModal(true); }} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon size={48} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No members found</p>
              </div>
            )}
          </>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">Add Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full name" required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="user@example.com" required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                    <option value="driver">Driver</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Operations, Sales" className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold disabled:opacity-50">{isSubmitting ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedMember.displayName}</h2>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Email</p>
                  <p className="text-black dark:text-white font-semibold">{selectedMember.email}</p>
                </div>
              </div>
              {selectedMember.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Phone</p>
                    <p className="text-black dark:text-white font-semibold">{selectedMember.phoneNumber}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Role</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[selectedMember.role] || 'bg-gray-100 text-gray-800'}`}>
                  {ROLE_ICONS[selectedMember.role] || null}
                  {selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedMember.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                  {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">Remove Member?</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">Remove {selectedMember.displayName} from your team. This action cannot be undone.</p>
            </div>
            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => { setShowDeleteModal(false); setSelectedMember(null); }} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">{isSubmitting ? 'Removing...' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
