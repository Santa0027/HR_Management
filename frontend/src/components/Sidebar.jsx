import { FaUser, FaMapMarkerAlt, FaChartBar } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { AiOutlineFileSearch } from "react-icons/ai";

const Sidebar = () => {
  return (
    <div className="w-64 bg-[#0F172A] text-white min-h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6">SwiftDispatch</div>

      {/* Sidebar items */}
      <nav className="space-y-2 text-sm font-medium">
        <div className="text-gray-400 text-xs mb-2">Menu</div>

        <SidebarItem icon={<MdDashboard />} label="Driver Management" active />
        <SidebarItem icon={<MdManageAccounts />} label="Registration Management" />
     
      
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-2 cursor-pointer hover:text-white">
          <AiOutlineFileSearch size={16} />
          <span>Delivery insights</span>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }) => (
  <div
    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
      active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </div>
);

export default Sidebar;
