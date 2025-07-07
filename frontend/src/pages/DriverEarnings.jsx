import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Download,
  Eye,
  Filter,
  RefreshCw,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Target,
  Award
} from 'lucide-react';

const DriverEarnings = () => {
  const [earningsData, setEarningsData] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [tripEarnings, setTripEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod, filters]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      // Mock earnings data
      const mockEarningsData = {
        today: {
          total: 245.50,
          trips: 8,
          hours: 6.5,
          average_per_trip: 30.69,
          bonus: 25.00
        },
        week: {
          total: 1456.75,
          trips: 42,
          hours: 38.5,
          average_per_trip: 34.69,
          bonus: 150.00
        },
        month: {
          total: 6234.25,
          trips: 178,
          hours: 165.5,
          average_per_trip: 35.02,
          bonus: 450.00
        },
        year: {
          total: 45678.90,
          trips: 1247,
          hours: 1456.5,
          average_per_trip: 36.64,
          bonus: 2500.00
        }
      };

      const mockPaymentHistory = [
        {
          id: 1,
          date: '2024-01-15',
          amount: 1456.75,
          period: 'Week of Jan 8-14, 2024',
          status: 'completed',
          method: 'Direct Deposit',
          reference: 'PAY-2024-001'
        },
        {
          id: 2,
          date: '2024-01-08',
          amount: 1234.50,
          period: 'Week of Jan 1-7, 2024',
          status: 'completed',
          method: 'Direct Deposit',
          reference: 'PAY-2024-002'
        },
        {
          id: 3,
          date: '2024-01-01',
          amount: 1567.25,
          period: 'Week of Dec 25-31, 2023',
          status: 'completed',
          method: 'Direct Deposit',
          reference: 'PAY-2023-052'
        }
      ];

      const mockTripEarnings = [
        {
          id: 1,
          date: '2024-01-15',
          time: '14:30',
          pickup: 'Downtown Mall',
          dropoff: 'Airport Terminal 2',
          distance: 23.5,
          duration: 35,
          base_fare: 15.00,
          distance_fare: 18.50,
          time_fare: 8.00,
          surge_multiplier: 1.2,
          tips: 5.00,
          bonus: 2.00,
          total: 45.50,
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-15',
          time: '11:15',
          pickup: 'Hotel Grand Plaza',
          dropoff: 'Business District',
          distance: 12.8,
          duration: 22,
          base_fare: 12.00,
          distance_fare: 10.75,
          time_fare: 4.50,
          surge_multiplier: 1.0,
          tips: 3.50,
          bonus: 0.00,
          total: 28.75,
          status: 'completed'
        }
      ];

      setEarningsData(mockEarningsData);
      setPaymentHistory(mockPaymentHistory);
      setTripEarnings(mockTripEarnings);
      
      toast.success('Earnings data loaded successfully');
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    setFilters({
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPeriodData = earningsData[selectedPeriod] || earningsData.week;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
              <p className="mt-2 text-gray-600">Track your earnings and payment history</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchEarningsData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['today', 'week', 'month', 'year'].map((period) => (
              <Button
                key={period}
                onClick={() => handlePeriodChange(period)}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentPeriodData.total)}</p>
                  <p className="text-xs text-gray-500">
                    {currentPeriodData.trips} trips • {currentPeriodData.hours}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average per Trip</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentPeriodData.average_per_trip)}</p>
                  <p className="text-xs text-gray-500">Per completed trip</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bonuses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentPeriodData.bonus)}</p>
                  <p className="text-xs text-gray-500">Performance bonuses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                  <p className="text-2xl font-bold text-gray-900">{currentPeriodData.hours}h</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(currentPeriodData.total / currentPeriodData.hours)}/hour
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown and Payment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Trip Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Recent Trip Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripEarnings.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {trip.pickup} → {trip.dropoff}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(trip.total)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {trip.date} at {trip.time} • {trip.distance} mi • {trip.duration} min
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Base: {formatCurrency(trip.base_fare)}</div>
                      <div>Distance: {formatCurrency(trip.distance_fare)}</div>
                      <div>Time: {formatCurrency(trip.time_fare)}</div>
                      <div>Tips: {formatCurrency(trip.tips)}</div>
                    </div>
                    {trip.surge_multiplier > 1 && (
                      <div className="mt-2">
                        <Badge className="bg-orange-100 text-orange-800">
                          {trip.surge_multiplier}x Surge
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{payment.period}</div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(payment.status)}
                        <div className="text-xs text-gray-500 mt-1">{payment.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{payment.method}</span>
                      <span>Ref: {payment.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Earnings Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-600">Peak Hours</h3>
                <p className="text-2xl font-bold text-blue-800">7-9 AM</p>
                <p className="text-sm text-blue-600">Highest earnings</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-600">Best Day</h3>
                <p className="text-2xl font-bold text-green-800">Friday</p>
                <p className="text-sm text-green-600">Average {formatCurrency(67.50)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-600">Efficiency</h3>
                <p className="text-2xl font-bold text-purple-800">92%</p>
                <p className="text-sm text-purple-600">Trip completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverEarnings;
