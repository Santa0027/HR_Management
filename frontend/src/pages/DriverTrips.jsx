import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
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
    try {
      setLoading(true);
      
      // Mock trip data
      const mockCurrentTrip = {
        id: 1,
        pickup_location: 'Downtown Mall, 123 Main St',
        pickup_coordinates: { lat: 40.7128, lng: -74.0060 },
        dropoff_location: 'Airport Terminal 2, JFK Airport',
        dropoff_coordinates: { lat: 40.6413, lng: -73.7781 },
        passenger_name: 'Sarah Johnson',
        passenger_phone: '+1 (555) 123-4567',
        scheduled_time: '2024-01-15T14:30:00Z',
        estimated_duration: 35,
        estimated_distance: 23.5,
        estimated_fare: 45.50,
        status: 'in_progress',
        trip_type: 'standard',
        special_instructions: 'Please call when you arrive',
        started_at: '2024-01-15T14:25:00Z'
      };

      const mockTrips = [
        {
          id: 2,
          pickup_location: 'Hotel Grand Plaza',
          dropoff_location: 'Business District',
          passenger_name: 'Michael Chen',
          passenger_phone: '+1 (555) 987-6543',
          scheduled_time: '2024-01-15T16:00:00Z',
          estimated_duration: 22,
          estimated_distance: 12.8,
          estimated_fare: 28.75,
          status: 'scheduled',
          trip_type: 'premium'
        },
        {
          id: 3,
          pickup_location: 'Central Station',
          dropoff_location: 'University Campus',
          passenger_name: 'Emily Davis',
          passenger_phone: '+1 (555) 456-7890',
          scheduled_time: '2024-01-15T18:30:00Z',
          estimated_duration: 25,
          estimated_distance: 15.2,
          estimated_fare: 32.00,
          status: 'scheduled',
          trip_type: 'standard'
        },
        {
          id: 4,
          pickup_location: 'Residential Area',
          dropoff_location: 'Shopping Center',
          passenger_name: 'David Wilson',
          passenger_phone: '+1 (555) 321-0987',
          scheduled_time: '2024-01-14T11:15:00Z',
          actual_duration: 18,
          actual_distance: 8.2,
          actual_fare: 18.25,
          status: 'completed',
          trip_type: 'standard',
          rating: 5,
          tip: 3.00,
          completed_at: '2024-01-14T11:33:00Z'
        },
        {
          id: 5,
          pickup_location: 'Medical Center',
          dropoff_location: 'Suburban Mall',
          passenger_name: 'Lisa Anderson',
          passenger_phone: '+1 (555) 654-3210',
          scheduled_time: '2024-01-14T09:45:00Z',
          actual_duration: 32,
          actual_distance: 19.8,
          actual_fare: 41.50,
          status: 'completed',
          trip_type: 'premium',
          rating: 4,
          tip: 5.00,
          completed_at: '2024-01-14T10:17:00Z'
        }
      ];

      setCurrentTrip(mockCurrentTrip);
      setTrips(mockTrips);
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'start':
          setCurrentTrip(prev => ({ ...prev, status: 'in_progress', started_at: new Date().toISOString() }));
          toast.success('Trip started');
          break;
        case 'complete':
          setCurrentTrip(null);
          toast.success('Trip completed');
          break;
        case 'cancel':
          setCurrentTrip(null);
          toast.success('Trip cancelled');
          break;
        default:
          break;
      }
      
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip');
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
