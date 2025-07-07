import { useState, useRef, useEffect } from "react";
import { MdDashboard, MdManageAccounts, MdAdminPanelSettings } from "react-icons/md";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FaDollarSign, FaCar } from "react-icons/fa"; // Add accounting and car icons
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import Chevron icons
import RoleBasedComponent from './RoleBasedComponent';

// Sidebar Item Component
const SidebarItem = ({ icon, label, to, active = false, children }) => {
  const [isOpenByClick, setIsOpenByClick] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDropdown = !!children; // Check if children exist to determine if it's a dropdown
  const location = useLocation();
  const timeoutRef = useRef(null); // Ref for hover timeout

  // Determine if the dropdown should be visually open (either by click or by hover)
  // If opened by click, it stays open. If not, it opens on hover.
  const shouldDropdownBeOpen = isOpenByClick || (isHovered && !isOpenByClick);

  const handleClick = (e) => {
    if (isDropdown) {
      e.preventDefault(); // Prevent default Link behavior for dropdown parent
      setIsOpenByClick(prev => !prev); // Toggle click-open state
      setIsHovered(false); // Reset hover state on click to prevent immediate re-closing on mouseleave
    }
  };

  const handleMouseEnter = () => {
    if (isDropdown) {
      clearTimeout(timeoutRef.current); // Clear any pending mouseLeave timeout
      setIsHovered(true); // Set hovered state to true
    }
  };

  const handleMouseLeave = () => {
    if (isDropdown) {
      // Set a small delay before setting isHovered to false
      // This prevents the dropdown from closing immediately when moving the mouse over sub-items
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 200); // Adjust delay as needed (milliseconds)
    }
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Determine if the current item (or its children) should be visually "active"
  const isActive = active || (isDropdown && children.some(child =>
    // Assuming child is also a SidebarItem like object with a 'to' prop
    // This checks if any of the dropdown children's paths match the current location
    // or if the current location starts with the dropdown's implied base path
    location.pathname === child.props.to || location.pathname.startsWith(to || '')
  ));

  // Determine the base HTML tag: 'button' for dropdown parents, Link for regular items
  const Tag = isDropdown ? 'button' : Link;

  return (
    <div
      className="w-full relative" // Add relative positioning for potential absolute dropdown content (though using ml-4 here)
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Tag
        to={to || '#'} // If it's a button, `to` is ignored; provide a fallback for Link usage
        onClick={handleClick}
        className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}
          ${isDropdown ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : ''}
        `}
        aria-expanded={isDropdown ? shouldDropdownBeOpen : undefined} // ARIA attribute for accessibility
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </div>
        {/* Show ChevronDown/Up icon only for dropdowns */}
        {isDropdown && (shouldDropdownBeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </Tag>

      {/* Conditionally render dropdown children */}
      {isDropdown && shouldDropdownBeOpen && (
        <div className="ml-4 pl-4 pt-2 space-y-2 border-l border-gray-700"> {/* Indent and add a subtle left border */}
          {children}
        </div>
      )}
    </div>
  );
};

// Full Sidebar Component
const Sidebar = () => {
  const location = useLocation(); // Hook to get current URL location

  return (
    <div className="w-64 bg-[#0F172A] text-white min-h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6">SwiftDispatch</div>

      {/* Sidebar Menu */}
      <nav className="space-y-2 text-sm font-medium">
        <div className="text-gray-400 text-xs mb-2">Menu</div>

        <RoleBasedComponent requiredPermissions={['can_view_drivers']}>
          <SidebarItem
            icon={<MdDashboard />}
            label="Driver Management"
            to="/dashboard"
            active={location.pathname === "/dashboard"}
          />
        </RoleBasedComponent>

        {/* Registration Management Dropdown Item */}
        <RoleBasedComponent requiredRoles={['admin', 'hr']}>
          <SidebarItem
            icon={<MdManageAccounts />}
            label="Registration Management"
            to="/registration-management"
            active={location.pathname.startsWith("/registration-management")}
          >
            <SidebarItem
              label="Driver Registration"
              to="/registration-management"
              active={location.pathname === "/registration-management"}
            />
            <SidebarItem
              icon={<FaCar />}
              label="Vehicle Management"
              to="/vehicle-management"
              active={location.pathname.startsWith("/vehicle")}
            >
              <SidebarItem
                label="Fleet Overview"
                to="/vehicle-management"
                active={location.pathname === "/vehicle-management"}
              />
              <SidebarItem
                label="Vehicle Registration"
                to="/vehicle-list"
                active={location.pathname === "/vehicle-list"}
              />
              <SidebarItem
                label="Service Management"
                to="/vehicle-service-management"
                active={location.pathname === "/vehicle-service-management"}
              />
              <SidebarItem
                label="Fuel Management"
                to="/vehicle-fuel-management"
                active={location.pathname === "/vehicle-fuel-management"}
              />
              <SidebarItem
                label="Rental Management"
                to="/vehicle-rental-management"
                active={location.pathname === "/vehicle-rental-management"}
              />
            </SidebarItem>
            <SidebarItem
              label="Company Registration"
              to="/platform-list"
              active={location.pathname === "/platform-list"}
            />
          </SidebarItem>
        </RoleBasedComponent>
        <RoleBasedComponent requiredPermissions={['can_view_hr']}>
          <SidebarItem
            icon={<MdManageAccounts />}
            label="HR Management"
            to="/HRDashboard"
            active={location.pathname.startsWith("/HR") || location.pathname.startsWith("/Attendance") || location.pathname.startsWith("/warning") || location.pathname.startsWith("/termination")}
          >
            <SidebarItem
              label="HR Dashboard"
              to="/HRDashboard"
              active={location.pathname === "/HRDashboard"}
            />
            <SidebarItem
              label="Attendance Report"
              to="/AttendanceDashboard"
              active={location.pathname === "/AttendanceDashboard"}
            />
            <SidebarItem
              label="Warning Report"
              to="/warningletter"
              active={location.pathname === "/warningletter"}
            />
            <SidebarItem
              label="Termination Report"
              to="/terminationletter"
              active={location.pathname === "/terminationletter"}
            />
          </SidebarItem>
        </RoleBasedComponent>

        {/* Accounting Management Dropdown Item */}
        <RoleBasedComponent requiredPermissions={['can_view_accounting']}>
          <SidebarItem
            icon={<FaDollarSign />}
            label="Accounting"
            to="/accounting"
            active={location.pathname.startsWith("/accounting")}
          >
            <SidebarItem
              label="Dashboard"
              to="/accounting"
              active={location.pathname === "/accounting"}
            />
            <RoleBasedComponent requiredPermissions={['can_view_accounting']}>
              <SidebarItem
                label="Transactions"
                to="/accounting/transactions"
                active={location.pathname === "/accounting/transactions"}
              />
            </RoleBasedComponent>
            <RoleBasedComponent requiredPermissions={['can_manage_accounting']}>
              <SidebarItem
                label="Income"
                to="/accounting/income"
                active={location.pathname === "/accounting/income"}
              />
              <SidebarItem
                label="Expenses"
                to="/accounting/expenses"
                active={location.pathname === "/accounting/expenses"}
              />
              <SidebarItem
                label="Budget Management"
                to="/accounting/budgets"
                active={location.pathname === "/accounting/budgets"}
              />
              <SidebarItem
                label="Bank Accounts"
                to="/accounting/bank-accounts"
                active={location.pathname === "/accounting/bank-accounts"}
              />
              <SidebarItem
                label="Payroll"
                to="/accounting/payroll"
                active={location.pathname === "/accounting/payroll"}
              />
              <SidebarItem
                label="Reports"
                to="/accounting/reports"
                active={location.pathname === "/accounting/reports"}
              />
            </RoleBasedComponent>
          </SidebarItem>
        </RoleBasedComponent>
      </nav>

      {/* Driver Portal - Driver role only */}
      <nav className="space-y-2 text-sm font-medium mt-4">
        <RoleBasedComponent requiredRoles={['driver']}>
          <SidebarItem
            icon={<FaCar />}
            label="Driver Portal"
            to="/driver/dashboard"
            active={location.pathname.startsWith("/driver")}
          >
            <SidebarItem
              label="My Dashboard"
              to="/driver/dashboard"
              active={location.pathname === "/driver/dashboard"}
            />
            <SidebarItem
              label="My Trips"
              to="/driver/trips"
              active={location.pathname === "/driver/trips"}
            />
            <SidebarItem
              label="My Earnings"
              to="/driver/earnings"
              active={location.pathname === "/driver/earnings"}
            />
            <SidebarItem
              label="My Profile"
              to="/driver/profile"
              active={location.pathname === "/driver/profile"}
            />
          </SidebarItem>
        </RoleBasedComponent>
      </nav>

      {/* Admin Management - Admin only */}
      <nav className="space-y-2 text-sm font-medium mt-4">
        <RoleBasedComponent requiredPermissions={['can_manage_users', 'can_manage_drivers']}>
          <SidebarItem
            icon={<MdAdminPanelSettings />}
            label="Admin Management"
            to="/admin/users"
            active={location.pathname.startsWith("/admin")}
          >
            <SidebarItem
              label="User Management"
              to="/admin/users"
              active={location.pathname === "/admin/users"}
            />
            <SidebarItem
              label="Driver Authentication"
              to="/admin/driver-auth"
              active={location.pathname === "/admin/driver-auth"}
            />
          </SidebarItem>
        </RoleBasedComponent>
      </nav>

      {/* Accounts Management (Add if needed, currently not in the provided Sidebar code) */}
      {/* <nav className="space-y-2 text-sm font-medium mt-4">
        <SidebarItem
          icon={<MdManageAccounts />} // Using a placeholder icon
          label="Accounts Management"
          to="/accounts-management"
          active={location.pathname === "/accounts-management"}
        />
      </nav> */}


      {/* Footer/Bottom Info */}
      <div className="mt-auto pt-4 border-t border-gray-700 text-xs text-gray-400">
        <Link to="/delivery-insights" className="flex items-center gap-2 hover:text-white">
          <AiOutlineFileSearch size={16} />
          <span>Delivery insights</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
