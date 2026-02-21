'use client';

import { useState } from 'react';
import {
  MapPin,
  Navigation,
  Truck,
  Package,
  Fuel,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  X,
  ChevronRight,
  Gauge,
  IndianRupee,
  CalendarDays,
  Weight,
  ArrowRight,
  Eye,
  PlayCircle,
  Flag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TripStatus = 'booked' | 'in-transit' | 'delivered' | 'cancelled';

interface Trip {
  id: string;
  tripId: string;
  vehicleName: string;
  vehicleType: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  cargoType: string;
  estimatedFuelCost: number;
  status: TripStatus;
  dispatchedAt: string;
  estimatedArrival: string;
  completedAt?: string;
  startOdometer?: number;
  endOdometer?: number;
  actualFuelExpense?: number;
  notes?: string;
}

// ─── Mock Data (driver's assigned trips) ─────────────────────────────────────

const initialTrips: Trip[] = [
  {
    id: '1', tripId: 'TRP-2401',
    vehicleName: 'Cargo Truck', vehicleType: 'Cargo Truck', vehiclePlate: 'MH 98 3456',
    origin: 'Mumbai Warehouse, Andheri East', destination: 'Pune Depot, Hinjewadi',
    cargoWeight: 2200, cargoType: 'Electronics', estimatedFuelCost: 3200,
    status: 'in-transit', dispatchedAt: '2026-02-21 08:30', estimatedArrival: '2026-02-21 14:00',
    startOdometer: 45230, notes: 'Handle with care – fragile items.',
  },
  {
    id: '2', tripId: 'TRP-2398',
    vehicleName: 'Trailer Truck', vehicleType: 'Trailer Truck', vehiclePlate: 'MH 02 2017',
    origin: 'Delhi Hub, Okhla Phase II', destination: 'Jaipur Depot, Sanganer',
    cargoWeight: 4800, cargoType: 'FMCG Goods', estimatedFuelCost: 5800,
    status: 'delivered', dispatchedAt: '2026-02-19 06:00', estimatedArrival: '2026-02-19 12:00',
    completedAt: '2026-02-19 11:45', startOdometer: 82100, endOdometer: 82570, actualFuelExpense: 5600,
  },
  {
    id: '3', tripId: 'TRP-2405',
    vehicleName: 'Mini Truck', vehicleType: 'Mini Truck', vehiclePlate: 'MH 45 7890',
    origin: 'Bangalore Cold Store, Whitefield', destination: 'Chennai Port, Anna Salai',
    cargoWeight: 1200, cargoType: 'Perishables', estimatedFuelCost: 4100,
    status: 'booked', dispatchedAt: '2026-02-22 07:00', estimatedArrival: '2026-02-22 17:30',
    notes: 'Temperature-controlled cargo. Keep below 8°C.',
  },
  {
    id: '4', tripId: 'TRP-2391',
    vehicleName: 'Pickup Van', vehicleType: 'Pickup Van', vehiclePlate: 'MH 12 5678',
    origin: 'Hyderabad DC, Nacharam', destination: 'Vizag Port, MVP Colony',
    cargoWeight: 800, cargoType: 'Auto Parts', estimatedFuelCost: 3500,
    status: 'cancelled', dispatchedAt: '2026-02-18 09:00', estimatedArrival: '2026-02-18 19:00',
    notes: 'Cancelled due to vehicle breakdown.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusConfig(status: TripStatus) {
  const map = {
    booked:     { label: 'Scheduled',  dot: 'bg-blue-500',   badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',   icon: <Clock size={13} /> },
    'in-transit': { label: 'In Transit', dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: <Navigation size={13} /> },
    delivered:  { label: 'Delivered',  dot: 'bg-green-500',  badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',  icon: <CheckCircle size={13} /> },
    cancelled:  { label: 'Cancelled',  dot: 'bg-red-500',    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',     icon: <XCircle size={13} /> },
  };
  return map[status];
}

// ─── Input field helper ───────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', icon, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: React.ReactNode; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
        />
      </div>
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, onView, onStartTrip, onCompleteTrip }: {
  trip: Trip;
  onView: () => void;
  onStartTrip: () => void;
  onCompleteTrip: () => void;
}) {
  const cfg = getStatusConfig(trip.status);

  return (
    <div className={`bg-zinc-50 dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${trip.status === 'in-transit' ? 'border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-amber-900/20 shadow-md' : 'border-zinc-200 dark:border-zinc-800'}`}>
      {/* Card top stripe */}
      <div className={`h-1 w-full ${trip.status === 'in-transit' ? 'bg-amber-400' : trip.status === 'delivered' ? 'bg-green-400' : trip.status === 'booked' ? 'bg-blue-400' : 'bg-red-400'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-black dark:text-white text-lg">{trip.tripId}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                {cfg.icon}{cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Truck size={12} />
              <span>{trip.vehicleName} · {trip.vehiclePlate}</span>
            </div>
          </div>
          <button onClick={onView}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Eye size={16} />
          </button>
        </div>

        {/* Route */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 mt-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="w-0.5 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <p className="text-xs text-zinc-500 mb-0.5">Origin</p>
                <p className="text-sm font-medium text-black dark:text-white leading-tight">{trip.origin}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Destination</p>
                <p className="text-sm font-medium text-black dark:text-white leading-tight">{trip.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg p-3 text-center">
            <Weight size={14} className="text-zinc-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-black dark:text-white">{trip.cargoWeight} kg</p>
            <p className="text-xs text-zinc-500">Cargo</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg p-3 text-center">
            <Fuel size={14} className="text-zinc-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-black dark:text-white">₹{trip.estimatedFuelCost.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Est. Fuel</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg p-3 text-center">
            <CalendarDays size={14} className="text-zinc-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-black dark:text-white">{trip.estimatedArrival.split(' ')[1]}</p>
            <p className="text-xs text-zinc-500">ETA</p>
          </div>
        </div>

        {/* Odometer summary for completed */}
        {trip.status === 'delivered' && trip.startOdometer && trip.endOdometer && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                <Gauge size={14} />
                <span className="font-medium">{trip.endOdometer - trip.startOdometer} km travelled</span>
              </div>
              {trip.actualFuelExpense && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                  <IndianRupee size={11} />
                  <span>{trip.actualFuelExpense.toLocaleString()} fuel spent</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {trip.status === 'booked' && (
          <button onClick={onStartTrip}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlayCircle size={16} /> Start Trip
          </button>
        )}
        {trip.status === 'in-transit' && (
          <button onClick={onCompleteTrip}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <Flag size={16} /> Mark as Completed
          </button>
        )}
        {trip.status === 'delivered' && (
          <div className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl text-sm font-medium">
            <CheckCircle size={15} /> Trip Completed
          </div>
        )}
        {trip.status === 'cancelled' && (
          <div className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl text-sm font-medium">
            <XCircle size={15} /> Trip Cancelled
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyTripPage() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [activeTab, setActiveTab] = useState<'all' | TripStatus>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Modals
  const [showView, setShowView] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Start form
  const [startOdometer, setStartOdometer] = useState('');
  const [startError, setStartError] = useState('');

  // Complete form
  const [endOdometer, setEndOdometer] = useState('');
  const [fuelExpense, setFuelExpense] = useState('');
  const [completeError, setCompleteError] = useState('');

  // ── Counts ──
  const counts = {
    all: trips.length,
    booked: trips.filter((t) => t.status === 'booked').length,
    'in-transit': trips.filter((t) => t.status === 'in-transit').length,
    delivered: trips.filter((t) => t.status === 'delivered').length,
    cancelled: trips.filter((t) => t.status === 'cancelled').length,
  };

  const filtered = activeTab === 'all' ? trips : trips.filter((t) => t.status === activeTab);

  // ── Handlers ──
  const openStartModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setStartOdometer('');
    setStartError('');
    setShowStartModal(true);
  };

  const openCompleteModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setEndOdometer('');
    setFuelExpense('');
    setCompleteError('');
    setShowCompleteModal(true);
  };

  const handleStartTrip = () => {
    if (!startOdometer.trim() || isNaN(Number(startOdometer)) || Number(startOdometer) <= 0) {
      setStartError('Please enter a valid odometer reading.');
      return;
    }
    setTrips((prev) => prev.map((t) => t.id === selectedTrip?.id
      ? { ...t, status: 'in-transit', startOdometer: Number(startOdometer) }
      : t
    ));
    setShowStartModal(false);
  };

  const handleCompleteTrip = () => {
    if (!endOdometer.trim() || isNaN(Number(endOdometer)) || Number(endOdometer) <= 0) {
      setCompleteError('Please enter a valid end odometer reading.');
      return;
    }
    if (!fuelExpense.trim() || isNaN(Number(fuelExpense)) || Number(fuelExpense) < 0) {
      setCompleteError('Please enter a valid fuel expense.');
      return;
    }
    if (selectedTrip?.startOdometer && Number(endOdometer) <= selectedTrip.startOdometer) {
      setCompleteError(`End odometer must be greater than start odometer (${selectedTrip.startOdometer} km).`);
      return;
    }
    setTrips((prev) => prev.map((t) => t.id === selectedTrip?.id
      ? {
          ...t, status: 'delivered',
          endOdometer: Number(endOdometer),
          actualFuelExpense: Number(fuelExpense),
          completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        }
      : t
    ));
    setShowCompleteModal(false);
  };

  const Backdrop = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
  );

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">My Trips</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">View and manage your assigned trips</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',      value: counts.all,          icon: <Package size={18} />,    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Scheduled',  value: counts.booked,       icon: <Clock size={18} />,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'In Transit', value: counts['in-transit'], icon: <Navigation size={18} />, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Completed',  value: counts.delivered,    icon: <CheckCircle size={18} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className={`${s.bg} ${s.color} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-black dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {([
          { key: 'all',        label: `All (${counts.all})` },
          { key: 'booked',     label: `Scheduled (${counts.booked})` },
          { key: 'in-transit', label: `In Transit (${counts['in-transit']})` },
          { key: 'delivered',  label: `Completed (${counts.delivered})` },
          { key: 'cancelled',  label: `Cancelled (${counts.cancelled})` },
        ] as const).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip Cards */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <Package size={40} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No trips found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip}
              onView={() => { setSelectedTrip(trip); setShowView(true); }}
              onStartTrip={() => openStartModal(trip)}
              onCompleteTrip={() => openCompleteModal(trip)}
            />
          ))}
        </div>
      )}

      {/* ── View Modal ── */}
      {showView && selectedTrip && (
        <>
          <Backdrop onClose={() => setShowView(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <div>
                  <h2 className="font-bold text-black dark:text-white text-lg">{selectedTrip.tripId}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Trip Details</p>
                </div>
                <button onClick={() => setShowView(false)} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(selectedTrip.status).badge}`}>
                    {getStatusConfig(selectedTrip.status).icon}
                    {getStatusConfig(selectedTrip.status).label}
                  </span>
                </div>

                {/* Route */}
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Route</h3>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 mt-1 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-10 bg-zinc-200 dark:bg-zinc-700" />
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <p className="text-xs text-zinc-500">From</p>
                        <p className="text-sm font-medium text-black dark:text-white">{selectedTrip.origin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">To</p>
                        <p className="text-sm font-medium text-black dark:text-white">{selectedTrip.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Cargo */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Truck size={14} />, label: 'Vehicle', value: `${selectedTrip.vehicleName}` },
                    { icon: <MapPin size={14} />, label: 'Plate', value: selectedTrip.vehiclePlate },
                    { icon: <Weight size={14} />, label: 'Cargo Weight', value: `${selectedTrip.cargoWeight} kg` },
                    { icon: <Package size={14} />, label: 'Cargo Type', value: selectedTrip.cargoType },
                    { icon: <Fuel size={14} />, label: 'Est. Fuel Cost', value: `₹${selectedTrip.estimatedFuelCost.toLocaleString()}` },
                    { icon: <CalendarDays size={14} />, label: 'Dispatched', value: selectedTrip.dispatchedAt },
                    { icon: <Clock size={14} />, label: 'Est. Arrival', value: selectedTrip.estimatedArrival },
                    ...(selectedTrip.completedAt ? [{ icon: <CheckCircle size={14} />, label: 'Completed At', value: selectedTrip.completedAt }] : []),
                  ].map((row) => (
                    <div key={row.label} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-zinc-500 text-xs mb-1">{row.icon}{row.label}</div>
                      <p className="text-sm font-medium text-black dark:text-white">{row.value}</p>
                    </div>
                  ))}
                </div>

                {/* Odometer & Fuel (if available) */}
                {(selectedTrip.startOdometer || selectedTrip.endOdometer) && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">Trip Readings</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-zinc-500 mb-1">Start ODO</p>
                        <p className="font-bold text-black dark:text-white text-sm">{selectedTrip.startOdometer?.toLocaleString()} km</p>
                      </div>
                      {selectedTrip.endOdometer && (
                        <>
                          <div className="text-center">
                            <p className="text-xs text-zinc-500 mb-1">End ODO</p>
                            <p className="font-bold text-black dark:text-white text-sm">{selectedTrip.endOdometer?.toLocaleString()} km</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-zinc-500 mb-1">Distance</p>
                            <p className="font-bold text-green-600 dark:text-green-400 text-sm">{(selectedTrip.endOdometer - selectedTrip.startOdometer!).toLocaleString()} km</p>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedTrip.actualFuelExpense && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Actual Fuel Expense</span>
                        <span className="font-bold text-black dark:text-white">₹{selectedTrip.actualFuelExpense.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedTrip.notes && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Driver Notes</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{selectedTrip.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Start Trip Modal ── */}
      {showStartModal && selectedTrip && (
        <>
          <Backdrop onClose={() => setShowStartModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                    <PlayCircle size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-black dark:text-white">Start Trip</h2>
                    <p className="text-xs text-zinc-500">{selectedTrip.tripId} · {selectedTrip.origin.split(',')[0]} <ArrowRight size={10} className="inline" /> {selectedTrip.destination.split(',')[0]}</p>
                  </div>
                </div>
                <button onClick={() => setShowStartModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Record the <strong>current odometer reading</strong> of <strong>{selectedTrip.vehicleName} ({selectedTrip.vehiclePlate})</strong> before you begin. This will be used to calculate the distance covered.
                  </p>
                </div>

                <Field
                  label="Starting Odometer Reading (km) *"
                  value={startOdometer}
                  onChange={setStartOdometer}
                  type="number"
                  icon={<Gauge size={15} />}
                  placeholder="e.g. 45230"
                  hint="Enter the exact reading shown on the vehicle's odometer"
                />

                {startError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    <AlertCircle size={15} />{startError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowStartModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleStartTrip}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <PlayCircle size={15} /> Start Trip
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Complete Trip Modal ── */}
      {showCompleteModal && selectedTrip && (
        <>
          <Backdrop onClose={() => setShowCompleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                    <Flag size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-black dark:text-white">Complete Trip</h2>
                    <p className="text-xs text-zinc-500">{selectedTrip.tripId} · {selectedTrip.destination.split(',')[0]}</p>
                  </div>
                </div>
                <button onClick={() => setShowCompleteModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You have reached the destination. Please enter the <strong>end odometer reading</strong> and your <strong>actual fuel expense</strong> to complete this trip.
                  </p>
                </div>

                {/* Trip summary bar */}
                {selectedTrip.startOdometer && (
                  <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Gauge size={14} />
                      <span>Started at</span>
                    </div>
                    <span className="font-semibold text-black dark:text-white">{selectedTrip.startOdometer.toLocaleString()} km</span>
                  </div>
                )}

                <Field
                  label="End Odometer Reading (km) *"
                  value={endOdometer}
                  onChange={setEndOdometer}
                  type="number"
                  icon={<Gauge size={15} />}
                  placeholder={selectedTrip.startOdometer ? `Must be > ${selectedTrip.startOdometer}` : 'e.g. 45700'}
                  hint="Enter the reading shown on the odometer upon arrival"
                />

                <Field
                  label="Actual Fuel Expense (₹) *"
                  value={fuelExpense}
                  onChange={setFuelExpense}
                  type="number"
                  icon={<IndianRupee size={15} />}
                  placeholder={`Estimated: ₹${selectedTrip.estimatedFuelCost.toLocaleString()}`}
                  hint="Total amount spent on fuel for this trip"
                />

                {endOdometer && selectedTrip.startOdometer && Number(endOdometer) > selectedTrip.startOdometer && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Navigation size={13} />Distance covered</span>
                    <span className="font-bold text-black dark:text-white">
                      {(Number(endOdometer) - selectedTrip.startOdometer).toLocaleString()} km
                    </span>
                  </div>
                )}

                {completeError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    <AlertCircle size={15} />{completeError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleCompleteTrip}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Complete Trip
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
