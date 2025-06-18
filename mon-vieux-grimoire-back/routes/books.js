const express = require('express');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/book');
const auth = require('../middleware/auth'); 



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });


router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book); 
    bookData.userId = req.userId;

    
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

//---------Livres les mieux notés-------------

router.get('/bestrating', async (req, res) => {
  try {
    const topBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(topBooks);
  } catch (err) {
    res.status(400).json({ error: 'Impossible de récupérer les livres les mieux notés.' });
  }
});


module.exports = router;