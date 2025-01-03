const captainModel = require('../model/captain.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklisttokenModel = require('../model/blacklist.model');
const { subscribeToQueue } = require('../service/rabbit');


// Register function
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingcaptain = await captainModel.findOne({ email });
        if (existingcaptain) {
            return res.status(400).json({ message: 'captain already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newcaptain = new captainModel({ name, email, password: hashedPassword });
        await newcaptain.save();

        const token= jwt.sign({id:newcaptain._id},process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('token',token);

        delete newcaptain._doc.password;

        res.status(201).json({token,newcaptain, message: 'captain registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login function
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const captain = await captainModel.findOne({ email });
        if (!captain) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(String(password), String(captain.password));
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ captainId: captain._id }, process.env.JWT_SECRET , { expiresIn: '1h' });
       
        delete captain._doc.password;
       
        res.cookie('token',token);
        res.status(200).json({ token,captain });
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
        res.send({ message: 'captain logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Profile function
const profile = async (req, res) => {
    try {
        res.send(req.captain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleAvailability= async(req,res)=>{
    try{
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.send(captain);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

const pendingRequests = [];

const waitForNewRide=  async (req,res)=>{
    console.log("captain wating for new ride");
     // Set timeout for long polling (e.g., 30 seconds)
    req.setTimeout(30000, () => {
        res.status(204).end(); // No Content
    });

    // Add the response object to the pendingRequests array
    pendingRequests.push(res);
}


subscribeToQueue("new-ride", (data) => {
    const rideData = JSON.parse(data);

    // Send the new ride data to all pending requests
    pendingRequests.forEach(res => {
        res.json({data:rideData});
    });

    // Clear the pending requests
    pendingRequests.length = 0;
});









// Export all functions
module.exports = { register, login, logout, profile ,toggleAvailability,waitForNewRide};