import React, { useState, useEffect } from 'react';
import axios from 'axios';


const VideoDownloader = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videos, setVideos] = useState([]);
    const [audios, setAudios] = useState([]); // Para almacenar audios convertidos
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchVideos(page);
    }, [page]);

    const downloadVideo = async (url) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/download', { url });
            setVideoUrl(`http://localhost:5000${response.data.videoUrl}`);
            fetchVideos(1); // Refresh video list after downloading
        } catch (err) {
            setError('Error en la descarga');
        } finally {
            setLoading(false);
        }
    };

    const fetchVideos = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/videos?page=${page}&limit=10`);
            setVideos(response.data.videos);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Error al obtener videos');
        } finally {
            setLoading(false);
        }
    };

    // Función para convertir video a audio
    const convertToMp3 = async (filename) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/convert-to-mp3', { filename });
            setAudios([...audios, response.data.audioUrl]); // Agrega el nuevo audio a la lista de audios
        } catch (err) {
            setError('Error al convertir el video');
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar videos
    const deleteVideo = async (filename) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`http://localhost:5000/videos/${filename}`);
            fetchVideos(page); // Refresca la lista de videos después de eliminar
        } catch (err) {
            setError('Error al eliminar el video');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="video-downloader-container p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="input-container mb-4 flex items-center">
                <input
                    type="text"
                    placeholder="Ingrese el enlace del video"
                    id="video-url"
                    className="border border-gray-300 rounded-md p-2 flex-grow"
                />
                <button
                    onClick={() => downloadVideo(document.getElementById('video-url').value)}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Descargar video
                </button>
            </div>
    
            {loading && <p className="text-yellow-600">Descargando...</p>}
            {error && <p className="error-message text-red-600">{error}</p>}
    
            {videoUrl && (
                <div className="video-player mb-4">
                    <video controls className="w-full rounded-lg shadow-md">
                        <source src={videoUrl} type="video/mp4" />
                        Su navegador no admite la reproducción de videos.
                    </video>
                </div>
            )}
    
            <div className="videos-container mb-6">
                <h3 className="text-xl font-bold mb-2">Videos disponibles:</h3>
                {videos.length > 0 ? (
                    <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video, index) => (
                            <div key={index} className="video-item border rounded-lg overflow-hidden shadow-md bg-white">
                                <video controls className="w-full">
                                    <source src={`http://localhost:5000/media/${video}`} type="video/mp4" />
                                    Tu navegador no soporta la reproducción de videos.
                                </video>
                                <div className="p-2 flex justify-between">
                                    {/* Botón para eliminar video */}
                                    <button
                                        onClick={() => deleteVideo(video)}
                                        className="bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-600 transition"
                                    >
                                        Eliminar
                                    </button>
                                    {/* Botón para convertir a mp3 */}
                                    <button
                                        onClick={() => convertToMp3(video)}
                                        className="bg-green-500 text-white rounded-md px-2 py-1 hover:bg-green-600 transition"
                                    >
                                        Convertir a MP3
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay videos disponibles.</p>
                )}
    
                <div className="pagination mt-4">
                    {page > 1 && (
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition mr-2"
                        >
                            Página Anterior
                        </button>
                    )}
                    {page < totalPages && (
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                        >
                            Página Siguiente
                        </button>
                    )}
                </div>
            </div>
    
            <div className="audios-container mt-6">
                <h3 className="text-xl font-bold mb-2">Audios convertidos a MP3:</h3>
                {audios.length > 0 ? (
                    <ul>
                        {audios.map((audio, index) => (
                            <li key={index} className="mb-2">
                                <a
                                    href={`http://localhost:5000${audio}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Descargar {audio.split('/').pop()}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay audios disponibles.</p>
                )}
            </div>
        </div>
    );
    
};

export default VideoDownloader;

