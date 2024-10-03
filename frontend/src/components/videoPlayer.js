import React, { useState, useEffect } from 'react';
import axios from 'axios';


const VideoPlayer = () => {
    const [videoUrls, setVideoUrls] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideoList = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/videos');
                setVideoUrls(response.data.videos);
            } catch (err) {
                setError('Error al cargar la lista de videos');
            } finally {
                setLoading(false);
            }
        };

        fetchVideoList();
    }, []);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? videoUrls.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === videoUrls.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="video-player-container flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Reproductor de video</h1>
            {loading && <p className="text-yellow-500">Cargando...</p>}
            {error && <p className="error-message text-red-500">{error}</p>}
            {videoUrls.length > 0 ? (
                <div className="carousel-container flex flex-col items-center">
                    <button
                        className="carousel-button prev mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                        onClick={handlePrevious}
                    >
                        Anterior
                    </button>
                    <div className="video-wrapper mb-2">
                        <video width="600" controls className="rounded-lg shadow-lg">
                            <source src={`http://localhost:5000/media/${videoUrls[currentIndex]}`} type="video/mp4" />
                            Tu navegador no soporta la reproducción de videos.
                        </video>
                    </div>
                    <button
                        className="carousel-button next px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                        onClick={handleNext}
                    >
                        Siguiente
                    </button>
                </div>
            ) : (
                <p>No se encontraron videos.</p>
            )}
        </div>
    );
    
};

export default VideoPlayer;
