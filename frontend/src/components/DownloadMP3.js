import React, { useState } from 'react';

const DownloadMP3 = () => {
    const [url, setUrl] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/download-mp3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Error en la descarga');
            }

            const data = await response.json();
            setAudioUrl(data.audioUrl); // Establecer la URL del archivo MP3 descargado
            console.log('Descarga completada con éxito:', data);
        } catch (err) {
            setError(err.message); // Manejar errores
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Descargar MP3 de YouTube</h2>
            <form onSubmit={handleDownload} className="flex flex-col">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Ingresa la URL del video"
                    required
                    className="border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-white rounded-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Descargando...' : 'Descargar MP3'}
                </button>
            </form>
            {error && <p className="text-red-600 mt-4">{error}</p>}
            {audioUrl && (
                <div className="mt-4">
                    <p className="font-semibold">Descarga completada:</p>
                    <a
                        href={audioUrl}
                        download
                        className="text-blue-600 hover:underline"
                    >
                        Descargar Audio MP3
                    </a>
                </div>
            )}
        </div>
    );
    
};

export default DownloadMP3;
