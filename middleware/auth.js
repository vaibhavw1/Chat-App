const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async ( req, res, next) => {
    const token = req.header('Authorization');
    
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        if (!token) {
            return res.status(401).json({ error: 'No token provided. Authorization denied.' });
        }
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        };
        req.userId = decoded.userId;
        req.user = user;
        next();
    }catch(error){
        console.error("Authentication error:", error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}