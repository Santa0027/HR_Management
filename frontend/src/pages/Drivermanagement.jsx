import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Badge = ({ status }) => {
  const color =
    status === "Active" || status === "Verified"
      ? "bg-green-600"
      : "bg-red-600";
  return (
    <span className={`px-3 py-1 rounded-full text-white text-sm ${color}`}>
      {status}
    </span>
  );
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint
    axios.get("http://localhost:8000/Register/onboarded")
      .then((response) => {
        setDrivers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Driver Management</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input type="text" placeholder="Search by Driver ID" className="px-4 py-2 rounded bg-gray-800 border border-gray-700" />
        <input type="text" placeholder="Driver ID" className="px-4 py-2 rounded bg-gray-800 border border-gray-700" />
        <input type="text" placeholder="City" className="px-4 py-2 rounded bg-gray-800 border border-gray-700" />
        <input type="text" placeholder="Vehicle Type" className="px-4 py-2 rounded bg-gray-800 border border-gray-700" />
        <select className="px-4 py-2 rounded bg-gray-800 border border-gray-700">
          <option>Account Status</option>
          <option>Verified</option>
          <option>Pending</option>
        </select>
        <select className="px-4 py-2 rounded bg-gray-800 border border-gray-700">
          <option>Driver Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="col-span-2 md:col-span-1 px-4 py-2 rounded bg-red-700 hover:bg-red-800">
          Reset All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center">Loading drivers...</p>
        ) : (
          <table className="w-full text-left border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {[
                  "Driver ID",
                  "Username",
                  "SPD",
                  "Driver Name",
                  "Driver Number",
                  "Driver Status",
                  "Account Status",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-2 border border-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{d.id}</td>
                  <td className="px-4 py-2">{d.username}</td>
                  <td className="px-4 py-2">{d.spd}</td>
                  <td className="px-4 py-2">{d.name}</td>
                  <td className="px-4 py-2">{d.number}</td>
                  <td className="px-4 py-2">
                    <Badge status={d.status} />
                  </td>
                  <td className="px-4 py-2">
                    <Badge status={d.account_status} />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/driver-management/Driver_profile/${d.id}`}>
                      <button className="text-blue-400 hover:underline">View</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
