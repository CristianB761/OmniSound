const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existen las carpetas
const audioUploadDir = './uploads/audios';
const imageUploadDir = './uploads/song-images';

if (!fs.existsSync(audioUploadDir)) {
  fs.mkdirSync(audioUploadDir, { recursive: true });
}
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// ==================== ALMACENAMIENTO PARA AUDIO ====================
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, audioUploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `song-${userId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

// ==================== ALMACENAMIENTO PARA IMAGEN ====================
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageUploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `song-image-${userId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

// ==================== FILTROS ====================

// Filtrar SOLO archivos de audio
const audioFileFilter = (req, file, cb) => {
  // Solo aplicar filtro a archivos con fieldname 'audio'
  if (file.fieldname !== 'audio') {
    return cb(null, true); // No es audio, dejamos que pase (será manejado por otro filtro)
  }

  const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mpga', '.mp2', '.mp2a', '.mpa', '.m2a', '.m3a'];
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-mpeg',
    'audio/x-mp3',
    'audio/x-mp4',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/x-ogg',
    'audio/flac',
    'audio/x-flac',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/x-aac'
  ];

  const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  // Verificar por extensión O por mimetype
  const isValidExtension = allowedExtensions.includes(extension);
  const isValidMimetype = allowedMimeTypes.includes(mimetype);

  if (isValidExtension || isValidMimetype) {
    cb(null, true);
  } else {
    console.log('Archivo de audio rechazado:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: extension
    });
    cb(new Error('Formato de audio no soportado. Usa MP3, WAV, OGG, M4A o FLAC.'));
  }
};

// Filtrar SOLO imágenes
const imageFileFilter = (req, file, cb) => {
  // Solo aplicar filtro a archivos con fieldname 'image'
  if (file.fieldname !== 'image') {
    return cb(null, true); // No es imagen, dejamos que pase
  }

  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ];

  const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  const isValidExtension = allowedExtensions.includes(extension);
  const isValidMimetype = allowedMimeTypes.includes(mimetype);

  if (isValidExtension && isValidMimetype) {
    cb(null, true);
  } else {
    console.log('Imagen rechazada:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: extension
    });
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP, BMP, TIFF, SVG)'));
  }
};

// ==================== MIDDLEWARE COMBINADO ====================
// Crea un middleware que use almacenamiento diferente según el tipo de archivo
const songUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Determinar la carpeta destino basado en el tipo de archivo
      if (file.fieldname === 'audio') {
        cb(null, audioUploadDir);
      } else if (file.fieldname === 'image') {
        cb(null, imageUploadDir);
      } else {
        cb(new Error('Tipo de archivo no soportado'));
      }
    },
    filename: function (req, file, cb) {
      const userId = req.user?.id || 'unknown';
      const timestamp = Date.now();
      const extension = path.extname(file.originalname).toLowerCase();

      let filename;
      if (file.fieldname === 'audio') {
        filename = `song-${userId}-${timestamp}${extension}`;
      } else if (file.fieldname === 'image') {
        filename = `song-image-${userId}-${timestamp}${extension}`;
      } else {
        return cb(new Error('Tipo de archivo no soportado'));
      }

      cb(null, filename);
    }
  }),
  fileFilter: function (req, file, cb) {
    // Aplicar filtro según el tipo de archivo
    if (file.fieldname === 'audio') {
      return audioFileFilter(req, file, cb);
    } else if (file.fieldname === 'image') {
      return imageFileFilter(req, file, cb);
    } else {
      return cb(new Error('Campo no válido en el formulario'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo
  }
});

// ==================== EXPORTS ====================
module.exports = { 
  audioUpload: multer({
    storage: audioStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: audioFileFilter
  }),

  imageUpload: multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter
  }),
  
  songUpload // Middleware combinado para subir canciones
};