// src/pages/DownloadWarningLetter.js
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Adjust path if necessary
import { Download } from 'lucide-react'; // Make sure lucide-react is installed: npm install lucide-react
import { toast } from 'react-toastify';

/**
 * Component to trigger the download of a warning letter PDF.
 * Assumes backend has an endpoint like `/warningletter/{id}/generate_pdf/`
 * that returns a PDF file.
 */
function DownloadWarningLetter({ letterId }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // API endpoint for warning letter PDF generation
      const response = await axiosInstance.get(
        `/warningletter/${letterId}/generate_pdf/`, // <<< Specific endpoint for Warning Letters
        {
          responseType: 'blob', // Important for file downloads
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // You might get a more specific filename from response headers (Content-Disposition)
      // For now, a generic name:
      link.setAttribute('download', `warning_letter_${letterId}.pdf`);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Warning letter downloaded!');
    } catch (error) {
      console.error('Error downloading warning letter:', error);
      toast.error('Failed to download warning letter. Please try again.');
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
      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
      disabled={isDownloading}
      title="Download Warning Letter"
    >
      <Download size={16} />
      <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
    </button>
  );
}

export default DownloadWarningLetter;