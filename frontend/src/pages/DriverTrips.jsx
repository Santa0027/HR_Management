import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  MapPin,
  Clock,
  Navigation,
  Phone,
  MessageSquare,
  Star,
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  X,
  AlertTriangle,
  Route,
  User,
  Car,
  Fuel,
  Timer,
  Target
} from 'lucide-react';

const DriverTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [filters, setFilters] = useState({
    status: 'all',
    date_range: 'today'
  });

  useEffect(() => {
    fetchTrips();
  }, [activeTab, filters]);

  const fetchTrips = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🚗 Fetching trips for driver:', user.id);

      // Get current trip (in progress)
      let currentTripData = null;
      try {
        const currentTripResponse = await axiosInstance.get('/trips/trips/', {
          params: {
            driver: user.id,
            status: 'in_progress',
            limit: 1
          }
        });

        const currentTrips = currentTripResponse.data.results || currentTripResponse.data || [];
        if (currentTrips.length > 0) {
          const trip = currentTrips[0];
          currentTripData = {
            id: trip.id,
            pickup_location: trip.pickup_location || 'Unknown',
            pickup_coordinates: {
              lat: trip.pickup_latitude || 0,
              lng: trip.pickup_longitude || 0
            },
            dropoff_location: trip.dropoff_location || 'Unknown',
            dropoff_coordinates: {
              lat: trip.dropoff_latitude || 0,
              lng: trip.dropoff_longitude || 0
            },
            passenger_name: trip.customer_name || 'Unknown',
            passenger_phone: trip.customer_phone || 'N/A',
            scheduled_time: trip.pickup_time || trip.created_at,
            estimated_duration: trip.duration_minutes || 0,
            estimated_distance: parseFloat(trip.distance_km || 0),
            estimated_fare: parseFloat(trip.total_fare || 0),
            status: trip.status,
            trip_type: trip.trip_type || 'standard',
            special_instructions: trip.notes || '',
            started_at: trip.started_at || trip.created_at
          };
        }
        console.log('✅ Current trip loaded:', currentTripData);
      } catch (error) {
        console.warn('⚠️ No current trip found:', error.message);
      }

      // Get all trips based on filters
      let tripsData = [];
      try {
        const params = {
          driver: user.id,
          ordering: '-created_at'
        };

        // Apply status filter
        if (filters.status !== 'all') {
          params.status = filters.status;
        }

        // Apply date range filter
        if (filters.date_range === 'today') {
          const today = new Date().toISOString().split('T')[0];
          params.start_date = today;
          params.end_date = today;
        } else if (filters.date_range === 'week') {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          params.start_date = weekAgo;
        } else if (filters.date_range === 'month') {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          params.start_date = monthAgo;
        }

        const tripsResponse = await axiosInstance.get('/trips/trips/', { params });
        const rawTrips = tripsResponse.data.results || tripsResponse.data || [];

        tripsData = rawTrips.map(trip => ({
          id: trip.id,
          pickup_location: trip.pickup_location || 'Unknown',
          dropoff_location: trip.dropoff_location || 'Unknown',
          passenger_name: trip.customer_name || 'Unknown',
          passenger_phone: trip.customer_phone || 'N/A',
          scheduled_time: trip.pickup_time || trip.created_at,
          estimated_duration: trip.duration_minutes || 0,
          estimated_distance: parseFloat(trip.distance_km || 0),
          estimated_fare: parseFloat(trip.total_fare || 0),
          actual_duration: trip.duration_minutes || 0,
          actual_distance: parseFloat(trip.distance_km || 0),
          actual_fare: parseFloat(trip.driver_earnings || 0),
          status: trip.status || 'unknown',
          trip_type: trip.trip_type || 'standard',
          rating: trip.customer_rating || 0,
          tip: parseFloat(trip.tip_amount || 0),
          completed_at: trip.completed_at || trip.updated_at,
          payment_method: trip.payment_method || 'unknown'
        }));

        console.log('✅ Trips loaded:', tripsData.length);
      } catch (error) {
        console.warn('⚠️ Could not load trips:', error.message);
        tripsData = [];
      }

      // Set state with real API data
      setCurrentTrip(currentTripData);
      setTrips(tripsData);

      console.log('✅ All trips data loaded successfully');
      toast.success('Trips loaded successfully');
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleTripAction = async (tripId, action) => {
    try {
      console.log(`🚗 Performing trip action: ${action} for trip ${tripId}`);

      let updateData = {};
      switch (action) {
        case 'start':
          updateData = {
            status: 'in_progress',
            started_at: new Date().toISOString()
          };
          break;
        case 'complete':
          updateData = {
            status: 'completed',
            completed_at: new Date().toISOString()
          };
          break;
        case 'cancel':
          updateData = {
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          };
          break;
        default:
          return;
      }

      // Update trip via API
      await axiosInstance.patch(`/trips/trips/${tripId}/`, updateData);

      // Update local state
      switch (action) {
        case 'start':
          setCurrentTrip(prev => ({ ...prev, status: 'in_progress', started_at: new Date().toISOString() }));
          toast.success('✅ Trip started successfully');
          break;
        case 'complete':
          setCurrentTrip(null);
          toast.success('✅ Trip completed successfully');
          break;
        case 'cancel':
          setCurrentTrip(null);
          toast.success('✅ Trip cancelled successfully');
          break;
      }

      // Refresh trips data
      fetchTrips();
    } catch (error) {
      console.error('❌ Error updating trip:', error);
      toast.error(`Failed to ${action} trip: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Clock },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Play },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: X },
      no_show: { color: 'bg-gray-100 text-gray-800', label: 'No Show', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTripTypeBadge = (type) => {
    const typeConfig = {
      standard: { color: 'bg-gray-100 text-gray-800', label: 'Standard' },
      premium: { color: 'bg-purple-100 text-purple-800', label: 'Premium' },
      luxury: { color: 'bg-gold-100 text-gold-800', label: 'Luxury' }
    };

    const config = typeConfig[type] || typeConfig.standard;
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'upcoming') return trip.status === 'scheduled';
    if (activeTab === 'completed') return trip.status === 'completed';
    if (activeTab === 'cancelled') return trip.status === 'cancelled';
    return true;
  });

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
              <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
              <p className="mt-2 text-gray-600">Manage your current and upcoming trips</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchTrips}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Current Trip */}
        {currentTrip && (
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Current Trip
                </div>
                {getStatusBadge(currentTrip.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Pickup</p>
                        <p className="text-sm text-gray-600">{currentTrip.pickup_location}</p>
                        <p className="text-xs text-gray-500">
                          Scheduled: {formatTime(currentTrip.scheduled_time)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Dropoff</p>
                        <p className="text-sm text-gray-600">{currentTrip.dropoff_location}</p>
                        <p className="text-xs text-gray-500">
                          Est. {currentTrip.estimated_duration} min • {currentTrip.estimated_distance} mi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{currentTrip.passenger_name}</p>
                        <p className="text-sm text-gray-600">{currentTrip.passenger_phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(currentTrip.estimated_fare)}
                        </span>
                        {getTripTypeBadge(currentTrip.trip_type)}
                      </div>
                    </div>

                    {currentTrip.special_instructions && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Instructions:</strong> {currentTrip.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6 pt-6 border-t">
                {currentTrip.status === 'scheduled' && (
                  <Button onClick={() => handleTripAction(currentTrip.id, 'start')}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Trip
                  </Button>
                )}
                {currentTrip.status === 'in_progress' && (
                  <>
                    <Button onClick={() => handleTripAction(currentTrip.id, 'complete')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Trip
                    </Button>
                    <Button variant="outline">
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleTripAction(currentTrip.id, 'cancel')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upcoming', label: 'Upcoming', count: trips.filter(t => t.status === 'scheduled').length },
                { id: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
                { id: 'all', label: 'All Trips', count: trips.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Trip List */}
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(trip.status)}
                    {getTripTypeBadge(trip.trip_type)}
                    {trip.rating && (
                      <div className="flex items-center">
                        {getRatingStars(trip.rating)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(trip.actual_fare || trip.estimated_fare)}
                    </p>
                    {trip.tip && (
                      <p className="text-sm text-gray-500">+ {formatCurrency(trip.tip)} tip</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Pickup</p>
                          <p className="text-sm text-gray-600">{trip.pickup_location}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Dropoff</p>
                          <p className="text-sm text-gray-600">{trip.dropoff_location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{trip.passenger_name}</p>
                          <p className="text-sm text-gray-600">{trip.passenger_phone}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">{formatDate(trip.scheduled_time)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-medium">{formatTime(trip.scheduled_time)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Distance</p>
                          <p className="font-medium">
                            {trip.actual_distance || trip.estimated_distance} mi
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {trip.actual_duration || trip.estimated_duration} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {trip.status === 'scheduled' && (
                  <div className="flex items-center space-x-4 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => handleTripAction(trip.id, 'start')}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Trip
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Passenger
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                  </div>
                )}

                {trip.status === 'completed' && trip.completed_at && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Completed on {formatDate(trip.completed_at)} at {formatTime(trip.completed_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredTrips.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming' && "You don't have any upcoming trips scheduled."}
                  {activeTab === 'completed' && "You haven't completed any trips yet."}
                  {activeTab === 'all' && "No trips available."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverTrips;
