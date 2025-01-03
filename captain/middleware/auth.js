const jwt = require('jsonwebtoken');
const captainModel = require('../model/captain.model');
const blacklisttokenModel = require('../model/blacklist.model');


const captainAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized, token not fond' });
        }

        const isBlacklisted = await blacklisttokenModel.find({ token });

        if (isBlacklisted.length) {
            return res.status(401).json({ message: 'Unauthorized, You have been logged Out' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        const captain = await captainModel.findById(decoded.captainId).select('-password');

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized, captain do not exists' });
        }

        req.captain = captain;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports= {captainAuth};