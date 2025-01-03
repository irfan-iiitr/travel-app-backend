const userModel = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklisttokenModel = require('../model/blacklist.model');
const { subscribeToQueue } = require('../service/rabbit');

const EventEmitter = require('events');
const rideEventEmitter = new EventEmitter();

// Register function
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashedPassword });
        await newUser.save();

        const token= jwt.sign({id:newUser._id},process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('token',token);

        delete newUser._doc.password;

        res.status(201).json({token,newUser, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login function
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(String(password), String(user.password));
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET , { expiresIn: '1h' });
       
        delete user._doc.password;
       
        res.cookie('token',token);
        res.status(200).json({ token,user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout function
const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        await blacklisttokenModel.create({ token });
        res.clearCookie('token');
        res.send({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Profile function
const profile = async (req, res) => {
    try {
        console.log("user details",req.user);
        res.send(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const acceptedRide=async(req,res)=>{
     // Long polling: wait for 'ride-accepted' event
     rideEventEmitter.once('ride-accepted', (data) => {
        res.send(data);
    });

    // Set timeout for long polling (e.g., 30 seconds)
    setTimeout(() => {
        res.status(204).send();
    }, 30000);
}

subscribeToQueue('ride-accepted', async (msg) => {
    const data = JSON.parse(msg);
    rideEventEmitter.emit('ride-accepted', data);
});

// Export all functions
module.exports = { register, login, logout, profile,acceptedRide };