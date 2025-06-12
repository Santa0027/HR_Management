import React from "react";

const drivers = [
  {
    id: "DRV123",
    username: "sophia.miller",
    spd: "SPD001",
    name: "Sophia Miller",
    number: "555-1234",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV456",
    username: "ethan.clark",
    spd: "SPD002",
    name: "Ethan Clark",
    number: "555-5678",
    status: "Inactive",
    accountStatus: "Pending",
  },
  {
    id: "DRV789",
    username: "mia.anderson",
    spd: "SPD003",
    name: "Mia Anderson",
    number: "555-9012",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV012",
    username: "liam.cooper",
    spd: "SPD004",
    name: "Liam Cooper",
    number: "555-3456",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV345",
    username: "ava.lopez",
    spd: "SPD005",
    name: "Ava Lopez",
    number: "555-7890",
    status: "Inactive",
    accountStatus: "Pending",
  },
  {
    id: "DRV678",
    username: "jackson.perez",
    spd: "SPD006",
    name: "Jackson Perez",
    number: "555-2345",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV901",
    username: "isabella.gonzalez",
    spd: "SPD007",
    name: "Isabella Gonzalez",
    number: "555-6789",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV234",
    username: "lucas.torres",
    spd: "SPD008",
    name: "Lucas Torres",
    number: "555-0123",
    status: "Inactive",
    accountStatus: "Pending",
  },
  {
    id: "DRV567",
    username: "olivia.ramirez",
    spd: "SPD009",
    name: "Olivia Ramirez",
    number: "555-4567",
    status: "Active",
    accountStatus: "Verified",
  },
  {
    id: "DRV890",
    username: "owen.flores",
    spd: "SPD010",
    name: "Owen Flores",
    number: "555-8901",
    status: "Active",
    accountStatus: "Verified",
  },
];

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
  return (
    <div className="min-h-screen w-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Driver Management</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Driver ID"
          className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Driver ID"
          className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="City"
          className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Vehicle Type"
          className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
        />
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
                  <Badge status={d.accountStatus} />
                </td>
                <td className="px-4 py-2">
                  <button className="text-blue-400 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
