const express=require('express');
const router= express.Router();


const {register, login, logout, profile,toggleAvailability,waitForNewRide}= require('../controller/captain.controller');
const {captainAuth}= require('../middleware/auth');

router.post('/register', register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/profile',captainAuth,profile);
router.patch('/toggle-availability',captainAuth,toggleAvailability);

router.get('/wait-for-new-ride',waitForNewRide);

module.exports=router;
