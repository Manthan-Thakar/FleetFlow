'use client';

import { useState } from 'react';
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Building2,
  Shield,
  Calendar,
  Users,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ManagerStatus = 'active' | 'inactive' | 'on-leave';

interface Manager {
  id: string;
  managerId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  location: string;
  joinDate: string;
  status: ManagerStatus;
  driversManaged: number;
  vehiclesManaged: number;
  notes?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialManagers: Manager[] = [
  {
    id: '1', managerId: 'MGR-001', name: 'Rajesh Kumar', email: 'rajesh.kumar@fleetflow.in',
    phone: '+91 98765 11001', department: 'North Zone Operations', location: 'Delhi',
    joinDate: '2022-03-15', status: 'active', driversManaged: 12, vehiclesManaged: 8,
    notes: 'Senior manager handling north zone logistics.',
  },
  {
    id: '2', managerId: 'MGR-002', name: 'Priya Sharma', email: 'priya.sharma@fleetflow.in',
    phone: '+91 98765 22002', department: 'South Zone Operations', location: 'Chennai',
    joinDate: '2021-07-20', status: 'active', driversManaged: 15, vehiclesManaged: 10,
    notes: 'Specialises in last-mile delivery management.',
  },
  {
    id: '3', managerId: 'MGR-003', name: 'Amit Patel', email: 'amit.patel@fleetflow.in',
    phone: '+91 98765 33003', department: 'West Zone Operations', location: 'Mumbai',
    joinDate: '2023-01-10', status: 'on-leave', driversManaged: 9, vehiclesManaged: 6,
    notes: 'On medical leave until Feb 2026.',
  },
  {
    id: '4', managerId: 'MGR-004', name: 'Sunita Reddy', email: 'sunita.reddy@fleetflow.in',
    phone: '+91 98765 44004', department: 'East Zone Operations', location: 'Kolkata',
    joinDate: '2020-11-05', status: 'inactive', driversManaged: 0, vehiclesManaged: 0,
    notes: 'Currently on sabbatical.',
  },
];

const departments = [
  'North Zone Operations', 'South Zone Operations', 'West Zone Operations',
  'East Zone Operations', 'Central Operations', 'Logistics Planning', 'Fleet Coordination',
];

const locations = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune'];

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusConfig(status: ManagerStatus) {
  const map: Record<ManagerStatus, { label: string; dot: string; badge: string }> = {
    active:   { label: 'Active',   dot: 'bg-green-500',  badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    inactive: { label: 'Inactive', dot: 'bg-zinc-400',   badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    'on-leave': { label: 'On Leave', dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  };
  return map[status];
}

// ─── Form defaults ────────────────────────────────────────────────────────────

const emptyForm = {
  name: '', email: '', phone: '', department: departments[0],
  location: locations[0], joinDate: '', status: 'active' as ManagerStatus,
  driversManaged: '', vehiclesManaged: '', notes: '',
};

// ─── Reusable field ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', icon, placeholder, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; icon?: React.ReactNode; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
        <input
          type={type} value={value} readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border text-sm transition-colors
            ${readOnly
              ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white'
            }`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ManagerStatus>('all');
  const [sortField, setSortField] = useState<keyof Manager>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  // ── derived data ──
  const filtered = managers
    .filter((m) => {
      const q = search.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) ||
        m.managerId.toLowerCase().includes(q) || m.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const av = String(a[sortField]), bv = String(b[sortField]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const stats = {
    total: managers.length,
    active: managers.filter((m) => m.status === 'active').length,
    onLeave: managers.filter((m) => m.status === 'on-leave').length,
    inactive: managers.filter((m) => m.status === 'inactive').length,
  };

  // ── helpers ──
  const set = (k: keyof typeof emptyForm) => (v: string) => setFormData((f) => ({ ...f, [k]: v }));

  const handleSort = (field: keyof Manager) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: keyof Manager }) =>
    sortField === field
      ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
      : <ChevronDown size={13} className="opacity-30" />;

  const openAdd = () => { setFormData(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (m: Manager) => {
    setFormData({
      name: m.name, email: m.email, phone: m.phone, department: m.department,
      location: m.location, joinDate: m.joinDate, status: m.status,
      driversManaged: String(m.driversManaged), vehiclesManaged: String(m.vehiclesManaged),
      notes: m.notes || '',
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (editingId) {
      setManagers((prev) => prev.map((m) => m.id === editingId ? {
        ...m, name: formData.name, email: formData.email, phone: formData.phone,
        department: formData.department, location: formData.location, joinDate: formData.joinDate,
        status: formData.status, driversManaged: Number(formData.driversManaged) || 0,
        vehiclesManaged: Number(formData.vehiclesManaged) || 0, notes: formData.notes,
      } : m));
    } else {
      const newId = `MGR-${String(managers.length + 1).padStart(3, '0')}`;
      setManagers((prev) => [...prev, {
        id: String(Date.now()), managerId: newId, name: formData.name, email: formData.email,
        phone: formData.phone, department: formData.department, location: formData.location,
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        status: formData.status, driversManaged: Number(formData.driversManaged) || 0,
        vehiclesManaged: Number(formData.vehiclesManaged) || 0, notes: formData.notes,
      }]);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 900);
  };

  const handleDelete = () => {
    if (selectedManager) setManagers((prev) => prev.filter((m) => m.id !== selectedManager.id));
    setShowDelete(false);
    setSelectedManager(null);
  };

  // ─ Backdrop ─
  const Backdrop = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
  );

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Managers</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage fleet operations managers</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
          <Plus size={16} /> Add Manager
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Managers', value: stats.total, icon: <UserCog size={20} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Active', value: stats.active, icon: <CheckCircle size={20} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'On Leave', value: stats.onLeave, icon: <Calendar size={20} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Inactive', value: stats.inactive, icon: <Shield size={20} />, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-black dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or department…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'on-leave', 'inactive'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}>
              {s === 'all' ? 'All' : s === 'on-leave' ? 'On Leave' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-medium text-black dark:text-white">{filtered.length} manager{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {[
                  { label: 'Manager', field: 'name' as keyof Manager },
                  { label: 'Department', field: 'department' as keyof Manager },
                  { label: 'Location', field: 'location' as keyof Manager },
                  { label: 'Drivers', field: 'driversManaged' as keyof Manager },
                  { label: 'Vehicles', field: 'vehiclesManaged' as keyof Manager },
                  { label: 'Status', field: 'status' as keyof Manager },
                ].map((col) => (
                  <th key={col.field} onClick={() => handleSort(col.field)}
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white select-none">
                    <span className="flex items-center gap-1">{col.label}<SortIcon field={col.field} /></span>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No managers found</td>
                </tr>
              ) : filtered.map((m) => {
                const cfg = getStatusConfig(m.status);
                return (
                  <tr key={m.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-black dark:text-white">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.managerId} · {m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                        <Building2 size={13} className="text-zinc-400" />{m.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <MapPin size={13} />{m.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                        <Users size={13} className="text-zinc-400" />{m.driversManaged}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{m.vehiclesManaged}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedManager(m); setShowView(true); }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => { setSelectedManager(m); setShowDelete(true); }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <>
          <Backdrop onClose={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                    <UserCog size={16} className="text-white dark:text-black" />
                  </div>
                  <div>
                    <h2 className="font-bold text-black dark:text-white">{editingId ? 'Edit Manager' : 'Add New Manager'}</h2>
                    <p className="text-xs text-zinc-500">{editingId ? 'Update manager details' : 'Fill in the details below'}</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name *" value={formData.name} onChange={set('name')} placeholder="e.g. Rajesh Kumar" icon={<UserCog size={14} />} />
                    <Field label="Email Address *" value={formData.email} onChange={set('email')} type="email" placeholder="manager@company.in" icon={<Mail size={14} />} />
                    <Field label="Phone Number" value={formData.phone} onChange={set('phone')} placeholder="+91 98765 XXXXX" icon={<Phone size={14} />} />
                    <Field label="Join Date" value={formData.joinDate} onChange={set('joinDate')} type="date" icon={<Calendar size={14} />} />
                  </div>
                </div>

                {/* Department & Location */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Department & Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField label="Department" value={formData.department} onChange={set('department')} options={departments} />
                    <SelectField label="Location" value={formData.location} onChange={set('location')} options={locations} />
                  </div>
                </div>

                {/* Scope */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Management Scope</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Drivers Managed" value={formData.driversManaged} onChange={set('driversManaged')} type="number" placeholder="0" icon={<Users size={14} />} />
                    <Field label="Vehicles Managed" value={formData.vehiclesManaged} onChange={set('vehiclesManaged')} type="number" placeholder="0" icon={<Briefcase size={14} />} />
                  </div>
                </div>

                {/* Status & Notes */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Status & Notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField label="Status" value={formData.status} onChange={set('status')} options={['active', 'inactive', 'on-leave']} />
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => set('notes')(e.target.value)}
                        placeholder="Any additional notes about this manager…" rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!formData.name.trim() || !formData.email.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  {saved ? <><CheckCircle size={15} /> Saved!</> : editingId ? <><CheckCircle size={15} /> Save Changes</> : <><Plus size={15} /> Add Manager</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── View Modal ── */}
      {showView && selectedManager && (
        <>
          <Backdrop onClose={() => setShowView(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="font-bold text-black dark:text-white">Manager Details</h2>
                <button onClick={() => setShowView(false)} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {selectedManager.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">{selectedManager.name}</p>
                    <p className="text-sm text-zinc-500">{selectedManager.managerId}</p>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedManager.status).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(selectedManager.status).dot}`} />
                      {getStatusConfig(selectedManager.status).label}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Mail size={14} />, label: 'Email', value: selectedManager.email },
                    { icon: <Phone size={14} />, label: 'Phone', value: selectedManager.phone || '—' },
                    { icon: <Building2 size={14} />, label: 'Department', value: selectedManager.department },
                    { icon: <MapPin size={14} />, label: 'Location', value: selectedManager.location },
                    { icon: <Users size={14} />, label: 'Drivers Managed', value: String(selectedManager.driversManaged) },
                    { icon: <Briefcase size={14} />, label: 'Vehicles Managed', value: String(selectedManager.vehiclesManaged) },
                    { icon: <Calendar size={14} />, label: 'Joined', value: selectedManager.joinDate || '—' },
                  ].map((row) => (
                    <div key={row.label} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">{row.icon}{row.label}</div>
                      <p className="text-sm font-medium text-black dark:text-white break-all">{row.value}</p>
                    </div>
                  ))}
                </div>

                {selectedManager.notes && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3">
                    <p className="text-xs text-zinc-500 mb-1">Notes</p>
                    <p className="text-sm text-black dark:text-white">{selectedManager.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 px-6 pb-5">
                <button onClick={() => { setShowView(false); openEdit(selectedManager); }}
                  className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Modal ── */}
      {showDelete && selectedManager && (
        <>
          <Backdrop onClose={() => setShowDelete(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-black dark:text-white mb-2">Remove Manager?</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Are you sure you want to remove <span className="font-semibold text-black dark:text-white">{selectedManager.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
