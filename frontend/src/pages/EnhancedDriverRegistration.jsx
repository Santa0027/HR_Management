import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import EnhancedDriverFormWithCommission from '../components/drivers/EnhancedDriverFormWithCommission';

const EnhancedDriverRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDriverSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        // Basic driver information
        driver_name: formData.driver_name,
        iqama: formData.iqama,
        mobile: formData.mobile,
        email: formData.email || '',
        gender: formData.gender || '',
        dob: formData.dob || null,
        nationality: formData.nationality || '',
        city: formData.city || '',
        
        // Company and vehicle information
        assigned_company: formData.assigned_company,
        vehicle_type: formData.vehicle_type,
        
        // Commission data (store as JSON)
        commission_data: JSON.stringify(formData.current_commission || {}),
        
        // Accessories data
        accessories: formData.accessories || {},
        
        // Status
        status: 'pending'
      };

      console.log('Submitting driver data:', submissionData);

      // Submit to the backend
      const response = await axiosInstance.post('/Register/drivers/', submissionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success('Driver registered successfully!');
        navigate('/registration-management');
      } else {
        throw new Error('Unexpected response status');
      }
      
    } catch (error) {
      console.error('Error submitting driver:', error);
      
      if (error.response?.data) {
        // Handle validation errors from backend
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('\n');
          toast.error(`Validation errors:\n${errorMessages}`);
        } else {
          toast.error('Failed to register driver. Please check your input.');
        }
      } else {
        toast.error('Failed to register driver. Please try again.');
      }
      
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/registration-management');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Registration</h1>
              <p className="text-gray-600 mt-2">
                Register a new driver with company assignment and commission details
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Driver Management
            </button>
          </div>
        </div>

        {/* Enhanced Driver Form */}
        <EnhancedDriverFormWithCommission
          onSubmit={handleDriverSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EnhancedDriverRegistration;
