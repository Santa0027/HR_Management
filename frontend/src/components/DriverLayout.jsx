import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';

const DriverLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Driver Sidebar */}
      <DriverSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar (Optional) */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Driver Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Status Indicators */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-gray-600">Online</span>
                </div>
                <div className="text-gray-300">|</div>
                <div className="text-gray-600">
                  Current Time: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
