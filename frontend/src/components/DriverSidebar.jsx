import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  User,
  MapPin,
  DollarSign,
  Calendar,
  Car,
  FileText,
  Bell,
  Settings,
  LogOut,
  Clock,
  Star,
  Navigation,
  Fuel,
  Phone,
  MessageSquare,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

// Driver Sidebar Item Component
const DriverSidebarItem = ({ icon, label, to, active = false, children, badge = null }) => {
  const [isOpenByClick, setIsOpenByClick] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDropdown = !!children;
  const location = useLocation();
  const timeoutRef = useRef(null);

  const shouldDropdownBeOpen = isOpenByClick || (isHovered && !isOpenByClick);

  const handleClick = (e) => {
    if (isDropdown) {
      e.preventDefault();
      setIsOpenByClick(prev => !prev);
      setIsHovered(false);
    }
  };

  const handleMouseEnter = () => {
    if (isDropdown) {
      clearTimeout(timeoutRef.current);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDropdown) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isActive = active || (isDropdown && children.some(child =>
    location.pathname === child.props.to || location.pathname.startsWith(to || '')
  ));

  const Tag = isDropdown ? 'button' : Link;

  return (
    <div
      className="w-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Tag
        to={to || '#'}
        onClick={handleClick}
        className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
          ${isDropdown ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
        `}
        aria-expanded={isDropdown ? shouldDropdownBeOpen : undefined}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
          {badge && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {badge}
            </span>
          )}
        </div>
        {isDropdown && (shouldDropdownBeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </Tag>

      {isDropdown && shouldDropdownBeOpen && (
        <div className="ml-4 pl-4 pt-2 space-y-2 border-l border-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

// Driver Sidebar Component
const DriverSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifications] = useState(3); // Mock notification count

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6 text-blue-400">DriverHub</div>

      {/* Driver Info */}
      <div className="mb-6 p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name || 'Driver Name'}</p>
            <p className="text-xs text-gray-300">ID: {user?.id || 'D001'}</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-xs text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-2 text-sm font-medium flex-1">
        <div className="text-gray-400 text-xs mb-2">MAIN MENU</div>

        <DriverSidebarItem
          icon={<Home />}
          label="Dashboard"
          to="/driver/dashboard"
          active={location.pathname === "/driver/dashboard"}
        />

        <DriverSidebarItem
          icon={<MapPin />}
          label="My Trips"
          to="/driver/trips"
          active={location.pathname.startsWith("/driver/trips")}
        >
          <DriverSidebarItem
            label="Current Trip"
            to="/driver/trips/current"
            active={location.pathname === "/driver/trips/current"}
          />
          <DriverSidebarItem
            label="Trip History"
            to="/driver/trips/history"
            active={location.pathname === "/driver/trips/history"}
          />
          <DriverSidebarItem
            label="Upcoming Trips"
            to="/driver/trips/upcoming"
            active={location.pathname === "/driver/trips/upcoming"}
          />
        </DriverSidebarItem>

        <DriverSidebarItem
          icon={<DollarSign />}
          label="Earnings"
          to="/driver/earnings"
          active={location.pathname.startsWith("/driver/earnings")}
        >
          <DriverSidebarItem
            label="Daily Earnings"
            to="/driver/earnings/daily"
            active={location.pathname === "/driver/earnings/daily"}
          />
          <DriverSidebarItem
            label="Weekly Summary"
            to="/driver/earnings/weekly"
            active={location.pathname === "/driver/earnings/weekly"}
          />
          <DriverSidebarItem
            label="Payment History"
            to="/driver/earnings/payments"
            active={location.pathname === "/driver/earnings/payments"}
          />
        </DriverSidebarItem>

        <DriverSidebarItem
          icon={<Calendar />}
          label="Schedule"
          to="/driver/schedule"
          active={location.pathname.startsWith("/driver/schedule")}
        />

        <DriverSidebarItem
          icon={<Car />}
          label="Vehicle"
          to="/driver/vehicle"
          active={location.pathname.startsWith("/driver/vehicle")}
        >
          <DriverSidebarItem
            label="Vehicle Info"
            to="/driver/vehicle/info"
            active={location.pathname === "/driver/vehicle/info"}
          />
          <DriverSidebarItem
            label="Maintenance"
            to="/driver/vehicle/maintenance"
            active={location.pathname === "/driver/vehicle/maintenance"}
          />
          <DriverSidebarItem
            label="Fuel Tracking"
            to="/driver/vehicle/fuel"
            active={location.pathname === "/driver/vehicle/fuel"}
          />
        </DriverSidebarItem>

        <DriverSidebarItem
          icon={<User />}
          label="Profile"
          to="/driver/profile"
          active={location.pathname.startsWith("/driver/profile")}
        >
          <DriverSidebarItem
            label="Personal Info"
            to="/driver/profile/personal"
            active={location.pathname === "/driver/profile/personal"}
          />
          <DriverSidebarItem
            label="Documents"
            to="/driver/profile/documents"
            active={location.pathname === "/driver/profile/documents"}
          />
          <DriverSidebarItem
            label="Performance"
            to="/driver/profile/performance"
            active={location.pathname === "/driver/profile/performance"}
          />
        </DriverSidebarItem>

        <div className="text-gray-400 text-xs mb-2 mt-6">COMMUNICATION</div>

        <DriverSidebarItem
          icon={<Bell />}
          label="Notifications"
          to="/driver/notifications"
          active={location.pathname === "/driver/notifications"}
          badge={notifications > 0 ? notifications : null}
        />

        <DriverSidebarItem
          icon={<MessageSquare />}
          label="Messages"
          to="/driver/messages"
          active={location.pathname === "/driver/messages"}
        />

        <DriverSidebarItem
          icon={<Phone />}
          label="Support"
          to="/driver/support"
          active={location.pathname === "/driver/support"}
        />

        <div className="text-gray-400 text-xs mb-2 mt-6">REPORTS & ANALYTICS</div>

        <DriverSidebarItem
          icon={<BarChart3 />}
          label="Performance"
          to="/driver/performance"
          active={location.pathname.startsWith("/driver/performance")}
        >
          <DriverSidebarItem
            label="Ratings"
            to="/driver/performance/ratings"
            active={location.pathname === "/driver/performance/ratings"}
          />
          <DriverSidebarItem
            label="Statistics"
            to="/driver/performance/stats"
            active={location.pathname === "/driver/performance/stats"}
          />
        </DriverSidebarItem>

        <DriverSidebarItem
          icon={<FileText />}
          label="Reports"
          to="/driver/reports"
          active={location.pathname === "/driver/reports"}
        />
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 border-t border-gray-600 space-y-2">
        <DriverSidebarItem
          icon={<Settings />}
          label="Settings"
          to="/driver/settings"
          active={location.pathname === "/driver/settings"}
        />
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-gray-300 hover:bg-red-600 hover:text-white w-full"
        >
          <LogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DriverSidebar;
