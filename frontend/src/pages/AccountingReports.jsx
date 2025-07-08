import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  Printer,
  Mail,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';

const AccountingReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    report_type: '',
    period: 'current_month',
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    format: 'pdf'
  });

  const [summary, setSummary] = useState({
    total_reports: 0,
    generated_this_month: 0,
    pending_reports: 0,
    scheduled_reports: 0
  });

  // Available report types
  const reportTypes = [
    {
      id: 'profit_loss',
      name: 'Profit & Loss Statement',
      description: 'Comprehensive income and expense report',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'Financial'
    },
    {
      id: 'balance_sheet',
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity overview',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'Financial'
    },
    {
      id: 'cash_flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      icon: <DollarSign className="w-5 h-5" />,
      category: 'Financial'
    },
    {
      id: 'budget_variance',
      name: 'Budget Variance Report',
      description: 'Budget vs actual performance analysis',
      icon: <PieChart className="w-5 h-5" />,
      category: 'Budget'
    },
    {
      id: 'payroll_summary',
      name: 'Payroll Summary',
      description: 'Driver payroll and earnings report',
      icon: <FileText className="w-5 h-5" />,
      category: 'Payroll'
    },
    {
      id: 'expense_analysis',
      name: 'Expense Analysis',
      description: 'Detailed expense breakdown by category',
      icon: <TrendingDown className="w-5 h-5" />,
      category: 'Expenses'
    },
    {
      id: 'income_analysis',
      name: 'Income Analysis',
      description: 'Revenue streams and income sources',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'Income'
    },
    {
      id: 'tax_report',
      name: 'Tax Report',
      description: 'Tax-related transactions and summaries',
      icon: <FileText className="w-5 h-5" />,
      category: 'Tax'
    }
  ];

  useEffect(() => {
    fetchReports();
    fetchSummary();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading accounting reports from API...');

      const response = await axiosInstance.get('/accounting/reports/');
      const reportsData = Array.isArray(response.data) ? response.data : [];
      setReports(reportsData);

      console.log('✅ Reports loaded from API:', reportsData.length);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log('📈 Loading reports summary from API...');
      const response = await axiosInstance.get('/accounting/reports/summary/');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({
        total_reports: 0,
        generated_this_month: 0,
        pending_reports: 0,
        scheduled_reports: 0
      });
    }
  };

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      console.log('📊 Generating report via API...');

      const reportData = {
        type: reportType,
        period: filters.period,
        format: 'pdf'
      };

      const response = await axiosInstance.post('/accounting/reports/generate/', reportData);

      toast.success('Report generation started successfully!');

      // Refresh reports list to show the new report
      await fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      // Simulate download
      toast.success('Report download started');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      generating: { color: 'bg-yellow-100 text-yellow-800', label: 'Generating' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounting Reports</h1>
          <p className="mt-2 text-gray-600">Generate and manage financial reports</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_reports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.generated_this_month}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.pending_reports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.scheduled_reports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  name="period"
                  value={filters.period}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="current_month">Current Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="current_quarter">Current Quarter</option>
                  <option value="last_quarter">Last Quarter</option>
                  <option value="current_year">Current Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  name="format"
                  value={filters.format}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((reportType) => (
                <Card key={reportType.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      {reportType.icon}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{reportType.name}</h3>
                        <p className="text-xs text-gray-500">{reportType.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{reportType.description}</p>
                    <Button
                      onClick={() => generateReport(reportType.id)}
                      disabled={loading}
                      className="w-full text-xs"
                      size="sm"
                    >
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Reports
              </div>
              <Button
                onClick={fetchReports}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reportTypes.find(t => t.id === report.type)?.name || report.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.period}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.generated_at ? new Date(report.generated_at).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.file_size || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {report.status === 'completed' && (
                            <>
                              <Button
                                onClick={() => downloadReport(report.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => setSelectedReport(report)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {report.status === 'generating' && (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-sm text-gray-500">Generating...</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reports.length === 0 && !loading && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate your first report using the options above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingReports;
