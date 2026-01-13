const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que la carpeta de uploads existe
const uploadDir = './uploads/pictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: usuario-id-timestamp.extension
    const userId = req.user.id;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `profile-${userId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

module.exports = upload;