'use client';

import { useState } from 'react';
import {
  Building2,
  User,
  Lock,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'company' | 'profile' | 'security';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company', icon: <Building2 size={18} /> },
  { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
  { id: 'security', label: 'Security', icon: <Lock size={18} /> },
];

// ─── Reusable field ───────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text', icon, placeholder, readOnly,
}: {
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

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={3}
        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      />
    </div>
  );
}

// ─── Company Tab ──────────────────────────────────────────────────────────────

function CompanyTab() {
  const [form, setForm] = useState({
    name: 'FleetFlow Logistics Pvt. Ltd.',
    email: 'admin@fleetflow.in',
    phone: '+91 98765 43210',
    website: 'www.fleetflow.in',
    industry: 'Logistics & Transportation',
    gst: '27AABCU9603R1ZX',
    pan: 'AABCU9603R',
    address: '14, Industrial Area, Phase II',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400093',
    country: 'India',
    description: 'Full-service fleet management and logistics company operating across India.',
  });
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-4">Company Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-black dark:bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white dark:text-black font-bold text-2xl">FF</span>
          </div>
          <div>
            <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Camera size={14} /> Upload Logo
            </button>
            <p className="text-xs text-zinc-500 mt-2">PNG, JPG up to 2MB. Recommended: 200×200px</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Field label="Company Name" value={form.name} onChange={set('name')} icon={<Building2 size={15} />} />
          </div>
          <Field label="Business Email" value={form.email} onChange={set('email')} type="email" icon={<Mail size={15} />} />
          <Field label="Phone Number" value={form.phone} onChange={set('phone')} icon={<Phone size={15} />} />
          <Field label="Website" value={form.website} onChange={set('website')} icon={<Globe size={15} />} />
          <Field label="Industry" value={form.industry} onChange={set('industry')} icon={<Briefcase size={15} />} />
          <div className="md:col-span-2">
            <TextArea label="Company Description" value={form.description} onChange={set('description')} placeholder="Brief description of your company..." />
          </div>
        </div>
      </div>

      {/* Tax Info */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Tax & Legal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="GST Number" value={form.gst} onChange={set('gst')} placeholder="e.g. 27XXXXX0000X1ZX" />
          <Field label="PAN Number" value={form.pan} onChange={set('pan')} placeholder="e.g. XXXXX0000X" />
        </div>
      </div>

      {/* Address */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Registered Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Field label="Street Address" value={form.address} onChange={set('address')} icon={<MapPin size={15} />} />
          </div>
          <Field label="City" value={form.city} onChange={set('city')} />
          <Field label="State" value={form.state} onChange={set('state')} />
          <Field label="Pincode" value={form.pincode} onChange={set('pincode')} />
          <Field label="Country" value={form.country} onChange={set('country')} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}>
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const [form, setForm] = useState({
    firstName: 'Arjun', lastName: 'Sharma',
    email: 'arjun.sharma@fleetflow.in', phone: '+91 99887 65432',
    role: 'Admin', department: 'Operations',
    bio: 'Fleet operations manager with 8+ years of experience.',
    timezone: 'Asia/Kolkata', language: 'English',
  });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <div>
            <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Camera size={14} /> Change Photo
            </button>
            <p className="text-xs text-zinc-500 mt-2">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="First Name" value={form.firstName} onChange={set('firstName')} />
          <Field label="Last Name" value={form.lastName} onChange={set('lastName')} />
          <Field label="Email Address" value={form.email} onChange={set('email')} type="email" icon={<Mail size={15} />} />
          <Field label="Phone" value={form.phone} onChange={set('phone')} icon={<Phone size={15} />} />
          <Field label="Role" value={form.role} readOnly />
          <Field label="Department" value={form.department} onChange={set('department')} />
          <div className="md:col-span-2">
            <TextArea label="Bio" value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself..." />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Timezone</label>
            <select value={form.timezone} onChange={(e) => set('timezone')(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
              {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'].map((tz) => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Language</label>
            <select value={form.language} onChange={(e) => set('language')(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
              {['English', 'Hindi', 'Tamil', 'Marathi'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}>
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setError('All fields are required.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setError('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setSaved(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setSaved(false), 2500);
  };

  const PasswordField = ({ field, label }: { field: 'current' | 'newPw' | 'confirm'; label: string }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type={show[field] ? 'text' : 'password'}
          value={pwForm[field]}
          onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow((s) => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
          {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold text-black dark:text-white mb-5">Change Password</h3>
        <div className="max-w-md space-y-4">
          <PasswordField field="current" label="Current Password" />
          <PasswordField field="newPw" label="New Password" />
          <PasswordField field="confirm" label="Confirm New Password" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {saved && <p className="text-green-500 text-sm flex items-center gap-1"><CheckCircle size={14} /> Password updated successfully!</p>}
          <button onClick={handleSave}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-sm px-5 py-2.5 rounded-lg hover:opacity-80 transition-opacity font-medium">
            <Lock size={14} /> Update Password
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-black dark:text-white">Active Sessions</h3>
        </div>
        {[
          { device: 'Chrome on Windows', location: 'Mumbai, IN', time: 'Current session', current: true },
          { device: 'Safari on iPhone', location: 'Mumbai, IN', time: '2 hours ago', current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4 border-b last:border-0 border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.current ? 'bg-green-500' : 'bg-zinc-400'}`} />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">{s.device}</p>
                <p className="text-xs text-zinc-500">{s.location} · {s.time}</p>
              </div>
            </div>
            {!s.current && (
              <button className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                Revoke <ChevronRight size={12} />
              </button>
            )}
            {s.current && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>}
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Permanently delete your account and all associated data.</p>
        <button className="text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('company');

  const content: Record<Tab, React.ReactNode> = {
    company: <CompanyTab />,
    profile: <ProfileTab />,
    security: <SecurityTab />,
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage company details, profile, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">{content[activeTab]}</div>
      </div>
    </div>
  );
}
