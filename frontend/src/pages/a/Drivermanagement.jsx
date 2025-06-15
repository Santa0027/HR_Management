import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, CircleUserRound, ChevronLeft, ChevronRight } from 'lucide-react'; // Import necessary icons

const drivers = [
  {
    id: "DRV123",
    username: "sophia.miller",
    spd: "SPD001",
    name: "Sophia Miller",
    number: "555-1234",
    status: "Active",
    accountStatus: "Verified",
    city: "Riyadh", // Added for filter example
    vehicleType: "Car", // Added for filter example
  },
  {
    id: "DRV456",
    username: "ethan.clark",
    spd: "SPD002",
    name: "Ethan Clark",
    number: "555-5678",
    status: "Inactive",
    accountStatus: "Pending",
    city: "Jeddah",
    vehicleType: "Motorcycle",
  },
  {
    id: "DRV789",
    username: "mia.anderson",
    spd: "SPD003",
    name: "Mia Anderson",
    number: "555-9012",
    status: "Active",
    accountStatus: "Verified",
    city: "Dammam",
    vehicleType: "Van",
  },
  {
    id: "DRV012",
    username: "liam.cooper",
    spd: "SPD004",
    name: "Liam Cooper",
    number: "555-3456",
    status: "Active",
    accountStatus: "Verified",
    city: "Riyadh",
    vehicleType: "Truck",
  },
  {
    id: "DRV345",
    username: "ava.lopez",
    spd: "SPD005",
    name: "Ava Lopez",
    number: "555-7890",
    status: "Inactive",
    accountStatus: "Pending",
    city: "Jeddah",
    vehicleType: "Car",
  },
  {
    id: "DRV678",
    username: "jackson.perez",
    spd: "SPD006",
    name: "Jackson Perez",
    number: "555-2345",
    status: "Active",
    accountStatus: "Verified",
    city: "Dammam",
    vehicleType: "Motorcycle",
  },
  {
    id: "DRV901",
    username: "isabella.gonzalez",
    spd: "SPD007",
    name: "Isabella Gonzalez",
    number: "555-6789",
    status: "Active",
    accountStatus: "Verified",
    city: "Riyadh",
    vehicleType: "Van",
  },
  {
    id: "DRV234",
    username: "lucas.torres",
    spd: "SPD008",
    name: "Lucas Torres",
    number: "555-0123",
    status: "Inactive",
    accountStatus: "Pending",
    city: "Jeddah",
    vehicleType: "Truck",
  },
  {
    id: "DRV567",
    username: "olivia.ramirez",
    spd: "SPD009",
    name: "Olivia Ramirez",
    number: "555-4567",
    status: "Active",
    accountStatus: "Verified",
    city: "Riyadh",
    vehicleType: "Car",
  },
  {
    id: "DRV890",
    username: "owen.flores",
    spd: "SPD010",
    name: "Owen Flores",
    number: "555-8901",
    status: "Active",
    accountStatus: "Verified",
    city: "Dammam",
    vehicleType: "Motorcycle",
  },
  {
    id: "DRV011",
    username: "chloe.kim",
    spd: "SPD011",
    name: "Chloe Kim",
    number: "555-1111",
    status: "Active",
    accountStatus: "Verified",
    city: "Riyadh",
    vehicleType: "Van",
  },
  {
    id: "DRV013",
    username: "daniel.lee",
    spd: "SPD012",
    name: "Daniel Lee",
    number: "555-2222",
    status: "Inactive",
    accountStatus: "Pending",
    city: "Jeddah",
    vehicleType: "Truck",
  },
];

// Reusable Badge component for status display
const Badge = ({ status }) => {
  const color =
    status === "Active" || status === "Verified"
      ? "bg-[#318343] text-white" // Primary dark text for active/verified
      : "bg-[#9F2626] text-white"; // Red for inactive/pending
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

export default function DriverManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of items to display per page

  // State for filter inputs
  const [filters, setFilters] = useState({
    driverId: '',
    city: '',
    vehicleType: '',
    accountStatus: 'Account Status', // Default option text
    driverStatus: 'Driver Status', // Default option text
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [id]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      driverId: '',
      city: '',
      vehicleType: '',
      accountStatus: 'Account Status',
      driverStatus: 'Driver Status',
    });
    setCurrentPage(1); // Reset to first page
  };

  // Filter drivers based on search inputs
  const filteredDrivers = drivers.filter(driver => {
    return (
      (filters.driverId === '' || driver.id.toLowerCase().includes(filters.driverId.toLowerCase())) &&
      (filters.city === '' || driver.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (filters.vehicleType === '' || driver.vehicleType.toLowerCase().includes(filters.vehicleType.toLowerCase())) &&
      (filters.accountStatus === 'Account Status' || driver.accountStatus === filters.accountStatus) &&
      (filters.driverStatus === 'Driver Status' || driver.status === filters.driverStatus)
    );
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  // Get drivers for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#1E2022] font-inter p-8"> {/* Main background: #F0F5F9, main text #1E2022 */}
      {/* Top Bar (simulating the top right English & User icon from the image) */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm transition-colors"> {/* Button: #C9D6DF, hover #52616B, text #52616B */}
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-[#1E2022]" /> {/* Icon color: #1E2022 */}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-[#52616B] mb-6">Organization / Driver Management</div> {/* Text color: #52616B */}

      {/* Page Title & Add Driver Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#187795] text-3xl font-semibold">Driver Management</h1> {/* Text color: #1E2022 */}
        <Link to="/adddriverform">
        <button className="bg-[#318343] hover:bg-[#458b54] text-white px-6 py-2 rounded-full font-medium transition-colors"> {/* Button: #0430DE, hover #2750F5 */}
          Add Driver
        </button></Link>
      </div>

      {/* Filters Section */}
      <div className="bg-[#D9D9D9] p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"> {/* Filter background: #C9D6DF */}
        <div>
          <label htmlFor="driverId" className="block text-sm mb-2 text-[#474747]">Driver ID</label> {/* Text color: #52616B */}
          <input
            type="text"
            id="driverId"
            placeholder="Search by Driver ID"
            value={filters.driverId}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#F0F5F9] border-[#52616B] text-[#1E2022]" /* Input: bg #F0F5F9, border #52616B, text #1E2022, focus ring #0430DE */
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm mb-2 text-[#474747]">City</label> {/* Text color: #52616B */}
          <input
            type="text"
            id="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#F0F5F9] border-[#52616B] text-[#1E2022]" /* Input: bg #F0F5F9, border #52616B, text #1E2022, focus ring #0430DE */
          />
        </div>
        <div>
          <label htmlFor="vehicleType" className="block text-sm mb-2 text-[#474747]">Vehicle Type</label> {/* Text color: #52616B */}
          <input
            type="text"
            id="vehicleType"
            placeholder="Vehicle Type"
            value={filters.vehicleType}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#F0F5F9] border-[#52616B] text-[#1E2022]" /* Input: bg #F0F5F9, border #52616B, text #1E2022, focus ring #0430DE */
          />
        </div>
        <div>
          <label htmlFor="accountStatus" className="block text-sm mb-2 text-[#474747]">Account Status</label> {/* Text color: #52616B */}
          <select
            id="accountStatus"
            value={filters.accountStatus}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#F0F5F9] border-[#52616B] text-[#1E2022]" /* Select: bg #F0F5F9, border #52616B, text #1E2022, focus ring #0430DE */
          >
            <option>Account Status</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
        <div>
          <label htmlFor="driverStatus" className="block text-sm mb-2 text-[#474747]">Driver Status</label> {/* Text color: #52616B */}
          <select
            id="driverStatus"
            value={filters.driverStatus}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#F0F5F9] border-[#52616B] text-[#1E2022]" /* Select: bg #F0F5F9, border #52616B, text #1E2022, focus ring #0430DE */
          >
            <option>Driver Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex justify-end col-span-full md:col-span-1 md:col-start-6">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-md bg-[#9F2626] hover:bg-[#7F1F1F] text-white font-medium transition-colors w-full" /* Red buttons remain unchanged */
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-4 bg-[#C9D6DF] rounded-lg"> {/* Table background: #C9D6DF */}
        <table className="min-w-full text-left">
          <thead className="bg-[#284B63]"> {/* Table header background: #52616B */}
            <tr className="text-white uppercase text-sm font-bold leading-normal"> {/* Header text: text-white for contrast */}
              <th className="py-3 px-6 text-left rounded-tl-lg">Driver ID</th>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">SPD</th>
              <th className="py-3 px-6 text-left">Driver Name</th>
              <th className="py-3 px-6 text-left">Driver Number</th>
              <th className="py-3 px-6 text-left">Driver Status</th>
              <th className="py-3 px-6 text-left">Account Status</th>
              <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="text-[#353535] text-sm font-light"> {/* Table body text: #52616B */}
            {currentDrivers.map((d) => (
              <tr key={d.id} className="border-b border-[#52616B] font-bold hover:bg-[#F0F5F9]"> {/* Border: #52616B, hover: #F0F5F9 */}
                <td className="px-6 py-3 whitespace-nowrap">{d.id}</td>
                <td className="px-6 py-3 whitespace-nowrap">{d.username}</td>
                <td className="px-6 py-3 whitespace-nowrap">{d.spd}</td>
                <td className="px-6 py-3 whitespace-nowrap">{d.name}</td>
                <td className="px-6 py-3 whitespace-nowrap">{d.number}</td>
                <td className="px-6 py-3 whitespace-nowrap ">
                  <Badge status={d.status} />
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <Badge status={d.accountStatus} />
                </td>
                <td className="px-6 py-3 text-center whitespace-nowrap">
                  <Link to="/driver-management/Driver_profile">
                    <button className="bg-[#b11616] hover:bg-[#9F2626] text-white px-4 py-2 rounded-full text-xs font-medium transition-colors"> {/* Button: #0430DE, hover #2750F5 */}
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {currentDrivers.length === 0 && (
              <tr className="border-b border-[#52616B]"> {/* Border: #52616B */}
                <td className="py-3 px-6 text-center" colSpan="8">
                  <div className="text-lg font-semibold mt-8 mb-2 text-[#52616B]">No Drivers Found</div> {/* Text: #52616B */}
                  <div className="text-sm text-gray-500 mb-8"> {/* Text: gray-500 for subtle message */}
                    Adjust your filters or add new drivers.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-[#52616B]"> {/* Text color: #52616B */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            // Corrected template literal syntax for className
            className={`p-2 rounded-full transition-colors hover:bg-[#C9D6DF] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
              <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded-full ${
                currentPage === index + 1
                  ? 'bg-[#0430DE] text-white' /* Button: #0430DE */
                  : 'hover:bg-[#C9D6DF]' /* Hover: #C9D6DF */
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            // Corrected template literal syntax for className
            className={`p-2 rounded-full transition-colors hover:bg-[#C9D6DF] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
}
