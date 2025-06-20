import React, { useState } from 'react';

const warningLetters = [
  { name: 'Ethan Carter', date: '2024-07-26', reason: 'Speeding', status: 'Active' },
  { name: 'Olivia Bennett', date: '2024-07-20', reason: 'Reckless Driving', status: 'Active' },
  { name: 'Noah Thompson', date: '2024-07-15', reason: 'Unauthorized Route', status: 'Inactive' },
  { name: 'Ava Harper', date: '2024-07-10', reason: 'Vehicle Damage', status: 'Active' },
  { name: 'Liam Foster', date: '2024-07-05', reason: 'Late Delivery', status: 'Inactive' },
];

export default function WarningLetters() {
  const [search, setSearch] = useState('');

  const filteredLetters = warningLetters.filter(letter =>
    letter.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warning Letters</h1>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">
          Issue Warning Letter
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by driver name"
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">Status</button>
        <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">Reason</button>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left">Driver Name</th>
              <th className="py-3 px-4 text-left">Issued Date</th>
              <th className="py-3 px-4 text-left">Reason</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredLetters.map((letter, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="py-3 px-4">{letter.name}</td>
                <td className="py-3 px-4">{letter.date}</td>
                <td className="py-3 px-4">{letter.reason}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      letter.status === 'Active'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {letter.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-400 hover:underline text-sm">View/Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
