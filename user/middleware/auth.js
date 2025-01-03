const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const blacklisttokenModel = require('../model/blacklist.model');


const userAuth = async (req, res, next) => {
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

        const user = await userModel.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized, user do not exists' });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports= {userAuth};