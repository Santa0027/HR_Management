import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChevronDown, CircleUserRound, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'; // Importing icons, including Sun and Moon

// // 1. Create a Theme Context
// const ThemeContext = createContext(null);

// // 2. Create a Theme Provider Component
// function ThemeProvider({ children }) {
//   // Initialize darkMode state from localStorage or default to true (dark)
//   const [darkMode, setDarkMode] = useState(() => {
//     const savedMode = localStorage.getItem('themeMode');
//     return savedMode === 'light' ? false : true; // Default to dark if no preference or 'dark'
//   });

//   // Effect to apply/remove dark class from HTML body for Tailwind JIT mode
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//       document.documentElement.classList.remove('light'); // Ensure light class is removed
//     } else {
//       document.documentElement.classList.add('light'); // Add light class for Tailwind
//       document.documentElement.classList.remove('dark'); // Ensure dark class is removed
//     }
//     // Save theme preference to localStorage
//     localStorage.setItem('themeMode', darkMode ? 'dark' : 'light');
//   }, [darkMode]);

//   // Function to toggle dark/light mode
//   const toggleDarkMode = () => {
//     setDarkMode(prevMode => !prevMode);
//   };

//   return (
//     <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }


// function App() {
//   const [activeTab, setActiveTab] = useState('New Request');
//   const [driverInsight, setDriverInsight] = useState(''); // State to store LLM generated insight
//   const [loadingInsight, setLoadingInsight] = useState(false); // State for loading indicator

//   // 3. Consume theme context in App component
//   const { darkMode, toggleDarkMode } = useContext(ThemeContext);

//   // Sample Data for the table
//   const sampleDrivers = [
//     {
//       requestNumber: '#12345',
//       driverId: 'Unver-UD1',
//       driverName: 'Sophia Miller',
//       driverNumber: '565-1734',
//       phoneNumber: '12345678510',
//       deliveryProvider: 'Mufejan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Car',
//       city: 'Now York',
//       requestStatus: 'Approved',
//       action: '-',
//     },
//     {
//       requestNumber: '#67890',
//       driverId: 'Driver-002',
//       driverName: 'Ethan Clerk',
//       driverNumber: '555-5678',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mutajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Motorcycle',
//       city: 'Los Angeles',
//       requestStatus: 'Approved',
//       action: '-',
//     },
//     {
//       requestNumber: '#11223',
//       driverId: 'Driver-003',
//       driverName: 'Via Anderson',
//       driverNumber: '555-9012',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mutejan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Van',
//       city: 'Chicago',
//       requestStatus: 'Rejected',
//       action: '-',
//     },
//     {
//       requestNumber: '#44556',
//       driverId: 'Driver-004',
//       driverName: 'Sophia Miller',
//       driverNumber: '555-3456',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mulajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Car',
//       city: 'Houston',
//       requestStatus: 'Approved',
//       action: '-',
//     },
//     {
//       requestNumber: '#77689',
//       driverId: 'Driver-005',
//       driverName: 'Cthan Clark',
//       driverNumber: '566-7890',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mulajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Motorcycle',
//       city: 'Phoenix',
//       requestStatus: 'Rejected',
//       action: '-',
//     },
//     {
//       requestNumber: '#99001',
//       driverId: 'Driver-006',
//       driverName: 'Mio Anderson',
//       driverNumber: '555-9012',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mulajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Track',
//       city: 'Philadelphia',
//       requestStatus: 'Approved',
//       action: '-',
//     },
//     {
//       requestNumber: '#22334',
//       driverId: 'Criver-007',
//       driverName: 'Saphia Miliar',
//       driverNumber: '555-9012',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mufajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Car',
//       city: 'Sar Artania',
//       requestStatus: 'Rejected',
//       action: '-',
//     },
//     {
//       requestNumber: '#56667',
//       driverId: 'Criver-008',
//       driverName: 'Ethan Clank',
//       driverNumber: '555-9017',
//       phoneNumber: '1234567890',
//       deliveryProvider: 'Mutajan Co',
//       tawseelApproval: 'Completed',
//       vehicleType: 'Motorcycle',
//       city: 'San Diego',
//       requestStatus: 'Approved',
//       action: '-',
//     },
//   ];


  // Function to call the Gemini API for driver insight
//   const generateDriverInsight = async () => {
//     setLoadingInsight(true); // Set loading to true
//     setDriverInsight(''); // Clear previous insight

//     // Define the prompt for the LLM
//     const prompt = "Generate a detailed, positive summary for a hypothetical delivery driver named 'Ahmad Al-Fahad' who has been driving for 3 years in Riyadh, using a sedan. Highlight his strengths in timely delivery, excellent customer satisfaction, and reliability. Suggest one area for potential growth, such as expanding to larger vehicle types or new service areas. Format it as a professional HR summary.";

//     try {
//       // Initialize chat history for the API call
//       let chatHistory = [];
//       chatHistory.push({ role: "user", parts: [{ text: prompt }] });

//       const payload = {
//         contents: chatHistory,
//       };

//       // API key is left empty; Canvas will inject it at runtime.
//       const apiKey = "";
//       const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();

//       // Check if the response structure is valid and contains content
//       if (result.candidates && result.candidates.length > 0 &&
//           result.candidates[0].content && result.candidates[0].content.parts &&
//           result.candidates[0].content.parts.length > 0) {
//         const text = result.candidates[0].content.parts[0].text;
//         setDriverInsight(text); // Set the generated insight
//       } else {
//         setDriverInsight("Failed to generate insight. Please try again.");
//         console.error("Gemini API response structure unexpected:", result);
//       }
//     } catch (error) {
//       setDriverInsight("Error generating insight. " + error.message);
//       console.error("Error calling Gemini API:", error);
//     } finally {
//       setLoadingInsight(false); // Set loading to false regardless of success or failure
//     }
//   };


//   return (
//     // 4. Wrap the entire App component with ThemeProvider
//     <ThemeProvider>
//       {/* App component's content will now use the consumed darkMode and toggleDarkMode */}
//       <AppContent />
//     </ThemeProvider>
//   );
// }

// 5. Create a new component to hold the main content of App
// This is done so that the App component can render ThemeProvider
// and AppContent can consume the context.
function Reg_ma_aprovel() {
  const [activeTab, setActiveTab] = useState('New Request');
  const [driverInsight, setDriverInsight] = useState(''); // State to store LLM generated insight
  const [loadingInsight, setLoadingInsight] = useState(false); // State for loading indicator

  // Consume theme context here
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // Sample Data for the table (duplicated for AppContent, in a real app this would be passed down or fetched here)
  const sampleDrivers = [
    {
      requestNumber: '#12345',
      driverId: 'Unver-UD1',
      driverName: 'Sophia Miller',
      driverNumber: '565-1734',
      phoneNumber: '12345678510',
      deliveryProvider: 'Mufejan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Car',
      city: 'Now York',
      requestStatus: 'Approved',
      action: '-',
    },
    {
      requestNumber: '#67890',
      driverId: 'Driver-002',
      driverName: 'Ethan Clerk',
      driverNumber: '555-5678',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mutajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Motorcycle',
      city: 'Los Angeles',
      requestStatus: 'Approved',
      action: '-',
    },
    {
      requestNumber: '#11223',
      driverId: 'Driver-003',
      driverName: 'Via Anderson',
      driverNumber: '555-9012',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mutejan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Van',
      city: 'Chicago',
      requestStatus: 'Rejected',
      action: '-',
    },
    {
      requestNumber: '#44556',
      driverId: 'Driver-004',
      driverName: 'Sophia Miller',
      driverNumber: '555-3456',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mulajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Car',
      city: 'Houston',
      requestStatus: 'Approved',
      action: '-',
    },
    {
      requestNumber: '#77689',
      driverId: 'Driver-005',
      driverName: 'Cthan Clark',
      driverNumber: '566-7890',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mulajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Motorcycle',
      city: 'Phoenix',
      requestStatus: 'Rejected',
      action: '-',
    },
    {
      requestNumber: '#99001',
      driverId: 'Driver-006',
      driverName: 'Mio Anderson',
      driverNumber: '555-9012',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mulajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Track',
      city: 'Philadelphia',
      requestStatus: 'Approved',
      action: '-',
    },
    {
      requestNumber: '#22334',
      driverId: 'Criver-007',
      driverName: 'Saphia Miliar',
      driverNumber: '555-9012',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mufajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Car',
      city: 'Sar Artania',
      requestStatus: 'Rejected',
      action: '-',
    },
    {
      requestNumber: '#56667',
      driverId: 'Criver-008',
      driverName: 'Ethan Clank',
      driverNumber: '555-9017',
      phoneNumber: '1234567890',
      deliveryProvider: 'Mutajan Co',
      tawseelApproval: 'Completed',
      vehicleType: 'Motorcycle',
      city: 'San Diego',
      requestStatus: 'Approved',
      action: '-',
    },
  ];

  // Function to call the Gemini API for driver insight (duplicated for AppContent)
  const generateDriverInsight = async () => {
    setLoadingInsight(true); // Set loading to true
    setDriverInsight(''); // Clear previous insight

    const prompt = "Generate a detailed, positive summary for a hypothetical delivery driver named 'Ahmad Al-Fahad' who has been driving for 3 years in Riyadh, using a sedan. Highlight his strengths in timely delivery, excellent customer satisfaction, and reliability. Suggest one area for potential growth, such as expanding to larger vehicle types or new service areas. Format it as a professional HR summary.";

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setDriverInsight(text);
      } else {
        setDriverInsight("Failed to generate insight. Please try again.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      setDriverInsight("Error generating insight. " + error.message);
      console.error("Error calling Gemini API:", error);
    } finally {
      setLoadingInsight(false);
    }
  };


  return (
    <div className={`min-h-screen font-inter ${darkMode ? 'bg-black text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      {/* Main Content */}
      <div className="flex flex-col p-8">
        {/* Top Bar for Language, Theme Toggle, and User Icon */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${darkMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-900 hover:bg-gray-800 text-green-400' : 'bg-gray-200 hover:bg-gray-300 text-green-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <CircleUserRound size={24} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        {/* Breadcrumb / Context Text */}
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Organization / Registration Management</div>
        {/* Page Title & Add Driver Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Registration Management</h1>
          <div className="flex space-x-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center justify-center"
              onClick={generateDriverInsight}
              disabled={loadingInsight}
            >
              {loadingInsight ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '✨ Generate Driver Insight'
              )}
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Driver
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex space-x-4 mb-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'New Request'
                ? (darkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900')
                : (darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-700')
            }`}
            onClick={() => setActiveTab('New Request')}
          >
            New Request ( 0 )
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Completed Requests'
                ? (darkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900')
                : (darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-700')
            }`}
            onClick={() => setActiveTab('Completed Requests')}
          >
            Completed Requests ( 8 )
          </button>
        </div>

        {/* Filter Section */}
        <div className={`p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          <div>
            <label htmlFor="vehicleType" className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Vehicle Type</label>
            <select id="vehicleType" className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
              <option>Select Vehicle Type</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="requestStatus" className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Request Status</label>
            <select id="requestStatus" className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
              <option>Select Request Status</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="requestId" className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Request ID</label>
            <input type="text" id="requestId" placeholder="Enter Request ID" className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`} />
          </div>
          <div>
            <label htmlFor="city" className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>City</label>
            <select id="city" className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
              <option>Select City</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="approval" className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Approval</label>
            <select id="approval" className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
              <option>Select Approval</option>
              {/* Add more options here */}
            </select>
          </div>
          <div className="flex space-x-2">
            <button className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}>
              Sorting
            </button>
            <button className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}>
              Reset All
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto mb-4">
          <table className={`min-w-full rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <thead>
              <tr className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'} uppercase text-sm leading-normal`}>
                <th className="py-3 px-6 text-left rounded-tl-lg">Request Number</th>
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver name</th>
                <th className="py-3 px-6 text-left">Driver Number</th>
                <th className="py-3 px-6 text-left">Phone Number</th>
                <th className="py-3 px-6 text-left">Delivery Provider</th>
                <th className="py-3 px-6 text-left">Tawseel Approval</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">City</th>
                <th className="py-3 px-6 text-left">Request Status</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-sm font-light`}>
              {sampleDrivers.map((driver, index) => (
                <tr key={index} className={`${darkMode ? 'border-b border-gray-800 hover:bg-gray-700' : 'border-b border-gray-300 hover:bg-gray-100'}`}>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.requestNumber}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.driverId}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.driverName}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.driverNumber}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.phoneNumber}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.deliveryProvider}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs ${
                      driver.tawseelApproval === 'Completed' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                    }`}>
                      {driver.tawseelApproval}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.vehicleType}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{driver.city}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs ${
                      driver.requestStatus === 'Approved' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                    }`}>
                      {driver.requestStatus}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center whitespace-nowrap">{driver.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Driver Insight Section */}
        {driverInsight && (
          <div className={`p-6 rounded-lg mt-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✨ Driver Insight Report</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>{driverInsight}</p>
          </div>
        )}

        {/* Pagination */}
        <div className={`flex justify-end items-center mt-auto space-x-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
                <ChevronLeft size={16} />
            </button>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full">1</span>
            <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
                <ChevronRight size={16} />
            </button>
        </div>

      </div>
    </div>
  );
}

export default Reg_ma_aprovel;
