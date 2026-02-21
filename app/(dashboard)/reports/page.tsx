'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Search,
  Loader2,
  Eye,
  X,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Package,
  Clock,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useOrders } from '@/firebase/hooks/useOrders';
import { useMaintenance } from '@/firebase/hooks/useMaintenance';
import { useAnalytics } from '@/firebase/hooks/useAnalytics';

type ReportType =
  | 'driver-performance'
  | 'fleet-analytics'
  | 'delivery-analytics'
  | 'route-optimization'
  | 'maintenance-schedule'
  | 'fuel-consumption';

interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  generatedDate: Date;
  dateRange: { start: Date; end: Date };
  metrics: Record<string, any>;
  icon: React.ReactNode;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { orders, analytics: orderAnalytics, loading: ordersLoading } = useOrders(user?.companyId);
  const { maintenanceRecords, analytics: maintenanceAnalytics, loading: maintenanceLoading } = useMaintenance(user?.companyId);
  const { fleetAnalytics, fuelAnalytics, costAnalytics, loading: analyticsLoading } = useAnalytics(user?.companyId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [reportForm, setReportForm] = useState({
    type: 'driver-performance' as ReportType,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  // Generate reports from Firebase data
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'RPT-001',
      name: 'Driver Performance - Current',
      type: 'driver-performance',
      description: 'Driver performance metrics including on-time delivery rates and efficiency scores',
      generatedDate: new Date(),
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      metrics: {
        totalOrders: orderAnalytics?.totalOrders || 0,
        successRate: ((orderAnalytics?.deliveredOrders || 0) / (orderAnalytics?.totalOrders || 1)) * 100 || 0,
        avgOrderValue: orderAnalytics?.avgOrderValue || 0,
      },
      icon: <Users size={20} />,
    },
    {
      id: 'RPT-002',
      name: 'Fleet Analytics - Current',
      type: 'fleet-analytics',
      description: 'Fleet performance including vehicle utilization and maintenance needs',
      generatedDate: new Date(),
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      metrics: {
        totalMaintenance: maintenanceAnalytics?.totalRecords || 0,
        completedMaintenance: maintenanceAnalytics?.completedCount || 0,
        totalMaintenanceCost: maintenanceAnalytics?.totalCost || 0,
      },
      icon: <Truck size={20} />,
    },
    {
      id: 'RPT-003',
      name: 'Delivery Analytics - Current',
      type: 'delivery-analytics',
      description: 'Delivery performance including completion rates and efficiency metrics',
      generatedDate: new Date(),
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      metrics: {
        totalDeliveries: orderAnalytics?.totalOrders || 0,
        completedDeliveries: orderAnalytics?.deliveredOrders || 0,
        successRate: ((orderAnalytics?.deliveredOrders || 0) / (orderAnalytics?.totalOrders || 1)) * 100 || 0,
      },
      icon: <Package size={20} />,
    },
    {
      id: 'RPT-005',
      name: 'Fuel Consumption Report',
      type: 'fuel-consumption',
      description: 'Detailed fuel consumption analysis with cost tracking and efficiency trends',
      generatedDate: new Date(),
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      metrics: {
        avgFuelEfficiency: fuelAnalytics?.avgFuelEfficiency || 0,
        estimatedMonthlyCost: costAnalytics?.estimatedMonthlyCost || 0,
      },
      icon: <TrendingUp size={20} />,
    },
  ]);

  const reportTypes = [
    {
      id: 'driver-performance',
      label: 'Driver Performance',
      icon: <Users size={20} />,
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'fleet-analytics',
      label: 'Fleet Analytics',
      icon: <Truck size={20} />,
      color: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'delivery-analytics',
      label: 'Delivery Analytics',
      icon: <Package size={20} />,
      color: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      id: 'route-optimization',
      label: 'Route Optimization',
      icon: <MapPin size={20} />,
      color: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: 'maintenance-schedule',
      label: 'Maintenance Schedule',
      icon: <Clock size={20} />,
      color: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      id: 'fuel-consumption',
      label: 'Fuel Consumption',
      icon: <TrendingUp size={20} />,
      color: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newReport: Report = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      name: `${reportTypes.find(t => t.id === reportForm.type)?.label || 'Report'} - ${reportForm.endDate.toLocaleDateString()}`,
      type: reportForm.type,
      description: `Generated on ${new Date().toLocaleDateString()}`,
      generatedDate: new Date(),
      dateRange: {
        start: reportForm.startDate,
        end: reportForm.endDate,
      },
      metrics: {
        status: 'Generated successfully',
        records: Math.floor(Math.random() * 500) + 50,
      },
      icon: reportTypes.find(t => t.id === reportForm.type)?.icon || <BarChart3 size={20} />,
    };

    setReports([newReport, ...reports]);
    setShowGenerateModal(false);
    setIsGenerating(false);
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleDownloadReport = (report: Report) => {
    // Simulate download
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.id}-${report.type}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">Reports</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Generate and analyze comprehensive business reports</p>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-end mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter size={18} />
              Filter
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Generate Report
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">Report Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  All
                </button>
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setTypeFilter(type.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Generate Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black dark:text-white mb-4">Quick Generate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setReportForm(prev => ({ ...prev, type: type.id as ReportType }));
                  setShowGenerateModal(true);
                }}
                className={`${type.color} dark:border dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow text-left`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {type.icon}
                  <h3 className="font-semibold text-black dark:text-white">{type.label}</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Generate {type.label.toLowerCase()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black dark:text-white mb-4">Recent Reports</h2>
          {filteredReports.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <FileText className="mx-auto text-zinc-400 mb-4" size={48} />
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">No reports found</p>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
                {typeFilter !== 'all' ? 'Try changing your filters' : 'Generate your first report to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 flex items-start gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black dark:text-white">{report.name}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                              {report.dateRange.start.toLocaleDateString()} - {report.dateRange.end.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{report.generatedDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(report)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={20} className="text-zinc-600 dark:text-zinc-400" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={20} className="text-zinc-600 dark:text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black dark:text-white">Generate Report</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Report Type</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value as ReportType }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Start Date</label>
                <input
                  type="date"
                  value={reportForm.startDate.toISOString().split('T')[0]}
                  onChange={(e) =>
                    setReportForm(prev => ({
                      ...prev,
                      startDate: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">End Date</label>
                <input
                  type="date"
                  value={reportForm.endDate.toISOString().split('T')[0]}
                  onChange={(e) =>
                    setReportForm(prev => ({
                      ...prev,
                      endDate: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p>Report will be generated for the selected period and added to your recent reports list.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedReport.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Report ID</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedReport.id}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Generated</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {selectedReport.generatedDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Period Start</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {selectedReport.dateRange.start.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Period End</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {selectedReport.dateRange.end.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="font-semibold text-black dark:text-white mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedReport.metrics).map(([key, value]) => (
                    <div key={key} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-semibold text-black dark:text-white">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Report
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
