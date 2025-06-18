const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'tonSecretUltraSecret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou mal formaté' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.userId = decodedToken.userId; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};
