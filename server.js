const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de Firebase
const serviceAccount = require('./serviceAccountKey.json'); // Descarga este archivo desde Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'YOUR_PROJECT_ID.appspot.com' // Reemplaza con tu bucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para agregar un libro
app.post('/api/libros', upload.single('portada'), async (req, res) => {
  const { nombre, autor, editorial } = req.body;
  const portadaFile = req.file;

  try {
    // Subir la imagen a Firebase Storage
    const file = bucket.file(`uploads/${Date.now()}_${portadaFile.originalname}`);
    await file.save(portadaFile.buffer, {
      metadata: { contentType: portadaFile.mimetype },
      public: true
    });
    const portadaURL = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    // Agregar el libro a Firestore
    await db.collection('libros').add({
      nombre,
      autor,
      editorial,
      portada: portadaURL
    });

    res.status(201).json({ message: 'Libro agregado con éxito' });
  } catch (error) {
    console.error('Error al agregar libro:', error);
    res.status(500).json({ error: 'Error al agregar libro' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
