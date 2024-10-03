import React, { useState } from 'react';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, format })
    })
    .then(response => response.json())
    .then(data => {
      if (data.mensaje === 'Descarga completada con éxito') {
        setDownloadStatus(`Download completed! <a href="${data.audioUrl}" target="_blank">Download ${format.toUpperCase()} file</a>`);
      } else {
        setDownloadStatus(`Error: ${data.mensaje}`);
      }
    })
    .catch(error => {
      setDownloadStatus(`Error: ${error.message}`);
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">YouTube Downloader</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="url" className="block text-gray-700">URL:</label>
                <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                    required
                />
            </div>
            <div>
                <label htmlFor="format" className="block text-gray-700">Format:</label>
                <select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                >
                    <option value="mp4">MP4 (Video)</option>
                    <option value="mp3">MP3 (Audio)</option>
                </select>
            </div>
            <button 
                type="submit" 
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
                Download
            </button>
        </form>
        {downloadStatus && <div className="mt-4 text-gray-600">{downloadStatus}</div>}
    </div>
);

};

export default YouTubeDownloader;