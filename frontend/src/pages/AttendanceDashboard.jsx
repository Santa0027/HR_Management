import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const attendanceRes = await axiosInstance.get('/attendance/');
        const data = attendanceRes.data;

        setAttendanceData(data);
        setFilteredData(data);
        setSummary(calculateSummary(data));
        setLoading(false);
      } catch (error) {
        console.error('Error loading attendance report:', error.response?.data || error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateSummary = (data) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let totalDeductions = 0;

    data.forEach(item => {
      const status = item.status?.toLowerCase();

      if (status === 'on-time') present++;
      else if (status === 'late') {
        present++;
        late++;
      } else {
        absent++;
      }

      totalDeductions += Number(item.deduct_amount || 0);
    });

    const totalWithStatus = present + absent;
    const onTimePercent = totalWithStatus ? ((present - late) / totalWithStatus * 100).toFixed(2) : 0;

    return {
      present,
      late,
      absent,
      on_time_percent: onTimePercent,
      total_deductions: totalDeductions,
    };
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = attendanceData.filter(d =>
      d.driver_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="bg-black text-white min-h-screen p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Attendance Report</h1>
        <p className="text-gray-400">View and manage driver attendance records.</p>
      </div>

      <input
        type="text"
        placeholder="Search by driver name"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
      />

      <div className="flex gap-4">
        <button className="px-4 py-1 bg-gray-700 rounded text-white">All</button>
        <button className="px-4 py-1 bg-gray-800 rounded text-gray-400">Late</button>
      </div>

      <div>
        <div className="flex gap-6 border-b border-gray-700 pb-2">
          <button className="text-white border-b-2 border-white">Daily Report</button>
          <button className="text-gray-400">Monthly Report</button>
        </div>

        <div className="overflow-auto mt-4">
          <table className="w-full text-sm text-left border border-gray-700">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                {[
                  'Driver Name', 'Date', 'Assigned Time', 'Login Time', 'Log Out Time', 'Live Photo',
                  'Status', 'Active time', 'Platform', 'Reason for Deduction', 'Deduct Amount (₹)'
                ].map(head => (
                  <th key={head} className="p-2 border border-gray-700">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-400">
                    No attendance data found.
                  </td>
                </tr>
              ) : (
                filteredData.map((d, i) => (
                  <tr key={i} className="border border-gray-700">
                    <td className="p-2 border border-gray-700">{d.driver_name}</td>
                    <td className="p-2 border border-gray-700">{d.date}</td>
                    <td className="p-2 border border-gray-700">{d.assigned_time}</td>
                    <td className="p-2 border border-gray-700">{d.login_time || 'Absent'}</td>
                    <td className="p-2 border border-gray-700">{d.logout_time || 'Absent'}</td>
                    <td className="p-2 border border-gray-700">
                      <img
                        src={d.photo_url}
                        alt="driver"
                        className="w-8 h-8 rounded-full"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    </td>
                    <td className="p-2 border border-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        d.status === 'On-time' ? 'bg-green-700 text-green-100' :
                        d.status === 'Late' ? 'bg-yellow-700 text-yellow-100' :
                        'bg-red-700 text-red-100'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-700">{d.duration || '-'}</td>
                    <td className="p-2 border border-gray-700">{d.platform}</td>
                    <td className="p-2 border border-gray-700">{d.reason_for_deduction || '-'}</td>
                    <td className="p-2 border border-gray-700">₹{d.deduct_amount || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Total Present</p>
          <p className="text-xl font-bold">{summary.present}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Late</p>
          <p className="text-xl font-bold">{summary.late}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Absent</p>
          <p className="text-xl font-bold">{summary.absent}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">On-time %</p>
          <p className="text-xl font-bold">{summary.on_time_percent}%</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Total Deductions Today</p>
          <p className="text-xl font-bold">₹{summary.total_deductions}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Export as PDF</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Export as CSV</button>
      </div>
    </div>
  );
};

export default AttendanceReport;
