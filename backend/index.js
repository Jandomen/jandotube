const express = require('express');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const { exec } = require('child_process'); 
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());



// Sirve archivos estáticos desde la carpeta "media"
app.use('/media', express.static(path.join(__dirname, 'media')));

app.post('/download', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'URL es requerida' });
    }

    const outputDir = 'media';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');
    console.log(`Descargando video desde: ${url}`);
    console.warn('Puede demorar unos segundos :0');

    youtubedl(url, {
        output: outputTemplate,
        format: 'mp4',
        mergeOutputFormat: 'mp4',
        progressHook: (progress) => {
            console.log(`Progreso: ${progress.percent}% - Velocidad: ${progress.speed} - Tiempo restante: ${progress.eta}`);
        }
    })
    .then(output => {
        console.log('Detalles del output:', output);
        const downloadedFiles = fs.readdirSync(outputDir);  // Lista los archivos descargados en la carpeta
        const videoFileName = downloadedFiles.find(file => file.endsWith('.mp4')); // Encuentra el archivo .mp4

        if (videoFileName) {
            const videoUrl = `/media/${videoFileName}`;
            console.log('Descarga de video completada con éxito :)');
            res.json({ message: 'Descarga completada con éxito', videoUrl });
        } else {
            throw new Error('No se pudo encontrar el archivo descargado.');
        }
    })
    .catch(error => {
        console.error('Problemas para descargar el video :(', error);
        res.status(500).json({ message: `Error en la descarga: ${error.message}` });
    });
});

app.post('/download', (req, res) => {
    const { url, format } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL es requerida' });
    }
    const outputDir = 'media';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    let outputTemplate;
    if (format === 'mp3') {
      outputTemplate = path.join(outputDir, '%(title)s.mp3');
      // Use youtube-dl to download only the audio
      youtubedl(url, {
        output: outputTemplate,
        format: 'bestaudio[ext=mp3]',
        progressHook: (progress) => {
          console.log(`Progreso: ${progress.percent}% - Velocidad: ${progress.speed} - Tiempo restante: ${progress.eta}`);
        }
      })
      .then(output => {
        console.log('Detalles del output:', output);
        const audioFileName = output.filename;
        const audioUrl = `/media/${audioFileName}`;
        console.log('Descarga completada con éxito :)');
        res.json({ mensaje: 'Descarga completada con éxito', audioUrl });
      })
      .catch(error => {
        console.error('Problemas para descargar :(', error);
        res.status(500).json({ mensaje: `Error en la descarga: ${error.message}` });
      });
    } else {
      // Existing video download logic
    }
  });



app.get('/videos', (req, res) => {
    const outputDir = 'media';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    fs.readdir(outputDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer la carpeta de videos' });
        }
        
        // Ordenar los videos por fecha de creación
        const videoFiles = files
            .filter(file => file.endsWith('.mp4'))
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(outputDir, file)).mtime.getTime() // Obtenemos la fecha de modificación
            }))
            .sort((a, b) => b.time - a.time)  // Orden descendente por fecha
        
        const totalVideos = videoFiles.length;
        const paginatedVideos = videoFiles.slice((page - 1) * limit, page * limit);
        console.log('Consulta exitosa :)')
        res.json({
            videos: paginatedVideos.map(video => video.name),  // Enviamos solo los nombres de los videos
            totalVideos,
            page,
            totalPages: Math.ceil(totalVideos / limit),
        });
    });
});

app.delete('/videos/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'media', filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al eliminar el archivo' });
            }
            console.log('Archivo eliminado con exito :)')
            res.json({ message: 'Archivo eliminado con éxito' });
        });
    } else {
        console.error('Problemas para eliminar el archivo :(')
        res.status(404).json({ message: 'Archivo no encontrado' });
    }
});

app.post('/convert-to-mp3', async (req, res) => {
    const { filename } = req.body;
    const videoPath = path.join(__dirname, 'media', filename);
    const outputAudioPath = path.join(__dirname, 'media', `${filename.split('.').slice(0, -1).join('.')}.mp3`);

    ffmpeg(videoPath)
        .toFormat('mp3')
        .on('end', () => {
            return res.json({ audioUrl: `/media/${filename.split('.').slice(0, -1).join('.')}.mp3` });
        })
        .on('error', (err) => {
            return res.status(500).send('Error al convertir el archivo');
        })
        .save(outputAudioPath);
});


// Directorio de salida
const outputDir = path.join(__dirname, 'music');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Ruta para descargar el audio
app.post("/download-mp3", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'URL es requerida' });
    }

    console.log(`Descargando audio desde: ${url}`);

    // Comando para obtener información del video
    const infoCommand = `yt-dlp --get-title "${url}"`;

    exec(infoCommand, (error, title) => {
        if (error) {
            console.error('Error al obtener el título del video:', error);
            return res.status(500).json({ message: 'Error al obtener el título', error: error.message });
        }

        // Sanitizar el nombre del archivo
        const sanitizedTitle = title.trim().replace(/[<>:"/\\|?*]+/g, '') + '.mp3'; // Agregar extensión .mp3
        const outputFilePath = path.join(outputDir, sanitizedTitle);

        // Comando para descargar el audio usando yt-dlp
        const downloadCommand = `yt-dlp -x --audio-format mp3 -o "${outputFilePath}" "${url}"`;

        exec(downloadCommand, (error) => {
            if (error) {
                console.error('Error durante la descarga:', error);
                return res.status(500).json({ message: 'Error durante la descarga', error: error.message });
            }
            
            console.log(`Audio descargado y guardado como: ${outputFilePath}`);
            res.json({ message: 'Descarga completada', audioFile: `/music/${sanitizedTitle}` });
        });
    });
});

// Servir archivos estáticos desde la carpeta 'music'
app.use('/music', express.static(path.join(__dirname, 'music')));
// Servir la carpeta 'music' con archivos estáticos
app.use('/media', express.static(path.join(__dirname, 'music')));





app.get('/audios', (req, res) => {
    const outputDir = 'music';
    fs.readdir(outputDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer la carpeta de audios' });
        }

        // Filtrar solo archivos .mp3
        const audioFiles = files.filter(file => file.endsWith('.mp3'));

        console.log('Consulta de audio exitosa :)');
        res.json({ audios: audioFiles });
    });
});






app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
