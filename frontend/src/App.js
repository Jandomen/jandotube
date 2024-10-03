// App.js
import './tailwind.css'
import React from 'react';
import './App.css'; // Asegúrate de que tus estilos estén correctamente aplicados
import VideoDownloader from './components/VideoDownloader.js';
import DownloadMP3 from './components/DownloadMP3.js';
import AudioList from './components/AudioList.js';

function App() {
    return (
        <div className="App">
            <header className="App-header">
            <h1 class="text-5xl font-bold text-center text-indigo-600 mt-10 mb-5">JandoTube</h1>
                <VideoDownloader />
                <DownloadMP3/>
                <AudioList/>
            </header>
        </div>
    );
}

export default App;

