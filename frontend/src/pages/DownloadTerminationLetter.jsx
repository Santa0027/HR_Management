// src/pages/DownloadTerminationLetter.js
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Component to trigger the download of a termination letter PDF.
 * Assumes backend has an endpoint like `/terminationletter/{id}/generate_pdf/`
 * that returns a PDF file.
 */
function DownloadTerminationLetter({ terminationId }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Make a GET request to your backend PDF generation endpoint
      const response = await axiosInstance.get(
        `/terminations/${terminationId}/generate_pdf/`, // Adjust this URL to your actual backend endpoint
        {
          responseType: 'blob', // Important: responseType must be 'blob' for file downloads
        }
      );

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;

      // Set the download attribute with a desired filename
      // You might want to get the filename from response headers (e.g., Content-Disposition)
      // For now, a generic name:
      link.setAttribute('download', `termination_letter_${terminationId}.pdf`);

      // Append to body and trigger click
      document.body.appendChild(link);
      link.click();

      // Clean up: remove the link and revoke the object URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Termination letter downloaded!');
    } catch (error) {
      console.error('Error downloading termination letter:', error);
      toast.error('Failed to download termination letter. Please try again.');
      // Optional: if the backend sends an error message in JSON, try to parse it
      if (error.response && error.response.data) {
        try {
          const reader = new FileReader();
          reader.onload = function() {
            const errorData = JSON.parse(reader.result);
            console.error('Backend error details:', errorData);
            toast.error(`Error: ${errorData.detail || errorData.message || 'Unknown backend error'}`);
          };
          reader.readAsText(error.response.data);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center space-x-1"
      disabled={isDownloading}
      title="Download Termination Letter"
    >
      <Download size={16} />
      <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
    </button>
  );
}

export default DownloadTerminationLetter;