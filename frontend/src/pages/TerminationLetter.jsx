import React from 'react';

const terminations = [
  {
    name: 'Ethan Harper',
    date: '2024-07-20',
    reason: 'Performance Issues',
  },
  {
    name: 'Olivia Bennett',
    date: '2024-07-15',
    reason: 'Voluntary Resignation',
  },
  {
    name: 'Noah Carter',
    date: '2024-07-10',
    reason: 'Policy Violation',
  },
  {
    name: 'Ava Mitchell',
    date: '2024-07-05',
    reason: 'Contract Expiration',
  },
  {
    name: 'Liam Foster',
    date: '2024-06-30',
    reason: 'Redundancy',
  },
];

const TerminationManagement = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Termination Management</h1>
        <button className="bg-neutral-800 text-sm px-4 py-2 rounded border border-neutral-600 hover:bg-neutral-700">
          Issue Termination
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search drivers"
          className="w-full p-2 rounded bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-600"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-neutral-800 text-sm px-4 py-1.5 rounded border border-neutral-600 hover:bg-neutral-700">
          Reason
        </button>
        <button className="bg-neutral-800 text-sm px-4 py-1.5 rounded border border-neutral-600 hover:bg-neutral-700">
          Termination Date
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-neutral-700">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-800 text-left text-neutral-400">
            <tr>
              <th className="p-3">Driver Name</th>
              <th className="p-3">Termination Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Document</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-neutral-200">
            {terminations.map((t, idx) => (
              <tr
                key={idx}
                className="border-t border-neutral-700 hover:bg-neutral-800"
              >
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.date}</td>
                <td className="p-3">{t.reason}</td>
                <td className="p-3 text-blue-400 hover:underline cursor-pointer">
                  View
                </td>
                <td className="p-3 text-blue-400 hover:underline cursor-pointer">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TerminationManagement;
