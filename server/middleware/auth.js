const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    console.log('Auth Header:', authHeader); // debug ke liye
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN" se TOKEN nikalo
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (err) {
    console.log('Token Error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};