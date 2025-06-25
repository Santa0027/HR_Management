import React from 'react';
import axiosInstance from '../api/axiosInstance';

export default function DownloadTerminationLetter({ terminationId }) {
  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/terminationletter/${terminationId}/`, {
        responseType: 'blob',
      });

      const data = response.data;
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'document.pdf'
        : 'document.pdf';

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Download failed or no document attached.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="text-green-400 hover:text-green-600 underline"
    >
      Download
    </button>
  );
}
