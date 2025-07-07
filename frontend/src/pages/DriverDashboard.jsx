import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import {
  User,
  DollarSign,
  MapPin,
  Clock,
  Car,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  Navigation,
  Fuel,
  Settings,
  Bell,
  Star,
  Award,
  Target,
  Activity
} from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [todayStats, setTodayStats] = useState({});
  const [weeklyStats, setWeeklyStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [recentTrips, setRecentTrips] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDriverDashboardData();
    }
  }, [user]);

  const fetchDriverDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - replace with actual API endpoints
      const mockDriverData = {
        id: user.id || 1,
        name: user.name || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        license_number: 'DL123456789',
        license_expiry: '2025-12-31',
        status: 'active',
        rating: 4.8,
        total_trips: 1247,
        years_experience: 5,
        profile_image: null,
        address: '123 Main St, City, State 12345',
        emergency_contact: '+1 (555) 987-6543'
      };

      const mockTodayStats = {
        trips_completed: 3,
        trips_scheduled: 5,
        earnings: 245.50,
        hours_worked: 6.5,
        distance_covered: 127.3,
        fuel_consumed: 12.8
      };

      const mockWeeklyStats = {
        trips_completed: 18,
        total_earnings: 1456.75,
        hours_worked: 42.5,
        distance_covered: 892.1,
        average_rating: 4.7
      };

      const mockMonthlyStats = {
        trips_completed: 78,
        total_earnings: 6234.25,
        hours_worked: 168.5,
        distance_covered: 3456.8,
        bonus_earned: 250.00
      };

      const mockRecentTrips = [
        {
          id: 1,
          pickup_location: 'Downtown Mall',
          dropoff_location: 'Airport Terminal 2',
          date: '2024-01-15',
          time: '14:30',
          status: 'completed',
          earnings: 45.50,
          distance: 23.5,
          duration: '35 min',
          rating: 5
        },
        {
          id: 2,
          pickup_location: 'Hotel Grand Plaza',
          dropoff_location: 'Business District',
          date: '2024-01-15',
          time: '11:15',
          status: 'completed',
          earnings: 28.75,
          distance: 12.8,
          duration: '22 min',
          rating: 4
        },
        {
          id: 3,
          pickup_location: 'Residential Area',
          dropoff_location: 'Shopping Center',
          date: '2024-01-15',
          time: '09:45',
          status: 'completed',
          earnings: 18.25,
          distance: 8.2,
          duration: '18 min',
          rating: 5
        }
      ];

      const mockUpcomingTrips = [
        {
          id: 4,
          pickup_location: 'Central Station',
          dropoff_location: 'University Campus',
          date: '2024-01-16',
          time: '08:00',
          status: 'scheduled',
          estimated_earnings: 32.00,
          estimated_distance: 15.2,
          estimated_duration: '25 min'
        },
        {
          id: 5,
          pickup_location: 'Medical Center',
          dropoff_location: 'Suburban Mall',
          date: '2024-01-16',
          time: '10:30',
          status: 'scheduled',
          estimated_earnings: 41.50,
          estimated_distance: 19.8,
          estimated_duration: '32 min'
        }
      ];

      const mockEarnings = {
        today: 245.50,
        week: 1456.75,
        month: 6234.25,
        year: 45678.90,
        pending_payment: 1456.75,
        last_payment_date: '2024-01-10',
        next_payment_date: '2024-01-25'
      };

      const mockNotifications = [
        {
          id: 1,
          type: 'trip',
          title: 'New Trip Assigned',
          message: 'You have a new trip scheduled for tomorrow at 8:00 AM',
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'payment',
          title: 'Payment Processed',
          message: 'Your weekly payment of $1,456.75 has been processed',
          time: '1 day ago',
          read: false
        },
        {
          id: 3,
          type: 'document',
          title: 'License Renewal Reminder',
          message: 'Your driving license expires in 11 months',
          time: '3 days ago',
          read: true
        }
      ];

      const mockVehicleInfo = {
        id: 1,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        license_plate: 'ABC-1234',
        color: 'Silver',
        mileage: 45678,
        fuel_type: 'Gasoline',
        insurance_expiry: '2024-08-15',
        registration_expiry: '2024-06-30',
        last_maintenance: '2024-01-01',
        next_maintenance: '2024-04-01'
      };

      // Set all data
      setDriverData(mockDriverData);
      setTodayStats(mockTodayStats);
      setWeeklyStats(mockWeeklyStats);
      setMonthlyStats(mockMonthlyStats);
      setRecentTrips(mockRecentTrips);
      setUpcomingTrips(mockUpcomingTrips);
      setEarnings(mockEarnings);
      setNotifications(mockNotifications);
      setVehicleInfo(mockVehicleInfo);

      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching driver dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {driverData?.name}!
              </h1>
              <p className="mt-2 text-gray-600">Here's your driving summary for today</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications ({notifications.filter(n => !n.read).length})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Driver Profile Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{driverData?.name}</h2>
                  {getStatusBadge(driverData?.status)}
                  <div className="flex items-center">
                    {getRatingStars(driverData?.rating)}
                    <span className="ml-2 text-sm text-gray-600">({driverData?.rating})</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {driverData?.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {driverData?.phone}
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    License: {driverData?.license_number}
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    {driverData?.total_trips} Total Trips
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trips Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{todayStats.trips_completed}</p>
                  <p className="text-xs text-gray-500">of {todayStats.trips_scheduled} scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayStats.earnings)}</p>
                  <p className="text-xs text-gray-500">{todayStats.hours_worked}h worked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Navigation className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Distance Covered</p>
                  <p className="text-2xl font-bold text-gray-900">{todayStats.distance_covered} mi</p>
                  <p className="text-xs text-gray-500">{todayStats.fuel_consumed}L fuel used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                  <p className="text-2xl font-bold text-gray-900">{todayStats.hours_worked}h</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Earnings Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(earnings.week)}</p>
                  <p className="text-xs text-gray-500">{weeklyStats.trips_completed} trips</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(earnings.month)}</p>
                  <p className="text-xs text-gray-500">{monthlyStats.trips_completed} trips</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Year</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(earnings.year)}</p>
                  <p className="text-xs text-gray-500">Total earnings</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{formatCurrency(earnings.pending_payment)}</p>
                  <p className="text-xs text-gray-500">Next: {earnings.next_payment_date}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model}
                  </p>
                  <p className="text-xs text-gray-500">{vehicleInfo?.license_plate}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Mileage</p>
                    <p className="font-medium">{vehicleInfo?.mileage?.toLocaleString()} mi</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fuel Type</p>
                    <p className="font-medium">{vehicleInfo?.fuel_type}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Insurance</span>
                    <span className={`font-medium ${
                      new Date(vehicleInfo?.insurance_expiry) < new Date(Date.now() + 30*24*60*60*1000)
                        ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {vehicleInfo?.insurance_expiry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-600">Next Maintenance</span>
                    <span className="font-medium text-blue-600">{vehicleInfo?.next_maintenance}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent and Upcoming Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Recent Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(trip.status)}
                        <div className="flex items-center">
                          {getRatingStars(trip.rating)}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(trip.earnings)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.pickup_location} → {trip.dropoff_location}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{trip.date} at {trip.time}</span>
                        <span>{trip.distance} mi • {trip.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(trip.status)}
                      <span className="text-sm font-medium text-blue-600">
                        Est. {formatCurrency(trip.estimated_earnings)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.pickup_location} → {trip.dropoff_location}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{trip.date} at {trip.time}</span>
                        <span>{trip.estimated_distance} mi • {trip.estimated_duration}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.read ? 'bg-gray-400' : 'bg-blue-600'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;
