const express = require('express');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/book'); // Chemin vers ton modèle Book
const auth = require('../middleware/auth'); // Middleware d'authentification

// Configuration de Multer pour gérer les fichiers images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier de stockage des images
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });

/**
 * Route POST pour ajouter un livre avec une image
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book); // Les infos JSON du livre
    bookData.userId = req.userId; // Ajout de l'userId depuis le token (sécurité)

    // Enregistre l'URL de l'image dans l'objet book
    if (req.file) {
      bookData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const newBook = new Book(bookData);
    await newBook.save();

    res.status(201).json({ message: 'Livre enregistré avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;