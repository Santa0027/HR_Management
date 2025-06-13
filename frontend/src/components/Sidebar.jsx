import React from "react";
import { MdDashboard, MdManageAccounts } from "react-icons/md";
import { AiOutlineFileSearch } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";

// Sidebar Item Component
const SidebarItem = ({ icon, label, to, active = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
      active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </Link>
);

// Full Sidebar Component
const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-[#0F172A] text-white min-h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6">SwiftDispatch</div>

      {/* Sidebar Menu */}
      <nav className="space-y-2 text-sm font-medium">
        <div className="text-gray-400 text-xs mb-2">Menu</div>

        <SidebarItem
          icon={<MdDashboard />}
          label="Driver Management"
          to="/dashboard"
          active={location.pathname === "/dashboard"}
        />
        <SidebarItem
          icon={<MdManageAccounts />}
          label="Registration Management"
          to="/registration-management"
          active={location.pathname === "/registration-management"}
        />
        <SidebarItem
          icon={<AiOutlineFileSearch />}
          label="Approval Status"
          to="/registration-management/aproval_status"
          active={location.pathname === "/registration-management/aproval_status"}
        />
        <SidebarItem
          icon={<MdDashboard />}
          label="Driver Profile"
          to="/driver-management/Driver_profile"
          active={location.pathname === "/driver-management/Driver_profile"}
        />
        <SidebarItem
          icon={<MdDashboard />}
          label="Vehicle Info"
          to="/driver-management/vehicle_information"
          active={location.pathname === "/driver-management/vehicle_information"}
        />
        <SidebarItem
          icon={<MdDashboard />}
          label="Attachments"
          to="/driver-management/attachments"
          active={location.pathname === "/driver-management/attachments"}
        />
        <SidebarItem
          icon={<MdDashboard />}
          label="Logs"
          to="/driver-management/logs"
          active={location.pathname === "/driver-management/logs"}
        />
        <SidebarItem
          icon={<MdDashboard />}
          label="Add Driver"
          to="/adddriverform"
          active={location.pathname === "/adddriverform"}
        />
      </nav>

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
