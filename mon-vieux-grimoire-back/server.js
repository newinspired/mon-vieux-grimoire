const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tonSecretUltraSecret';

const Book = require('./models/book.js');
const auth = require('./middleware/auth'); // 🔐 import du middleware

const app = express();
const PORT = 3001;
const cors = require('cors');

app.use(express.json());

//-----------PERMET UNIQUEMENT LA CONNEXION DU FRONT SUR LE PORT 3000 -------

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions)); //'*' permet de répondre a toutes les requetes



//----------AJOUT DES LIVRES (protégé) ----------------
app.post('/api/books', auth, async (req, res) => {
  console.log('POST /api/books avec userId:', req.userId);
  try {
    const book = new Book({ ...req.body, userId: req.userId });
    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------LISTE DES LIVRES ----------------
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------TROUVER UN LIVRE ----------------
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
    res.status(200).json(book);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------MODIFIER UN LIVRE ----------------
app.put('/api/books/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!book.userId || book.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Accès interdit : ce livre ne vous appartient pas' });
    }

    if (!updatedBook) return res.status(404).json({ error: 'Livre non trouvé' });
    res.status(200).json({ message: 'Livre modifié !', book: updatedBook });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------SUPPRIMER UN LIVRE ----------------
app.delete('/api/books/:id', auth, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ error: 'Livre non trouvé' });
    res.status(200).json({ message: 'Livre supprimé !' });
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------CONNEXION MONGODB ----------------
mongoose.connect('mongodb://127.0.0.1:27017/mon-vieux-grimoire')
  .then(() => {
    console.log('Connexion à MongoDB réussie !');
    console.log(
      app._router.stack
        .filter(r => r.route)
        .map(r => {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase());
          return `${methods.join(', ')} ${r.route.path}`;
        })
    );
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Connexion à MongoDB échouée :', err?.stack || err || 'Erreur inconnue');
  });

app.get('/', (req, res) => {
  res.send('Bienvenue sur Mon Vieux Grimoire ! 📚');
});







app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Email déjà utilisé' });

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email ou mot de passe invalide' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Email ou mot de passe invalide' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});