import React, { useEffect, useState } from 'react';

const AudioList = () => {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAudios = async () => {
            try {
                const response = await fetch('http://localhost:5000/audios');
                if (!response.ok) {
                    throw new Error('Error al obtener los audios');
                }
                const data = await response.json();
                setAudios(data.audios);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAudios();
    }, []);

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Audios Descargados</h2>
            {loading && <p className="text-blue-600">Cargando...</p>}
            {error && <p className="text-red-600">{error}</p>}
            
            <ul className="mt-4">
                {audios.length > 0 ? (
                    audios.map((audio, index) => (
                        <li key={index} className="flex justify-between items-center border-b border-gray-300 py-2">
                                          <a 
                                           href={`http://localhost:5000/media/${encodeURIComponent(audio)}`} 
                  download 
    className="text-blue-600 hover:underline"
>
    {audio}
</a>

                        </li>
                    ))
                ) : (
                    <p>No hay audios disponibles.</p>
                )}
            </ul>
        </div>
    );
    
};

export default AudioList;
