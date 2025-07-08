import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  RefreshCw,
  Download,
  Filter,
  Search,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
  MapPin,
  Clock,
  User,
  Car
} from 'lucide-react';

const CashSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    total_cash_sales: 0,
    total_digital_sales: 0,
    total_trips: 0,
    total_earnings: 0,
    cash_percentage: 0,
    digital_percentage: 0,
    average_trip_value: 0
  });
  const [filters, setFilters] = useState({
    date_range: 'today',
    payment_method: 'all',
    driver: '',
    search: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Fetch sales data
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching cash sales report data...');

      // Get trips data with payment method breakdown
      const tripsResponse = await axiosInstance.get('/trips/trips/', {
        params: {
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          driver: filters.driver || undefined,
          ordering: '-created_at'
        }
      });

      const trips = tripsResponse.data.results || tripsResponse.data || [];
      console.log('✅ Trips data loaded:', trips.length, 'trips');

      // Calculate summary statistics
      const cashTrips = trips.filter(trip => trip.payment_method === 'cash');
      const digitalTrips = trips.filter(trip => ['digital', 'card', 'wallet'].includes(trip.payment_method));
      
      const totalCashSales = cashTrips.reduce((sum, trip) => sum + parseFloat(trip.driver_earnings || 0), 0);
      const totalDigitalSales = digitalTrips.reduce((sum, trip) => sum + parseFloat(trip.driver_earnings || 0), 0);
      const totalEarnings = totalCashSales + totalDigitalSales;
      
      const summaryStats = {
        total_cash_sales: totalCashSales,
        total_digital_sales: totalDigitalSales,
        total_trips: trips.length,
        total_earnings: totalEarnings,
        cash_percentage: totalEarnings > 0 ? (totalCashSales / totalEarnings) * 100 : 0,
        digital_percentage: totalEarnings > 0 ? (totalDigitalSales / totalEarnings) * 100 : 0,
        average_trip_value: trips.length > 0 ? totalEarnings / trips.length : 0
      };

      setSalesData(trips);
      setSummary(summaryStats);
      console.log('✅ Sales summary calculated:', summaryStats);

    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      toast.error('Failed to load sales data');
      setSalesData([]);
      setSummary({
        total_cash_sales: 0,
        total_digital_sales: 0,
        total_trips: 0,
        total_earnings: 0,
        cash_percentage: 0,
        digital_percentage: 0,
        average_trip_value: 0
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters.driver]);

  // Fetch drivers for filter
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/Register/drivers/');
      const driversData = response.data.results || response.data || [];
      setDrivers(driversData);
      console.log('✅ Drivers loaded for filter:', driversData.length);
    } catch (error) {
      console.error('❌ Error fetching drivers:', error);
      setDrivers([]);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Filter sales data based on search and payment method
  const filteredSalesData = salesData.filter(trip => {
    const matchesSearch = !filters.search || 
      trip.customer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.pickup_location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.dropoff_location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.trip_id?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesPaymentMethod = filters.payment_method === 'all' || 
      (filters.payment_method === 'cash' && trip.payment_method === 'cash') ||
      (filters.payment_method === 'digital' && ['digital', 'card', 'wallet'].includes(trip.payment_method));

    return matchesSearch && matchesPaymentMethod;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    const badgeProps = {
      cash: { variant: 'default', className: 'bg-green-100 text-green-800', icon: Banknote },
      digital: { variant: 'secondary', className: 'bg-blue-100 text-blue-800', icon: CreditCard },
      card: { variant: 'secondary', className: 'bg-blue-100 text-blue-800', icon: CreditCard },
      wallet: { variant: 'secondary', className: 'bg-purple-100 text-purple-800', icon: CreditCard }
    };

    const props = badgeProps[method] || badgeProps.digital;
    const IconComponent = props.icon;

    return (
      <Badge className={props.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {method?.charAt(0).toUpperCase() + method?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  // Export sales data
  const exportSalesData = () => {
    const csvContent = [
      ['Trip ID', 'Date', 'Driver', 'Customer', 'Pickup', 'Dropoff', 'Payment Method', 'Earnings'].join(','),
      ...filteredSalesData.map(trip => [
        trip.trip_id || '',
        trip.created_at || '',
        trip.driver_name || '',
        trip.customer_name || '',
        trip.pickup_location || '',
        trip.dropoff_location || '',
        trip.payment_method || '',
        trip.driver_earnings || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-sales-report-${dateRange.start_date}-${dateRange.end_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('✅ Sales report exported successfully!');
  };

  if (loading && salesData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading sales report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Sales Report</h1>
          <p className="text-gray-600 mt-1">Track cash vs digital payment trends and earnings</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={fetchSalesData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportSalesData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={filters.payment_method}
                onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash Only</option>
                <option value="digital">Digital Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
              <select
                value={filters.driver}
                onChange={(e) => setFilters(prev => ({ ...prev, driver: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.driver_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by customer, location, or trip ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Banknote className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash Sales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_cash_sales)}</p>
                <p className="text-xs text-gray-500">{summary.cash_percentage.toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Digital Sales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_digital_sales)}</p>
                <p className="text-xs text-gray-500">{summary.digital_percentage.toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_trips}</p>
                <p className="text-xs text-gray-500">in selected period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Trip Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.average_trip_value)}</p>
                <p className="text-xs text-gray-500">per trip average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sales Transactions ({filteredSalesData.length})
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PieChart className="w-4 h-4" />
              Cash: {summary.cash_percentage.toFixed(1)}% | Digital: {summary.digital_percentage.toFixed(1)}%
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSalesData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales data found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Trip Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Driver</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesData.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">#{trip.trip_id}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(trip.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {trip.driver_name || 'Unknown Driver'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {trip.customer_name || 'Unknown Customer'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <MapPin className="w-3 h-3 mr-1 text-green-500" />
                            <span className="truncate max-w-32">{trip.pickup_location}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-red-500" />
                            <span className="truncate max-w-32">{trip.dropoff_location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getPaymentMethodBadge(trip.payment_method)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(trip.driver_earnings)}
                        </div>
                        {trip.tip_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            +{formatCurrency(trip.tip_amount)} tip
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashSalesReport;
