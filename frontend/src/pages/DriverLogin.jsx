import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Car,
  LogIn,
  Smartphone
} from 'lucide-react';

const DriverLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate driver authentication
      if (credentials.username && credentials.password) {
        // Mock driver user data
        const driverUserData = {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'driver',
          username: credentials.username,
          access: 'mock-driver-token',
          refresh: 'mock-refresh-token',
          permissions: ['can_view_trips', 'can_update_trips', 'can_view_earnings']
        };

        login(driverUserData);
        toast.success('Welcome back, driver!');
        navigate('/driver/dashboard');
      } else {
        setError('Please enter both username and password');
      }
    } catch (error) {
      console.error('Driver login error:', error);
      setError('Invalid credentials. Please try again.');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'driver001', password: 'driver123', name: 'John Doe' },
    { username: 'driver002', password: 'driver123', name: 'Jane Smith' },
    { username: 'driver003', password: 'driver123', name: 'Mike Johnson' }
  ];

  const handleDemoLogin = (account) => {
    setCredentials({
      username: account.username,
      password: account.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">Driver Portal</h2>
          <p className="mt-2 text-blue-100">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Driver Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your driver username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Demo Driver Accounts:</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(account)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.username}</p>
                    </div>
                    <div className="text-xs text-gray-400">Click to use</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile App Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Mobile App Available</p>
                <p className="text-xs text-blue-600">Download our mobile app for better on-the-go experience</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact support at{' '}
              <a href="mailto:support@company.com" className="text-blue-600 hover:text-blue-500">
                support@company.com
              </a>
            </p>
          </div>
        </div>

        {/* Back to Main Login */}
        <div className="text-center">
          <a
            href="/login"
            className="text-blue-100 hover:text-white text-sm underline"
          >
            ← Back to Main Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
